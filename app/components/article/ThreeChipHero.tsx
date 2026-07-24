'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// BİR BAYTIN SAYMASI (bilgisayar hero'su) — three.js.
//
// Tek bir silikon KALIP (die), paket değil: makalede birkaç saniye sonra gerçek
// bir CPU fotoğrafı var ve altyazısı "parlak metal transistörler değil, ısı
// kapağı; asıl şey altındaki silikon parçasında" diyor. Hero o kapağın altını
// gösterir.
//
// Kalıbın üstünde 8 sütun × 5 satır FİZİKSEL anahtar dizisi var: beş tane 8
// bitlik sayaç. Durum hem renkten hem KABARTMADAN okunuyor (0 = yatık ve sönük,
// 1 = 2,5 kat yükselmiş ve camgöbeği). En sağdaki sütun LSB, sürekli kıpırdar;
// sola gidildikçe yavaşlar. Taşıma (carry) bit bit sağdan sola koşar — carry
// lookahead'in neden icat edildiğini gösteren şey. Makalenin ilk cümlesi
// "milyarlarca minik anahtarın 1 ve 0 olarak işbirliği yapması"; bu onun
// görünür hâli ve okuyucu 30 saniye sonra BinaryPlayground'da aynı şeyi elleyecek.
//
// Sayaç matematiği shader'a yazılmadan ÖNCE Node'da doğrulandı: sayaç 1'er
// artıyor, 5 satır farklı ofsetten başlıyor, 92,16 sn sarması dikişsiz, taşıma
// gecikmesi 12 ms/bit, LSB kenar frekansı 2,78 Hz (WCAG 3 flaş/sn eşiği altı).
//
// TASARIM KURALLARI (klişe "mavi devre kartı"ndan kaçış):
//   • Yalnız Manhattan geometri (0°/90°). Yuvarlak via YOK, 45° dirsek YOK.
//   • En az üç ayrı ölçek katmanı: 0.175 / 0.016 / 0.004 dünya birimi (1:11:44).
//   • Additive katman YOK: parlama, opak yüzeyin kendi shader'ında ışık havuzu
//     olarak çiziliyor → overdraw / renderOrder / premultiplied-alpha riski yok.
//
// Perf disiplini diğer hero'larla aynı (heroPerf.ts): cihaz kademesi, kare
// ölçen bekçi, ekran dışında rAF durur, reduced-motion'da tek statik kare,
// cleanup'ta tam dispose, loseContext() ÇAĞRILMAZ (Strict Mode tuzağı).
// ─────────────────────────────────────────────────────────────────────────

const DIE = 3.0;            // kalıp kenarı
const THK = 0.20;           // kalınlık
const BEV = 0.055;          // pah — "bu bir NESNE" dedirten kenar çizgisi buradan gelir
const TOP = THK * 0.5;
const HALF = DIE * 0.5;
const PITCH = 0.175;        // anahtar adımı (en kaba ölçek katmanı)
const CELL = PITCH * 0.62;  // ped ayak izi
const CH = 0.018;           // ped taban yüksekliği (alçak kabartma — bkz. vertex yorumu)
const WRAP = 92.16;         // 0.36 × 256 — tam sayaç turu; her bit periyodunu tam böler

type V3 = [number, number, number];

/** İki üçgenlik quad; düz gölgeleme için yüz başına ayrı vertex (indekssiz). */
function pushQuad(
  P: number[], N: number[], U: number[], T: number[] | null,
  a: V3, b: V3, c: V3, d: V3,
  ua: [number, number], ub: [number, number], uc: [number, number], ud: [number, number],
  ta = 0, tb = 0, tc = 0, td = 0,
) {
  const e1: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const e2: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const nx = e1[1] * e2[2] - e1[2] * e2[1];
  const ny = e1[2] * e2[0] - e1[0] * e2[2];
  const nz = e1[0] * e2[1] - e1[1] * e2[0];
  const l = Math.hypot(nx, ny, nz) || 1;
  const n: V3 = [nx / l, ny / l, nz / l];
  const put = (p: V3, uv: [number, number], t: number) => {
    P.push(p[0], p[1], p[2]); N.push(n[0], n[1], n[2]); U.push(uv[0], uv[1]); T?.push(t);
  };
  put(a, ua, ta); put(b, ub, tb); put(c, uc, tc);
  put(a, ua, ta); put(c, uc, tc); put(d, ud, td);
}

/** Pahlı dilim: üst yüz (inset) + 4 pah yamuğu + 4 yan duvar + alt yüz. */
function buildBeveledSlab(w: number, d: number, h: number, b: number) {
  const P: number[] = [], N: number[] = [], U: number[] = [];
  const x = w / 2, z = d / 2, y = h / 2, xi = x - b, zi = z - b, yb = y - b;
  const uv = (s: number, t: number): [number, number] => [s, t];

  // üst yüz (inset)
  pushQuad(P, N, U, null,
    [-xi, y, zi], [xi, y, zi], [xi, y, -zi], [-xi, y, -zi],
    uv(0, 1), uv(1, 1), uv(1, 0), uv(0, 0));

  // pah bandı: üst-inset kenardan (y) tam genişlik kenara (yb)
  pushQuad(P, N, U, null, [-xi, y, zi], [-x, yb, z], [x, yb, z], [xi, y, zi], uv(0, 1), uv(0, 1), uv(1, 1), uv(1, 1));   // ön (+z)
  pushQuad(P, N, U, null, [xi, y, -zi], [x, yb, -z], [-x, yb, -z], [-xi, y, -zi], uv(1, 0), uv(1, 0), uv(0, 0), uv(0, 0)); // arka (-z)
  pushQuad(P, N, U, null, [xi, y, zi], [x, yb, z], [x, yb, -z], [xi, y, -zi], uv(1, 1), uv(1, 1), uv(1, 0), uv(1, 0));     // sağ (+x)
  pushQuad(P, N, U, null, [-xi, y, -zi], [-x, yb, -z], [-x, yb, z], [-xi, y, zi], uv(0, 0), uv(0, 0), uv(0, 1), uv(0, 1)); // sol (-x)

  // yan duvarlar — uv.y 0..1 (alt→üst): metal katman bantları bundan üretiliyor
  pushQuad(P, N, U, null, [-x, yb, z], [-x, -y, z], [x, -y, z], [x, yb, z], uv(0, 1), uv(0, 0), uv(1, 0), uv(1, 1));
  pushQuad(P, N, U, null, [x, yb, -z], [x, -y, -z], [-x, -y, -z], [-x, yb, -z], uv(0, 1), uv(0, 0), uv(1, 0), uv(1, 1));
  pushQuad(P, N, U, null, [x, yb, z], [x, -y, z], [x, -y, -z], [x, yb, -z], uv(0, 1), uv(0, 0), uv(1, 0), uv(1, 1));
  pushQuad(P, N, U, null, [-x, yb, -z], [-x, -y, -z], [-x, -y, z], [-x, yb, z], uv(0, 1), uv(0, 0), uv(1, 0), uv(1, 1));

  // alt yüz
  pushQuad(P, N, U, null, [-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z], uv(0, 0), uv(1, 0), uv(1, 1), uv(0, 1));

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  return g;
}

/**
 * Anahtar pedi: üst yüz + 4 yamuk yan yüz (tabansız — alttan görünmez).
 * aTop = 1 olan vertexler yükselir; taban 0 → ped kalıptan KOPMAZ.
 */
function buildCell(size: number, h: number, inset: number, withGate: boolean) {
  const P: number[] = [], N: number[] = [], U: number[] = [], T: number[] = [];
  const s = size / 2, si = s - inset;
  const uv = (a: number, b: number): [number, number] => [a, b];

  pushQuad(P, N, U, T, [-si, h, si], [si, h, si], [si, h, -si], [-si, h, -si],
    uv(0, 1), uv(1, 1), uv(1, 0), uv(0, 0), 1, 1, 1, 1);
  pushQuad(P, N, U, T, [-s, 0, s], [s, 0, s], [si, h, si], [-si, h, si], uv(0, 0), uv(1, 0), uv(1, 1), uv(0, 1), 0, 0, 1, 1);
  pushQuad(P, N, U, T, [s, 0, -s], [-s, 0, -s], [-si, h, -si], [si, h, -si], uv(0, 0), uv(1, 0), uv(1, 1), uv(0, 1), 0, 0, 1, 1);
  pushQuad(P, N, U, T, [s, 0, s], [s, 0, -s], [si, h, -si], [si, h, si], uv(0, 0), uv(1, 0), uv(1, 1), uv(0, 1), 0, 0, 1, 1);
  pushQuad(P, N, U, T, [-s, 0, -s], [-s, 0, s], [-si, h, si], [-si, h, -si], uv(0, 0), uv(1, 0), uv(1, 1), uv(0, 1), 0, 0, 1, 1);

  if (withGate) {
    // geçit çubuğu: en ince ölçek katmanı (0.004 birim mertebesi)
    const gw = size * 0.62 / 2, gh = 0.030, gd = size * 0.14 / 2, y0 = h + 0.004, y1 = y0 + gh;
    const q = (a: V3, b: V3, c: V3, d: V3) => pushQuad(P, N, U, T, a, b, c, d, uv(0, 0), uv(1, 0), uv(1, 1), uv(0, 1), 1, 1, 1, 1);
    q([-gw, y1, gd], [gw, y1, gd], [gw, y1, -gd], [-gw, y1, -gd]);
    q([-gw, y0, gd], [-gw, y1, gd], [-gw, y1, -gd], [-gw, y0, -gd]);
    q([gw, y0, -gd], [gw, y1, -gd], [gw, y1, gd], [gw, y0, gd]);
    q([-gw, y0, gd], [gw, y0, gd], [gw, y1, gd], [-gw, y1, gd]);
    q([gw, y0, -gd], [-gw, y0, -gd], [-gw, y1, -gd], [gw, y1, -gd]);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.setAttribute('aTop', new THREE.Float32BufferAttribute(T, 1));
  return g;
}

// ═══ ORTAK GLSL — iki shader da AYNI string'i kullanır (sayaç tek kaynak) ═══
const COMMON = `
#define TAU 6.2831853
#define TPD 0.012              // ripple-carry bit gecikmesi (sn)
float h11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
                   q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
// bit: 0 = LSB = EN SAĞ sütun · lane: 0..4 → (durum 0/1, anahtarlama parlaması)
vec2 cellState(float bit, float lane, float t, float clk){
  float P     = clk * exp2(bit + 1.0);
  float K     = floor(h11(lane * 7.13) * 256.0);        // satırın sayaç ofseti
  float ph    = fract((t - bit * TPD) / P + K / exp2(bit + 1.0));
  float b     = step(0.5, ph);
  float since = (ph - b * 0.5) * P;                     // son kenardan geçen süre
  float tau   = min(0.13, P * 0.28);
  return vec2(b, exp(-since / tau));
}
`;

const chipVertex = `
varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vViewZ;
void main(){
  // rotation.x=-π/2 ile yatırılan düzlemde yerel +y → dünya -z, yani ham uv.y=1
  // UZAK kenara düşer. Bölge sabitleri "y büyüdükçe kameraya yaklaşır" varsayıyor,
  // bu yüzden burada ÇEVRİLİYOR. Çevrilmezse anahtarların ışık havuzu kalıbın ters
  // yarısında çizilir (gerçek pedler yakın yarıda, parlama uzakta) — render'da
  // tam olarak bu hatayla yakalandı.
  vUv = vec2(uv.x, 1.0 - uv.y);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz; vViewZ = mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const chipFragment = `
${COMMON}
uniform float uTime, uClk, uDetail, uRows, uSramPitch, uPitchScale, uFogN, uFogF;
uniform vec3 uLightDir, uC1, uC2, uC3, uC4;
uniform vec2 uRes, uTitleC, uTitleR;
varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vViewZ;

// Frekans kırpması: prosedürel moiré'yi kaynağında keser VE uzak/eğik bölgede
// detayı kendi ortalamasına söndürerek bedava makro alan-derinliği verir.
// 2.2 ilk render'da fazla agresifti: uzak yarı düz bir yıkamaya dönüyor, kat planı
// hiyerarşisi görünmez oluyordu. 1.4 moiré'yi hâlâ keser ama dokuyu yaşatır.
float det(float f, float w){ return clamp(1.0 - f * w * 1.4, 0.0, 1.0); }
float rect(vec2 p, vec4 r){ return step(r.x, p.x) * step(p.x, r.z) * step(r.y, p.y) * step(p.y, r.w); }

void main(){
  vec2 fw = fwidth(vUv);

  // ── BÖLGELER (kat planı hiyerarşisi — tekdüze ızgara DEĞİL) ──
  const vec4 R_CNT = vec4(0.070, 0.600, 0.554, 0.903);   // anahtar bloğu
  const vec4 R_LOG = vec4(0.070, 0.160, 0.554, 0.560);   // mantık / standart hücre
  const vec4 R_MEM = vec4(0.600, 0.340, 0.955, 0.900);   // önbellek / SRAM
  const vec4 R_PHY = vec4(0.600, 0.120, 0.955, 0.300);   // analog / PHY
  float mLog = rect(vUv, R_LOG), mMem = rect(vUv, R_MEM), mPhy = rect(vUv, R_PHY);

  // 1) STANDART HÜCRE SATIRLARI — die'ın en tanınır dokusu
  vec2 q = (vUv - R_LOG.xy) / (R_LOG.zw - R_LOG.xy);
  float row = floor(q.y * uRows), ry = fract(q.y * uRows);
  float rail = smoothstep(0.10, 0.0, ry) + smoothstep(0.90, 1.0, ry);   // VDD/VSS güç rayları
  float xs = q.x * uRows * 3.0 + h11(row + 3.7) * 13.0;                 // satır başına faz kayması
  float cid = floor(xs);
  float cw = 0.42 + 0.52 * h21(vec2(cid, row));                         // DEĞİŞKEN hücre genişliği
  float vLog = step(fract(xs), cw) * (0.34 + 0.62 * h21(vec2(cid, row + 7.0))) + rail * 1.15;
  vLog = mix(0.30, vLog, det(uRows, fw.y));

  // 2) SRAM — bank olukları + satır-çözücü şeridi olmadan "gri leke" olur
  vec2 g = (vUv - R_MEM.xy) / uSramPitch;
  float cellT = (0.5 + 0.5 * cos(g.x * TAU)) * (0.72 + 0.28 * cos(g.y * TAU));
  float bank = step(0.045, fract((vUv.x - R_MEM.x) * 6.0)) * step(0.06, fract((vUv.y - R_MEM.y) * 4.0));
  float dec = uDetail * step(fract((vUv.x - R_MEM.x) * 6.0), 0.030) * 0.35;
  float vMem = mix(0.26, (0.20 + 0.95 * cellT) * bank + dec, det(1.0 / uSramPitch, max(fw.x, fw.y)));

  // 3) PHY / analog — kaba dokulu bloklar (farklı ölçek = hiyerarşi kanıtı)
  vec2 pq = (vUv - R_PHY.xy) * vec2(26.0, 14.0);
  float vPhy = mix(0.30, 0.26 + 0.44 * h21(floor(pq)), det(20.0, max(fw.x, fw.y)));

  // 4) I/O PEDLERİ + MÜHÜR HALKASI — "bu gerçek bir die" ikonografisi
  vec2 e = min(vUv, 1.0 - vUv);
  float edge = min(e.x, e.y);
  float seal = smoothstep(0.024, 0.021, abs(edge - 0.022));
  vec2 pd = fract(vUv / 0.050);
  float pads = step(edge, 0.045) * step(0.010, edge)
             * step(abs(pd.x - 0.5), 0.30) * step(abs(pd.y - 0.5), 0.30);

  // 5) SAAT NEFESİ — küresel ve SENKRON (gezen cephe yok: saat ağacının amacı skew'i sıfırlamak)
  float beat = exp(-fract(uTime / uClk) * 6.0);
  vLog += rail * beat * 0.20;

  // 6) ANAHTARLARIN IŞIK HAVUZU — sahnedeki TEK parlama mekanizması
  vec2 c = (vUv - R_CNT.xy) / (R_CNT.zw - R_CNT.xy);
  vec2 gi = vec2(c.x * 8.0, c.y * 5.0);
  vec2 id = clamp(floor(gi), vec2(0.0), vec2(7.0, 4.0));
  vec2 fr = gi - id - 0.5;
  vec2 st = cellState(7.0 - id.x, id.y, uTime, uClk);     // bit 0 = LSB = en sağ
  float rr = dot(fr, fr);
  float pool = exp(-rr * 5.5) * st.y;
  if (uDetail > 0.5) pool += exp(-rr * 1.4) * st.y * 0.30;
  pool *= rect(vUv, R_CNT);

  // 7) KIRINIM PARILTISI — metal adımı görünür dalga boyu mertebesinde olduğu için
  //    kalıp gerçekten bir kırınım ızgarasıdır. uTime terimi YOK: band, yönelimin SONUCU.
  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uLightDir), H = normalize(L + V);
  float s = dot(vec3(1.0, 0.0, 0.0), H);
  float lam = abs(2.0 * fract(s * uPitchScale) - 1.0);     // ÜÇGEN dalga → renk dikişi yok
  vec3 band = mix(uC3, uC4, smoothstep(0.0, 1.0, lam));
  vec3 sheen = band * pow(max(dot(N, H), 0.0), 24.0) * exp(-pow((s - 0.30) * 3.2, 2.0)) * 1.35;

  // ── BİRLEŞTİRME ──
  // mor KURALI: yalnız kenarda (mühür halkası + pedler), asla merkezde parlamaz.
  // Katsayılar bilerek DÜŞÜK: 0.70/0.85 denendi ve kalıp bir tabloya çerçeve
  // takılmış gibi göründü; kenar bir ipucu olmalı, ana olay değil.
  vec3 albedo = uC1 + uC2 * (vLog * mLog + vMem * mMem + vPhy * mPhy) + mix(uC2, uC4, 0.30) * (pads * 0.13 + seal * 0.16);
  vec3 emis = uC3 * (rail * mLog * 0.16 + pool * 2.10) + sheen + uC4 * seal * 0.04;
  vec3 col = albedo * (0.28 + 0.80 * max(dot(N, L), 0.0));

  // BAŞLIK MASKESİ: YALNIZ emissive'e. Albedo'ya dokunmak periyodik doku üstünde
  // Mach bandı yapar ("buraya birisi gölge koymuş"); koyuluğu kompozisyon + sis taşır.
  vec2 scr = gl_FragCoord.xy / uRes;
  emis *= mix(0.12, 1.0, smoothstep(0.85, 1.60, length((scr - uTitleC) / uTitleR)));
  emis *= 1.0 - 0.78 * smoothstep(0.900, 0.965, 1.0 - scr.y);   // KAYDIR bandı guard'ı
  col += emis;

  // SİS: sabitler applyFrame()'den TÜRETİLDİ (başka sahneden kopyalanmadı)
  col = mix(col, uC1, smoothstep(uFogN, uFogF, -vViewZ) * 0.95);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const cellVertex = `
${COMMON}
uniform float uTime, uClk;
attribute float aTop;
attribute vec2 aCell;                 // (bit, lane) — instance attribute
varying vec3 vN; varying vec3 vV; varying float vViewZ; varying float vBit; varying float vFlash;
void main(){
  vec2 st = cellState(aCell.x, aCell.y, uTime, uClk);
  vec3 p = position;
  // 1 → ~2,4 kat yükselir. MUTLAK değer küçük tutuldu: ilk render'da 0.075 idi ve
  // pedler çip hücresi değil "piyano tuşu" gibi duruyordu (yükseklik ped genişliğini
  // aşıyordu). Kabartma okunur ama alçak kalmalı.
  p.y += aTop * (st.x * 0.026 + st.y * 0.010);
  // ShaderMaterial'da begin_vertex chunk'ı yok → instanceMatrix ELLE uygulanır.
  vec4 wp = instanceMatrix * vec4(p, 1.0);
  vec4 mv = modelViewMatrix * wp;
  vN = normalize(normalMatrix * (mat3(instanceMatrix) * normal));
  vV = -mv.xyz; vViewZ = mv.z; vBit = st.x; vFlash = st.y;
  gl_Position = projectionMatrix * mv;
}
`;

const cellFragment = `
uniform float uFogN, uFogF;
uniform vec3 uLightDir, uC1, uC3, uC4;
uniform vec2 uRes, uTitleC, uTitleR;
varying vec3 vN; varying vec3 vV; varying float vViewZ; varying float vBit; varying float vFlash;
void main(){
  // Kapalı anahtar: ilk render'da (0.012,0.020,0.048) idi ve pedler kalıba açılmış
  // SİYAH DELİKLER gibi görünüyordu. Kalıp yüzeyine yakın ama belirgin şekilde sönük.
  const vec3 OFF = vec3(0.038, 0.058, 0.115);
  const vec3 HOT = vec3(0.62, 0.92, 1.00);        // yeni renk değil: camgöbeğinin aşırı pozlanmışı
  vec3 N = normalize(vN), V = normalize(vV), L = normalize(uLightDir), H = normalize(L + V);
  vec3 base = mix(OFF, uC3 * 0.42, vBit);
  float spec = pow(max(dot(N, H), 0.0), 52.0) * 0.55;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.4);
  vec3 col = base * (0.28 + 0.85 * max(dot(N, L), 0.0)) + vec3(spec) + uC4 * fres * 0.32;
  vec3 emis = uC3 * vBit * 0.62 + HOT * vFlash * 1.90;

  vec2 scr = gl_FragCoord.xy / uRes;
  emis *= mix(0.12, 1.0, smoothstep(0.85, 1.60, length((scr - uTitleC) / uTitleR)));
  emis *= 1.0 - 0.78 * smoothstep(0.900, 0.965, 1.0 - scr.y);
  col += emis;
  col = mix(col, uC1, smoothstep(uFogN, uFogF, -vViewZ) * 0.95);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// HERO_COLORS (BilgisayarClient) — LİNEER uzayda
const C1 = new THREE.Vector3(0.02, 0.04, 0.09);   // koyu lacivert: taban + sis hedefi
const C2 = new THREE.Vector3(0.05, 0.13, 0.30);   // derin mavi: doku taşıyıcısı
const C3 = new THREE.Vector3(0.13, 0.60, 0.74);   // camgöbeği: KURAL → hareket eden ve "1" olan her şey
const C4 = new THREE.Vector3(0.50, 0.34, 0.86);   // mor: yalnız kenarda, asla merkezde parlamaz

export default function ThreeChipHero() {
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

      // MSAA yalnız high: buradaki aliasing GEOMETRİK değil PROSEDÜREL,
      // MSAA ona dokunamaz — det(f,fw) zaten onun için var.
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: tier === 'high', powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap(tier)));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 1.0, 40);
      const rig = new THREE.Group();
      scene.add(rig);

      // ORTAM: PMREM/RoomEnvironment YOK (mount'ta 30-60ms ana-iş-parçacığı bloğu
      // yaratırlar, tam LCP penceresinde). 64×32 prosedürel gradyan yeterli.
      const EW = 64, EH = 32, data = new Uint8Array(EW * EH * 4);
      for (let y = 0; y < EH; y++) {
        const v = y / (EH - 1);                       // 0 = üst
        const top = [97, 112, 140], hor = [26, 33, 51], bot = [5, 8, 15];
        const c = v < 0.5
          ? top.map((t, i) => t + (hor[i] - t) * (v / 0.5))
          : hor.map((h, i) => h + (bot[i] - h) * ((v - 0.5) / 0.5));
        for (let x = 0; x < EW; x++) {
          const i = (y * EW + x) * 4;
          data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
        }
      }
      const envTex = new THREE.DataTexture(data, EW, EH, THREE.RGBAFormat);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      envTex.colorSpace = THREE.SRGBColorSpace;
      envTex.needsUpdate = true;
      scene.environment = envTex;

      // ── kademe parametreleri ──
      const ROWS = tier === 'low' ? 28 : tier === 'mid' ? 44 : 64;
      // İlk render'da 0.004/0.006/0.010 idi: frekans o kadar yüksekti ki det() hücre
      // dokusunu tamamen ortalamaya söndürüyor, SRAM bloğu koca boş bir yıkama oluyordu.
      const SRAM = tier === 'low' ? 0.020 : tier === 'mid' ? 0.014 : 0.010;
      const DETAIL = tier === 'low' ? 0 : 1;
      const PSCALE = tier === 'low' ? 2.5 : tier === 'mid' ? 4.5 : 7.5;   // hiçbir kademede 0 değil: kırınım = KİMLİK

      const shared = {
        uTime: { value: 0 }, uClk: { value: 0.36 },
        uDetail: { value: DETAIL }, uRows: { value: ROWS }, uSramPitch: { value: SRAM }, uPitchScale: { value: PSCALE },
        uLightDir: { value: new THREE.Vector3(0, 1, 0) },
        uFogN: { value: 6 }, uFogF: { value: 12 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTitleC: { value: new THREE.Vector2(0.5, 0.5) }, uTitleR: { value: new THREE.Vector2(0.30, 0.24) },
        uC1: { value: C1 }, uC2: { value: C2 }, uC3: { value: C3 }, uC4: { value: C4 },
      };

      // 1) pahlı dilim (tek PBR programı; clearcoat YOK — 0.20 birimlik dilimde hiçbir şey satın almaz)
      const slabGeo = buildBeveledSlab(DIE, DIE, THK, BEV);
      const slabMat = new THREE.MeshStandardMaterial({ color: 0x0a1330, metalness: 0.55, roughness: 0.26, envMapIntensity: 1.25 });
      rig.add(new THREE.Mesh(slabGeo, slabMat));

      // 2) kat planı düzlemi — tüm yerleşim tek fragment shader'da
      const planeGeo = new THREE.PlaneGeometry(DIE - 2 * BEV, DIE - 2 * BEV, 1, 1);
      const chipMat = new THREE.ShaderMaterial({ vertexShader: chipVertex, fragmentShader: chipFragment, uniforms: shared });
      const plane = new THREE.Mesh(planeGeo, chipMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = TOP + 0.0015;
      rig.add(plane);

      // 3) anahtar dizisi: 8 bit × 5 satır
      const cellGeo = buildCell(CELL, CH, CELL * 0.16, tier !== 'low');
      const aCell = new Float32Array(80);
      const cellMat = new THREE.ShaderMaterial({
        vertexShader: cellVertex, fragmentShader: cellFragment,
        uniforms: { ...shared, uGate: { value: tier !== 'low' ? 1 : 0 } },
      });
      const cells = new THREE.InstancedMesh(cellGeo, cellMat, 40);
      const dummy = new THREE.Object3D();
      for (let lane = 0; lane < 5; lane++) {
        for (let bit = 0; bit < 8; bit++) {
          const i = lane * 8 + bit;
          dummy.position.set(-1.15 + (7 - bit) * PITCH, TOP + 0.0015, 0.30 + lane * PITCH);
          dummy.updateMatrix();
          cells.setMatrixAt(i, dummy.matrix);
          aCell[i * 2] = bit; aCell[i * 2 + 1] = lane;
        }
      }
      cellGeo.setAttribute('aCell', new THREE.InstancedBufferAttribute(aCell, 2));
      // ZORUNLU: three, InstancedMesh'in bounding sphere'ini GEOMETRİDEN hesaplar
      // (0.109 birimlik minik küre) → yalpalamada 40 hücrenin TAMAMI sessizce kaybolur.
      cells.frustumCulled = false;
      cells.instanceMatrix.needsUpdate = true;
      rig.add(cells);

      const KEY_DIR = new THREE.Vector3(2.4, 4.0, 2.2).normalize();   // TEK KAYNAK
      const key = new THREE.DirectionalLight(0xffffff, 1.25);
      key.position.copy(KEY_DIR).multiplyScalar(8);
      scene.add(key);
      const rim = new THREE.PointLight(0x8b5cf6, 9, 18);
      rim.position.set(-3.0, 1.4, 1.6);
      scene.add(rim);

      // ── KADRAJ: sabit sayı YOK, çözülüyor ──
      const CORNERS: V3[] = [
        [-HALF, TOP, HALF], [HALF, TOP, HALF],
        [-HALF, TOP, -HALF], [HALF, TOP, -HALF],
      ];
      let dCam = 8, logged = false;
      const v = new THREE.Vector3();
      const applyFrame = (w: number, h: number) => {
        const aspect = w / h;
        const portrait = aspect < 0.85;
        camera.fov = portrait ? 44 : 34;
        camera.aspect = aspect;
        const elCam = portrait ? 0.60 : 0.55;
        let yMax = 0, yMin = 0;
        for (let i = 0; i < 8; i++) {
          camera.position.set(0, Math.sin(elCam) * dCam, Math.cos(elCam) * dCam);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld(true);
          let mx = 0; yMax = -9; yMin = 9;
          for (const c of CORNERS) {
            v.set(c[0], c[1], c[2]).project(camera);
            mx = Math.max(mx, Math.abs(v.x));
            yMax = Math.max(yMax, v.y); yMin = Math.min(yMin, v.y);
          }
          // Kadrajı YATAY sınır belirliyor (dikey pay hiç bağlayıcı olmuyor: gerçek
          // dikey kaplama ~0.52). 0.99 denendi, kalıbın üst kenarı ekranın %58'ine
          // çıktı ve alt başlık bandına (%58-70) girdi. 0.90 = okunabilirlik ile
          // makro his arasındaki denge; ölçümle bulundu, tahminle değil.
          dCam *= Math.max(mx / 0.90, (yMax - yMin) / 0.88);
        }
        // DİKEY YERLEŞİM: lens kaydırma — perspektifi bozmaz, derinlikten bağımsız.
        // ndc.y kayması = -elements[9]. İşaret TAHMİN DEĞİL, aşağıda ölçülüp düzeltiliyor.
        // -0.50/-0.48 denendi: kalıbın üst kenarı ekranın %62'sine düşüyordu ve ALT
        // BAŞLIK kutusu (%58-70) tam onun üstüne oturuyordu → ölçülen luminans 0.221,
        // sınır 0.10. Alt başlığın gölgesi yok, okunabilirlik kazası orada olur.
        const TARGET = portrait ? -0.62 : -0.60;
        camera.projectionMatrix.elements[9] += -(TARGET - (yMax + yMin) * 0.5);
        let lo = 9, hi = -9;
        for (const c of CORNERS) { v.set(c[0], c[1], c[2]).project(camera); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); }
        const resid = TARGET - (lo + hi) * 0.5;
        if (Math.abs(resid) > 0.02) camera.projectionMatrix.elements[9] += resid;   // işaret ters çıktıysa düzeltir

        // Sis kalıbın GERÇEK derinlik aralığına kalibre. uFogN başlangıçta
        // dCam-0.15·depth idi; alt başlık bandı (kalıbın uzak üst şeridi) 0.111
        // luminansta kalıyordu (sınır 0.10). Sis daha erken başlatıldı.
        const depth = HALF * Math.cos(elCam);
        shared.uFogN.value = dCam - depth * 0.55;
        shared.uFogF.value = dCam + depth * 1.05;
        shared.uTitleR.value.set(portrait ? 0.46 : 0.30, portrait ? 0.28 : 0.24);
        shared.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
        shared.uLightDir.value.copy(KEY_DIR).transformDirection(camera.matrixWorldInverse);

        if (process.env.NODE_ENV !== 'production' && !logged) {
          logged = true;
          // KADRAJ REGRESYON TESTİ — gözle değil sayıyla: dört köşe de |x|≤0.93
          // içinde ve dikey merkez TARGET±0.02 olmalı (yoksa kalıp kadrajdan taşar).
          const ndc = CORNERS.map(c => { const p = v.set(c[0], c[1], c[2]).project(camera); return [+p.x.toFixed(2), +p.y.toFixed(2)]; });
          const ys = ndc.map(p => p[1]);
          const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
          console.log('[chip-hero] NDC köşeler', JSON.stringify(ndc), 'merkez', mid.toFixed(2), 'hedef', TARGET, 'd', dCam.toFixed(2));
        }
      };

      const resize = () => {
        const w = host.clientWidth || window.innerWidth || 1200;
        const h = host.clientHeight || window.innerHeight || 800;
        renderer.setSize(w, h, false);
        applyFrame(w, h);   // lens kaydırma updateProjectionMatrix()'i ezdiği için TEK fonksiyonda
      };
      resize();
      window.addEventListener('resize', resize);

      const start = performance.now();
      // reduced-motion karesi: 20/40 ped açık (dengeli), taşıma cascade'i görünür
      const T_STILL = 6.80;
      const draw = (now: number) => {
        const t = ((now - start) / 1000) % WRAP;   // mediump fract() çözünürlüğü için ŞART
        shared.uTime.value = t;
        rig.rotation.y = Math.sin(t * 0.19) * 0.100;   // "=" ile: "+=" sinüsü integre eder
        rig.rotation.z = Math.sin(t * 0.13) * 0.035;   // ikinci eksen ŞART: kırınım bandı donmasın
        rig.position.y = Math.sin(t * 0.31) * 0.035;
        renderer.render(scene, camera);
      };

      // MOUNT STALL: makeFpsGuard bunu YAPISAL OLARAK göremez (WARMUP 60 kare atar,
      // MAX_DT 200ms'i aykırı sayar) → program derlemesi ayrıca ölçülür.
      const t0 = performance.now();
      draw(reduce ? start + T_STILL * 1000 : start);
      if (performance.now() - t0 > 220) {
        renderer.setPixelRatio(1); resize();
        shared.uDetail.value = 0; shared.uRows.value = 28;
      }

      let frozen = false;
      const guard = makeFpsGuard(
        () => {   // low'da setPixelRatio(1) no-op → asıl iş uniform'larda
          renderer.setPixelRatio(1); resize();
          shared.uDetail.value = 0; shared.uRows.value = 24; shared.uSramPitch.value = 0.012;
        },
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
        slabGeo.dispose(); planeGeo.dispose(); cellGeo.dispose();
        slabMat.dispose(); chipMat.dispose(); cellMat.dispose();
        envTex.dispose(); renderer.dispose();
        canvas.remove();
        // loseContext() ÇAĞRILMAZ: Strict Mode remount'ta bağlamı öldürür (bkz. ShaderHero).
      };
    } catch { /* WebGL yoksa: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
