'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// TEK SEFERLİK three.js DENEYİ (kuantum-olumsuzlugu hero'su — Möbius şeridi).
// Neden burada three.js: ogl'de elle yazması zahmetli olan üç şeyi hazır verir —
//   1) MeshPhysicalMaterial + IRIDESCENCE (yanardöner ince-film girişimi)
//   2) RoomEnvironment + PMREM → gerçek stüdyo ortam yansıması (IBL)
//   3) ACES filmic tone mapping
// MALİYET: ~150KB gz. `dynamic(ssr:false)` ile YALNIZCA bu makalenin chunk'ına
// iner; diğer 31 makale etkilenmez. Beğenilmezse tek commit geri alınır.
//
// Perf disiplini Object3DHero ile aynı: dpr min 1.75, IntersectionObserver ile
// ekran dışında rAF DURUR, prefers-reduced-motion'da tek statik kare, cleanup'ta
// tam dispose. Canvas effect içinde OLUŞTURULUP temizlikte kaldırılır → React
// Strict Mode remount'unda bağlam çakışması olmaz (ogl'deki loseContext dersi).
// Canvas alpha:true → arkadaki ArticleHero radyal-gradyan zemini görünür.
// ─────────────────────────────────────────────────────────────────────────

/** Möbius şeridi: parametrik yüzey (yarım burgulu kapalı şerit). */
function mobiusGeometry(R: number, w: number, uSeg: number, vSeg: number) {
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= uSeg; i++) {
    const u = (i / uSeg) * Math.PI * 2;
    const cu = Math.cos(u), su = Math.sin(u), c2 = Math.cos(u / 2), s2 = Math.sin(u / 2);
    for (let j = 0; j <= vSeg; j++) {
      const v = (j / vSeg - 0.5) * 2 * w;
      const r = R + v * c2;
      pos.push(r * cu, r * su, v * s2);
    }
  }
  const row = vSeg + 1;
  for (let i = 0; i < uSeg; i++) for (let j = 0; j < vSeg; j++) {
    const a = i * row + j, b = (i + 1) * row + j;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export default function ThreeMobiusHero() {
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

      // zayıf cihazda MSAA kapalı (mobil GPU'da pahalı; dpr zaten 1'e iniyor)
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: tier !== 'low', powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap(tier)));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 6.5);

      // IBL: stüdyo ortamı → gerçek yansımalar (three'nin en güçlü kısayolu)
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;

      const uSeg = tier === 'low' ? 150 : tier === 'mid' ? 210 : 280;
      const vSeg = tier === 'low' ? 16 : tier === 'mid' ? 20 : 26;
      const geo = mobiusGeometry(1.25, 0.40, uSeg, vSeg);
      // clearcoat = İKİNCİ specular katmanı; zayıf cihazda kapatılır.
      // iridescence (yanardönerlik) sahnenin YILDIZI → her sınıfta kalır.
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x16203c, metalness: 1, roughness: 0.16, envMapIntensity: 2.2,
        iridescence: 1, iridescenceIOR: 1.5, iridescenceThicknessRange: [120, 640],
        clearcoat: tier === 'low' ? 0 : 0.6, clearcoatRoughness: 0.25, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 5); scene.add(key);
      const teal = new THREE.PointLight(0x2dd4bf, 18, 22); teal.position.set(-3.5, 1.5, 2.5); scene.add(teal);
      const violet = new THREE.PointLight(0x8b5cf6, 16, 22); violet.position.set(3, -2.5, 2); scene.add(violet);

      const resize = () => {
        const w = host.clientWidth || window.innerWidth || 1200;
        const h = host.clientHeight || window.innerHeight || 800;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener('resize', resize);

      const start = performance.now();
      const draw = (now: number) => {
        const t = (now - start) / 1000;
        mesh.rotation.y = t * 0.35;
        mesh.rotation.x = -0.55 + Math.sin(t * 0.4) * 0.12;
        mesh.position.y = Math.sin(t * 0.5) * 0.08;
        renderer.render(scene, camera);
      };
      draw(reduce ? start + 4000 : start); // ilk kareyi SENKRON çiz

      // FPS bekçisi: yavaş cihazda önce çözünürlük düşer, hâlâ yavaşsa animasyon
      // DONAR (son kare kalır) → kilitlenme yerine durağan bir görsel.
      let frozen = false;
      const guard = makeFpsGuard(
        () => { renderer.setPixelRatio(1); resize(); },
        () => { frozen = true; },
      );

      let visible = true;
      const loop = (now: number) => {
        if (!visible || frozen) { raf = 0; return; }   // ekran dışı ya da donmuş → dur
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
        geo.dispose(); mat.dispose(); envRT.dispose(); pmrem.dispose(); renderer.dispose();
        canvas.remove();
      };
    } catch { /* WebGL yoksa sessiz: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
