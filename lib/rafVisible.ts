/**
 * Ekran dışındaki canvas'ın rAF döngüsünü durdurur, geri görünür olunca başlatır.
 *
 * Neden: makale sayfalarındaki canvas modülleri mount olduğu andan itibaren
 * koşulsuz `requestAnimationFrame` ile kendini yeniden zamanlıyordu. Okur
 * makalenin sonuna kaydırdığında ekran dışındaki her canvas saniyede 60 kez
 * çizmeye devam ediyor → sürekli ana iş parçacığı işi, kaydırma tırtıklanması
 * (INP) ve mobilde belirgin batarya tüketimi. Bu desen radyoaktivite
 * sim'lerinde (sim-halflife.tsx) ve ShaderHero'da zaten doğru uygulanmıştı;
 * burası onu paylaşılan hale getiriyor.
 *
 * Kullanım:
 *   const vis = observeVisibility(canvas, () => { if (!raf) raf = requestAnimationFrame(loop); });
 *   const loop = () => {
 *     if (!vis.visible) { raf = 0; return; }   // ← döngü başında
 *     ...
 *     raf = requestAnimationFrame(loop);
 *   };
 *   return () => { cancelAnimationFrame(raf); vis.disconnect(); };
 */
export type VisibilityHandle = { visible: boolean; disconnect: () => void };

export function observeVisibility(el: Element, onEnter: () => void): VisibilityHandle {
  // SSR / eski tarayıcı → her zaman görünür say (eski davranış, kırılma yok).
  if (typeof IntersectionObserver === 'undefined') {
    return { visible: true, disconnect: () => {} };
  }

  const handle: VisibilityHandle = { visible: true, disconnect: () => {} };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        handle.visible = e.isIntersecting;
        if (e.isIntersecting) onEnter();
      }
    },
    // 200px pay: kullanıcı öğeye varmadan döngü çoktan ısınmış olsun,
    // görünür olduğu an donmuş bir kare görmesin.
    { rootMargin: '200px' },
  );

  io.observe(el);
  handle.disconnect = () => io.disconnect();
  return handle;
}
