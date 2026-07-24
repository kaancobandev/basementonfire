'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// KESİTLİ DÜNYA (dunya hero'su) — three.js.
//
// Gezegenden bir dilim çıkarılmış: içeri bakılıyor. Merkezden dışa
//   iç çekirdek (katı, akkor) → dış çekirdek (SIVI METAL, akan) →
//   manto → kabuk → yüzey (yeşillikler + denizler) → binalar → bulutlar
//
// Kesit yüzeyi tek bir yarım disk; katmanlar YARIÇAPA GÖRE fragment'ta
// boyanıyor. Dış çekirdek bandı akan türbülansla çiziliyor → erimiş metal.
// Bu sayede "katman katman geometri" yığmadan kesit keskin ve okunur çıkıyor.
//
// ARAZİ TEK KAYNAK: aynı 3B value-noise HEM GLSL'de (kara/deniz boyaması) HEM
// JS'te (binaların nereye dikileceği) var. İkisi ayrışırsa binalar denize
// dikilir — bu yüzden sabitler birebir aynı tutuldu (bkz. hash3/fbm3).
//
// Bu makalede ALT BÖLÜMDE cobe küresi var (ayrı WebGL bağlamı). Ölçüldü:
// tarayıcı ~16 bağlama izin veriyor, ikisi sorun değil.
//
// Perf disiplini diğer hero'larla aynı (heroPerf.ts).
// ─────────────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const R = 1.0;              // yüzey yarıçapı
const CUT_HALF = 0.62;      // çıkarılan dilimin yarı açısı (radyan)
const PHI0 = Math.PI / 2;   // dilim kameraya (+Z) bakar

// Katman yarıçapları (görsel; gerçek oranlara yakın tutuldu)
const R_INNER = 0.19;       // iç çekirdek
const R_OUTER = 0.55;       // dış çekirdek (sıvı metal)
const R_MANTLE = 0.94;      // manto üstü (bunun dışı kabuk)

/** Kesit düzlemi: Y eksenini içeren yarım disk (r 0..R, t 0..π). */
function buildCutFace(phi: number, rSeg: number, tSeg: number) {
  const dx = -Math.cos(phi), dz = Math.sin(phi);
  const P: number[] = [], UV: number[] = [];
  const put = (r: number, t: number) => {
    const s = Math.sin(t), c = Math.cos(t);
    P.push(dx * r * s, r * c, dz * r * s);
    UV.push(r / R, t / Math.PI);
  };
  for (let i = 0; i < rSeg; i++) {
    const r0 = (i / rSeg) * R, r1 = ((i + 1) / rSeg) * R;
    for (let j = 0; j < tSeg; j++) {
      const t0 = (j / tSeg) * Math.PI, t1 = ((j + 1) / tSeg) * Math.PI;
      put(r0, t0); put(r1, t0); put(r1, t1);
      put(r0, t0); put(r1, t1); put(r0, t1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
  g.computeVertexNormals();
  return g;
}

// ── Arazi gürültüsü: GLSL ve JS'te BİREBİR aynı ──
function hash3(x: number, y: number, z: number) {
  let h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  h -= Math.floor(h);
  return h;
}
function noise3(x: number, y: number, z: number) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (i: number, j: number, k: number) => hash3(ix + i, iy + j, iz + k);
  return L(
    L(L(c(0, 0, 0), c(1, 0, 0), ux), L(c(0, 1, 0), c(1, 1, 0), ux), uy),
    L(L(c(0, 0, 1), c(1, 0, 1), ux), L(c(0, 1, 1), c(1, 1, 1), ux), uy),
    uz);
}
function fbm3(x: number, y: number, z: number) {
  let v = 0, a = 0.5, f = 1.6;
  for (let i = 0; i < 5; i++) { v += a * noise3(x * f, y * f, z * f); a *= 0.5; f *= 2.03; }
  return v;
}
/**
 * ARAZİ YÜKSEKLİĞİ — >0.5 kara. GLSL'deki terrain() ile BİREBİR aynı olmalı,
 * yoksa binalar denize dikilir.
 * Düz fbm ızgaraya hizalı çıkıyordu: kıtalar dikdörtgen lekeler gibi görünüyor,
 * kıyılar merdiven yapıyordu ("piksel piksel"). ALAN BÜKME (domain warp) örnekleme
 * noktasını başka bir gürültüyle kaydırır → ızgara kırılır, kıyılar organikleşir.
 */
function terrain(x: number, y: number, z: number) {
  const wa = fbm3(x * 1.7 + 5.2, y * 1.7 + 1.3, z * 1.7 + 7.7);
  const wb = fbm3(x * 1.7 + 9.1, y * 1.7 + 4.4, z * 1.7 + 2.8);
  return fbm3((x + (wa - 0.5) * 0.85) * 2.35, (y + (wb - 0.5) * 0.85) * 2.35, (z + (wa - wb) * 0.85) * 2.35);
}

const GLSL_NOISE = `
float hash3(vec3 p){ return fract(sin(p.x*127.1 + p.y*311.7 + p.z*74.7) * 43758.5453); }
float noise3(vec3 p){
  vec3 i = floor(p), f = p - i;
  vec3 u = f * f * (3.0 - 2.0 * f);
  float n000=hash3(i), n100=hash3(i+vec3(1,0,0)), n010=hash3(i+vec3(0,1,0)), n110=hash3(i+vec3(1,1,0));
  float n001=hash3(i+vec3(0,0,1)), n101=hash3(i+vec3(1,0,1)), n011=hash3(i+vec3(0,1,1)), n111=hash3(i+vec3(1,1,1));
  return mix(mix(mix(n000,n100,u.x), mix(n010,n110,u.x), u.y),
             mix(mix(n001,n101,u.x), mix(n011,n111,u.x), u.y), u.z);
}
float fbm3(vec3 p){
  float v = 0.0, a = 0.5, f = 1.6;
  for (int i = 0; i < 5; i++) { v += a * noise3(p * f); a *= 0.5; f *= 2.03; }
  return v;
}
// ARAZİ: JS'teki terrain() ile BİREBİR aynı (yoksa binalar denize dikilir).
// Alan bükme ızgara hizalanmasını kırar → kıyılar merdiven değil, organik.
float terrain(vec3 p){
  float wa = fbm3(p * 1.7 + vec3(5.2, 1.3, 7.7));
  float wb = fbm3(p * 1.7 + vec3(9.1, 4.4, 2.8));
  return fbm3((p + vec3(wa - 0.5, wb - 0.5, wa - wb) * 0.85) * 2.35);
}
`;

// ═══ YÜZEY: kara + deniz + kutup buzu ═══
const surfaceVertex = `
varying vec3 vLocal; varying vec3 vN; varying vec3 vV;
void main(){
  vLocal = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const surfaceFragment = `
${GLSL_NOISE}
uniform vec3 uLightDir, uSea, uSeaDeep, uLand, uLandDry, uIce;
uniform vec2 uRes, uTitleC, uTitleR;
varying vec3 vLocal; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n = normalize(vLocal);
  float h = terrain(n);                            // JS terrain() ile AYNI
  // KIYI KENARI fwidth ile: sabit genişlikli smoothstep uzakta bulanık, yakında
  // merdivenli çıkıyordu. Piksel ayak izine göre ölçekleyince kıyı her yerde
  // TAM BİR PİKSEL yumuşaklığında — keskin ama tırtıklı değil.
  float aa = max(fwidth(h), 0.0015) * 1.1;
  float land = smoothstep(0.500 - aa, 0.500 + aa, h);
  // kıyı sığlığı: denizin karaya yakın kısmı açılır
  float shallow = smoothstep(0.42, 0.50, h);
  vec3 sea = mix(uSeaDeep, uSea, shallow);
  // kara dokusu: yükseklikle kuruyan yeşil
  vec3 landC = mix(uLand, uLandDry, smoothstep(0.55, 0.72, h));
  vec3 col = mix(sea, landC, land);
  // kutup buzu
  float ice = smoothstep(0.82, 0.93, abs(n.y));
  col = mix(col, uIce, ice);

  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uLightDir), H = normalize(L + V);
  float diff = max(dot(N, L), 0.0);
  // parlama YALNIZ denizde (kara mat) — su olduğunu bu anlatır
  float spec = pow(max(dot(N, H), 0.0), 60.0) * (1.0 - land) * (1.0 - ice) * 0.85;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col = col * (0.16 + 1.05 * diff) + vec3(spec) + vec3(0.35, 0.62, 1.0) * fres * 0.22;

  // Yüzey sahnenin EN PARLAK yeri (okyanus + bulut). Gezegen büyütülüp yukarı
  // alınınca metin bloğu TAM ÜSTÜNE düşüyor → maske hem derin (0.055) hem geniş
  // (yarıçap büyütüldü) ki başlık+alt başlık kutusunu tümüyle karartsın.
  vec2 scr = gl_FragCoord.xy / uRes;
  col *= mix(0.055, 1.0, smoothstep(0.72, 1.85, length((scr - uTitleC) / uTitleR)));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// ═══ KESİT YÜZEYİ: katmanlar + AKAN SIVI METAL ═══
const cutVertex = `
varying vec2 vUv; varying vec3 vLocal; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv; vLocal = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const cutFragment = `
${GLSL_NOISE}
uniform float uTime;
uniform vec3 uLightDir, uInner, uOuter, uOuterHot, uMantle, uMantleDeep, uCrust;
uniform vec2 uRes, uTitleC, uTitleR;
varying vec2 vUv; varying vec3 vLocal; varying vec3 vN; varying vec3 vV;
void main(){
  float r = vUv.x;                                  // 0 merkez → 1 yüzey
  vec3 col;
  float emis = 0.0;

  if (r < ${R_INNER}) {
    // İÇ ÇEKİRDEK: katı, akkor. fbm (tek noise3 değil) → ızgara bloğu yok.
    float g = 0.82 + 0.20 * fbm3(vLocal * 9.0);
    col = uInner * g;
    emis = 1.35 * (1.0 - r / ${R_INNER} * 0.35);
  } else if (r < ${R_OUTER}) {
    // DIŞ ÇEKİRDEK: SIVI METAL. İki katmanlı akan türbülans (biri ters yönde)
    // → dönen, karışan erimiş demir. Sıcak damarlar akkor beyaza yaklaşır.
    vec3 q = vLocal * 5.5;
    float f1 = fbm3(q + vec3(0.0, uTime * 0.28, uTime * 0.11));
    float f2 = fbm3(q * 1.7 - vec3(uTime * 0.19, 0.0, uTime * 0.23));
    float flow = f1 * 0.65 + f2 * 0.45;
    float veins = smoothstep(0.44, 0.78, flow);
    col = mix(uOuter, uOuterHot, veins);
    emis = 0.75 + 1.25 * veins;
  } else if (r < ${R_MANTLE}) {
    // MANTO: çok yavaş konveksiyon; derine gidince koyulaşır
    // Konveksiyon hücreleri: ilk render'da manto düz bir kahverengi alandı.
    // İki ölçekli gürültü + damar eşiği → yükselen sıcak sütunlar görünür.
    float t = (r - ${R_OUTER}) / (${R_MANTLE} - ${R_OUTER});
    float c1 = fbm3(vLocal * 3.1 + vec3(0.0, uTime * 0.030, 0.0));
    float c2 = fbm3(vLocal * 8.5 - vec3(uTime * 0.018, 0.0, 0.0));
    float conv = c1 * 0.7 + c2 * 0.42;
    float plume = smoothstep(0.52, 0.80, conv) * (1.0 - t * 0.55);
    col = mix(uMantleDeep, uMantle, clamp(t * 0.55 + conv * 0.62, 0.0, 1.0));
    col = mix(col, uOuter, plume * 0.42);            // sıcak sütun çekirdek rengine çalar
    emis = 0.26 * (1.0 - t) * (0.45 + 0.9 * conv) + plume * 0.30;
  } else {
    // KABUK: ince, koyu, kaya dokulu. fbm → ızgara bloğu yok.
    col = uCrust * (0.72 + 0.6 * fbm3(vLocal * 13.0));
  }

  // katman sınırlarında ince koyu çizgi → kesit "çizilmiş" gibi okunur
  float e = fwidth(r) * 1.6;
  float line = smoothstep(e, 0.0, abs(r - ${R_INNER}))
             + smoothstep(e, 0.0, abs(r - ${R_OUTER}))
             + smoothstep(e, 0.0, abs(r - ${R_MANTLE}));
  col *= 1.0 - 0.55 * clamp(line, 0.0, 1.0);

  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uLightDir);
  col = col * (0.34 + 0.62 * max(dot(N, L), 0.0)) + col * emis;

  // Maske DERİNLİĞİ ve YARIÇAPI üç yüzeyde de aynı olmalı; ayrışırsa başlığın
  // altında yüzeyler arası görünür bir bant izi oluşuyor. (Kesit çekirdeği emissive
  // olduğu için tabanı yüzeyden biraz yüksek: akkor çekirdek tam sönmesin.)
  vec2 scr = gl_FragCoord.xy / uRes;
  col *= mix(0.075, 1.0, smoothstep(0.72, 1.85, length((scr - uTitleC) / uTitleR)));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// ═══ BULUTLAR ═══
const cloudVertex = surfaceVertex;
const cloudFragment = `
${GLSL_NOISE}
uniform float uTime; uniform vec3 uLightDir;
uniform vec2 uRes, uTitleC, uTitleR;
varying vec3 vLocal; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 n = normalize(vLocal);
  float c = fbm3(n * 3.1 + vec3(uTime * 0.012, 0.0, uTime * 0.008));
  float a = smoothstep(0.52, 0.70, c);
  if (a < 0.01) discard;
  vec3 N = normalize(vN), L = normalize(uLightDir);
  float lit = 0.42 + 0.75 * max(dot(N, L), 0.0);
  vec2 scr = gl_FragCoord.xy / uRes;
  float m = mix(0.055, 1.0, smoothstep(0.72, 1.85, length((scr - uTitleC) / uTitleR)));
  gl_FragColor = vec4(vec3(1.0) * lit * m, a * 0.80 * m);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function ThreeEarthHero() {
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
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 40);
      const rig = new THREE.Group();
      scene.add(rig);

      const SEG = tier === 'low' ? 40 : tier === 'mid' ? 64 : 96;
      const CUT_R = tier === 'low' ? 26 : tier === 'mid' ? 40 : 56;
      // İlk render'da 90/190/320 ve çok inceydiler → yüzeyde 2 piksel kalıp
      // kayboluyorlardı. Sayı ve genişlik artırıldı: şehirler artık okunuyor.
      const BUILDINGS = tier === 'low' ? 150 : tier === 'mid' ? 320 : 520;

      const shared = {
        uTime: { value: 0 },
        uLightDir: { value: V(0, 1, 0) },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTitleC: { value: new THREE.Vector2(0.5, 0.5) },
        uTitleR: { value: new THREE.Vector2(0.30, 0.24) },
      };

      // ── yüzey (dilim çıkarılmış küre) ──
      const phiStart = PHI0 + CUT_HALF, phiLen = TAU - 2 * CUT_HALF;
      const surfGeo = new THREE.SphereGeometry(R, SEG, Math.round(SEG * 0.6), phiStart, phiLen);
      const surfMat = new THREE.ShaderMaterial({
        vertexShader: surfaceVertex, fragmentShader: surfaceFragment,
        uniforms: {
          ...shared,
          uSea: { value: V(0.04, 0.26, 0.52) }, uSeaDeep: { value: V(0.012, 0.10, 0.26) },
          uLand: { value: V(0.13, 0.38, 0.17) }, uLandDry: { value: V(0.42, 0.40, 0.20) },
          uIce: { value: V(0.88, 0.93, 0.97) },
        },
      });
      rig.add(new THREE.Mesh(surfGeo, surfMat));

      // ── kesit yüzeyleri (iki yarım disk) ──
      const cutUniforms = {
        ...shared,
        uInner: { value: V(1.00, 0.86, 0.55) },        // iç çekirdek: akkor
        uOuter: { value: V(0.92, 0.34, 0.06) },        // dış çekirdek: erimiş
        uOuterHot: { value: V(1.00, 0.88, 0.62) },     // sıcak damar
        uMantle: { value: V(0.42, 0.16, 0.09) },
        uMantleDeep: { value: V(0.20, 0.06, 0.05) },
        uCrust: { value: V(0.20, 0.19, 0.20) },
      };
      const cutMat = new THREE.ShaderMaterial({ vertexShader: cutVertex, fragmentShader: cutFragment, uniforms: cutUniforms, side: THREE.DoubleSide });
      const cutA = buildCutFace(PHI0 + CUT_HALF, CUT_R, Math.round(CUT_R * 1.2));
      const cutB = buildCutFace(PHI0 - CUT_HALF, CUT_R, Math.round(CUT_R * 1.2));
      rig.add(new THREE.Mesh(cutA, cutMat));
      rig.add(new THREE.Mesh(cutB, cutMat));

      // ── binalar: SADECE karada, dilimin dışında ──
      const bGeo = new THREE.BoxGeometry(1, 1, 1);
      bGeo.translate(0, 0.5, 0);                        // taban orijinde → yukarı büyür
      // Beton/gri: yeşil karanın üstünde ayrışması için açık tarafta tutuldu.
      const bMat = new THREE.MeshStandardMaterial({ color: 0xb3b9c2, roughness: 0.72, metalness: 0.06 });
      const cells: { m: THREE.Matrix4 }[] = [];
      const dummy = new THREE.Object3D();
      const up = V(0, 1, 0);
      /** Nokta karada, kutup dışında ve dilimin dışında mı? */
      const yerUygun = (n: THREE.Vector3) => {
        if (terrain(n.x, n.y, n.z) < 0.515) return false;                     // deniz
        if (Math.abs(n.y) > 0.80) return false;                               // kutup buzu
        let phi = Math.atan2(n.z, -n.x); if (phi < 0) phi += TAU;
        let d = Math.abs(phi - PHI0); d = Math.min(d, TAU - d);
        return d >= CUT_HALF + 0.05;                                          // çıkarılan dilim
      };
      // ŞEHİRLER: binalar eşit dağılınca gezegen "kirpi" gibi oluyordu. Önce
      // birkaç şehir merkezi seçilir, binalar onların ETRAFINA kümelenir —
      // uzaktan bakınca yerleşim lekeleri, yakından bina kümeleri okunur.
      const CITIES = tier === 'low' ? 5 : tier === 'mid' ? 8 : 12;
      const merkezler: THREE.Vector3[] = [];
      for (let g = 0; g < CITIES * 60 && merkezler.length < CITIES; g++) {
        const u = Math.random() * 2 - 1, a = Math.random() * TAU, s = Math.sqrt(1 - u * u);
        const n = V(s * Math.cos(a), u, s * Math.sin(a));
        if (yerUygun(n)) merkezler.push(n);
      }
      let guard = 0;
      while (cells.length < BUILDINGS && guard++ < BUILDINGS * 40 && merkezler.length) {
        const c = merkezler[(Math.random() * merkezler.length) | 0];
        // merkezin çevresine küçük rastgele sapma → küme
        const n = V(c.x + (Math.random() - 0.5) * 0.30, c.y + (Math.random() - 0.5) * 0.30, c.z + (Math.random() - 0.5) * 0.30).normalize();
        if (!yerUygun(n)) continue;
        // Yükseklik ÇOK küçük: ilk render'da 0.030-0.105 idi (yarıçapın %10'u,
        // yani ~600 km!) ve gezegen dikenli görünüyordu. Şehir merkeze yakınsa
        // daha yüksek — siluete doğru alçalan gerçekçi bir profil.
        const yakin = 1.0 - Math.min(1, n.distanceTo(c) / 0.30);
        const h = 0.011 + Math.random() * 0.016 + yakin * 0.014;
        dummy.position.copy(n).multiplyScalar(R * 0.998);
        dummy.quaternion.setFromUnitVectors(up, n);      // bina yüzeye DİK
        const w = 0.011 + Math.random() * 0.008;
        dummy.scale.set(w, h, w);
        dummy.updateMatrix();
        cells.push({ m: dummy.matrix.clone() });
      }
      const buildings = new THREE.InstancedMesh(bGeo, bMat, cells.length);
      cells.forEach((c, i) => buildings.setMatrixAt(i, c.m));
      buildings.instanceMatrix.needsUpdate = true;
      buildings.frustumCulled = false;                   // bkz. ThreeChipHero: bounding sphere tuzağı
      rig.add(buildings);

      // ── bulutlar (gezegenin hafif üstünde) ──
      const cloudGeo = new THREE.SphereGeometry(R * 1.045, Math.round(SEG * 0.7), Math.round(SEG * 0.45), phiStart, phiLen);
      const cloudMat = new THREE.ShaderMaterial({
        vertexShader: cloudVertex, fragmentShader: cloudFragment, uniforms: shared,
        transparent: true, depthWrite: false, side: THREE.FrontSide,
      });
      const clouds = new THREE.Mesh(cloudGeo, cloudMat);
      rig.add(clouds);

      const KEY_DIR = V(-1.9, 1.5, 2.6).normalize();
      const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.copy(KEY_DIR).multiplyScalar(8); scene.add(key);
      // Çekirdek sızıntısı. MENZİL KISA tutuldu: 8/14 iken yüzeye kadar ulaşıp
      // beton binaları ten rengine boyuyordu (render'da yakalandı).
      const fill = new THREE.PointLight(0xff8a3d, 3.2, 2.0); fill.position.set(0.15, -0.35, 0.55); scene.add(fill);
      scene.add(new THREE.AmbientLight(0x5577aa, 0.5));

      // ── KADRAJ (ThreeChipHero disiplini) ──
      const PTS: [number, number, number][] = [[-R, 0, 0], [R, 0, 0], [0, -R, 0], [0, R, 0]];
      let dCam = 5, logged = false;
      const v = new THREE.Vector3();
      const applyFrame = (w: number, h: number) => {
        const aspect = w / h, portrait = aspect < 0.85;
        camera.fov = portrait ? 42 : 34;
        camera.aspect = aspect;
        let yMax = 0, yMin = 0;
        for (let i = 0; i < 8; i++) {
          camera.position.set(0, 0, dCam); camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
          let mx = 0; yMax = -9; yMin = 9;
          for (const p of PTS) {
            v.set(p[0], p[1], p[2]).project(camera);
            mx = Math.max(mx, Math.abs(v.x)); yMax = Math.max(yMax, v.y); yMin = Math.min(yMin, v.y);
          }
          // %70 yakınlaştırma (kullanıcı isteği): 1.16 → 1.97, yatay 0.94 → 1.60.
          // Gezegen artık kadrajdan taşıyor; başlık onun ÜSTÜNDE duracağı için
          // yüzey maskesi de derinleştirildi (bkz. surfaceFragment).
          dCam *= Math.max(mx / 1.60, (yMax - yMin) / 1.97);
        }
        // Obje sayfanın DAHA ÜSTÜNE alındı (kullanıcı isteği). -0.30 denendi ama
        // gezegen o kadar büyük+yukarı ki başlık tam gövdesine biniyordu ve maske
        // ne kadar zorlansa metin kayboluyordu. -0.44 = hâlâ belirgin yukarıda,
        // ama başlığa nefes alanı bırakıyor (ölçümle bulundu).
        const TARGET = portrait ? -0.48 : -0.44;
        camera.projectionMatrix.elements[9] += -(TARGET - (yMax + yMin) * 0.5);
        let lo = 9, hi = -9;
        for (const p of PTS) { v.set(p[0], p[1], p[2]).project(camera); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); }
        const resid = TARGET - (lo + hi) * 0.5;
        if (Math.abs(resid) > 0.02) camera.projectionMatrix.elements[9] += resid;

        // Obje yukarı+büyük olduğu için maske elipsi de büyütüldü: başlık kutusunu
        // tümüyle örtmezse harflerin arkasında parlak yüzey kalır.
        shared.uTitleR.value.set(portrait ? 0.54 : 0.40, portrait ? 0.34 : 0.30);
        shared.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
        shared.uLightDir.value.copy(KEY_DIR).transformDirection(camera.matrixWorldInverse);

        if (process.env.NODE_ENV !== 'production' && !logged) {
          logged = true;
          console.log('[earth-hero] merkez', ((lo + hi) / 2).toFixed(2), 'hedef', TARGET, 'd', dCam.toFixed(2), 'bina', cells.length);
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
      const T_STILL = 7.0;
      const draw = (now: number) => {
        const t = ((now - start) / 1000) % 600;
        shared.uTime.value = t;
        // Dilim TAM kameraya bakınca iki kesit yüzeyi üst üste binip sivri bir
        // oval veriyordu (klasik kesit okunmuyordu). Rig, dilim yarı açısı kadar
        // çevrilir → TEK kesit yüzeyi tam görünür, öteki tarafta gezegen yüzeyi
        // kalır: pastadan dilim alınmış gibi. Salınım bunun etrafında.
        rig.rotation.y = -CUT_HALF + Math.sin(t * 0.10) * 0.13;
        rig.rotation.x = -0.16 + Math.sin(t * 0.07) * 0.04;
        clouds.rotation.y = t * 0.020;                 // bulutlar kendi hızında
        renderer.render(scene, camera);
      };

      resize();
      // ResizeObserver + window: pencere olayı hero'nun KUTUSU değiştiği her
      // durumu yakalamıyor. Ölçüldü: viewport masaüstünden mobile geçtiğinde
      // olay tetiklenmedi, çizim tamponu 1236×1000'de kaldı ama CSS 375×812
      // oldu → küre yatayda ezilip elips gibi göründü. Kutuyu doğrudan izlemek
      // mobil adres çubuğu, yön değişimi ve düzen kaymalarını da kapsar.
      window.addEventListener('resize', resize);
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
      ro?.observe(host);

      const t0 = performance.now();
      draw(reduce ? start + T_STILL * 1000 : start);
      if (performance.now() - t0 > 220) { renderer.setPixelRatio(1); resize(); }

      let frozen = false;
      const fpsGuard = makeFpsGuard(
        () => { renderer.setPixelRatio(1); resize(); clouds.visible = false; },
        () => { frozen = true; },
      );

      let visible = true;
      const loop = (now: number) => {
        if (!visible || frozen) { raf = 0; return; }
        fpsGuard(now);
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
        ro?.disconnect();
        window.removeEventListener('resize', resize);
        surfGeo.dispose(); cutA.dispose(); cutB.dispose(); bGeo.dispose(); cloudGeo.dispose();
        surfMat.dispose(); cutMat.dispose(); bMat.dispose(); cloudMat.dispose();
        renderer.dispose();
        canvas.remove();
        // loseContext() ÇAĞRILMAZ: Strict Mode remount'ta bağlamı öldürür.
      };
    } catch { /* WebGL yoksa: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
