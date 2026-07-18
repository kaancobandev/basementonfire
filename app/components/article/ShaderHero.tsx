'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh } from 'ogl';

// Genel, TEMA-PARAMETRELİ canlı WebGL gradyan/akış zemini (ogl). Her makale 4 renk
// vererek farklı bir hero atmosferi alır. dynamic(ssr:false) ile yüklenir; WebGL
// başlatılamazsa canvas gizlenir → arkadaki CSS gradyan fallback'i görünür.

export type Rgb = [number, number, number]; // 0..1

const DEFAULT_COLORS: [Rgb, Rgb, Rgb, Rgb] = [
  [0.016, 0.086, 0.063], [0.063, 0.45, 0.30], [0.40, 0.83, 0.31], [0.98, 0.74, 0.18],
];

const vertex = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;
varying vec2 vUv;
void main(){
  vec2 uv = vUv;
  float t = uTime * 0.12;
  float w = sin(uv.x * 3.0 + t) + sin(uv.y * 2.4 - t * 1.2) + sin((uv.x + uv.y) * 2.0 + t * 0.6);
  w += 0.6 * sin((uv.x - uv.y) * 5.0 + t * 1.5);
  w = w / 3.2;
  float m = distance(uv, uMouse);
  w += (0.28 - m) * 0.55;
  vec3 col = mix(uC1, uC2, smoothstep(-1.0, 0.1, w));
  col = mix(col, uC3, smoothstep(0.1, 0.7, w));
  col = mix(col, uC4, smoothstep(0.7, 1.2, w) * 0.55);
  float vig = smoothstep(1.15, 0.25, length(uv - 0.5));
  col *= mix(0.5, 1.05, vig);
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ShaderHero({ colors }: { colors?: [Rgb, Rgb, Rgb, Rgb] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const c = colors ?? DEFAULT_COLORS;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse: [number, number] = [0.5, 0.6];
    let raf = 0;

    try {
      const renderer = new Renderer({ canvas, alpha: false, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.75) });
      const gl = renderer.gl;
      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex, fragment,
        uniforms: {
          uTime: { value: 0 }, uMouse: { value: mouse },
          uC1: { value: c[0] }, uC2: { value: c[1] }, uC3: { value: c[2] }, uC4: { value: c[3] },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      // Fare konumu için önbelleklenen canvas dikdörtgeni. Eskiden her
      // `pointermove`'da `getBoundingClientRect()` çağrılıyordu → her fare
      // hareketinde zorunlu düzen hesabı (forced layout). Dinleyici efektin
      // ömrü boyunca window üzerinde kaldığı için, hero ekran dışındayken ve
      // shader hiç render etmezken bile bu maliyet ödeniyordu. Rect yalnızca
      // resize/scroll'da değişir; ikisinde de tazeliyoruz.
      let rect = canvas.getBoundingClientRect();
      const refreshRect = () => { rect = canvas.getBoundingClientRect(); };

      const resize = () => {
        const p = canvas.parentElement;
        renderer.setSize(p ? p.clientWidth : window.innerWidth, p ? p.clientHeight : window.innerHeight);
        refreshRect();
      };
      resize();
      window.addEventListener('resize', resize);

      window.addEventListener('scroll', refreshRect, { passive: true });

      const onMove = (e: PointerEvent) => {
        mouse[0] = (e.clientX - rect.left) / rect.width;
        mouse[1] = 1 - (e.clientY - rect.top) / rect.height;
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      let visible = true;
      const start = performance.now();
      const loop = (now: number) => {
        if (!visible) { raf = 0; return; } // ekran dışı → dur (tam ekran WebGL shader boşuna kasmasın)
        program.uniforms.uTime.value = (now - start) / 1000;
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      };
      if (reduce) { program.uniforms.uTime.value = 7; renderer.render({ scene: mesh }); }
      else raf = requestAnimationFrame(loop);

      // Hero uzun makalede unmount olmaz → ekran dışına kayınca shader'ı durdur.
      const io = reduce ? null : new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      }, { rootMargin: '200px' });
      io?.observe(canvas.parentElement ?? canvas);

      return () => {
        cancelAnimationFrame(raf);
        io?.disconnect();
        window.removeEventListener('resize', resize);
        window.removeEventListener('scroll', refreshRect);
        window.removeEventListener('pointermove', onMove);
        try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch {}
      };
    } catch {
      canvas.style.display = 'none';
    }
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
