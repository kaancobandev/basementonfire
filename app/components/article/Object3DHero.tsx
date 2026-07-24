'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Geometry, Texture, Triangle, Sphere, Box, Torus } from 'ogl';
import type { Rgb } from './ShaderHero';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// Genel, TEMA-PARAMETRELİ 3D hero objesi (ogl — three.js DEĞİL, ~10KB).
// ShaderHero'nun performans disiplinini birebir taşır:
//   • dpr min(dpr,1.75)  • IntersectionObserver ile ekran dışında rAF DURUR
//   • prefers-reduced-motion → tek statik kare  • 0-boyuta karşı resize fallback
// TEK WebGL bağlamı: canlı gradyan zemin + 3D obje + parçacıklar aynı canvas'ta
// ard arda çizilir (2. bağlam açılmaz). WebGL başlatılamazsa canvas gizlenir →
// arkadaki ArticleHero radyal-gradyan zemini görünür (zarif fallback).
//
// `kind`: 'dna' | 'coin'. 'coin' + `src` (görsel) → dokulu altın sikke.
// ─────────────────────────────────────────────────────────────────────────

// 'mobius' ve 'slit' ogl'de DEĞİL, ayrı three.js bileşenlerinde çizilir
// (ThreeMobiusHero / ThreeSlitHero) — ArticleHero bu değerleri görünce
// Object3DHero yerine ilgili three.js bileşenini render eder.
export type Object3DKind = 'dna' | 'coin' | 'wreath' | 'cannon' | 'helmet' | 'prism' | 'atom' | 'nucleus' | 'orbital' | 'particles' | 'mobius' | 'slit' | 'chip' | 'rose' | 'earth';

const DEFAULT_COLORS: [Rgb, Rgb, Rgb, Rgb] = [
  [0.016, 0.086, 0.063], [0.063, 0.45, 0.30], [0.40, 0.83, 0.31], [0.98, 0.74, 0.18],
];

/* Zemin: ShaderHero'nun akan gradyanı (fare yok). depthWrite kapalı → önce
   çizilir, 3D objenin derinlik testini bozmaz. Kenarlar koyu (obje parlasın). */
const bgVertex = `
attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;
const bgFragment = `
precision highp float;
uniform float uTime;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;
varying vec2 vUv;
void main(){
  vec2 uv = vUv;
  float t = uTime * 0.09;
  float w = sin(uv.x * 3.0 + t) + sin(uv.y * 2.4 - t * 1.2) + sin((uv.x + uv.y) * 2.0 + t * 0.6);
  w += 0.6 * sin((uv.x - uv.y) * 5.0 + t * 1.5);
  w = w / 3.2;
  vec3 col = mix(uC1, uC2, smoothstep(-1.0, 0.1, w));
  col = mix(col, uC3, smoothstep(0.1, 0.7, w) * 0.5);
  col = mix(col, uC4, smoothstep(0.7, 1.2, w) * 0.28);
  float vig = smoothstep(1.25, 0.15, length(uv - 0.5));
  col *= mix(0.32, 1.02, vig);
  col *= 1.0 - 0.42 * smoothstep(0.66, 0.04, length(uv - 0.5)); // merkezi karart → obje öne çıksın
  gl_FragColor = vec4(col, 1.0);
}
`;

/* Düz obje: Blinn-Phong + fresnel + derinlik sisi. (DNA tüpleri/küreleri + sikke kenarı) */
const litVertex = `
precision highp float;
attribute vec3 position; attribute vec3 normal;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix;
varying vec3 vNormal; varying vec3 vViewPos;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const litFragment = `
precision highp float;
uniform vec3 uColor; uniform vec3 uLightDir; uniform vec3 uFog; uniform float uGlow;
varying vec3 vNormal; varying vec3 vViewPos;
void main(){
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(-vViewPos);
  vec3 H = normalize(L + V);
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 42.0) * 0.7;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 col = uColor * (0.26 + 0.86 * diff) + spec + uColor * fres * uGlow;
  float fog = smoothstep(6.5, 13.5, -vViewPos.z);
  col = mix(col, uFog, fog * 0.92);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* Sikke yüzü: dokunun PARLAKLIĞI altın kabartma gibi kullanılır (açık=çıkık,
   koyu=girinti); ham foto rengi değil. → gerçekten dövülmüş altın sikke hissi. */
const capVertex = `
precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec2 uv;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix;
varying vec3 vNormal; varying vec3 vViewPos; varying vec2 vUv;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const capFragment = `
precision highp float;
uniform sampler2D uTex; uniform vec3 uGold; uniform vec3 uLightDir; uniform vec3 uFog;
varying vec3 vNormal; varying vec3 vViewPos; varying vec2 vUv;
void main(){
  float lum = dot(texture2D(uTex, vUv).rgb, vec3(0.299, 0.587, 0.114));
  lum = pow(clamp(lum, 0.0, 1.0), 0.82);          // gölgeleri aç, kabartmayı belirginleştir
  vec3 albedo = uGold * (0.52 + 0.78 * lum);       // taban net altın, çıkıntı parlak
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(-vViewPos);
  vec3 H = normalize(L + V);
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 26.0) * (0.4 + lum) * 0.95;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 col = albedo * (0.46 + 0.72 * diff) + spec + uGold * fres * 0.55;
  float fog = smoothstep(6.5, 13.5, -vViewPos.z);
  col = mix(col, uFog, fog * 0.9);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* Süzülen parçacıklar (toz) — additive, yumuşak nokta. */
const dotVertex = `
precision highp float;
attribute vec3 position; attribute float aSize;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform float uTime;
varying float vFade;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.3 + position.x * 1.7) * 0.18;
  p.x += cos(uTime * 0.22 + position.z * 1.3) * 0.12;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (150.0 / -mv.z);
  vFade = clamp((15.0 + mv.z) / 9.0, 0.0, 1.0);
}
`;
const dotFragment = `
precision highp float;
uniform vec3 uColor; varying float vFade;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * 0.55 * vFade;
  gl_FragColor = vec4(uColor, a);
}
`;

/* Taş/dökme yüzey: konuma bağlı 3B değer-gürültüsüyle benekli/aşınmış görünüm +
   geniş mat highlight (metal değil taş). Namlu için. */
const stoneVertex = `
precision highp float;
attribute vec3 position; attribute vec3 normal;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix;
varying vec3 vNormal; varying vec3 vViewPos; varying vec3 vPos;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vPos = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const stoneFragment = `
precision highp float;
uniform vec3 uColor; uniform vec3 uLightDir; uniform vec3 uFog; uniform float uGlow;
varying vec3 vNormal; varying vec3 vViewPos; varying vec3 vPos;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0.,0.,0.)), hash(i + vec3(1.,0.,0.)), f.x), mix(hash(i + vec3(0.,1.,0.)), hash(i + vec3(1.,1.,0.)), f.x), f.y),
             mix(mix(hash(i + vec3(0.,0.,1.)), hash(i + vec3(1.,0.,1.)), f.x), mix(hash(i + vec3(0.,1.,1.)), hash(i + vec3(1.,1.,1.)), f.x), f.y), f.z);
}
void main(){
  float n = noise3(vPos * 9.0) * 0.55 + noise3(vPos * 26.0) * 0.30 + noise3(vPos * 62.0) * 0.15;
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(-vViewPos);
  vec3 H = normalize(L + V);
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 16.0) * 0.22 * (0.4 + n); // taş: geniş, mat
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 albedo = uColor * (0.70 + 0.55 * n);      // benekli taş
  vec3 col = albedo * (0.32 + 0.72 * diff) + spec + uColor * fres * uGlow;
  float fog = smoothstep(6.5, 13.5, -vViewPos.z);
  col = mix(col, uFog, fog * 0.9);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* Fotogerçekçi metal: sahte stüdyo-ortam YANSIMASI (reflect vektörü → gökyüzü/
   zemin gradyanı + parlak key ışık) + fresnel reflektivite + keskin highlight +
   dövme mikro-yüzey. uMetal (metallik), uRough (pürüz). Miğfer/metal objeler için. */
const metalVertex = `
precision highp float;
attribute vec3 position; attribute vec3 normal;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix;
varying vec3 vNormal; varying vec3 vViewPos; varying vec3 vPos;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vPos = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const metalFragment = `
precision highp float;
uniform vec3 uColor; uniform vec3 uLightDir; uniform vec3 uFog; uniform float uMetal; uniform float uRough;
varying vec3 vNormal; varying vec3 vViewPos; varying vec3 vPos;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i+vec3(0.,0.,0.)),hash(i+vec3(1.,0.,0.)),f.x),mix(hash(i+vec3(0.,1.,0.)),hash(i+vec3(1.,1.,0.)),f.x),f.y),
             mix(mix(hash(i+vec3(0.,0.,1.)),hash(i+vec3(1.,0.,1.)),f.x),mix(hash(i+vec3(0.,1.,1.)),hash(i+vec3(1.,1.,1.)),f.x),f.y),f.z);
}
vec3 envColor(vec3 r){
  float up = r.y * 0.5 + 0.5;
  vec3 sky = mix(vec3(0.20,0.22,0.28), vec3(0.88,0.92,1.0), smoothstep(0.36,1.0,up));
  vec3 base = mix(vec3(0.18,0.17,0.17), sky, smoothstep(0.44,0.58,up));
  float key = pow(max(dot(r, normalize(vec3(0.40,0.72,0.55))), 0.0), 45.0);
  float rim = pow(max(dot(r, normalize(vec3(-0.55,0.25,-0.5))), 0.0), 16.0);
  return base + vec3(1.0) * key * 1.7 + vec3(0.55,0.65,0.85) * rim * 0.4;
}
void main(){
  vec3 N = normalize(vNormal);
  float n = noise3(vPos * 42.0) * 0.5 + noise3(vPos * 120.0) * 0.5;
  N = normalize(N + (n - 0.5) * 0.04);                 // dövme mikro-yüzey
  vec3 V = normalize(-vViewPos);
  vec3 L = normalize(uLightDir);
  vec3 R = reflect(-V, N);
  vec3 env = envColor(R);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
  float refl = mix(mix(0.04, 0.95, uMetal), 1.0, fres);
  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = uColor * diff * (1.0 - uMetal) * 0.7;
  vec3 H = normalize(L + V);
  float sp = pow(max(dot(N, H), 0.0), mix(24.0, 220.0, 1.0 - uRough)) * 1.3;
  vec3 tint = mix(vec3(1.0), uColor, uMetal);
  vec3 col = diffuse + env * tint * refl + sp * mix(vec3(1.0), uColor, 0.5 * uMetal) + uColor * 0.10;
  float fog = smoothstep(6.5, 13.5, -vViewPos.z);
  col = mix(col, uFog, fog * 0.85);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* Cam prizma: fresnel kenarları parlak, iç saydam (alpha blend). */
const glassFragment = `
precision highp float;
uniform vec3 uColor; uniform vec3 uFog;
varying vec3 vNormal; varying vec3 vViewPos; varying vec3 vPos;
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vViewPos);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
  vec3 col = uColor * 0.16 + vec3(0.82, 0.87, 1.0) * fres;
  float a = 0.14 + 0.72 * fres;
  gl_FragColor = vec4(col, a);
}
`;
/* Işın/spektrum düzlemleri (uv taşır); additive çizilir. */
const planeVertex = `
precision highp float;
attribute vec3 position; attribute vec2 uv;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const spectrumFragment = `
precision highp float;
varying vec2 vUv;
vec3 spectrum(float t){
  return clamp(vec3(1.5 - abs(4.0*t - 3.0), 1.5 - abs(4.0*t - 2.0), 1.5 - abs(4.0*t - 1.0)), 0.0, 1.0);
}
void main(){
  vec3 c = spectrum(clamp(vUv.y, 0.0, 1.0));
  float along = smoothstep(1.08, -0.05, vUv.x);                                   // prizmada parlak, uzakta söner
  float across = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);      // kenarları yumuşat
  float a = along * across * 0.9;
  gl_FragColor = vec4(c * a, a);
}
`;
const beamFragment = `
precision highp float;
varying vec2 vUv;
void main(){
  float across = smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
  float a = across * 0.85;
  gl_FragColor = vec4(vec3(1.0) * a, a);
}
`;

/* Yumuşak akkor küre (merkez parlak, kenar söner) — additive hâle. */
const glowFragment = `
precision highp float;
uniform vec3 uColor;
varying vec3 vNormal; varying vec3 vViewPos;
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vViewPos);
  float f = pow(max(dot(N, V), 0.0), 3.2);
  gl_FragColor = vec4(uColor * f, f * 0.42);
}
`;

/* Kuantum orbital lobu: saydam ışıyan bulut — fresnel kenarları parlak, additive. */
const orbitalFragment = `
precision highp float;
uniform vec3 uColor;
varying vec3 vNormal; varying vec3 vViewPos;
void main(){
  vec3 N = normalize(vNormal); vec3 V = normalize(-vViewPos);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 1.8);
  float core = max(dot(N, V), 0.0);
  vec3 col = uColor * (0.5 + 0.95 * fres) + uColor * core * 0.25;
  float a = 0.38 + 0.55 * fres;
  gl_FragColor = vec4(col * a, a);
}
`;

/* Radyoaktif partikül alanı: hareket TAMAMEN vertex shader'da (GPU) — girdap +
   dikey sürüklenme (wrap) + türbülans + parıldama. CPU başına iş düşmez. */
const fieldVertex = `
precision highp float;
attribute vec3 position; attribute float aSeed; attribute float aSize;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform float uTime;
varying float vB; varying float vSeed;
void main(){
  vec3 p = position;
  float t = uTime;
  float r = length(p.xz);
  float a = atan(p.z, p.x) + t * (0.32 + 0.55 / (r + 0.6));   // girdap: içerisi daha hızlı
  p.x = cos(a) * r; p.z = sin(a) * r;
  p.y = mod(p.y + t * 0.30 + aSeed * 7.0 + 2.3, 4.6) - 2.3;    // yüksel + sar (dikeyde toplu)
  p += 0.22 * vec3(sin(t * 0.9 + aSeed * 6.2), cos(t * 0.75 + aSeed * 4.1), sin(t * 1.1 + aSeed * 8.3));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.55 + 0.45 * sin(t * 2.2 + aSeed * 20.0);        // parıldama
  vB = tw * clamp((14.0 + mv.z) / 10.0, 0.0, 1.0);
  vSeed = aSeed;
  gl_PointSize = aSize * (165.0 / -mv.z) * (0.7 + 0.5 * tw);
}
`;
const fieldFragment = `
precision highp float;
varying float vB; varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 c1 = vec3(0.45, 1.0, 0.22);    // radyoaktif lime
  vec3 c2 = vec3(0.78, 1.0, 0.45);    // açık yeşil
  vec3 c3 = vec3(0.95, 1.0, 0.85);    // beyaza yakın sıcak çekirdek
  float m = fract(vSeed * 7.3);
  vec3 col = mix(c1, c2, smoothstep(0.0, 0.55, m));
  col = mix(col, c3, smoothstep(0.72, 1.0, m));
  float al = a * vB;
  gl_FragColor = vec4(col * al, al);
}
`;

const TAU = Math.PI * 2;
type GL = ConstructorParameters<typeof Geometry>[0];

/* Helix boyunca pürüzsüz tüp (omurga şeridi). Radyal çerçeve → bükülmesiz halka. */
function buildHelixTube(gl: GL, phase: number, R: number, HGT: number, TURNS: number, M: number, tubeR: number, seg: number) {
  const pts: number[][] = [], tan: number[][] = [], rad: number[][] = [];
  for (let i = 0; i <= M; i++) {
    const f = i / M, y = (f - 0.5) * HGT, ang = f * TURNS * TAU + phase;
    pts.push([Math.cos(ang) * R, y, Math.sin(ang) * R]);
    rad.push([Math.cos(ang), 0, Math.sin(ang)]);
  }
  for (let i = 0; i <= M; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(M, i + 1)];
    let t = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const L = Math.hypot(t[0], t[1], t[2]) || 1; t = [t[0] / L, t[1] / L, t[2] / L];
    tan.push(t);
  }
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (let i = 0; i <= M; i++) {
    const P = pts[i], T = tan[i], rd = rad[i];
    let bx = T[1] * rd[2] - T[2] * rd[1], by = T[2] * rd[0] - T[0] * rd[2], bz = T[0] * rd[1] - T[1] * rd[0];
    const bl = Math.hypot(bx, by, bz) || 1; bx /= bl; by /= bl; bz /= bl;
    let nx = by * T[2] - bz * T[1], ny = bz * T[0] - bx * T[2], nz = bx * T[1] - by * T[0];
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * TAU, c = Math.cos(th), s = Math.sin(th);
      const ox = nx * c + bx * s, oy = ny * c + by * s, oz = nz * c + bz * s;
      pos.push(P[0] + ox * tubeR, P[1] + oy * tubeR, P[2] + oz * tubeR);
      nor.push(ox, oy, oz);
    }
  }
  const ring = seg + 1;
  for (let i = 0; i < M; i++) for (let j = 0; j < seg; j++) {
    const a = i * ring + j, b = a + ring;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: new Float32Array(nor) },
    index: { data: new Uint16Array(idx) },
  });
}

/* Sikke yüzü diski (XY düzleminde, z sabit). Dairesel UV → kare doku diske biner
   (köşe/siyah kenar hiç örneklenmez). flipU: arka yüzde ayna görüntüsünü düzelt. */
function buildDisc(gl: GL, radius: number, z: number, nz: number, seg: number, flipU: number) {
  const pos = [0, 0, z], nor = [0, 0, nz], uv = [0.5, 0.5], idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const th = (i / seg) * TAU, c = Math.cos(th), s = Math.sin(th);
    pos.push(c * radius, s * radius, z);
    nor.push(0, 0, nz);
    uv.push(c * 0.5 * flipU + 0.5, s * 0.5 + 0.5);
    if (i < seg) idx.push(0, i + 1, i + 2);
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: new Float32Array(nor) },
    uv: { size: 2, data: new Float32Array(uv) },
    index: { data: new Uint16Array(idx) },
  });
}

/* Sikke kenarı (Z ekseni etrafında silindir yüzeyi, kapaksız). */
function buildRim(gl: GL, radius: number, halfH: number, seg: number) {
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const th = (i / seg) * TAU, c = Math.cos(th), s = Math.sin(th);
    pos.push(c * radius, s * radius, halfH, c * radius, s * radius, -halfH);
    nor.push(c, s, 0, c, s, 0);
    if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: new Float32Array(nor) },
    index: { data: new Uint16Array(idx) },
  });
}

/* Üçgen normallerini toplayıp düğümlere yay (pürüzsüz gölgelendirme). */
function computeNormals(pos: number[], idx: number[]) {
  const nor = new Float32Array(pos.length);
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, cc = idx[i + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[cc] - pos[a], vy = pos[cc + 1] - pos[a + 1], vz = pos[cc + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, cc]) { nor[k] += nx; nor[k + 1] += ny; nor[k + 2] += nz; }
  }
  for (let i = 0; i < nor.length; i += 3) {
    const l = Math.hypot(nor[i], nor[i + 1], nor[i + 2]) || 1;
    nor[i] /= l; nor[i + 1] /= l; nor[i + 2] /= l;
  }
  return nor;
}

/* Defne yaprağı: +Y boyunca uzayan, uçlara sivrilen, ortadan hafif kabarık şerit. */
function buildLeaf(gl: GL, L: number, W: number, dome: number) {
  const M = 8;
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= M; i++) {
    const t = i / M, y = t * L, s = Math.sin(Math.PI * t);
    const w = W * Math.pow(s, 0.5), z0 = dome * s;
    pos.push(-w, y, z0, 0, y, z0 + dome * 0.5 * s, w, y, z0);
  }
  for (let i = 0; i < M; i++) for (let cc = 0; cc < 2; cc++) {
    const a = i * 3 + cc, b = (i + 1) * 3 + cc;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: computeNormals(pos, idx) },
    index: { data: new Uint16Array(idx) },
  });
}

/* Dönme yüzeyi (lathe): [z, yarıçap] profilini Z ekseni etrafında çevirir.
   Namlu profili → dipçik topuzu, takviye halkaları, ağız şişkinliği, içi boş ağız. */
function buildLathe(gl: GL, profile: number[][], seg: number) {
  const pos: number[] = [], idx: number[] = [];
  const M = profile.length;
  for (let i = 0; i < M; i++) {
    const z = profile[i][0], r = profile[i][1];
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * TAU;
      pos.push(Math.cos(th) * r, Math.sin(th) * r, z);
    }
  }
  const ring = seg + 1;
  for (let i = 0; i < M - 1; i++) for (let j = 0; j < seg; j++) {
    const a = i * ring + j, b = (i + 1) * ring + j;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: computeNormals(pos, idx) },
    index: { data: new Uint16Array(idx) },
  });
}

/* Oluklu kubbe (Y ekseni etrafında dönme + açısal oluk modülasyonu). Miğfer
   kubbesi için: [y, yarıçap] profili + `flutes` dikey oluk; oluk brim ve finial'de
   0'a, kubbe ortasında en yükseğe taperlanır. */
function buildDomeFluted(gl: GL, profile: number[][], seg: number, flutes: number, amp: number) {
  const pos: number[] = [], idx: number[] = [];
  const M = profile.length;
  const y0 = profile[0][0], y1 = profile[M - 1][0];
  for (let i = 0; i < M; i++) {
    const y = profile[i][0], r = profile[i][1];
    const t = (y - y0) / (y1 - y0);
    const fl = amp * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.05) / 0.75)));
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * TAU;
      const rr = r * (1 + fl * Math.cos(flutes * th));
      pos.push(Math.cos(th) * rr, y, Math.sin(th) * rr);
    }
  }
  const ring = seg + 1;
  for (let i = 0; i < M - 1; i++) for (let j = 0; j < seg; j++) {
    const a = i * ring + j, b = (i + 1) * ring + j;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: computeNormals(pos, idx) },
    index: { data: new Uint16Array(idx) },
  });
}

/* Üçgen prizma (XY'de üçgen A=tepe,B=sol-alt,C=sağ-alt; Z'de ±depth/2 extrude).
   Her yüz KENDİ köşeleriyle → computeNormals düz facet verir (keskin cam kenarları). */
function buildPrism(gl: GL, A: number[], B: number[], C: number[], depth: number) {
  const hz = depth / 2;
  const Af = [A[0], A[1], hz], Bf = [B[0], B[1], hz], Cf = [C[0], C[1], hz];
  const Ab = [A[0], A[1], -hz], Bb = [B[0], B[1], -hz], Cb = [C[0], C[1], -hz];
  const pos: number[] = [], idx: number[] = [];
  const push = (...pts: number[][]) => { const b = pos.length / 3; pts.forEach(p => pos.push(p[0], p[1], p[2])); return b; };
  const tri = (a: number[], b: number[], c: number[]) => { const o = push(a, b, c); idx.push(o, o + 1, o + 2); };
  const quad = (a: number[], b: number[], c: number[], d: number[]) => { const o = push(a, b, c, d); idx.push(o, o + 1, o + 2, o, o + 2, o + 3); };
  tri(Af, Bf, Cf); tri(Ab, Cb, Bb);                 // ön/arka kapak
  quad(Bf, Cf, Cb, Bb); quad(Cf, Af, Ab, Cb); quad(Af, Bf, Bb, Ab); // taban + sağ + sol yüz
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(pos) },
    normal: { size: 3, data: computeNormals(pos, idx) },
    index: { data: new Uint16Array(idx) },
  });
}

/* Dörtgen (a=yakın-alt, b=uzak-alt, c=uzak-üst, d=yakın-üst); uv: x yakın→uzak, y alt→üst. */
function buildQuad(gl: GL, a: number[], b: number[], c: number[], d: number[]) {
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array([...a, ...b, ...c, ...a, ...c, ...d]) },
    uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]) },
  });
}

export default function Object3DHero({ kind = 'dna', colors, src }: { kind?: Object3DKind; colors?: [Rgb, Rgb, Rgb, Rgb]; src?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const c = colors ?? DEFAULT_COLORS;
  const key = JSON.stringify(c) + '|' + kind + '|' + (src ?? '');

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tier = deviceTier();
    let raf = 0;

    try {
      // zayıf cihazda MSAA kapalı + dpr 1 (bkz. heroPerf.ts)
      const renderer = new Renderer({ canvas, alpha: false, antialias: tier !== 'low', dpr: Math.min(window.devicePixelRatio || 1, dprCap(tier)) });
      const gl = renderer.gl;
      gl.clearColor(c[0][0], c[0][1], c[0][2], 1);

      // ── Zemin ──
      const bgProgram = new Program(gl, {
        vertex: bgVertex, fragment: bgFragment, depthTest: false, depthWrite: false, cullFace: false,
        uniforms: { uTime: { value: 0 }, uC1: { value: c[0] }, uC2: { value: c[1] }, uC3: { value: c[2] }, uC4: { value: c[3] } },
      });
      const bgMesh = new Mesh(gl, { geometry: new Triangle(gl), program: bgProgram });

      // ── Sahne ──
      const camera = new Camera(gl, { fov: 32, near: 0.1, far: 100 });
      camera.position.set(0, 0, 9);
      camera.lookAt([0, 0, 0]);
      const scene = new Transform();
      const root = new Transform();
      root.setParent(scene);
      const fx = new Transform();

      const lightDir: [number, number, number] = [0.45, 0.75, 0.65];
      const litProg = (col: Rgb, glow: number) => new Program(gl, {
        vertex: litVertex, fragment: litFragment,
        uniforms: { uColor: { value: col }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: glow } },
      });

      let dotProgram: Program | null = null;
      let dust: Rgb = [0.75, 0.95, 0.7];
      let spinY = 0.3, tiltX = 0.16;
      let coinSpin: Transform | null = null;
      let renderOnce: ((n: number) => void) | null = null;
      const orbiters: { t: Transform; sp: number; ph: number }[] = []; // dönen elektronlar (atom)
      let pulseGroup: Transform | null = null;                          // titreşen çekirdek (nucleus)
      const emitters: { m: Mesh; dir: number[]; sp: number; ph: number }[] = []; // ışıma parçacıkları
      let fieldProgram: Program | null = null;                          // GPU partikül alanı (particles)

      if (kind === 'dna') {
        const R = 1.02, HGT = 5.2, TURNS = 2.5, N = 20;
        root.rotation.x = tiltX;
        const progA = litProg(c[2], 0.7), progB = litProg(c[3], 0.7);
        new Mesh(gl, { geometry: buildHelixTube(gl, 0, R, HGT, TURNS, 150, 0.1, 8), program: progA }).setParent(root);
        new Mesh(gl, { geometry: buildHelixTube(gl, Math.PI, R, HGT, TURNS, 150, 0.1, 8), program: progB }).setParent(root);
        const sphere = new Sphere(gl, { radius: 1, widthSegments: 20, heightSegments: 14 });
        const bar = new Box(gl, { width: 1, height: 1, depth: 1 });
        const rungProg = litProg([0.86, 0.9, 0.88], 0.5);
        for (let i = 0; i < N; i++) {
          const f = i / (N - 1), y = (f - 0.5) * HGT, ang = f * TURNS * TAU;
          const ax = Math.cos(ang) * R, az = Math.sin(ang) * R;
          const sA = new Mesh(gl, { geometry: sphere, program: progA });
          sA.position.set(ax, y, az); sA.scale.set(0.17, 0.17, 0.17); sA.setParent(root);
          const sB = new Mesh(gl, { geometry: sphere, program: progB });
          sB.position.set(-ax, y, -az); sB.scale.set(0.17, 0.17, 0.17); sB.setParent(root);
          const rung = new Mesh(gl, { geometry: bar, program: rungProg });
          rung.position.set(0, y, 0); rung.scale.set(R * 2, 0.05, 0.05); rung.rotation.y = -ang; rung.setParent(root);
        }
      } else if (kind === 'coin') {
        dust = [0.95, 0.78, 0.42]; spinY = 0.62; tiltX = 0.42;
        root.rotation.x = tiltX;
        const coin = new Transform(); coin.setParent(root);
        const RAD = 1.4, HALF = 0.11, SEG = 72;
        const gold: Rgb = [1.0, 0.85, 0.47];
        // Doku
        const tex = new Texture(gl, { generateMipmaps: false });
        if (src) { const img = new Image(); img.onload = () => { tex.image = img; renderOnce?.(performance.now()); }; img.src = src; }
        const capProg = () => new Program(gl, {
          vertex: capVertex, fragment: capFragment, cullFace: false,
          uniforms: { uTex: { value: tex }, uGold: { value: gold }, uLightDir: { value: lightDir }, uFog: { value: c[0] } },
        });
        new Mesh(gl, { geometry: buildDisc(gl, RAD, HALF, 1, SEG, 1), program: capProg() }).setParent(coin);   // ön
        new Mesh(gl, { geometry: buildDisc(gl, RAD, -HALF, -1, SEG, -1), program: capProg() }).setParent(coin); // arka (ayna düzeltildi)
        const rimProg = new Program(gl, {
          vertex: litVertex, fragment: litFragment, cullFace: false,
          uniforms: { uColor: { value: gold }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: 0.5 } },
        });
        new Mesh(gl, { geometry: buildRim(gl, RAD, HALF, SEG), program: rimProg }).setParent(coin);
        coinSpin = coin; // coin kendi ekseninde döner; root sadece süzülür/eğilir
      } else if (kind === 'wreath') {
        dust = [0.95, 0.80, 0.45]; spinY = 0.34; tiltX = 0.52;
        root.rotation.x = tiltX;
        const gold: Rgb = [1.0, 0.88, 0.55];
        const gProg = new Program(gl, {
          vertex: litVertex, fragment: litFragment, cullFace: false,
          uniforms: { uColor: { value: gold }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: 0.9 } },
        });
        const berryProg = new Program(gl, {
          vertex: litVertex, fragment: litFragment, cullFace: false,
          uniforms: { uColor: { value: [1.0, 0.72, 0.32] as Rgb }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: 1.3 } },
        });
        const Rw = 1.3;
        // ince altın halka (çoğu yaprakla örtülü)
        new Mesh(gl, { geometry: new Torus(gl, { radius: Rw, tube: 0.04, radialSegments: 12, tubularSegments: 80 }), program: gProg }).setParent(root);
        // deterministik hafif rastgelelik (organik, remount'ta kararlı)
        const jit = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
        // ÜÇ katman: hepsi AYNI teğetsel yöne akar (kiremitli/imbrike) → lush defne
        const layers = [
          { geo: buildLeaf(gl, 0.98, 0.17, 0.08), lean: 1.12, tx: 0.30, dr: 0.03, dz: 0.07 },
          { geo: buildLeaf(gl, 0.80, 0.15, 0.07), lean: 1.30, tx: 0.05, dr: -0.02, dz: -0.01 },
          { geo: buildLeaf(gl, 0.60, 0.13, 0.06), lean: 1.48, tx: -0.22, dr: -0.06, dz: -0.09 },
        ];
        const berryGeo = new Sphere(gl, { radius: 1, widthSegments: 12, heightSegments: 10 });
        const N = 30;
        for (let i = 0; i < N; i++) {
          const phi = (i / N) * TAU;
          for (let L = 0; L < layers.length; L++) {
            const ly = layers[L], j = jit(i * 3 + L), rr = Rw + ly.dr;
            const m = new Mesh(gl, { geometry: ly.geo, program: gProg });
            m.position.set(Math.cos(phi) * rr, Math.sin(phi) * rr, ly.dz + (j - 0.5) * 0.04);
            m.rotation.z = phi - Math.PI / 2 + ly.lean + (j - 0.5) * 0.28;
            m.rotation.x = ly.tx + (j - 0.5) * 0.22;
            const s = 0.88 + j * 0.28; m.scale.set(s, s, s);
            m.setParent(root);
          }
          if (i % 2 === 0) { // defne meyveleri (içe nestled)
            const b = new Mesh(gl, { geometry: berryGeo, program: berryProg });
            const br = Rw - 0.03;
            b.position.set(Math.cos(phi) * br, Math.sin(phi) * br, 0.03);
            b.scale.set(0.075, 0.075, 0.075); b.setParent(root);
          }
        }
      } else if (kind === 'cannon') {
        dust = [0.95, 0.72, 0.38]; spinY = 0.26; tiltX = 0.14;
        root.rotation.x = tiltX;
        const stone: Rgb = [0.50, 0.51, 0.53];   // nötr gri taş
        const bProg = new Program(gl, {
          vertex: stoneVertex, fragment: stoneFragment, cullFace: false,
          uniforms: { uColor: { value: stone }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: 0.30 } },
        });
        // Namlu profili [z, yarıçap] — daha kıvrımlı/detaylı: dipçik topuzu →
        // ogee dipçik → hazne → 3 yuvarlak ÇİFT takviye halkası → ogee ağız
        // şişkinliği + astragal → düz ağız halkası → içi boş namlu ağzı (geri döner).
        const P = [
          [-1.92, 0.02], [-1.87, 0.10], [-1.82, 0.16], [-1.77, 0.18], [-1.72, 0.16], [-1.68, 0.11],
          [-1.65, 0.11], [-1.62, 0.16], [-1.58, 0.30], [-1.53, 0.48], [-1.48, 0.60], [-1.44, 0.65], [-1.40, 0.665],
          [-1.28, 0.66], [-1.05, 0.64], [-0.90, 0.63],
          [-0.86, 0.625], [-0.83, 0.69], [-0.80, 0.715], [-0.77, 0.69], [-0.74, 0.63], [-0.71, 0.625], [-0.68, 0.675], [-0.65, 0.62],
          [-0.45, 0.605], [-0.22, 0.59],
          [-0.18, 0.585], [-0.15, 0.665], [-0.12, 0.695], [-0.09, 0.665], [-0.06, 0.585],
          [0.12, 0.575], [0.35, 0.565],
          [0.39, 0.56], [0.42, 0.64], [0.45, 0.67], [0.48, 0.64], [0.51, 0.56],
          [0.72, 0.555], [0.95, 0.555],
          [1.00, 0.565], [1.06, 0.60], [1.11, 0.575], [1.17, 0.615], [1.25, 0.71], [1.33, 0.735], [1.40, 0.72], [1.45, 0.725],
          [1.47, 0.735], [1.47, 0.47], [1.40, 0.45], [1.08, 0.43], [1.03, 0.45],
        ];
        const cannon = new Transform(); cannon.setParent(root);
        cannon.rotation.y = 1.12; cannon.rotation.x = -0.08;  // yatay + 3/4 açı (ağız kameraya dönük)
        cannon.position.set(0.1, 0, 0.2);
        const barrelGroup = new Transform(); barrelGroup.scale.set(1.02, 1.02, 1.02); barrelGroup.setParent(cannon);
        new Mesh(gl, { geometry: buildLathe(gl, P, 64), program: bProg }).setParent(barrelGroup);
        // kapstan yuva çıkıntıları: namlu çevresinde küçük düğme sıraları (Dardanel topu detayı)
        const bossGeo = new Sphere(gl, { radius: 1, widthSegments: 10, heightSegments: 8 });
        for (const band of [[-0.34, 0.585], [0.63, 0.55]]) {
          const z = band[0], rr = band[1], cnt = 12;
          for (let k = 0; k < cnt; k++) {
            const a = (k / cnt) * TAU;
            const b = new Mesh(gl, { geometry: bossGeo, program: bProg });
            b.position.set(Math.cos(a) * rr, Math.sin(a) * rr, z);
            b.scale.set(0.052, 0.052, 0.052); b.setParent(barrelGroup);
          }
        }
      } else if (kind === 'helmet') {
        dust = [0.92, 0.86, 0.6]; spinY = 0.3; tiltX = 0.08;
        root.rotation.x = tiltX;
        const helmet = new Transform(); helmet.setParent(root);
        helmet.position.y = -0.5; helmet.scale.set(1.05, 1.05, 1.05);
        const steelProg = new Program(gl, {
          vertex: metalVertex, fragment: metalFragment, cullFace: false,
          uniforms: { uColor: { value: [0.58, 0.61, 0.66] as Rgb }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uMetal: { value: 1.0 }, uRough: { value: 0.22 } },
        });
        const goldProg = new Program(gl, {
          vertex: metalVertex, fragment: metalFragment, cullFace: false,
          uniforms: { uColor: { value: [1.0, 0.76, 0.36] as Rgb }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uMetal: { value: 1.0 }, uRough: { value: 0.30 } },
        });
        // Kubbe profili [y, yarıçap]: brim → soğan-kubbe → finial boyun → topuz → sivri uç
        const P = [
          [-0.06, 0.80], [0.00, 0.92], [0.05, 0.90],
          [0.10, 0.86], [0.30, 0.83], [0.50, 0.78],
          [0.70, 0.70], [0.90, 0.58], [1.08, 0.44],
          [1.24, 0.28], [1.36, 0.16], [1.44, 0.09],
          [1.48, 0.06], [1.52, 0.10], [1.56, 0.11], [1.60, 0.075],
          [1.64, 0.03], [1.70, 0.008],
        ];
        new Mesh(gl, { geometry: buildDomeFluted(gl, P, 96, 18, 0.05), program: steelProg }).setParent(helmet);
        // brim altın bandı (yatay torus)
        const rim = new Mesh(gl, { geometry: new Torus(gl, { radius: 0.9, tube: 0.055, radialSegments: 14, tubularSegments: 100 }), program: goldProg });
        rim.rotation.x = Math.PI / 2; rim.setParent(helmet);
        // burunluk (nasal bar): önde aşağı inen ince altın şerit + yaprak uç
        const bar = new Mesh(gl, { geometry: new Box(gl, { width: 1, height: 1, depth: 1 }), program: goldProg });
        bar.position.set(0, -0.26, 0.85); bar.scale.set(0.11, 0.64, 0.055); bar.setParent(helmet);
        const leaf = new Mesh(gl, { geometry: new Sphere(gl, { radius: 1, widthSegments: 12, heightSegments: 10 }), program: goldProg });
        leaf.position.set(0, -0.64, 0.86); leaf.scale.set(0.13, 0.22, 0.045); leaf.setParent(helmet); // aşağı bakan yaprak/mahmuz
        const knob = new Mesh(gl, { geometry: new Sphere(gl, { radius: 1, widthSegments: 12, heightSegments: 10 }), program: goldProg });
        knob.position.set(0, 1.69, 0); knob.scale.set(0.05, 0.065, 0.05); knob.setParent(helmet); // tepe altın topuz
      } else if (kind === 'prism') {
        dust = [0.70, 0.72, 0.95]; spinY = 0; tiltX = 0.03;
        root.rotation.x = tiltX;
        const newton = new Transform(); newton.setParent(root);
        newton.scale.set(0.72, 0.72, 0.72); newton.position.set(-0.1, -0.05, 0); newton.rotation.y = -0.12;
        // cam prizma (fresnel kenarlı, saydam)
        const glassProg = new Program(gl, {
          vertex: metalVertex, fragment: glassFragment, cullFace: false, transparent: true, depthWrite: false,
          uniforms: { uColor: { value: [0.55, 0.60, 0.85] as Rgb }, uFog: { value: c[0] } },
        });
        const prism = new Mesh(gl, { geometry: buildPrism(gl, [0, 0.9], [-0.9, -0.62], [0.9, -0.62], 0.5), program: glassProg });
        prism.renderOrder = 0; prism.setParent(newton);
        // gelen beyaz ışın (additive)
        const beamProg = new Program(gl, { vertex: planeVertex, fragment: beamFragment, cullFace: false, transparent: true, depthTest: false, depthWrite: false, uniforms: {} });
        beamProg.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
        const beam = new Mesh(gl, { geometry: buildQuad(gl, [-0.5, 0.05, 0.01], [-3.6, 0.05, 0.01], [-3.6, 0.23, 0.01], [-0.5, 0.23, 0.01]), program: beamProg });
        beam.renderOrder = 1; beam.setParent(newton);
        // çıkan gökkuşağı yelpazesi (additive)
        const specProg = new Program(gl, { vertex: planeVertex, fragment: spectrumFragment, cullFace: false, transparent: true, depthTest: false, depthWrite: false, uniforms: {} });
        specProg.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
        const spec = new Mesh(gl, { geometry: buildQuad(gl, [0.5, -0.05, 0.01], [3.7, -0.95, 0.01], [3.7, 1.15, 0.01], [0.5, 0.32, 0.01]), program: specProg });
        spec.renderOrder = 2; spec.setParent(newton);
      } else if (kind === 'atom') {
        dust = [0.55, 0.80, 1.0]; spinY = 0.14; tiltX = 0.12;
        root.rotation.x = tiltX;
        const litP = (col: Rgb, glow: number) => new Program(gl, {
          vertex: litVertex, fragment: litFragment, cullFace: false,
          uniforms: { uColor: { value: col }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: glow } },
        });
        const protonProg = litP([0.93, 0.28, 0.22], 0.55);   // proton kırmızı
        const neutronProg = litP([0.44, 0.52, 0.74], 0.55);  // nötron mavi-gri
        const orbitProg = litP([0.42, 0.78, 1.0], 1.3);      // camgöbeği yörünge
        const elProg = litP([0.72, 0.95, 1.0], 1.8);         // parlak elektron
        const sph = new Sphere(gl, { radius: 1, widthSegments: 20, heightSegments: 16 });
        const jit = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
        // çekirdek: proton+nötron kümesi
        for (let i = 0; i < 14; i++) {
          const theta = jit(i * 3) * TAU, phi = Math.acos(2 * jit(i * 3 + 1) - 1), rad = 0.30 * Math.cbrt(jit(i * 3 + 2));
          const m = new Mesh(gl, { geometry: sph, program: i % 2 ? protonProg : neutronProg });
          m.position.set(rad * Math.sin(phi) * Math.cos(theta), rad * Math.sin(phi) * Math.sin(theta), rad * Math.cos(phi));
          m.scale.set(0.17, 0.17, 0.17); m.setParent(root);
        }
        // 3 eğik yörünge + üzerinde dönen elektron (klasik atom simgesi)
        const orbitR = 1.45;
        const torus = new Torus(gl, { radius: orbitR, tube: 0.018, radialSegments: 8, tubularSegments: 120 });
        for (let k = 0; k < 3; k++) {
          const outerG = new Transform(); outerG.setParent(root); outerG.rotation.z = k * TAU / 3; // görüş ekseni etrafında 120° aç
          const innerG = new Transform(); innerG.setParent(outerG); innerG.rotation.x = 1.25;       // çemberi elipse eğ
          new Mesh(gl, { geometry: torus, program: orbitProg }).setParent(innerG);
          const spinner = new Transform(); spinner.setParent(innerG);
          const e = new Mesh(gl, { geometry: sph, program: elProg });
          e.position.set(orbitR, 0, 0); e.scale.set(0.11, 0.11, 0.11); e.setParent(spinner);
          orbiters.push({ t: spinner, sp: 1.1 + k * 0.55, ph: k * 2.1 });
        }
      } else if (kind === 'nucleus') {
        dust = [0.6, 1.0, 0.55]; spinY = 0.1; tiltX = 0.1;
        root.rotation.x = tiltX;
        const litP = (col: Rgb, glow: number) => new Program(gl, {
          vertex: litVertex, fragment: litFragment, cullFace: false,
          uniforms: { uColor: { value: col }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: glow } },
        });
        const protonProg = litP([1.0, 0.30, 0.24], 0.8), neutronProg = litP([0.46, 0.56, 0.8], 0.8);
        const sph = new Sphere(gl, { radius: 1, widthSegments: 18, heightSegments: 14 });
        const jit = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
        const nuc = new Transform(); nuc.setParent(root); pulseGroup = nuc;
        // radyoaktif AKKOR HÂLE (additive; çekirdekle titreşir → nabız gibi parlar)
        const glowProg = new Program(gl, {
          vertex: litVertex, fragment: glowFragment, cullFace: false, transparent: true, depthTest: false, depthWrite: false,
          uniforms: { uColor: { value: [0.5, 1.0, 0.42] as Rgb } },
        });
        glowProg.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
        const halo = new Mesh(gl, { geometry: sph, program: glowProg }); halo.scale.set(1.75, 1.75, 1.75); halo.renderOrder = -1; halo.setParent(nuc);
        // kararsız çekirdek (titreşir)
        for (let i = 0; i < 30; i++) {
          const theta = jit(i * 3) * TAU, phi = Math.acos(2 * jit(i * 3 + 1) - 1), rad = 0.48 * Math.cbrt(jit(i * 3 + 2));
          const m = new Mesh(gl, { geometry: sph, program: i % 2 ? protonProg : neutronProg });
          m.position.set(rad * Math.sin(phi) * Math.cos(theta), rad * Math.sin(phi) * Math.sin(theta), rad * Math.cos(phi));
          m.scale.set(0.19, 0.19, 0.19); m.setParent(nuc);
        }
        // dışa DRAMATİK fırlayan ışıma İZLERİ (streak): α amber, β camgöbeği, γ mor
        const rayProgs = [litP([1.0, 0.6, 0.12], 2.6), litP([0.3, 0.92, 1.0], 2.6), litP([0.88, 0.5, 1.0], 2.6)];
        for (let i = 0; i < 22; i++) {
          const th = jit(i * 5) * TAU, ph = Math.acos(2 * jit(i * 5 + 1) - 1);
          const dir = [Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph)];
          const m = new Mesh(gl, { geometry: sph, program: rayProgs[i % 3] });
          m.rotation.y = Math.atan2(dir[0], dir[2]); m.rotation.x = -Math.asin(Math.max(-1, Math.min(1, dir[1]))); // yerel Z'yi yöne çevir → iz dışa uzasın
          m.setParent(root);
          emitters.push({ m, dir, sp: 0.4 + jit(i * 5 + 2) * 0.35, ph: jit(i * 5 + 3) });
        }
      } else if (kind === 'orbital') {
        dust = [0.6, 0.8, 1.0]; spinY = 0.22; tiltX = 0.18;
        root.rotation.x = tiltX;
        const orb = new Transform(); orb.setParent(root); orb.scale.set(1.28, 1.28, 1.28);
        orb.rotation.x = 0.5; orb.rotation.y = 0.62;   // izometrik: 3 dambıl da görünsün
        // teardrop lob profili [z, yarıçap] — nodda (çekirdek) sivri, uçta yuvarlak
        const LOBE = [
          [0.0, 0.001], [0.06, 0.09], [0.16, 0.18], [0.32, 0.27], [0.52, 0.32],
          [0.72, 0.33], [0.90, 0.29], [1.06, 0.20], [1.18, 0.10], [1.26, 0.001],
        ];
        const lobe = buildLathe(gl, LOBE, 40);
        const orbProg = (col: Rgb) => {
          const p = new Program(gl, { vertex: litVertex, fragment: orbitalFragment, cullFace: false, transparent: true, depthTest: false, depthWrite: false, uniforms: { uColor: { value: col } } });
          p.setBlendFunc(gl.SRC_ALPHA, gl.ONE); return p;
        };
        const red = orbProg([1.0, 0.35, 0.45]), green = orbProg([0.4, 1.0, 0.55]), blue = orbProg([0.45, 0.65, 1.0]);
        const mk = (prog: Program, rx: number, ry: number) => {
          const m = new Mesh(gl, { geometry: lobe, program: prog }); m.rotation.x = rx; m.rotation.y = ry; m.setParent(orb);
        };
        mk(blue, 0, 0); mk(blue, Math.PI, 0);              // pz (±Z)
        mk(red, 0, Math.PI / 2); mk(red, 0, -Math.PI / 2);  // px (±X)
        mk(green, -Math.PI / 2, 0); mk(green, Math.PI / 2, 0); // py (±Y)
        // merkez çekirdek (küçük parlak)
        const nucProg = new Program(gl, { vertex: litVertex, fragment: litFragment, cullFace: false, uniforms: { uColor: { value: [1.0, 0.92, 0.72] as Rgb }, uLightDir: { value: lightDir }, uFog: { value: c[0] }, uGlow: { value: 1.6 } } });
        const n = new Mesh(gl, { geometry: new Sphere(gl, { radius: 1, widthSegments: 20, heightSegments: 16 }), program: nucProg });
        n.scale.set(0.16, 0.16, 0.16); n.setParent(orb);
      } else if (kind === 'particles') {
        // ATOM YOK: sadece uçan radyoaktif partiküller (girdap + yükselme + türbülans)
        dust = [0.45, 1.0, 0.35]; spinY = 0; tiltX = 0.05;
        root.rotation.x = tiltX;
        const COUNT = tier === 'low' ? 900 : tier === 'mid' ? 1600 : 2400;
        const pp = new Float32Array(COUNT * 3), sd = new Float32Array(COUNT), sz = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
          const a = Math.random() * TAU, r = 0.1 + Math.pow(Math.random(), 1.3) * 2.5; // merkeze doğru yoğun
          pp[i * 3] = Math.cos(a) * r;
          pp[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
          pp[i * 3 + 2] = Math.sin(a) * r;
          sd[i] = Math.random();
          sz[i] = 0.5 + Math.random() * 1.7;
        }
        fieldProgram = new Program(gl, {
          vertex: fieldVertex, fragment: fieldFragment, transparent: true, depthTest: false, depthWrite: false,
          uniforms: { uTime: { value: 0 } },
        });
        fieldProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
        new Mesh(gl, {
          geometry: new Geometry(gl, { position: { size: 3, data: pp }, aSeed: { size: 1, data: sd }, aSize: { size: 1, data: sz } }),
          program: fieldProgram, mode: gl.POINTS,
        }).setParent(fx);
      }

      // Parçacıklar (toz)
      const COUNT = 130;
      const pp = new Float32Array(COUNT * 3), ps = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        pp[i * 3] = (Math.random() - 0.5) * 8;
        pp[i * 3 + 1] = (Math.random() - 0.5) * 7;
        pp[i * 3 + 2] = (Math.random() - 0.5) * 5 - 0.5;
        ps[i] = 0.6 + Math.random() * 1.8;
      }
      dotProgram = new Program(gl, {
        vertex: dotVertex, fragment: dotFragment, transparent: true, depthTest: true, depthWrite: false,
        uniforms: { uTime: { value: 0 }, uColor: { value: dust } },
      });
      dotProgram.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      new Mesh(gl, {
        geometry: new Geometry(gl, { position: { size: 3, data: pp }, aSize: { size: 1, data: ps } }),
        program: dotProgram, mode: gl.POINTS,
      }).setParent(fx);

      const resize = () => {
        const p = canvas.parentElement;
        const w = (p && p.clientWidth) || window.innerWidth || 1200;
        const h = (p && p.clientHeight) || window.innerHeight || 800;
        renderer.setSize(w, h);
        camera.perspective({ aspect: w / h });
      };
      resize();
      window.addEventListener('resize', resize);

      const start = performance.now();
      const draw = (now: number) => {
        const t = (now - start) / 1000;
        bgProgram.uniforms.uTime.value = t;
        if (dotProgram) dotProgram.uniforms.uTime.value = t;
        if (fieldProgram) fieldProgram.uniforms.uTime.value = t;
        if (coinSpin) coinSpin.rotation.y = t * spinY; else root.rotation.y = t * spinY;
        root.position.y = Math.sin(t * 0.5) * 0.12;
        for (const o of orbiters) o.t.rotation.z = t * o.sp + o.ph; // elektronlar yörüngede döner
        if (pulseGroup) { const s = 1 + 0.085 * Math.sin(t * 6); pulseGroup.scale.set(s, s, s); } // çekirdek şiddetle titreşir
        for (const e of emitters) { // ışıma izleri dışa fırlar (yakında doğar, uzayarak uçar, uzakta söner)
          const d = ((t * e.sp + e.ph) % 1 + 1) % 1, dist = 0.45 + d * 3.4, s = 0.11 * Math.sin(d * Math.PI);
          e.m.position.set(e.dir[0] * dist, e.dir[1] * dist, e.dir[2] * dist); e.m.scale.set(s * 0.7, s * 0.7, s * 3.0);
        }
        renderer.render({ scene: bgMesh });
        renderer.render({ scene, camera, clear: false, frustumCull: false });
        renderer.render({ scene: fx, camera, clear: false, frustumCull: false });
      };

      renderOnce = draw;
      draw(reduce ? start + 6000 : start); // ilk kareyi SENKRON çiz

      // FPS bekçisi: yavaş cihazda önce çözünürlük düşer, hâlâ yavaşsa animasyon
      // DONAR (son kare kalır) → kilitlenme yerine durağan bir görsel.
      let frozen = false;
      const guard = makeFpsGuard(
        () => { renderer.dpr = 1; resize(); },
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
      io?.observe(canvas.parentElement ?? canvas);

      return () => {
        cancelAnimationFrame(raf);
        io?.disconnect();
        window.removeEventListener('resize', resize);
        // NOT: WEBGL_lose_context.loseContext() BİLEREK çağrılmıyor — bkz. yorum
        // (React Strict Mode remount'ta bağlamı öldürürdü → obje dev'de görünmezdi).
        // Bağlam, canvas DOM'dan kalkınca GC ile serbest kalır.
      };
    } catch {
      canvas.style.display = 'none';
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
