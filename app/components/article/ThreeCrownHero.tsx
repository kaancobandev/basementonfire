'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// DÖRT TAÇLI VENEDİK MİĞFERİ (kanuni hero’su) — three.js.
//
// NEDEN BU OBJE: 1532’de İbrahim Paşa’nın siparişiyle Venedik’te (kuyumcu Luigi
// Caorlini) yapıldı. Avusturya tipi bir miğferin üstüne DÖRT taç oturtulmuş;
// tepesinde hilal taşıyan sorguç var. Papa’nın tiarası ÜÇ katlıydı — dördüncü
// taç, sayıyla üstünlük iddiasıdır. Ve kaynaklara göre Süleyman onu muhtemelen
// hiç takmadı: Batılı elçilere sergilenen bir propaganda objesiydi.
//
// TASARIM HAMLESİ: hero’nun kendisi makalenin İLK TUZAĞI. Okur 20 saniye dönen
// mücevherli tacı izler; Perde 1’de bunun bir rekvizit olduğunu öğrenir.
//
// GEOMETRİ SAF PRİMİTİF: lathe (miğfer kubbesi) + 4 × açık silindir bant +
// torus çemberler + koni fleuronlar + küre mücevherler + sorguç. Dış varlık,
// model dosyası, doku indirmesi YOK → lisans ve CSP riski sıfır.
//
// ALTIN NEDEN ENV-MAP İSTER: metalness=1 materyal, ortam yansıması olmadan
// neredeyse siyah çıkar (yalnız specular nokta görünür). Bu yüzden 64×32’lik
// KÜÇÜK bir canvas gradyanından PMREM ile ortam üretiliyor — dosya indirilmiyor.
//
// Perf disiplini diğer hero’larla aynı (heroPerf.ts): cihaz kademesi, kare ölçen
// bekçi, ekran dışında rAF durur, reduced-motion’da tek statik kare, cleanup’ta
// tam dispose, loseContext() ÇAĞRILMAZ (Strict Mode tuzağı).
// ─────────────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;

const GOLD = 0xf0bd55;        // ölçüldü: 0xd9a441 koyu camda kahverengiye kaçıyordu
const GOLD_DEEP = 0xa8752a;   // çemberler/kenar — gövdeden bir ton koyu, ama kahve değil
const PEARL = 0xf2ece0;

/** Taç katmanları: aşağıdan yukarı ÇOK AZ daralan dört bant.
 *  İlk denemede yarıçaplar 0.78→0.44 idi (sert daralma) ve obje taç değil
 *  DÜĞÜN PASTASI gibi okunuyordu (ölçüldü, ekran görüntüsüyle doğrulandı).
 *  Gerçek objede dört taç birbirine yakın çaplıdır; siluet kule gibi dik. */
const TIERS = [
  { y: 0.66, r: 0.80, h: 0.22, pts: 12 },
  { y: 0.99, r: 0.76, h: 0.21, pts: 11 },
  { y: 1.31, r: 0.71, h: 0.20, pts: 10 },
  { y: 1.62, r: 0.66, h: 0.19, pts: 9 },
];

/** Miğfer kubbesi profili (lathe): tepeden aşağı, x = yarıçap. */
function domeProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const STEPS = 16;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;                  // 0 tepe → 1 etek
    const a = t * (Math.PI * 0.5);
    pts.push(new THREE.Vector2(Math.sin(a) * 0.90, 0.56 * Math.cos(a)));
  }
  pts.push(new THREE.Vector2(0.93, -0.02));   // etek kalınlığı
  pts.push(new THREE.Vector2(0.93, -0.10));
  return pts;
}

/** Küçük bir gradyan canvas → equirect doku → PMREM ortam haritası. */
function makeEnv(renderer: THREE.WebGLRenderer): { env: THREE.Texture; dispose: () => void } | null {
  try {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 32;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createLinearGradient(0, 0, 0, 32);
    g.addColorStop(0.00, '#cfd6ff');   // üstte soğuk gök (kobalt gece)
    g.addColorStop(0.38, '#6b74a8');
    g.addColorStop(0.55, '#3a3f6a');
    // ALT YARI BİLEREK KOYU DEĞİL: miğfer kubbesi (objenin en büyük kütlesi)
    // alt yarım küreyi yansıtıyor; ilk denemede #07091a idi ve kubbe siyah bir
    // leke gibi çıktı (ekran görüntüsüyle ölçüldü).
    g.addColorStop(1.00, '#241c2e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 32);
    // tek sıcak ışık lekesi: altın üstünde gezinen vurgu
    const s = ctx.createRadialGradient(16, 8, 0, 16, 8, 14);
    s.addColorStop(0, 'rgba(255,236,200,0.95)');
    s.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = s;
    ctx.fillRect(0, 0, 40, 24);

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose();
    pmrem.dispose();
    return { env, dispose: () => env.dispose() };
  } catch {
    return null;
  }
}

export default function ThreeCrownHero() {
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
      renderer.toneMappingExposure = 1.5;   // altın koyu zeminde sönük kalıyordu

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 60);
      const rig = new THREE.Group();
      scene.add(rig);
      // Taç yerel uzayda y = -0.16 … 2.65 arasında duruyor, yani merkezi ~1.24.
      // Kamera (0,0,0)'a baktığı için offsetlenmezse obje kadrajın ÜSTÜNDE kalır
      // (ilk denemede ekranda hiç görünmedi). Gövde aşağı kaydırılıyor → rig'in
      // merkezi objenin merkezi olur, kadraj matematiği simetrik çalışır.
      const body = new THREE.Group();
      body.position.y = -1.35;   // objenin yerel merkezi (~-0.16 … 2.85 aralığı)
      rig.add(body);

      const envPack = makeEnv(renderer);
      if (envPack) scene.environment = envPack.env;

      // ── Çözünürlük kademesi: düşük cihazda daha az segment, daha az mücevher ──
      const SEG = tier === 'low' ? 20 : tier === 'mid' ? 32 : 48;
      const RING_SEG = tier === 'low' ? 6 : 10;
      const jewelsOn = tier !== 'low';

      const geos: THREE.BufferGeometry[] = [];
      const mats: THREE.Material[] = [];
      const keep = <T extends THREE.BufferGeometry>(g: T) => { geos.push(g); return g; };

      const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.94, roughness: 0.24, envMapIntensity: 1.35 });
      const goldDeepMat = new THREE.MeshStandardMaterial({ color: GOLD_DEEP, metalness: 0.9, roughness: 0.38, envMapIntensity: 1.1 });
      const pearlMat = new THREE.MeshStandardMaterial({ color: PEARL, metalness: 0.05, roughness: 0.62, envMapIntensity: 0.9 });
      const rubyMat = new THREE.MeshStandardMaterial({ color: 0xc32b34, metalness: 0.25, roughness: 0.12, envMapIntensity: 1.6, emissive: 0x2a0406 });
      const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x1f9c74, metalness: 0.25, roughness: 0.12, envMapIntensity: 1.6, emissive: 0x03210f });
      mats.push(goldMat, goldDeepMat, pearlMat, rubyMat, emeraldMat);

      // ── Miğfer kubbesi ──
      const dome = new THREE.Mesh(keep(new THREE.LatheGeometry(domeProfile(), SEG)), goldMat);
      body.add(dome);

      // Kubbe eteğindeki kalın çember (Avusturya tipi miğferin kenarı)
      const brim = new THREE.Mesh(keep(new THREE.TorusGeometry(0.93, 0.055, RING_SEG, SEG)), goldDeepMat);
      brim.rotation.x = Math.PI / 2;
      brim.position.y = -0.06;
      body.add(brim);

      // ── Dört taç ──
      const bandGeoCache = new Map<string, THREE.BufferGeometry>();
      TIERS.forEach((t, ti) => {
        // bant (açık silindir)
        const bk = `b${t.r}${t.h}`;
        let band = bandGeoCache.get(bk);
        if (!band) { band = keep(new THREE.CylinderGeometry(t.r, t.r * 1.03, t.h, SEG, 1, true)); bandGeoCache.set(bk, band); }
        const bandMesh = new THREE.Mesh(band, goldMat);
        bandMesh.position.y = t.y;
        body.add(bandMesh);

        // bandın alt ve üst çemberi
        for (const dy of [-t.h / 2, t.h / 2]) {
          const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(t.r * (dy < 0 ? 1.03 : 1.0), 0.026, RING_SEG, SEG)), goldDeepMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = t.y + dy;
          body.add(ring);
        }

        // fleuronlar (tacın uçları) — bir büyük bir küçük dönüşümlü.
        // Kısaltıldı: uzun uçlar silueti dikenli bir çam gibi gösteriyordu.
        const coneBig = keep(new THREE.ConeGeometry(0.05, 0.12, 6));
        const coneSm = keep(new THREE.ConeGeometry(0.036, 0.075, 6));
        for (let i = 0; i < t.pts; i++) {
          const a = (i / t.pts) * TAU;
          const big = i % 2 === 0;
          const c = new THREE.Mesh(big ? coneBig : coneSm, goldMat);
          c.position.set(Math.cos(a) * t.r, t.y + t.h / 2 + (big ? 0.06 : 0.037), Math.sin(a) * t.r);
          body.add(c);
          // mücevher: büyük uçların dibinde
          if (jewelsOn && big) {
            const j = new THREE.Mesh(keep(new THREE.SphereGeometry(0.032, 8, 6)), (ti + i) % 3 === 0 ? emeraldMat : rubyMat);
            j.position.set(Math.cos(a) * t.r * 1.02, t.y, Math.sin(a) * t.r * 1.02);
            body.add(j);
          }
        }
      });

      // ── Tepe: küçük küre + hilal taşıyan sorguç ──
      const finial = new THREE.Mesh(keep(new THREE.SphereGeometry(0.085, SEG / 2, SEG / 3)), goldMat);
      finial.position.y = 1.82;
      body.add(finial);

      // hilal (açık torus yayı)
      const crescent = new THREE.Mesh(keep(new THREE.TorusGeometry(0.16, 0.03, RING_SEG, 24, Math.PI * 1.35)), goldMat);
      crescent.position.y = 2.0;
      crescent.rotation.z = -Math.PI * 0.32;
      body.add(crescent);

      // sorguç: yelpaze hâlinde ince tüyler
      const featherGeo = keep(new THREE.ConeGeometry(0.045, 0.85, 5));
      const FEATHERS = tier === 'low' ? 3 : 5;
      for (let i = 0; i < FEATHERS; i++) {
        const f = new THREE.Mesh(featherGeo, pearlMat);
        const k = (i - (FEATHERS - 1) / 2) / Math.max(1, FEATHERS - 1);
        f.position.set(k * 0.16, 2.36 + Math.cos(k * 2.2) * 0.06, -0.02 + Math.abs(k) * 0.05);
        f.rotation.z = -k * 0.55;
        f.scale.y = 1 - Math.abs(k) * 0.22;
        body.add(f);
      }

      // ── Işıklar (env zaten var; bunlar biçimi okutur) ──
      const key = new THREE.DirectionalLight(0xfff1d8, 2.1);
      key.position.set(-2.4, 3.2, 3.0);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8fa8ff, 1.05);
      rim.position.set(3.0, 0.6, -2.4);
      scene.add(rim);
      // Alt dolgu: miğfer kubbesi (objenin en alt kütlesi) anahtar ışığın
      // gölgesinde kalıp neredeyse siyah çıkıyordu — ölçüldü, eklendi.
      const fill = new THREE.DirectionalLight(0xffd9a8, 1.25);
      fill.position.set(0.6, -2.6, 2.2);
      scene.add(fill);
      scene.add(new THREE.HemisphereLight(0xaebbff, 0x1a1408, 0.7));

      // ── Kadraj: sabit sayı yok, çözülüyor (rose/chip hero ile aynı disiplin) ──
      // Obje yüksek ve dar; kadrajı DİKEY uzunluk belirler. Taç ALT YARIYA oturur,
      // üst yarı başlığa kalır.
      // Değerler RIG uzayında (yani body'nin -1.35 offset'i ZATEN uygulanmış):
      // yerel 2.85 (sorguç ucu) → 1.50, yerel -0.16 (miğfer eteği) → -1.51.
      // CORNERS rig.matrixWorld ile çarpıldığı için offset'i elle düşmek şart.
      const H_TOP = 1.50, H_BOT = -1.51, R_MAX = 0.99;
      const CORNERS: [number, number, number][] = [
        [-R_MAX, H_BOT, 0], [R_MAX, H_BOT, 0], [0, H_TOP, 0], [0, H_BOT, R_MAX], [0, H_BOT, -R_MAX],
      ];
      let dCam = 8;
      const v = new THREE.Vector3();
      const applyFrame = (w: number, h: number) => {
        const aspect = w / h;
        const portrait = aspect < 0.85;
        camera.fov = portrait ? 40 : 32;
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
          // Dikey doluluk: portrede biraz daha küçük (metin bloğu uzun).
          // K = objenin oturacağı NDC yüksekliği. ÖLÇÜLDÜ (1568×754 ekran):
          // başlık + alt başlık bloğu hero'nun 360–535 px'ini kaplıyor, geriye
          // ~250 px kalıyor. 1.16 ve 0.98 denendi, ikisinde de sorguç alt
          // başlığın içinden geçti. 0.58 → taç metnin ALTINDA, tamamı görünür.
          dCam *= Math.max(mx / 0.84, (yMax - yMin) / (portrait ? 0.50 : 0.55));
        }
        // Merkezi aşağı kaydır: üst yarı başlığa kalsın. -0.70 fazla aşağıdaydı
        // (tacın yarısı ekran altında kalıyordu); -0.60 ile tamamı görünür ve
        // metin bloğunun altında duruyor.
        const TARGET = portrait ? -0.64 : -0.60;
        camera.projectionMatrix.elements[9] += -(TARGET - (yMax + yMin) * 0.5);
        let lo = 9, hi = -9;
        for (const c of CORNERS) { v.set(c[0], c[1], c[2]).applyMatrix4(rig.matrixWorld).project(camera); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); }
        const resid = TARGET - (lo + hi) * 0.5;
        if (Math.abs(resid) > 0.02) camera.projectionMatrix.elements[9] += resid;
      };

      const resize = () => {
        const w = host.clientWidth || window.innerWidth || 1200;
        const h = host.clientHeight || window.innerHeight || 800;
        renderer.setSize(w, h, false);
        rig.updateMatrixWorld(true);
        applyFrame(w, h);
      };

      const start = performance.now();
      const T_STILL = 3.2;   // reduced-motion’da gösterilecek "güzel" kare
      const draw = (now: number) => {
        const t = ((now - start) / 1000) % 3600;
        // Yavaş dönüş + çok hafif salınım. Taç bir vitrin objesi gibi dönüyor —
        // çünkü tam olarak oydu.
        rig.rotation.y = t * 0.19;
        rig.rotation.x = -0.06 + Math.sin(t * 0.24) * 0.035;
        rig.position.y = Math.sin(t * 0.33) * 0.018;
        renderer.render(scene, camera);
      };

      resize();
      window.addEventListener('resize', resize);

      const t0 = performance.now();
      draw(reduce ? start + T_STILL * 1000 : start);
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
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        envPack?.dispose();
        renderer.dispose();
        canvas.remove();
        // loseContext() ÇAĞRILMAZ: Strict Mode remount’ta bağlamı öldürür.
      };
    } catch { /* WebGL yoksa: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
