'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// GÜL PENCERE (sanat-akimlari hero'su) — three.js.
//
// Neden vitray: makale Rönesans'tan bugüne akımların haritası ve paleti kızıl
// (#e11d48) + sıcak altın + koyu erik. Gül pencere hem bu paletin ta kendisi
// hem de tartışmasız "SANAT" diyen bir biçim — jenerik bir 3B nesne değil.
// PRİZMA BİLEREK YAPILMADI: cam prizma + tayf zaten newton makalesinin hero'su.
//
// Işık ARKADAN gelir (katedralde olduğu gibi): paneller kendi renklerinde
// ışırlar, kurşun çıtalar (came) arada siyah kalır. Dışarıdaki güneş yavaşça
// yer değiştirir → pencerede gezen bir aydınlanma dalgası.
//
// EL YAPIMI HİSSİ: her panele küçük bir NORMAL EĞİMİ (aTilt) verilir. Gerçek
// antika camda paneller tam düz değildir; parlama her panelde ayrı yakalanır.
// Tek başına bu, "prosedürel ızgara" hissini kırar.
//
// Perf disiplini diğer hero'larla aynı (heroPerf.ts): cihaz kademesi, kare ölçen
// bekçi, ekran dışında rAF durur, reduced-motion'da tek statik kare, cleanup'ta
// tam dispose, loseContext() ÇAĞRILMAZ (Strict Mode tuzağı).
// ─────────────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;

/** Halka tanımı: iç/dış yarıçap + panel sayısı. Merkez rozet n=1. */
const RINGS: { r0: number; r1: number; n: number }[] = [
  { r0: 0.00, r1: 0.30, n: 1 },
  { r0: 0.36, r1: 0.74, n: 8 },
  { r0: 0.80, r1: 1.20, n: 16 },
  { r0: 1.26, r1: 1.58, n: 24 },
];
const R_OUT = 1.58;
// İlk render'da 0.028/0.030 idi: iç halkada siyah, camdan çok yer kaplıyordu.
const GAP_R = 0.017;   // kurşun çıta kalınlığı (radyal)
const GAP_A = 0.020;   // kurşun çıta kalınlığı (açısal, yay uzunluğu olarak)

type Built = { geo: THREE.BufferGeometry };

/**
 * Panelleri kutupsal düzende kurar. Her panel bir halka dilimi; aralarındaki
 * boşluktan arkadaki koyu disk görünür → kurşun çıta.
 */
function buildPanes(arcSeg: number): Built {
  const P: number[] = [], N: number[] = [], U: number[] = [], A: number[] = [], T: number[] = [];
  let seed = 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  const emit = (
    r0: number, r1: number, a0: number, a1: number,
    ring: number, sector: number, tint: number, tx: number, ty: number,
  ) => {
    for (let i = 0; i < arcSeg; i++) {
      const t0 = i / arcSeg, t1 = (i + 1) / arcSeg;
      const b0 = a0 + (a1 - a0) * t0, b1 = a0 + (a1 - a0) * t1;
      const c0 = Math.cos(b0), s0 = Math.sin(b0), c1 = Math.cos(b1), s1 = Math.sin(b1);
      const p = [
        [r0 * c0, r0 * s0], [r1 * c0, r1 * s0], [r1 * c1, r1 * s1], [r0 * c1, r0 * s1],
      ];
      const uvs = [[0, t0], [1, t0], [1, t1], [0, t1]];
      const tri = (a: number, b: number, c: number) => {
        for (const k of [a, b, c]) {
          P.push(p[k][0], p[k][1], 0);
          N.push(0, 0, 1);
          U.push(uvs[k][0], uvs[k][1]);
          A.push(ring, sector, tint);
          T.push(tx, ty);
        }
      };
      tri(0, 1, 2); tri(0, 2, 3);
    }
  };

  RINGS.forEach((R, ri) => {
    if (R.n === 1) {
      // merkez rozet: tam disk (yay boşluğu yok)
      emit(0.0, R.r1 - GAP_R, 0, TAU, ri, 0, rnd(), (rnd() - 0.5) * 0.5, (rnd() - 0.5) * 0.5);
      return;
    }
    const step = TAU / R.n;
    const gapA = GAP_A / Math.max(R.r0, 0.2);   // yay boşluğunu sabit UZUNLUKTA tut
    for (let s = 0; s < R.n; s++) {
      emit(
        R.r0 + GAP_R, R.r1 - GAP_R,
        s * step + gapA * 0.5, (s + 1) * step - gapA * 0.5,
        ri, s, rnd(), (rnd() - 0.5) * 0.55, (rnd() - 0.5) * 0.55,
      );
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  geo.setAttribute('aPane', new THREE.Float32BufferAttribute(A, 3));   // (halka, dilim, ton)
  geo.setAttribute('aTilt', new THREE.Float32BufferAttribute(T, 2));   // el yapımı normal eğimi
  return { geo };
}

/** Taş söve: dış halka (düz disk şeridi). */
function buildStoneRim(r0: number, r1: number, seg: number) {
  const P: number[] = [], N: number[] = [], U: number[] = [];
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * TAU, a1 = ((i + 1) / seg) * TAU;
    const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
    const q = [[r0 * c0, r0 * s0], [r1 * c0, r1 * s0], [r1 * c1, r1 * s1], [r0 * c1, r0 * s1]];
    const uv = [[0, i / seg], [1, i / seg], [1, (i + 1) / seg], [0, (i + 1) / seg]];
    for (const k of [0, 1, 2, 0, 2, 3]) {
      P.push(q[k][0], q[k][1], 0); N.push(0, 0, 1); U.push(uv[k][0], uv[k][1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  return g;
}

const glassVertex = `
attribute vec3 aPane;
attribute vec2 aTilt;
varying vec2 vUv; varying vec3 vPane; varying vec3 vN; varying vec3 vV; varying vec2 vLocal;
void main(){
  vUv = uv; vPane = aPane; vLocal = position.xy;
  // el yapımı cam: her panelin normali biraz eğik → parlama panel panel değişir
  vec3 nrm = normalize(vec3(aTilt, 1.0));
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * nrm);
  vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const glassFragment = `
uniform float uTime, uDetail;
uniform vec3 uLightDir, uC1, uC2, uC3, uC4, uCool;
uniform vec2 uRes, uTitleC, uTitleR;
varying vec2 vUv; varying vec3 vPane; varying vec3 vN; varying vec3 vV; varying vec2 vLocal;

float h11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }

void main(){
  // ── panel rengi: paletten seçilir, ton aPane.z ile kararlaştırılır ──
  // Ağırlıklar KASITLI dengesiz: eşit dağıtınca pencere panayır gibi oluyordu.
  // Kızıl baskın (makalenin ACCENT'i), kobalt yalnız karşı ağırlık, altın az ve
  // değerli. Gerçek gül pencerelerde de bir renk yönetir, ötekiler eşlik eder.
  float t = vPane.z;
  vec3 col;
  // KARIŞIM RENGİ YOK: mix(uC3,uC4) ve mix(uC2,uCool) denendi, ikisi de kahve ve
  // çamurlu eflatun verdi. Vitray mücevher gibidir — aynı hue'nun koyu/açık
  // tonları kullanılır, ara tonlar karıştırılmaz.
  if      (t < 0.34) col = uC3;                    // kızıl (baskın)
  else if (t < 0.52) col = uC3 * 0.42;             // derin kızıl
  else if (t < 0.66) col = uC2;                    // koyu şarap
  else if (t < 0.80) col = uCool;                  // kobalt (karşı ağırlık)
  else if (t < 0.90) col = uCool * 0.45;           // gece mavisi
  else               col = uC4;                    // sıcak altın (az ve değerli)
  // merkez rozet her zaman altın: gözün gideceği yer orası
  if (vPane.x < 0.5) col = uC4;

  // ── antika cam damarları: radyal yönde ince çizgilenme + hafif kabarcık ──
  float grain = 0.86 + 0.14 * sin(vUv.x * 26.0 + h11(vPane.y + vPane.x * 7.0) * 12.0);
  if (uDetail > 0.5) grain *= 0.94 + 0.06 * sin(vUv.y * 40.0 + vUv.x * 9.0);
  col *= grain;

  // ── ARKADAN IŞIK: dışarıdaki güneş yavaşça yer değiştirir ──
  // Panellerin ışıması konuma bağlı; pencere boyunca gezen bir aydınlanma dalgası.
  float sweep = 0.62 + 0.38 * cos(dot(normalize(vec2(cos(uTime * 0.13), sin(uTime * 0.13))), vLocal) * 1.15 - uTime * 0.55);
  // Kontrast KASITLI yüksek: ilk render'da paneller "arkadan aydınlatılmış cam"
  // değil düz renkli karolar gibi duruyordu. Işık merkeze doğru da toplanır —
  // gerçek gül pencerede rozet en parlak yerdir, göz oraya çekilir.
  // Taban 0.34: pow(sweep,2.6) tek başına taramanın uzak kaldığı yarıyı tamamen
  // karartıyordu, pencerenin yarısı ölü görünüyordu. Gerçek pencerede gökyüzü
  // her yeri bir miktar aydınlatır; tarama yalnız VURGUYU gezdirir.
  float glow = (0.34 + 0.78 * pow(sweep, 1.8)) * (0.86 + 0.42 * exp(-dot(vLocal, vLocal) * 0.75));

  // ── ön yüzeyden yansıma: cam olduğunu hatırlatır ──
  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uLightDir), H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 30.0) * 0.55;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

  // HUE KORUYAN parlaklık: col*(a+b*glow) tek başına ACES'te tepe noktaları
  // beyaza sürükler ve cam çamurlaşır. col*col terimi rengi KENDİ hue'sunda
  // derinleştirir → arkadan aydınlatılmış doygun cam hissi.
  vec3 outc = col * (0.24 + 0.95 * glow) + col * col * glow * 1.45
            + vec3(spec) * (0.25 + 0.55 * glow) + col * fres * 0.30;

  // BAŞLIK MASKESİ: yalnız ışımaya (albedo'ya dokunulmaz — periyodik desende
  // ekran-uzayı karartma Mach bandı yapar; bkz. ThreeChipHero aynı kural).
  vec2 scr = gl_FragCoord.xy / uRes;
  float m = mix(0.16, 1.0, smoothstep(0.85, 1.60, length((scr - uTitleC) / uTitleR)));
  outc *= m;
  outc *= 1.0 - 0.70 * smoothstep(0.900, 0.965, 1.0 - scr.y);   // KAYDIR bandı guard'ı

  gl_FragColor = vec4(outc, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const stoneVertex = `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const stoneFragment = `
uniform vec3 uLightDir, uC1, uC2;
uniform vec2 uRes, uTitleC, uTitleR;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
                   q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main(){
  // yontulmuş taş: kaba benekli doku + söve kaburgaları
  float rib = smoothstep(0.42, 0.5, abs(fract(vUv.y * 48.0) - 0.5));
  float n = h21(floor(vec2(vUv.x * 6.0, vUv.y * 260.0)));
  // Taş DOYGUN OLMAMALI: mix(uC1,uC2) denendi ve söve mor bir plastik halka gibi
  // durdu. Yontulmuş kireçtaşı = koyu, sıcak-gri; camın yanında geri çekilmeli.
  vec3 base = vec3(0.055, 0.043, 0.040) * (0.70 + 0.62 * n) + uC1 * 0.5 + vec3(0.016, 0.012, 0.010) * rib;
  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uLightDir);
  vec3 col = base * (0.34 + 0.75 * max(dot(N, L), 0.0));
  vec2 scr = gl_FragCoord.xy / uRes;
  col *= mix(0.30, 1.0, smoothstep(0.85, 1.60, length((scr - uTitleC) / uTitleR)));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// HERO_COLORS (SanatClient) — LİNEER uzayda
const C1 = new THREE.Vector3(0.05, 0.02, 0.06);   // neredeyse siyah erik: kurşun çıta + zemin
const C2 = new THREE.Vector3(0.22, 0.05, 0.14);   // koyu şarap
const C3 = new THREE.Vector3(0.75, 0.11, 0.28);   // kızıl (ACCENT #e11d48)
const C4 = new THREE.Vector3(0.85, 0.55, 0.18);   // sıcak altın
const COOL = new THREE.Vector3(0.10, 0.20, 0.62); // kobalt: kızılın karşı ağırlığı

export default function ThreeRoseWindowHero() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tier = deviceTier();
    let raf = 0;

    try {
      const canvas = document.createElement('canvas');
      canvas.className = 'absolute inset-0 h-full w-full';
      host.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: tier !== 'low', powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap(tier)));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 40);
      const rig = new THREE.Group();
      scene.add(rig);

      const ARC = tier === 'low' ? 3 : tier === 'mid' ? 5 : 8;
      const RIM = tier === 'low' ? 48 : tier === 'mid' ? 72 : 112;

      const shared = {
        uTime: { value: 0 },
        uDetail: { value: tier === 'low' ? 0 : 1 },
        uLightDir: { value: new THREE.Vector3(0, 0, 1) },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTitleC: { value: new THREE.Vector2(0.5, 0.5) },
        uTitleR: { value: new THREE.Vector2(0.30, 0.24) },
        uC1: { value: C1 }, uC2: { value: C2 }, uC3: { value: C3 }, uC4: { value: C4 }, uCool: { value: COOL },
      };

      // arka disk: panel aralarından görünen KURŞUN ÇITA (came)
      const backGeo = new THREE.CircleGeometry(R_OUT + 0.01, RIM);
      const backMat = new THREE.MeshBasicMaterial({ color: 0x0a0409 });
      const back = new THREE.Mesh(backGeo, backMat);
      back.position.z = -0.012;
      rig.add(back);

      const { geo: paneGeo } = buildPanes(ARC);
      const glassMat = new THREE.ShaderMaterial({ vertexShader: glassVertex, fragmentShader: glassFragment, uniforms: shared });
      rig.add(new THREE.Mesh(paneGeo, glassMat));

      const rimGeo = buildStoneRim(R_OUT + 0.02, R_OUT + 0.30, RIM);
      const stoneMat = new THREE.ShaderMaterial({ vertexShader: stoneVertex, fragmentShader: stoneFragment, uniforms: shared });
      rig.add(new THREE.Mesh(rimGeo, stoneMat));

      const KEY_DIR = new THREE.Vector3(-1.6, 2.2, 3.4).normalize();

      // ── KADRAJ: sabit sayı yok, çözülüyor (ThreeChipHero ile aynı disiplin) ──
      const R_ALL = R_OUT + 0.30;
      const CORNERS: [number, number, number][] = [
        [-R_ALL, 0, 0], [R_ALL, 0, 0], [0, -R_ALL, 0], [0, R_ALL, 0],
      ];
      let dCam = 6, logged = false;
      const v = new THREE.Vector3();
      const applyFrame = (w: number, h: number) => {
        const aspect = w / h;
        const portrait = aspect < 0.85;
        camera.fov = portrait ? 42 : 34;
        camera.aspect = aspect;
        let yMax = 0, yMin = 0;
        for (let i = 0; i < 8; i++) {
          camera.position.set(0, 0, dCam);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld(true);
          let mx = 0; yMax = -9; yMin = 9;
          for (const c of CORNERS) {
            v.set(c[0], c[1], c[2]).applyMatrix4(rig.matrixWorld).project(camera);
            mx = Math.max(mx, Math.abs(v.x));
            yMax = Math.max(yMax, v.y); yMin = Math.min(yMin, v.y);
          }
          // Kadrajı DİKEY pay belirliyor (pencere dairesel; geniş ekranda yatayda
          // bol yer var). 0.80 → 0.98 denendi, pencere hâlâ küçük bir madalyon
          // gibiydi: 0.98 NDC = ekran yüksekliğinin yalnızca %49'u. 1.25 ile
          // pencere ANITSAL olur ve alttan taşar — gerçek katedral fotoğrafında
          // da gül pencere kadraja sığmaz, aşağıdan bakılır.
          dCam *= Math.max(mx / 0.92, (yMax - yMin) / 1.25);
        }
        // Pencere ALT ÜÇTE BİRE oturur: üst yarı başlığa kalır (katedralde
        // gül pencereye AŞAĞIDAN bakılır — kompozisyon hem doğru hem işlevsel).
        // Portrede metin bloğu daha uzun (ekranın %29-70'i) → pencere daha aşağıda.
        const TARGET = portrait ? -0.74 : -0.68;
        camera.projectionMatrix.elements[9] += -(TARGET - (yMax + yMin) * 0.5);
        let lo = 9, hi = -9;
        for (const c of CORNERS) { v.set(c[0], c[1], c[2]).applyMatrix4(rig.matrixWorld).project(camera); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); }
        const resid = TARGET - (lo + hi) * 0.5;
        if (Math.abs(resid) > 0.02) camera.projectionMatrix.elements[9] += resid;

        shared.uTitleR.value.set(portrait ? 0.46 : 0.30, portrait ? 0.28 : 0.24);
        shared.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
        shared.uLightDir.value.copy(KEY_DIR).transformDirection(camera.matrixWorldInverse);

        if (process.env.NODE_ENV !== 'production' && !logged) {
          logged = true;
          const ndc = CORNERS.map(c => { const p = v.set(c[0], c[1], c[2]).applyMatrix4(rig.matrixWorld).project(camera); return [+p.x.toFixed(2), +p.y.toFixed(2)]; });
          const ys = ndc.map(p => p[1]);
          console.log('[rose-hero] NDC uçlar', JSON.stringify(ndc), 'merkez', ((Math.min(...ys) + Math.max(...ys)) / 2).toFixed(2), 'hedef', TARGET, 'd', dCam.toFixed(2));
        }
      };

      const resize = () => {
        const w = host.clientWidth || window.innerWidth || 1200;
        const h = host.clientHeight || window.innerHeight || 800;
        renderer.setSize(w, h, false);
        rig.updateMatrixWorld(true);
        applyFrame(w, h);
      };

      const start = performance.now();
      const T_STILL = 5.4;
      const draw = (now: number) => {
        const t = ((now - start) / 1000) % 600;
        shared.uTime.value = t;
        // hafif eğim: tam cepheden bakış "mandala" gibi düz durur, az bir
        // perspektif pencereye derinlik ve taş sövesine hacim verir.
        rig.rotation.x = -0.16 + Math.sin(t * 0.11) * 0.03;
        rig.rotation.y = 0.13 + Math.sin(t * 0.08) * 0.04;
        rig.rotation.z = t * 0.012;                    // çok yavaş dönüş
        renderer.render(scene, camera);
      };

      resize();
      window.addEventListener('resize', resize);

      const t0 = performance.now();
      draw(reduce ? start + T_STILL * 1000 : start);
      if (performance.now() - t0 > 220) { renderer.setPixelRatio(1); resize(); shared.uDetail.value = 0; }

      let frozen = false;
      const guard = makeFpsGuard(
        () => { renderer.setPixelRatio(1); resize(); shared.uDetail.value = 0; },
        () => { frozen = true; },
      );

      let visible = true;
      const loop = (now: number) => {
        if (!visible || frozen) { raf = 0; return; }
        guard(now);
        draw(now);
        raf = requestAnimationFrame(loop);
      };
      if (!reduce) raf = requestAnimationFrame(loop);

      const io = reduce ? null : new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf && !frozen) raf = requestAnimationFrame(loop);
      }, { rootMargin: '200px' });
      io?.observe(host);

      return () => {
        cancelAnimationFrame(raf);
        io?.disconnect();
        window.removeEventListener('resize', resize);
        backGeo.dispose(); paneGeo.dispose(); rimGeo.dispose();
        backMat.dispose(); glassMat.dispose(); stoneMat.dispose();
        renderer.dispose();
        canvas.remove();
        // loseContext() ÇAĞRILMAZ: Strict Mode remount'ta bağlamı öldürür.
      };
    } catch { /* WebGL yoksa: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
