// ════════════════════════════════════════════════════════════════════════
// KENAR HIZ SINIRI — /api/upload için sel kesici.
//
// NEDEN VAR: uygulama içindeki token bucket (lib/rateLimit.ts) isteği REDDEDER
// ama önce ÇALIŞTIRIR. Reddedilen her istek yine de 1 Netlify fonksiyon çağrısı
// + 1 Supabase auth turu + 1 satır yazması harcıyor (kovayı doldurma UPDATE'i
// reddederken de yazar). Saatte 1000 istek atan biri kovayı hiç delmeden bu
// bedeli ödetebilir. Netlify'ın hız sınırı ise fonksiyon ÇAĞRILMADAN ÖNCE
// uygulanır — sel buraya çarpar, arkasındaki hiçbir şey uyanmaz.
//
// GÖVDESİ BİLEREK BOŞ: `undefined` döndürmek "bu isteğe dokunma, zinciri
// sürdür" demektir. İstek normal akışına devam eder; tek işi `config`teki
// rateLimit kuralını o yola bağlamak. Next.js middleware'i de bu yolda bir
// edge fonksiyonu olarak çalışıyor (matcher /api/* i kapsıyor) ve aynı yolda
// iki edge fonksiyonunun sırası dokümante DEĞİL — geçirgen tasarım bu yüzden:
// sıra ne olursa olsun davranış değişmiyor.
//
// SAYILAR — kenar limiti uygulama limitinden BİLEREK GEVŞEK:
//   · Kenar IP başına sayar. Ortak ağdaki (okul, kafe, operatör NAT) ikinci
//     kullanıcı da aynı kovaya düşer, o yüzden politika burada uygulanamaz.
//   · Gerçek politika uygulamada: kullanıcı başına saatte 10 (RATE_LIMITS.upload).
//   · Buradaki 20/dk = saatte 1200 tavan; meşru hiçbir kullanıcıya değmez,
//     ama saatte 1000 istekli seli kenarda öldürür.
//
// PLAN SINIRI: ücretsiz/starter planda proje başına 2 kural, Pro'da 5.
// İkinci kural için en iyi aday /api/storage/sign (yüklemenin ön kapısı).
//
// tsconfig `**/*.ts` topladığı için bu dosya `exclude`a eklendi: Deno global'leri
// ve @netlify/edge-functions tipleri Next'in tsconfig'inde yok, tsc burayı
// derlemeye çalışırsa boşuna kırılır. Netlify bu dosyayı kendi Deno bundle'ıyla
// derler.
// ════════════════════════════════════════════════════════════════════════

export default async () => undefined;

export const config = {
  path: '/api/upload',
  rateLimit: {
    windowLimit: 20,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
