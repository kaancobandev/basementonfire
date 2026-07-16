// Deterministik tr-TR sayı biçimi (binlik "." ondalık ",").
//
// Intl/toLocaleString KULLANMAZ: Node'un ve tarayıcının ICU'su farklı
// olduğunda aynı sayı sunucuda "7840", istemcide "7.840" render edilir →
// hidrasyon uyuşmazlığı. SSR'a giren her sayı bundan geçmeli.
// (Makalelerin kendi ui.tsx'lerindeki tr() ile aynı uygulama.)

export function tr(n: number, dec = 0): string {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  const [int, frac] = Math.abs(n).toFixed(dec).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + grouped + (frac ? ',' + frac : '');
}
