'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * 429 yanıtındaki `Retry-After` başlığını geri sayan bir saniye sayacına çevirir.
 * Kullanımı: gönder düğmesini `left > 0` iken kilitle.
 *
 * NE İŞE YARAR, NE YARAMAZ: bu bir GÜVENLİK katmanı DEĞİL — saldırgan düğmeyi
 * hiç kullanmaz, doğrudan uca istek atar. Amacı dürüst kullanıcının reddedilen
 * isteği üst üste denemesini durdurmak. Bunun somut bedeli var: tarayıcı
 * medyayı Storage'a yükledikten SONRA /api/upload çağrılıyor, yani her boş
 * deneme bir dosya yüklemesini çöpe atıyor (2026-08-10'da konsolda 4 kez görüldü).
 *
 * `Retry-After` okunabiliyor çünkü istek AYNI KÖKENDE; farklı kökene giden bir
 * istekte sunucunun ayrıca `Access-Control-Expose-Headers` vermesi gerekirdi.
 * Başlık yoksa (ör. yanıtı Netlify'ın edge katmanı üretmişse) `fallback` kullanılır.
 */
export function useCooldown() {
  const [left, setLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const durdur = () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  };
  // Bileşen sökülürken sayacı bırak — yoksa kapatılan modalın arkasında
  // saniyede bir setState çalışmaya devam eder.
  useEffect(() => durdur, []);

  /** Yanıttan süreyi okur, geri saymaya başlar ve saniyeyi döndürür. */
  function startFrom(res: Response, fallback = 60): number {
    const raw = Number(res.headers.get('Retry-After'));
    const sec = Number.isFinite(raw) && raw > 0 ? Math.ceil(raw) : fallback;
    durdur();
    setLeft(sec);
    timer.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { durdur(); return 0; }
        return v - 1;
      });
    }, 1000);
    return sec;
  }

  return { left, startFrom };
}

/** "95 sn" / "2 dk 5 sn" — geri sayımı okunur biçimde yazar. */
export function cooldownLabel(sec: number): string {
  if (sec < 60) return `${sec} sn`;
  const dk = Math.floor(sec / 60);
  const kalan = sec % 60;
  return kalan ? `${dk} dk ${kalan} sn` : `${dk} dk`;
}
