'use client';

import { useEffect, useRef } from 'react';
import { deviceTier } from '@/app/components/article/heroPerf';

// ─────────────────────────────────────────────────────────────────────────
// Sinir ağı bağlantı arka planı (ayna-noronlari). Kaynak: lightswind/neural-link.
// Bu makaleye UYARLANDI ve arka-plan kullanımı için sadeleştirildi:
//   • RENK: makalenin iki kavramsal rengi — self #ff7a5c (mercan) ↔ mirror
//     #43e8c9 (turkuaz) — düğümlere KONUMA GÖRE gradient olarak uygulanır
//     (sol mercan → sağ turkuaz), çizgiler ara tonu alır. Paket = seam (parlak).
//   • Sayfanın zemini DEĞİŞMEZ: yalnız clearRect (şeffaf), zemin boyanmaz →
//     --ink altında görünür. (Orijinaldeki kullanılmayan currentBgFill atıldı.)
//   • Tema tespiti (.dark class + MutationObserver) ATILDI: proje data-theme
//     kullanır, hem de tek sabit palet isteniyor.
//   • Mouse etkileşimi (router/gravity/pulse + tüm dinleyiciler) ATILDI: arka
//     planda canvas içeriğin altında, mouse ona hiç ulaşmıyordu (ölü koddu).
//   • framer-motion useInView yerine IntersectionObserver (sıfır bağımlılık).
//   • Düğüm sayısı cihaz sınıfına göre (heroPerf); reduced-motion'da tek kare.
// ─────────────────────────────────────────────────────────────────────────

type Node = { x: number; y: number; vx: number; vy: number; radius: number; baseSpeed: number; pulse: number; tint: number };
type Packet = { x: number; y: number; path: number[]; idx: number; progress: number; speed: number; size: number };

const SELF: [number, number, number] = [0xff, 0x7a, 0x5c];   // mercan
const MIRROR: [number, number, number] = [0x43, 0xe8, 0xc9]; // turkuaz
const PACKET = '#f2eeff';                                    // seam (parlak sinyal)
// self→mirror arası düz interpolasyon (t: 0=self, 1=mirror) → rgb string
const mix = (t: number, a = 1) =>
  `rgba(${Math.round(SELF[0] + (MIRROR[0] - SELF[0]) * t)},${Math.round(SELF[1] + (MIRROR[1] - SELF[1]) * t)},${Math.round(SELF[2] + (MIRROR[2] - SELF[2]) * t)},${a})`;

export default function NeuralLinkBg({ className = '', maxDistance = 110, packetFrequency = 2000 }: {
  className?: string; maxDistance?: number; packetFrequency?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current, host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tier = deviceTier();
    const nodeCount = tier === 'low' ? 42 : tier === 'mid' ? 66 : 92;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0, nodes: Node[] = [], packets: Packet[] = [], lastTime = performance.now(), autoTimer = 0, visible = true;

    const createNode = (w: number, h: number): Node => {
      const angle = Math.random() * Math.PI * 2, baseSpeed = 0.2 + Math.random() * 0.4;
      const x = Math.random() * w;
      return { x, y: Math.random() * h, vx: Math.cos(angle) * baseSpeed, vy: Math.sin(angle) * baseSpeed,
        radius: 1.5 + Math.random() * 2.5, baseSpeed, pulse: 1, tint: x / w };  // tint = konuma göre gradient
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width || window.innerWidth));
      const h = Math.max(1, Math.round(r.height || window.innerHeight));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        nodes = Array.from({ length: nodeCount }, () => createNode(w, h));
        packets = [];
      }
    };
    resize();

    const neighbors = (i: number) => {
      const out: number[] = [], n1 = nodes[i];
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        const dx = nodes[j].x - n1.x, dy = nodes[j].y - n1.y;
        if (dx * dx + dy * dy < maxDistance * maxDistance) out.push(j);
      }
      return out;
    };

    const spawn = (start: number) => {
      const path = [start]; let cur = start;
      const hops = 4 + Math.floor(Math.random() * 3);
      for (let h = 0; h < hops; h++) {
        const ns = neighbors(cur).filter((n) => !path.includes(n));
        if (!ns.length) break;
        cur = ns[Math.floor(Math.random() * ns.length)];
        path.push(cur);
      }
      if (path.length > 1) {
        packets.push({ x: nodes[start].x, y: nodes[start].y, path, idx: 0, progress: 0,
          speed: 0.04 + Math.random() * 0.03, size: 2 + Math.random() * 2 });
        nodes[start].pulse = 2.5;
      }
    };

    const draw = (now: number) => {
      const w = canvas.width, h = canvas.height, dt = now - lastTime; lastTime = now;
      ctx.clearRect(0, 0, w, h);   // ŞEFFAF — sayfanın zemini görünür kalır

      if (!reduce && packetFrequency > 0) {
        autoTimer += dt;
        if (autoTimer >= packetFrequency) { autoTimer = 0; if (nodes.length) spawn(Math.floor(Math.random() * nodes.length)); }
      }

      // 1) düğümleri hareket ettir
      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy; }
        if (n.x < 0) n.x = w; else if (n.x > w) n.x = 0;
        if (n.y < 0) n.y = h; else if (n.y > h) n.y = 0;
        n.tint = n.x / w;                    // konum değişince ton da kayar (canlı gradient)
        n.pulse = n.pulse > 1 ? n.pulse - 0.05 : 1;
      }

      // 2) bağlantı çizgileri (ara ton, düşük alpha)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x, dy = n2.y - n1.y, d2 = dx * dx + dy * dy;
          if (d2 < maxDistance * maxDistance) {
            const dist = Math.sqrt(d2), alpha = (1 - dist / maxDistance) * 0.14;
            ctx.strokeStyle = mix((n1.tint + n2.tint) / 2, alpha);
            ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.stroke();
          }
        }
      }

      // 3) düğümler (konuma göre self→mirror gradient) + parlayan hale
      for (const n of nodes) {
        ctx.fillStyle = mix(n.tint);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radius * n.pulse, 0, Math.PI * 2); ctx.fill();
        if (n.pulse > 1.1) {
          ctx.strokeStyle = mix(n.tint); ctx.lineWidth = 1; ctx.globalAlpha = (n.pulse - 1) / 1.5;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.radius * n.pulse * 1.8, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // 4) paketler (yol boyunca sıçrar, parlak seam)
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        if (!reduce) p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0; p.idx++;
          if (p.idx >= p.path.length - 1) { packets.splice(i, 1); continue; }
          const reached = nodes[p.path[p.idx]]; if (reached) reached.pulse = 2;
        }
        const a = nodes[p.path[p.idx]], b = nodes[p.path[p.idx + 1]];
        if (!a || !b) { packets.splice(i, 1); continue; }
        p.x = a.x + (b.x - a.x) * p.progress; p.y = a.y + (b.y - a.y) * p.progress;
        ctx.shadowBlur = 8; ctx.shadowColor = PACKET; ctx.fillStyle = PACKET;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    draw(performance.now());   // ilk kareyi senkron çiz (reduced-motion'da tek kare)

    const loop = (now: number) => { if (!visible) { raf = 0; return; } draw(now); raf = requestAnimationFrame(loop); };
    if (!reduce) raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {   // ekran dışında rAF DURUR
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) { lastTime = performance.now(); raf = requestAnimationFrame(loop); }
    }, { rootMargin: '120px' });
    io.observe(host);

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [maxDistance, packetFrequency]);

  return (
    <div ref={hostRef} className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
