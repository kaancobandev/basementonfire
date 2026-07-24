'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ─────────────────────────────────────────────────────────────────────────
// ÇİFT YARIK DENEYİ (cift-yarik hero'su) — three.js.
// Fiziksel olarak doğru: gelen DÜZ DALGA → iki yarıklı bariyer → arkada iki
// dairesel dalganın SÜPERPOZİSYONU → girişim saçakları. Dalga yüksekliği ve
// normalleri VERTEX SHADER'da hesaplanır (GPU) → CPU'ya yük yok.
//   y < yB : h = A·sin(k(y-yB) - ωt)                        (düz dalga)
//   y > yB : h = Σ A·sin(k·rᵢ - ωt)/√rᵢ  (i = iki yarık)     (dairesel + girişim)
// Perf disiplini diğer hero'larla aynı: dpr min 1.75, IntersectionObserver ile
// ekran dışında rAF durur, reduced-motion'da tek kare, cleanup'ta tam dispose,
// canvas effect içinde oluşturulup kaldırılır (Strict Mode bağlam tuzağı yok).
// ─────────────────────────────────────────────────────────────────────────

const YB = -0.6;      // bariyerin düzlem-yerel y'si
const SLIT_X = 0.42;  // yarık merkezleri (±)
const SLIT_HW = 0.13; // yarık yarı-genişliği

const vertexShader = `
uniform float uTime;
varying float vH;
varying vec3 vNormalV;
varying vec3 vViewPos;

const float YB = ${YB.toFixed(2)};
const float SX = ${SLIT_X.toFixed(2)};
const float K  = 7.0;      // dalga sayısı
const float W  = 3.0;      // açısal frekans
const float A  = 0.16;     // genlik

float waveH(vec2 p, float t){
  if (p.y < YB) {
    return A * sin(K * (p.y - YB) - W * t) * 0.85;          // gelen düz dalga
  }
  vec2 s1 = vec2(-SX, YB), s2 = vec2(SX, YB);
  float r1 = distance(p, s1), r2 = distance(p, s2);
  float d1 = sin(K * r1 - W * t) / sqrt(max(r1, 0.28));
  float d2 = sin(K * r2 - W * t) / sqrt(max(r2, 0.28));
  return A * (d1 + d2) * 0.55;                               // süperpozisyon
}

void main(){
  vec2 p = position.xy;
  float h = waveH(p, uTime);
  // normal: analitik fonksiyondan sonlu farklarla
  float e = 0.02;
  float hL = waveH(p + vec2(-e, 0.0), uTime), hR = waveH(p + vec2(e, 0.0), uTime);
  float hD = waveH(p + vec2(0.0, -e), uTime), hU = waveH(p + vec2(0.0, e), uTime);
  vec3 nrm = normalize(vec3((hL - hR) / (2.0 * e), (hD - hU) / (2.0 * e), 1.0));

  vH = h;
  vNormalV = normalize(normalMatrix * nrm);
  vec4 mv = modelViewMatrix * vec4(p.x, p.y, h, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = `
varying float vH;
varying vec3 vNormalV;
varying vec3 vViewPos;

void main(){
  vec3 N = normalize(vNormalV);
  vec3 V = normalize(-vViewPos);
  vec3 L = normalize(vec3(0.35, 0.75, 0.55));
  vec3 H = normalize(L + V);

  vec3 cLow  = vec3(0.09, 0.03, 0.26);   // çukur: koyu mor
  vec3 cMid  = vec3(0.36, 0.16, 0.72);   // menekşe
  vec3 cHigh = vec3(0.36, 0.86, 1.00);   // tepe: camgöbeği
  float t01 = clamp(vH * 3.2 + 0.5, 0.0, 1.0);
  vec3 col = mix(cLow, cMid, smoothstep(0.0, 0.55, t01));
  col = mix(col, cHigh, smoothstep(0.55, 1.0, t01));

  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 44.0);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col = col * (0.42 + 0.72 * diff) + spec * 0.85 + fres * 0.18;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ThreeSlitHero() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    try {
      const canvas = document.createElement('canvas');
      canvas.className = 'absolute inset-0 h-full w-full';
      host.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 3.35, 3.95);
      camera.lookAt(0, 0, -0.85);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;

      const rig = new THREE.Group();
      scene.add(rig);

      // dalga yüzeyi (yerel XY düzlemi; +Z yer değiştirme → yatay yatır)
      const geo = new THREE.PlaneGeometry(7, 6, 240, 200);
      const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: { uTime: { value: 0 } } });
      const water = new THREE.Mesh(geo, mat);
      water.rotation.x = -Math.PI / 2;
      water.position.z = 0.2;
      rig.add(water);

      // iki yarıklı bariyer: yerel y=YB → dünya z=-YB
      const wallZ = -YB + 0.2;
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1b1230, metalness: 0.65, roughness: 0.3, envMapIntensity: 1.2 });
      const seg = (cx: number, w: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.34, 0.13), wallMat);
        m.position.set(cx, 0.1, wallZ);
        rig.add(m);
      };
      const halfW = 3.5;
      const lIn = -SLIT_X - SLIT_HW;              // sol yarığın dış kenarı (-0.55)
      seg((-halfW + lIn) / 2, halfW + lIn);       // sol duvar
      seg(0, 2 * (SLIT_X - SLIT_HW));             // iki yarık arasındaki orta blok
      seg((halfW - lIn) / 2, halfW + lIn);        // sağ duvar (simetrik)

      const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(2, 4, 3); scene.add(key);
      const fill = new THREE.PointLight(0xa855f7, 14, 24); fill.position.set(-3, 2, 2); scene.add(fill);

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
        mat.uniforms.uTime.value = t;
        rig.rotation.y = Math.sin(t * 0.16) * 0.06;   // hafif salınım
        renderer.render(scene, camera);
      };
      draw(reduce ? start + 3000 : start);            // ilk kareyi SENKRON çiz

      let visible = true;
      const loop = (now: number) => {
        if (!visible) { raf = 0; return; }
        draw(now);
        raf = requestAnimationFrame(loop);
      };
      if (!reduce) raf = requestAnimationFrame(loop);

      const io = reduce ? null : new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      }, { rootMargin: '200px' });
      io?.observe(host);

      return () => {
        cancelAnimationFrame(raf);
        io?.disconnect();
        window.removeEventListener('resize', resize);
        geo.dispose(); mat.dispose(); wallMat.dispose();
        rig.traverse(o => { if (o instanceof THREE.Mesh) o.geometry.dispose(); });
        envRT.dispose(); pmrem.dispose(); renderer.dispose();
        canvas.remove();
      };
    } catch { /* WebGL yoksa: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
