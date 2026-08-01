'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { deviceTier, dprCap, makeFpsGuard } from './heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// MARS'IN KILICI (atilla hero'su) — three.js.
//
// NEDEN BU OBJE: Jordanes'in aktardığına göre bir çoban otlakta toprakta bir
// kılıç bulup kağana getirir; Atilla onu Savaş Tanrısı'nın kılıcı ilan eder.
// Bozkır siyasetinde bunun adı vardır: KUT — Gök'ten gelen yönetme yetkisi —
// görünür bir nesneye bağlanır. Soyut iddia elle tutulur hâle gelir.
//
// TON NOTU (önemli): bu obje bir SAHTECİLİK anlatısı DEĞİLDİR. Kanuni'nin
// dört taçlı miğferi "sipariş edilmiş ve hiç takılmamış bir rekvizit"ti;
// burada tam tersi var — bulunan bir nesne, sahiplenilerek meşruiyetin
// maddesine dönüşüyor. Kılıç bu yüzden görkemli çizilir, ironiyle değil.
//
// KİMSE TUTMUYOR: kılıç ucu aşağı, toprağa saplı. Çevresinde çatlamış zemin
// ve yükselen kor var. Silueti dikey ve kalın → 375 px'te de okunur (bileşik
// yay bu testte kalıyordu, kılıç bu yüzden seçildi).
//
// GEOMETRİ SAF PRİMİTİF + iki elle yazılmış tampon:
//   • buildBlade  — eşkenar dörtgen kesitli, uca doğru incelen çift ağızlı namlu
//                   (flatShading → orta sırt keskin okunur)
//   • buildCracks — zeminde ışıyan radyal çatlaklar
//   + lathe (kabza), box (balçak), sphere (topuz + garnet kakmalar), points (kor)
// Dış model, doku indirmesi, GLB YOK → lisans ve CSP riski sıfır.
//
// ENV-MAP NEDEN TERS: diğer hero'larda gök üstte aydınlıktır. Burada ışık
// KAYNAĞI YERDE — kor. Bu yüzden equirect gradyanın ALT yarısı sıcak ve
// parlak, üst yarısı soğuk ve koyu. Çelik namlu alt yarıyı yansıttığı için
// aşağı doğru ısınıyor; sahnenin hikâyesi de bu.
//
// Perf disiplini diğer hero'larla aynı (heroPerf.ts): cihaz kademesi, kare
// ölçen bekçi, ekran dışında rAF durur, reduced-motion'da tek statik kare,
// cleanup'ta tam dispose, loseContext() ÇAĞRILMAZ (Strict Mode tuzağı).
// ─────────────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;

const STEEL = 0x9aa3ad;
const GOLD = 0xd9a441;
const GOLD_DEEP = 0x9c6f26;
const GARNET = 0xa01f2d;
const EMBER = 0xe2622b;
const GRIP = 0x2a1c16; // koyu deri/ahşap sargı

/** Kılıcın yerel uzaydaki dikey sınırları — kadraj çözücüsü bunları kullanır. */
const Y_TOP = 2.62; // topuzun tepesi
const Y_TIP = -2.62; // namlunun ucu (toprağın altında)
const Y_GROUND = -2.34; // zemin düzlemi: uç ~0.28 gömülü
const HALF_W = 0.62; // balçak yarı genişliği (en geniş yatay ölçü)

/**
 * Çift ağızlı namlu. Kesit bir eşkenar dörtgen: sol ağız, ön sırt, sağ ağız,
 * arka sırt. Uca doğru hem genişlik hem kalınlık daralır.
 *
 * NİYE flatShading: computeVertexNormals pürüzsüz normal üretiyor ve orta sırt
 * yuvarlanıp kayboluyordu (namlu, şişmiş bir bıçak gibi okunuyordu). Düz
 * gölgelendirmede dört yüz ayrı ayrı ışık alıyor → sırt bir çizgi hâlinde
 * parlıyor. Kılıcı kılıç yapan detay bu.
 */
function buildBlade(len: number, halfW: number, thick: number, M: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= M; i++) {
    const t = i / M; // 0 = balçak dibi, 1 = uç
    const y = -t * len;
    // Gövde boyunca çok hafif incelme, son %26'da sivri uca iniş.
    const taper = t < 0.74 ? 1 - t * 0.16 : (1 - 0.74 * 0.16) * Math.pow(1 - (t - 0.74) / 0.26, 0.72);
    const w = halfW * Math.max(0.015, taper);
    const th = thick * Math.max(0.04, taper);
    pos.push(-w, y, 0, 0, y, th, w, y, 0, 0, y, -th);
  }
  for (let i = 0; i < M; i++) {
    const a = i * 4, b = (i + 1) * 4;
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) % 4;
      idx.push(a + k, b + k, a + k2, a + k2, b + k, b + k2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Kabza profili (lathe): balçaktan topuza doğru hafif fıçı biçimi. */
function gripProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const STEPS = 10;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const r = 0.105 + Math.sin(t * Math.PI) * 0.022; // ortası hafif şişkin
    pts.push(new THREE.Vector2(r, 1.72 + t * 0.72));
  }
  return pts;
}

/**
 * Zemindeki radyal çatlaklar: kılıcın saplandığı noktadan dışa açılan, uca
 * doğru incelen ince üçgen şeritler. Işıyan malzemeyle çizilir (kor).
 * Deterministik sahte-rastgelelik → remount'ta aynı desen (hidrasyon güvenli).
 */
function buildCracks(count: number, inner: number, outer: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const rnd = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  let base = 0;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + (rnd(i) - 0.5) * 0.34;
    const len = outer * (0.45 + rnd(i * 3.7) * 0.55);
    const wid = 0.055 * (0.6 + rnd(i * 5.1) * 0.8);
    const ca = Math.cos(a), sa = Math.sin(a);
    // dipte genişçe, uçta sıfır (üç köşe)
    const x0 = ca * inner, z0 = sa * inner;
    const nx = -sa, nz = ca; // teğet yön (genişlik ekseni)
    pos.push(
      x0 + nx * wid, 0, z0 + nz * wid,
      x0 - nx * wid, 0, z0 - nz * wid,
      ca * len, 0, sa * len,
    );
    idx.push(base, base + 1, base + 2);
    base += 3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Yumuşak nokta dokusu (kor tanesi). Küçük canvas → dosya indirmesi yok. */
function makeSpark(): THREE.Texture | null {
  try {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0.0, 'rgba(255,238,205,1)');
    g.addColorStop(0.35, 'rgba(255,150,60,0.75)');
    g.addColorStop(1.0, 'rgba(255,120,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  } catch {
    return null;
  }
}

/**
 * Küçük gradyan canvas → equirect doku → PMREM ortam haritası.
 * TERS GRADYAN: ışık kaynağı yerdeki kor, gök değil (dosya başlığındaki nota bak).
 */
function makeEnv(renderer: THREE.WebGLRenderer): { env: THREE.Texture; dispose: () => void } | null {
  try {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 32;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createLinearGradient(0, 0, 0, 32);
    g.addColorStop(0.00, '#12141c'); // tepe: soğuk bozkır gecesi
    g.addColorStop(0.42, '#241a1a');
    g.addColorStop(0.62, '#5e2a17'); // ufuk: korun ısıttığı bant
    g.addColorStop(0.82, '#c2521f');
    g.addColorStop(1.00, '#ff8a3d'); // dip: ateş
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 32);
    // tek soğuk ay lekesi — çelik tepede tamamen kahverengiye kaçmasın diye
    const s = ctx.createRadialGradient(46, 6, 0, 46, 6, 13);
    s.addColorStop(0, 'rgba(190,205,255,0.85)');
    s.addColorStop(1, 'rgba(190,205,255,0)');
    ctx.fillStyle = s;
    ctx.fillRect(30, 0, 34, 20);

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

export default function ThreeSwordHero() {
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
      renderer.toneMappingExposure = 1.35;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 60);
      const rig = new THREE.Group();
      scene.add(rig);
      // Kılıç yerel uzayda ~-2.62 … +2.62 arasında, yani merkezi zaten ~0.
      // Crown hero'daki gibi ek gövde offset'ine gerek yok; kadraj TARGET ile
      // aşağı itiliyor (başlık üst yarıda kalsın).
      const body = new THREE.Group();
      rig.add(body);

      const envPack = makeEnv(renderer);
      if (envPack) scene.environment = envPack.env;

      // ── Çözünürlük kademesi ──
      const SEG = tier === 'low' ? 12 : tier === 'mid' ? 20 : 28;
      const BLADE_M = tier === 'low' ? 14 : 26;
      const CRACKS = tier === 'low' ? 7 : 13;
      const SPARKS = tier === 'low' ? 26 : tier === 'mid' ? 60 : 110;
      const gemsOn = tier !== 'low';

      const geos: THREE.BufferGeometry[] = [];
      const mats: THREE.Material[] = [];
      const keep = <T extends THREE.BufferGeometry>(g: T) => { geos.push(g); return g; };

      const steelMat = new THREE.MeshStandardMaterial({
        color: STEEL, metalness: 1.0, roughness: 0.26, envMapIntensity: 1.5, flatShading: true,
      });
      const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.95, roughness: 0.28, envMapIntensity: 1.4 });
      const goldDeepMat = new THREE.MeshStandardMaterial({ color: GOLD_DEEP, metalness: 0.92, roughness: 0.42, envMapIntensity: 1.15 });
      const gripMat = new THREE.MeshStandardMaterial({ color: GRIP, metalness: 0.12, roughness: 0.82, envMapIntensity: 0.55 });
      const garnetMat = new THREE.MeshStandardMaterial({
        color: GARNET, metalness: 0.2, roughness: 0.14, envMapIntensity: 1.7, emissive: GARNET, emissiveIntensity: 0.35,
      });
      const crackMat = new THREE.MeshBasicMaterial({
        color: EMBER, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false,
      });
      mats.push(steelMat, goldMat, goldDeepMat, gripMat, garnetMat, crackMat);

      // ── Namlu: balçak dibinden (y=1.66) uca (y=-2.62) ──
      const BLADE_LEN = 1.66 - Y_TIP;
      const blade = new THREE.Mesh(keep(buildBlade(BLADE_LEN, 0.235, 0.058, BLADE_M)), steelMat);
      blade.position.y = 1.66;
      body.add(blade);

      // ── Balçak (crossguard): hafif konik bar + iki uç topuzu ──
      const guard = new THREE.Mesh(keep(new THREE.BoxGeometry(HALF_W * 2, 0.115, 0.17)), goldMat);
      guard.position.y = 1.72;
      body.add(guard);
      const guardCapGeo = keep(new THREE.SphereGeometry(0.078, SEG / 2, SEG / 3));
      for (const sx of [-1, 1]) {
        const cap = new THREE.Mesh(guardCapGeo, goldDeepMat);
        cap.position.set(sx * HALF_W, 1.72, 0);
        cap.scale.set(0.9, 1.0, 1.0);
        body.add(cap);
      }

      // ── Kabza: koyu sargı + altın tel halkalar ──
      const grip = new THREE.Mesh(keep(new THREE.LatheGeometry(gripProfile(), SEG)), gripMat);
      body.add(grip);
      const wireGeo = keep(new THREE.TorusGeometry(0.118, 0.011, 6, SEG));
      for (let i = 0; i < 5; i++) {
        const w = new THREE.Mesh(wireGeo, goldMat);
        w.rotation.x = Math.PI / 2;
        w.position.y = 1.84 + i * 0.14;
        body.add(w);
      }

      // ── Topuz (pommel): basık küre + tepe garnet ──
      const pommel = new THREE.Mesh(keep(new THREE.SphereGeometry(0.19, SEG, SEG / 2)), goldMat);
      pommel.position.y = 2.46;
      pommel.scale.set(1.0, 0.78, 1.0);
      body.add(pommel);

      // ── Garnet cloisonné kakmalar: balçakta ve topuzda (Hun elit işçiliği) ──
      const gems: THREE.Mesh[] = [];
      if (gemsOn) {
        const gemGeo = keep(new THREE.SphereGeometry(0.042, 8, 6));
        // balçak boyunca sıra
        for (let i = 0; i < 5; i++) {
          const k = (i - 2) / 2; // -1 … 1
          for (const sz of [1, -1]) {
            const g = new THREE.Mesh(gemGeo, garnetMat);
            g.position.set(k * (HALF_W - 0.1), 1.72, sz * 0.088);
            g.scale.set(1, 1, 0.55);
            body.add(g);
            gems.push(g);
          }
        }
        // topuzun tepesindeki tek büyük taş
        const crown = new THREE.Mesh(keep(new THREE.SphereGeometry(0.072, 10, 8)), garnetMat);
        crown.position.y = 2.61;
        crown.scale.set(1, 0.62, 1);
        body.add(crown);
        gems.push(crown);
      }

      // ── Zemin: ışıyan radyal çatlaklar ──
      const cracks = new THREE.Mesh(keep(buildCracks(CRACKS, 0.16, 2.15)), crackMat);
      cracks.position.y = Y_GROUND;
      body.add(cracks);

      // ── Kor tanecikleri (yükselen) ──
      const spark = makeSpark();
      let points: THREE.Points | null = null;
      let sparkMat: THREE.PointsMaterial | null = null;
      const seeds = new Float32Array(SPARKS);
      if (spark) {
        const p = new Float32Array(SPARKS * 3);
        for (let i = 0; i < SPARKS; i++) {
          const a = (i / SPARKS) * TAU * 3.3;
          const r = 0.25 + ((i * 37) % 100) / 100 * 1.85;
          p[i * 3] = Math.cos(a) * r;
          p[i * 3 + 1] = Y_GROUND + ((i * 53) % 100) / 100 * 4.2;
          p[i * 3 + 2] = Math.sin(a) * r;
          seeds[i] = ((i * 71) % 100) / 100;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
        geos.push(g);
        sparkMat = new THREE.PointsMaterial({
          size: 0.085, map: spark, transparent: true, depthWrite: false,
          blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 0.9,
        });
        mats.push(sparkMat);
        points = new THREE.Points(g, sparkMat);
        body.add(points);
      }

      // ── Işıklar: anahtar YUKARIDAN DEĞİL, aşağıdan (kor) ──
      const ground = new THREE.PointLight(EMBER, 26, 9, 2);
      ground.position.set(0, Y_GROUND + 0.35, 0.5);
      scene.add(ground);
      const key = new THREE.DirectionalLight(0xffd9b0, 1.5);
      key.position.set(-2.2, 1.4, 3.2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9fb4ff, 1.15);
      rim.position.set(2.8, 2.2, -2.2);
      scene.add(rim);
      scene.add(new THREE.HemisphereLight(0x30405e, 0x1a0d08, 0.55));

      // ── Kadraj: crown hero ile aynı disiplin (sabit sayı yok, çözülüyor) ──
      // Obje ÇOK dar ve ÇOK uzun → kadrajı tamamen DİKEY uzunluk belirler.
      // Yatay kısıt zaten hiç bağlamıyor (HALF_W 0.62'ye karşı yükseklik 5.24).
      const CORNERS: [number, number, number][] = [
        [0, Y_TOP, 0], [0, Y_TIP, 0],
        [-HALF_W, 1.72, 0], [HALF_W, 1.72, 0],
        [-2.15, Y_GROUND, 0], [2.15, Y_GROUND, 0], // çatlak halkası
      ];
      let dCam = 10;
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
          // K = objenin oturacağı NDC yüksekliği. Kılıç dikey bir nesne;
          // crown'dan (0.50/0.55) belirgin BÜYÜK olması gerekiyor yoksa
          // ekranda bir kibrit çöpüne dönüyor.
          dCam *= Math.max(mx / 0.90, (yMax - yMin) / (portrait ? 1.06 : 1.16));
        }
        // Merkezi aşağı it: üst şerit başlığa kalsın. Topuz başlık bloğunun
        // ALTINDA durmalı — ölçüm tarayıcıda yapılacak, bu başlangıç değeri.
        // Objeyi aşağı it. ⚠ BU DEĞER ÖLÇÜMLE BULUNDU, tahminle değil.
        // -0.26'da objenin tepesi ekranın %34,8'ine geliyordu; ÜST SATIR ise
        // %36'da duruyor → topuzun altın+garnet spekülerinin tam üstüne biniyor
        // ve kontrast 2,27:1'e düşüyordu (AA eşiği 4,5; üst satır 11,5px yani
        // "büyük metin" istisnasına da girmiyor). Başlık 96px olduğu için 6,2
        // ile zaten güvendeydi — asıl kurban küçük üst satırdı.
        // -0.37 + fill 1.16 ile objenin tepesi üst satırın ALTINA iniyor.
        const TARGET = portrait ? -0.40 : -0.37;
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
      const T_STILL = 2.4; // reduced-motion'da gösterilecek kare
      const posAttr = points ? (points.geometry.getAttribute('position') as THREE.BufferAttribute) : null;

      const draw = (now: number) => {
        const t = ((now - start) / 1000) % 3600;
        // Kamera saplı kılıcın çevresinde ağır ağır dönüyor. Kılıç DÖNMÜYOR —
        // duruyor. Fark önemli: dönen bir vitrin objesi değil, saplı bir nesne.
        rig.rotation.y = t * 0.16;
        // ⚠ ÖLÇÜLDÜ (2026-08-01, canlı canvas'tan readPixels): bu değer -0.05'ti
        // ve zemin çatlaklarının ekrandaki payı %0 çıkıyordu. Sebep: çatlaklar
        // y = Y_GROUND'da YATAY bir düzlemde duruyor, kamera ise (0,0,d)'den tam
        // yatay bakıyor → düzlem KENARINDAN görünüyor, yani bir çizgi.
        // -0.26 (~15°) ile zemin bir elipse açılıyor; kılıç ekranda hâlâ dik
        // duruyor çünkü eğim DERİNLİKTE, yanlamasına değil.
        rig.rotation.x = -0.26 + Math.sin(t * 0.21) * 0.03;

        // garnetler yavaşça nabız gibi
        garnetMat.emissiveIntensity = 0.28 + Math.sin(t * 0.9) * 0.14;
        crackMat.opacity = 0.52 + Math.sin(t * 0.7) * 0.12;

        // korlar yükselir ve başa sarar
        if (posAttr) {
          const arr = posAttr.array as Float32Array;
          for (let i = 0; i < SPARKS; i++) {
            const s = seeds[i];
            let y = arr[i * 3 + 1] + (0.006 + s * 0.010);
            if (y > Y_GROUND + 4.6) y = Y_GROUND;
            arr[i * 3 + 1] = y;
            arr[i * 3] += Math.sin(t * 0.6 + s * 12.0) * 0.0016;
            arr[i * 3 + 2] += Math.cos(t * 0.5 + s * 9.0) * 0.0016;
          }
          posAttr.needsUpdate = true;
        }
        renderer.render(scene, camera);
      };

      resize();
      window.addEventListener('resize', resize);

      const t0 = performance.now();
      draw(reduce ? start + T_STILL * 1000 : start);
      if (performance.now() - t0 > 220) { renderer.setPixelRatio(1); resize(); }

      let frozen = false;
      const guard2 = makeFpsGuard(
        () => { renderer.setPixelRatio(1); resize(); },
        () => { frozen = true; },
      );

      let visible = true;
      const loop = (now: number) => {
        if (!visible || frozen) { raf = 0; return; }
        guard2(now);
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
        spark?.dispose();
        envPack?.dispose();
        renderer.dispose();
        canvas.remove();
        // loseContext() ÇAĞRILMAZ: Strict Mode remount'ta bağlamı öldürür.
      };
    } catch { /* WebGL yoksa: arkadaki CSS gradyan zemin görünür */ }
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
