// Ödül anının imperatif parçaları — uçan çip ve ölçüm yardımcıları.
//
// ⚠ NEDEN framer DEĞİL: Günün Sorusu, HomeFeed'in `<LazyMotion strict>` ağacının
// İÇİNDE render ediliyor; orada `motion.*` invariant fırlatır, ağaç dışında ise
// `m.*` renderer bulamayıp sessizce animasyonsuz kalır. Uçan çip zaten DOM'a
// geçici bir düğüm koyup CSS geçişiyle taşıyor — React'e hiç girmiyor.

export type CipTuru = 'xp' | 'seri';

export function azHareket(): boolean {
  return typeof window !== 'undefined'
    && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function bekle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Bir öğenin ekran merkezi. Öğe yoksa ya da hiç yer kaplamıyorsa null. */
export function merkez(el: Element | null | undefined): { x: number; y: number } | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * `metin` yazılı bir çipi `bas`langıç noktasında belirtir, sonra `hedef`e uçurur.
 *
 * Söz (promise), çip hedefe vardığında çözülür — çağıran o anda barı doldurur.
 *
 * ⚠ `transitionend`e TEK BAŞINA güvenilmez: gizli/kısılmış sekmede CSS geçişi
 * donar ve olay HİÇ gelmez; düğüm ekranda asılı kalır, söz de hiç çözülmez.
 * Bu yüzden hem kaldırma hem çözme `setTimeout`a bağlı (o, gizli sekmede de
 * gecikmeli ama MUTLAKA çalışır).
 */
export function ucanCip(
  metin: string,
  bas: { x: number; y: number },
  hedef: { x: number; y: number },
  tur: CipTuru = 'xp',
): Promise<void> {
  // Hareketi azaltan kullanıcıda çip HİÇ çizilmez; çağıran akış aynen sürer,
  // yalnız bekleme sıfırlanır (bar anında dolar).
  if (typeof document === 'undefined' || azHareket()) return Promise.resolve();

  const el = document.createElement('div');
  el.className = tur === 'seri' ? 'bof-cip bof-cip--seri' : 'bof-cip';
  el.setAttribute('aria-hidden', 'true');   // duyuru aria-live satırından gider
  el.textContent = metin;
  el.style.transform = `translate(${bas.x}px, ${bas.y}px) translate(-50%, -50%) scale(0.2)`;
  el.style.opacity = '0';
  document.body.appendChild(el);

  const dx = hedef.x, dy = hedef.y;
  const BELIR = 200, UCUS = 620;

  // Belirme: küçükten tam boya.
  void el.offsetWidth;
  el.style.transition = `transform ${BELIR}ms var(--bof-ease-spring), opacity 120ms linear`;
  el.style.transform = `translate(${bas.x}px, ${bas.y}px) translate(-50%, -50%) scale(1)`;
  el.style.opacity = '1';

  return new Promise<void>((coz) => {
    setTimeout(() => {
      el.style.transition = `transform ${UCUS}ms var(--bof-ease-fly), opacity 200ms linear ${UCUS - 200}ms`;
      el.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%) scale(0.6)`;
      el.style.opacity = '0';
    }, BELIR);

    setTimeout(() => {
      el.remove();
      coz();
    }, BELIR + UCUS);
  });
}

/**
 * Bir öğeye kısa ömürlü bir sınıf takar (zıplama gibi eklemeli süsler için).
 * Sınıfı ÖNCE kaldırıp reflow zorlar; art arda çağrıda animasyon yeniden başlar.
 */
export function kisaSinif(el: Element | null | undefined, sinif: string, ms: number) {
  if (!el) return;
  el.classList.remove(sinif);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(sinif);
  setTimeout(() => el.classList.remove(sinif), ms);
}
