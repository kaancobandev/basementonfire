// ════════════════════════════════════════════════════════════════════════
// SÜPÜRGENİN OLAY TETİĞİ — adı "deploy-succeeded" olduğu için Netlify her
// başarılı production deploy'da bu fonksiyonu OTOMATİK çağırır; "-background"
// eki 15 dk'lık arka plan limitini verir (sweep ~5-15 sn sürebilir, senkron
// fonksiyonun 10 sn'lik limitine sığdırmaya çalışmak riskli olurdu).
//
// NEDEN VAR (2026-07-23 denetimi): süpürgenin tek tetiği panelden ELLE kurulmuş
// bir webhook'tu (repo dışı). Panelden yanlışlıkla silinse deploy'lar yeşil
// kalır, hiçbir test kırılmaz — site sessizce "deploy sonrası ilk ziyaretçi
// 3-4 sn bekler" hâline geri dönerdi. Tetik artık kodda; webhook yedek.
//
// WARM_SECRET kapısı BİLEREK yok: bu fonksiyon dışarıdan çağrılabilse bile
// yapabileceği tek şey kendi sitemizin cache'ini doldurmak (HARD_CAP + düşük
// eşzamanlılıkla sınırlı, idempotent). Sır gerektiren bir yüzey değil.
// ════════════════════════════════════════════════════════════════════════

import { runWarm } from '../lib/warm.mts';

export default async () => {
  await runWarm('deploy-succeeded');
};
