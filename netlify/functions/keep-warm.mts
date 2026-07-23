// ════════════════════════════════════════════════════════════════════════
// LAMBDA ISITICI — girişli kullanıcının /feed açılışını soğuk başlatmadan korur.
//
// PROBLEM: /feed force-dynamic + no-store → hiçbir cache katmanına GİREMEZ;
// deploy süpürgesi (warm-background.mts) onu yapısal olarak ısıtamaz. ~3
// ziyaretçi/gün trafikte server-handler Lambda'sı istekler arasında uykuya
// düşer; girişli kullanıcı ('/' → 307 → /feed, middleware.ts) neredeyse her
// girişte soğuk başlatma öder. Ölçüm (2026-07-23): soğuk TTFB 3,9 sn /
// gövde 8,2 sn, sıcak 0,6-1,6 sn.
//
// ÇÖZÜM: 5 dakikada bir /feed'e TEK anonim GET. Amaç CACHE DEĞİL (no-store,
// zaten giremez) — Next server-handler Lambda instance'ını canlı tutmak.
// Yan kazanç: feed'in 30 sn'lik paylaşılan unstable_cache'i de tazelenir,
// gerçek ziyaretçi içerik sorgularının bir kısmını hazır bulur.
//
// warm-background.mts'teki katman ayrımıyla çelişki YOK: o fonksiyon
// cache'lenebilir sayfaları CDN'e doldurur (o sayfalar için doğru katman);
// burası cache'e giremeyen tek kritik rotanın FONKSİYON katmanını ısıtır.
//
// Maliyet: 288 çağrı/gün ≈ ~8.600/ay — kredi harcamasında deploy'ların
// (%94,7) yanında ihmal edilebilir. Çerezsiz istek → JS çalışmaz →
// page_views/GA istatistiklerine GİRMEZ (ikisi de istemci beacon'ı).
// Middleware de erken çıkar (çerez yok → auth turu yok).
// ════════════════════════════════════════════════════════════════════════

const TARGET = 'https://basementonfire.com/feed';
const UA = 'BasementsKeepWarm/1.0 (+https://basementonfire.com)';

export default async () => {
  const t0 = Date.now();
  try {
    const res = await fetch(TARGET, {
      headers: {
        'user-agent': UA,
        accept: 'text/html',
        // Node fetch accept-encoding'i kendiliğinden göndermez (bkz.
        // warm-background.mts'teki taşıyıcı satır); burada cache kovası derdi
        // yok ama sunucunun küçük gzip gövde döndürmesi için yine gönderilir.
        'accept-encoding': 'gzip, br',
      },
    });
    // Gövdeyi TÜKET: render'ın (ve içindeki Supabase sorgularının) tamamlanması
    // stream'in sonuna kadar okunmasına bağlı — yarıda bırakma.
    await res.arrayBuffer();
    console.log(`[keep-warm] /feed ${res.status} ${Date.now() - t0}ms`);
  } catch (e) {
    // Nadir zaman aşımı/ağ hatası sorun değil: 5 dk sonraki tur telafi eder.
    console.warn(`[keep-warm] hata (${Date.now() - t0}ms):`, String(e));
  }
};

// ZAMANLAMA netlify.toml'da: [functions."keep-warm"] schedule = "*/5 * * * *".
// BURADA `export const config = { schedule }` KULLANMA — denendi ve canlıda
// TETİKLENMEDİ (2026-07-24: fonksiyon deploy oldu ama cron hiç koşmadı, 7 dk
// sessizlik sonrası /feed yine soğuktu; üstelik URL'den çağrılabilir kalmıştı).
// Bu Next.js-plugin'li kurulumda in-source config statik olarak okunmuyor;
// toml bildirimi garantili yol. Cron UTC'dir; yalnız production deploy'da koşar.
// Log: Netlify UI → Logs → Functions → keep-warm.
