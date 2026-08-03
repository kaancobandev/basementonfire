'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// PERİYODİK TABLO HERO — three.js.
//
// Bu hero süs DEĞİL, makalenin TEZİ: "tablonun şekli orbital doldurmasından
// çıkıyor." Okur tek kelime okumadan önce argümanı görüyor.
//
// SAHNE İKİ KATMAN:
//   ARKA  — s/p/d/f orbital silüetleri (küre, dambıl, yonca, karmaşık lob).
//           O an dolan blok parlar, ötekiler söner.
//   ÖN    — 118 hücre TEK InstancedMesh. Hücre YATIK ve sönük başlar; Aufbau
//           sırası ona gelince YÜKSELİR ve blok rengiyle yanar. Yani doldurma
//           tabloyu soldan sağa, satır satır KABARTAN bir dalga olarak geçiyor.
//
// AUFBAU SIRASI (Madelung n+ℓ): 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p
// 7s 5f 6d 7p. Kapasiteler 2+2+6+2+6+2+10+6+2+10+6+2+14+10+6+2+14+10+6 = 118.
// Toplam Node'da doğrulandı; hücrenin dolum sırası = atom numarası.
//
// ⚠ GRUP 3: bu tablo geleneksel/TKD biçimini kullanıyor — lantan ve aktinyum
// grup 3'te, f-blok satırları Ce–Lu ve Th–Lr. Makalenin 4. perdesi zaten bunun
// hâlâ tartışmalı olduğunu anlatıyor; biçimi değiştirirsen METNİ de değiştir.
//
// Perf disiplini diğer hero'larla aynı (heroPerf.ts): cihaz kademesi, kare
// ölçen bekçi, ekran dışında rAF durur, reduced-motion'da tek statik kare,
// cleanup'ta tam dispose, loseContext() ÇAĞRILMAZ (Strict Mode tuzağı).
// ─────────────────────────────────────────────────────────────────────────

const COLS = 18, ROWS = 10;        // 7 ana satır + boşluk + 2 f satırı
const PITCH = 0.34;                // hücre aralığı
const CW = 0.30;                   // hücre kenarı
const BASE_H = 0.05;               // yatık (dolmamış) yükseklik
const WRAP = 96;                   // zaman sarması — mediump fract() için ŞART
const CYCLE = 16;                  // bir Aufbau turu (saniye)

// Blok kimliği — makaledeki ui.tsx BLOK sabitiyle AYNI renkler.
const BLOK_RENK = [
  new THREE.Color('#60a5fa'),   // 0 s
  new THREE.Color('#4ade80'),   // 1 p
  new THREE.Color('#fbbf24'),   // 2 d
  new THREE.Color('#e879f9'),   // 3 f
];
const BLOK_YUKSEK = [0.34, 0.46, 0.60, 0.78];   // kapasiteyle artan kabartma

/** Madelung dizisi: [blok indeksi, o alt kabuğun bittiği Z]. */
const AUFBAU: [number, number][] = [
  [0, 2], [0, 4], [1, 10], [0, 12], [1, 18], [0, 20], [2, 30], [1, 36], [0, 38],
  [2, 48], [1, 54], [0, 56], [3, 70], [2, 80], [1, 86], [0, 88], [3, 102], [2, 112], [1, 118],
];

/** Z → ızgara konumu. sim-tablo.tsx'teki konum() ile BİREBİR aynı mantık. */
function konum(z: number, blok: number): { c: number; r: number } {
  if (blok === 3) {
    const bas = z <= 71 ? 58 : 90;
    return { c: 3 + (z - bas), r: z <= 71 ? 9 : 10 };
  }
  // grup/periyot — elements.ts'teki yerlesim() ile aynı
  const P: [number, number][] = [[1, 2], [3, 10], [11, 18], [19, 36], [37, 54], [55, 86], [87, 118]];
  const periyot = P.findIndex(([a, b]) => z >= a && z <= b) + 1;
  if (z === 1) return { c: 1, r: 1 };
  if (z === 2) return { c: 18, r: 1 };
  let grup: number;
  if (periyot === 2 || periyot === 3) {
    const i = z - (periyot === 2 ? 3 : 11);
    grup = i < 2 ? i + 1 : i + 11;
  } else if (periyot === 4 || periyot === 5) {
    grup = z - (periyot === 4 ? 19 : 37) + 1;
  } else {
    const taban = periyot === 6 ? 55 : 87;
    grup = z <= taban + 2 ? z - taban + 1 : z - taban - 14 + 1;
  }
  return { c: grup, r: periyot };
}

/** Z → blok indeksi (AUFBAU dizisinden türetilir, elle yazılmaz). */
function blokOf(z: number): number {
  for (const [b, son] of AUFBAU) if (z <= son) return b;
  return 1;
}

const cellVertex = `
attribute vec2 aMeta;          // x = dolum sırası (Z), y = blok indeksi
uniform float uFill;
uniform float uTime;
varying vec3 vN;
varying float vLit;
varying float vBlok;
varying float vPulse;

void main() {
  float z = aMeta.x;
  vBlok = aMeta.y;

  // Dolum ilerlemesi: 0 = yatık ve sönük, 1 = yükselmiş ve yanıyor.
  float lit = clamp((uFill - z) * 0.55 + 1.0, 0.0, 1.0);
  vLit = lit;
  // Tam o an dolan hücre kısa bir parlama yapar.
  vPulse = exp(-abs(uFill - z) * 1.1);

  vec3 p = position;
  // Yükseklik SADECE Y'de ölçeklenir; kutu tabanı sabit kalsın diye +0.5 kaydırma.
  float h = mix(${BASE_H.toFixed(3)}, aMeta.y > 2.5 ? ${BLOK_YUKSEK[3].toFixed(2)} : (aMeta.y > 1.5 ? ${BLOK_YUKSEK[2].toFixed(2)} : (aMeta.y > 0.5 ? ${BLOK_YUKSEK[1].toFixed(2)} : ${BLOK_YUKSEK[0].toFixed(2)})), lit);
  p.y = (p.y + 0.5) * h;

  // ShaderMaterial'da begin_vertex chunk'ı yok → instanceMatrix ELLE uygulanır.
  vec4 wp = instanceMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * (mat3(instanceMatrix) * normal));
  gl_Position = projectionMatrix * modelViewMatrix * wp;
}`;

const cellFragment = `
precision mediump float;
uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
uniform vec3 uLightDir;
varying vec3 vN;
varying float vLit;
varying float vBlok;
varying float vPulse;

void main() {
  vec3 col = vBlok > 2.5 ? uC3 : (vBlok > 1.5 ? uC2 : (vBlok > 0.5 ? uC1 : uC0));
  float d = max(dot(normalize(vN), normalize(uLightDir)), 0.0);
  // Dolmamış hücre: koyu, mat, neredeyse görünmez bir iskelet.
  vec3 sonuk = col * 0.10;
  vec3 dolu  = col * (0.34 + d * 0.72);
  vec3 son = mix(sonuk, dolu, vLit) + col * vPulse * 0.85;
  gl_FragColor = vec4(son, 1.0);
}`;

const lobeVertex = `
varying vec3 vN; varying vec3 vP;
void main() {
  vN = normalize(normalMatrix * normal);
  vP = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const lobeFragment = `
precision mediump float;
uniform vec3 uColor; uniform float uOn;
varying vec3 vN; varying vec3 vP;
void main() {
  // Fresnel: kenarlar parlak, yüzey saydam → "bulut" hissi.
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 2.2);
  gl_FragColor = vec4(uColor * (0.25 + f * 1.5) * uOn, (0.05 + f * 0.5) * uOn);
}`;

export default function ThreePeriodicHero() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    try {
      const tier = deviceTier();
      const canvas = document.createElement('canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap(tier)));
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      const rig = new THREE.Group();
      scene.add(rig);

      // ── ARKA KATMAN: dört orbital silüeti ──
      const lobeGeos: THREE.BufferGeometry[] = [];
      const lobeMats: THREE.ShaderMaterial[] = [];
      const lobeGroups: THREE.Group[] = [];
      const SEG = tier === 'low' ? 12 : 20;

      for (let b = 0; b < 4; b++) {
        const g = new THREE.Group();
        const mat = new THREE.ShaderMaterial({
          vertexShader: lobeVertex, fragmentShader: lobeFragment,
          uniforms: { uColor: { value: BLOK_RENK[b].clone() }, uOn: { value: 0 } },
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        });
        lobeMats.push(mat);

        // s = küre · p = iki lob · d = dört lob · f = altı lob
        const lobSayi = [0, 2, 4, 6][b];
        if (lobSayi === 0) {
          const geo = new THREE.SphereGeometry(0.62, SEG, SEG);
          lobeGeos.push(geo);
          g.add(new THREE.Mesh(geo, mat));
        } else {
          const geo = new THREE.SphereGeometry(0.42, SEG, SEG);
          geo.scale(0.62, 1.5, 0.62);
          geo.translate(0, 0.58, 0);
          lobeGeos.push(geo);
          for (let i = 0; i < lobSayi; i++) {
            const m = new THREE.Mesh(geo, mat);
            m.rotation.z = (i / lobSayi) * Math.PI * 2;
            g.add(m);
          }
        }
        g.position.set(0, 0, -2.2);
        g.visible = false;
        rig.add(g);
        lobeGroups.push(g);
      }

      // ── ÖN KATMAN: 118 hücre, tek InstancedMesh ──
      const cellGeo = new THREE.BoxGeometry(CW, 1, CW);
      const aMeta = new Float32Array(118 * 2);
      const cellMat = new THREE.ShaderMaterial({
        vertexShader: cellVertex, fragmentShader: cellFragment,
        uniforms: {
          uFill: { value: 0 }, uTime: { value: 0 },
          uC0: { value: BLOK_RENK[0].clone() }, uC1: { value: BLOK_RENK[1].clone() },
          uC2: { value: BLOK_RENK[2].clone() }, uC3: { value: BLOK_RENK[3].clone() },
          uLightDir: { value: new THREE.Vector3(0.4, 1, 0.6).normalize() },
        },
      });
      const cells = new THREE.InstancedMesh(cellGeo, cellMat, 118);
      const dummy = new THREE.Object3D();
      const cx = (COLS + 1) / 2, cz = 5.6;
      for (let z = 1; z <= 118; z++) {
        const b = blokOf(z);
        const { c, r } = konum(z, b);
        dummy.position.set((c - cx) * PITCH, 0, (r - cz + (r >= 9 ? 0.5 : 0)) * PITCH);
        dummy.updateMatrix();
        cells.setMatrixAt(z - 1, dummy.matrix);
        aMeta[(z - 1) * 2] = z;
        aMeta[(z - 1) * 2 + 1] = b;
      }
      cellGeo.setAttribute('aMeta', new THREE.InstancedBufferAttribute(aMeta, 2));
      // ZORUNLU: three, InstancedMesh'in bounding sphere'ini GEOMETRİDEN hesaplar
      // (tek hücrelik minik küre) → yalpalamada 118 hücrenin TAMAMI sessizce kaybolur.
      cells.frustumCulled = false;
      cells.instanceMatrix.needsUpdate = true;
      rig.add(cells);

      // ── KADRAJ: sabit sayı yok, çözülüyor ──
      const W = COLS * PITCH, D = ROWS * PITCH;
      let dCam = 8;
      const v = new THREE.Vector3();
      const KOSE: [number, number][] = [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]];
      const applyFrame = (w: number, h: number) => {
        const aspect = w / h;
        const portrait = aspect < 0.85;
        camera.fov = portrait ? 46 : 34;
        camera.aspect = aspect;
        const el = portrait ? 0.72 : 0.58;
        // Tablo 18:10 oranında çok geniş — portrede yatay sınır bağlayıcı olur ve
        // hücreler okunmaz hâle gelir; o yüzden portrede kadraj bilerek gevşetildi.
        const hedefX = portrait ? 0.98 : 0.86;
        for (let i = 0; i < 8; i++) {
          camera.position.set(0, Math.sin(el) * dCam, Math.cos(el) * dCam);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld(true);
          let mx = 0, yMax = -9, yMin = 9;
          for (const [x, z] of KOSE) {
            v.set(x, 0, z).project(camera);
            mx = Math.max(mx, Math.abs(v.x));
            yMax = Math.max(yMax, v.y); yMin = Math.min(yMin, v.y);
          }
          dCam *= Math.max(mx / hedefX, (yMax - yMin) / 0.80);
        }
        cellMat.uniforms.uLightDir.value.set(0.4, 1, 0.6).normalize().transformDirection(camera.matrixWorldInverse);
      };

      const resize = () => {
        const w = host.clientWidth || window.innerWidth || 1200;
        const h = host.clientHeight || window.innerHeight || 800;
        renderer.setSize(w, h, false);
        applyFrame(w, h);
      };
      resize();
      window.addEventListener('resize', resize);

      // ⚠ SAAT KAYDIRILDI, sıfırdan başlamıyor. Sebep ölçüldü: t=0'da uFill=0 →
      // 118 hücrenin HEPSİ "dolmamış" durumda, yani %10 parlaklıkta. İlk boyanan
      // kare neredeyse siyah bir ızgara oluyordu (piksel okundu: ortalama
      // rgb(20,10,16)). Turun ortasından başlayınca ilk kare de dolu bir tablo
      // gösteriyor ve animasyon oradan KESİNTİSİZ devam ediyor — ayrı bir
      // "açılış karesi" çizip sonra başa sarmak görünür bir sıçrama yapardı.
      const start = performance.now() - CYCLE * 0.55 * 1000;
      const draw = (now: number) => {
        const t = ((now - start) / 1000) % WRAP;   // mediump fract() çözünürlüğü için ŞART
        // Aufbau turu: 0 → 130 (sonda kısa bir "hepsi dolu" duruşu bırakır)
        const fill = ((t % CYCLE) / CYCLE) * 132;
        cellMat.uniforms.uFill.value = fill;
        cellMat.uniforms.uTime.value = t;

        // O an hangi blok doluyor? Lobu yak, ötekileri söndür.
        const aktif = blokOf(Math.max(1, Math.min(118, Math.round(fill))));
        for (let b = 0; b < 4; b++) {
          const hedef = b === aktif && fill < 120 ? 1 : 0;
          const u = lobeMats[b].uniforms.uOn;
          u.value += (hedef - u.value) * 0.06;
          lobeGroups[b].visible = u.value > 0.01;
          lobeGroups[b].rotation.y = t * 0.22;
          lobeGroups[b].rotation.x = 0.3 + Math.sin(t * 0.17) * 0.08;
        }

        rig.rotation.y = Math.sin(t * 0.16) * 0.085;
        rig.rotation.z = Math.sin(t * 0.11) * 0.028;
        renderer.render(scene, camera);
      };

      // MOUNT STALL: makeFpsGuard bunu yapısal olarak göremez (WARMUP 60 kare atar).
      const t0 = performance.now();
      draw(performance.now());
      if (performance.now() - t0 > 220) { renderer.setPixelRatio(1); resize(); }

      let frozen = false;
      const guard = makeFpsGuard(
        () => { renderer.setPixelRatio(1); resize(); },
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
        cellGeo.dispose();
        cellMat.dispose();
        lobeGeos.forEach((g) => g.dispose());
        lobeMats.forEach((m) => m.dispose());
        renderer.dispose();
        canvas.remove();
        // loseContext() ÇAĞRILMAZ: Strict Mode remount'ta bağlamı öldürür.
      };
    } catch { /* WebGL yoksa: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
