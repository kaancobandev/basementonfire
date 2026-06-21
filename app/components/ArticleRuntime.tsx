'use client';

import { useEffect } from 'react';

/**
 * İçerik makalelerinin (ekonomi, einstein-rosen, arcade, tıbbi) orijinal vanilla
 * JS'ini SPA içinde güvenle çalıştırır:
 *  - Gerekli CDN'leri (Three.js, GSAP, Lottie) sırayla yükler, sonra inline JS'i enjekte eder.
 *  - SSR ile basılan içerik DOM'da hazır olduğundan getElementById/querySelector çalışır.
 *  - Unmount'ta (başka sayfaya geçince): kütüphane döngülerini (GSAP/ScrollTrigger/Lottie)
 *    ve AudioContext'i durdurur, JS'in body'ye eklediği düğümleri/global'leri temizler,
 *    bekleyen rAF'leri iptal eder, setInterval'leri temizler, init dinleyicilerini kaldırır,
 *    enjekte script'leri siler — böylece SPA gezinmesinde arka planda döngü/leak kalmaz.
 *  - NOT: 'js'/'reduced' html sınıfları layout <head> script'inde (ilk boyamadan önce)
 *    ayarlanır; reveal FOUC'unu önlemek için burada YÖNETİLMEZ.
 */
export default function ArticleRuntime({ js, cdns = [] }: { js: string; cdns?: string[] }) {
  useEffect(() => {
    const w = window as any;
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
      // Kütüphane/kaynak teardown'ı — SPA navigasyonunda CPU/WebGL/AudioContext leak'ini
      // önler. Bu kütüphaneler (GSAP/ScrollTrigger/Lottie) yalnızca içerik makalelerinde
      // kullanıldığından global olarak durdurmak güvenli.
      try { if (typeof w.__articleCleanup === 'function') w.__articleCleanup(); } catch {}
      try { delete w.__articleCleanup; } catch {}
      try { w.ScrollTrigger && w.ScrollTrigger.getAll && w.ScrollTrigger.getAll().forEach((t: any) => t.kill()); } catch {}
      try { w.gsap && w.gsap.globalTimeline && w.gsap.globalTimeline.clear(); } catch {}
      try { w.lottie && w.lottie.destroy && w.lottie.destroy(); } catch {}
      try { w.ARCADE && w.ARCADE.ac && w.ARCADE.ac.close && w.ARCADE.ac.close(); } catch {}
      // JS'in body'ye eklediği düğümler (tıbbi özel imleci) ve script-üretimi global'ler
      try { document.querySelectorAll('body > .cursor-ring, body > .cursor-dot').forEach((n) => n.remove()); } catch {}
      try { delete w.PULSE; } catch {}
      try { delete w._starGroup; } catch {}
      try { delete w.ARCADE; } catch {}
      rafs.forEach((id) => origCaf(id)); rafs.clear();
      intervals.forEach((id) => clearInterval(id)); intervals.clear();
      captured.forEach(({ t, type, fn, opts }) => { try { t.removeEventListener(type, fn, opts); } catch {} });
      injected.forEach((s) => s.remove());
      w.requestAnimationFrame = origRaf;
      w.cancelAnimationFrame = origCaf;
      w.setInterval = origSetInterval;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
