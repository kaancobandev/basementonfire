'use client';

import { useEffect } from 'react';

/**
 * İçerik makalelerinin (ekonomi, einstein-rosen, arcade, tıbbi) orijinal vanilla
 * JS'ini SPA içinde güvenle çalıştırır:
 *  - Gerekli CDN'leri (Three.js, GSAP, Lottie) sırayla yükler, sonra inline JS'i enjekte eder.
 *  - SSR ile basılan içerik DOM'da hazır olduğundan getElementById/querySelector çalışır.
 *  - Unmount'ta (başka sayfaya geçince): bekleyen requestAnimationFrame'leri iptal eder,
 *    setInterval'leri temizler, init sırasında eklenen window/document dinleyicilerini
 *    kaldırır ve enjekte edilen script'leri siler — böylece arka planda döngü/leak kalmaz.
 */
export default function ArticleRuntime({ js, cdns = [] }: { js: string; cdns?: string[] }) {
  useEffect(() => {
    const w = window as any;
    const root = document.documentElement;
    root.classList.add('js');
    let reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch {}
    if (reduced) root.classList.add('reduced');

    const injected: HTMLScriptElement[] = [];
    let stopped = false;

    // requestAnimationFrame: tüm mount boyunca izle, unmount'ta bekleyenleri iptal et
    const rafs = new Set<number>();
    const origRaf: typeof requestAnimationFrame = w.requestAnimationFrame.bind(w);
    const origCaf: typeof cancelAnimationFrame = w.cancelAnimationFrame.bind(w);
    w.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = origRaf((t) => { rafs.delete(id); cb(t); });
      rafs.add(id);
      return id;
    };
    w.cancelAnimationFrame = (id: number) => { rafs.delete(id); origCaf(id); };

    // setInterval: izle, unmount'ta temizle (React setInterval kullanmaz, güvenli)
    const intervals = new Set<any>();
    const origSetInterval = w.setInterval.bind(w);
    w.setInterval = (...a: any[]) => { const id = origSetInterval(...a); intervals.add(id); return id; };

    // window/document.addEventListener: SADECE script'in senkron init'i sırasında yakala
    // (diğer bileşenlerin dinleyicilerine dokunmamak için sonra geri al)
    const captured: { t: any; type: string; fn: any; opts: any }[] = [];
    const wrapAEL = (target: any) => {
      const orig = target.addEventListener.bind(target);
      target.addEventListener = (type: string, fn: any, opts: any) => { captured.push({ t: target, type, fn, opts }); orig(type, fn, opts); };
      return () => { target.addEventListener = orig; };
    };

    const runInline = () => {
      if (stopped) return;
      const restoreWin = wrapAEL(window);
      const restoreDoc = wrapAEL(document);
      try {
        const s = document.createElement('script');
        s.textContent = js;
        document.body.appendChild(s); // senkron çalışır
        injected.push(s);
      } finally {
        restoreWin();
        restoreDoc();
      }
    };

    const loadCdn = (src: string) => new Promise<void>((resolve) => {
      const existing = Array.from(document.scripts).find((sc) => sc.src === src);
      if (existing && (existing as any)._loaded) { resolve(); return; }
      if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', () => resolve()); return; }
      const sc = document.createElement('script');
      sc.src = src; sc.async = false;
      sc.onload = () => { (sc as any)._loaded = true; resolve(); };
      sc.onerror = () => resolve(); // yüklenmese de inline'ı deneyelim
      document.head.appendChild(sc);
      injected.push(sc);
    });

    (async () => {
      for (const c of cdns) { if (stopped) return; await loadCdn(c); }
      runInline();
    })();

    return () => {
      stopped = true;
      rafs.forEach((id) => origCaf(id)); rafs.clear();
      intervals.forEach((id) => clearInterval(id)); intervals.clear();
      captured.forEach(({ t, type, fn, opts }) => { try { t.removeEventListener(type, fn, opts); } catch {} });
      injected.forEach((s) => s.remove());
      w.requestAnimationFrame = origRaf;
      w.cancelAnimationFrame = origCaf;
      w.setInterval = origSetInterval;
      root.classList.remove('js');
      if (reduced) root.classList.remove('reduced');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
