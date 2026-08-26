/**
 * Siteler arası POST bekçisi — `Sec-Fetch-Site` tabanlı.
 *
 * BULGU (26.08.2026 denetimi): `/api/auth/login` yabancı kökenli bir POST'u
 * sorgusuz işliyordu. Canlı ölçüm: `Origin: https://evil.example` başlığıyla
 * gönderilen form POST'u HTTP 303 ile kimlik doğrulama akışını sonuna kadar
 * koştu. İçerik türü `form-urlencoded` olduğu için gerçek bir `<form>`
 * gönderimi preflight de tetiklemez — yani sömürü şekli birebir uygulanabilir.
 *
 * ZARAR SINIRLI ve bilerek öyle sınıflandırıldı: giriş CSRF'i saldırganın
 * kurbanı KENDİ hesabına sokmasıdır (kurbanın hesabını ele geçirmek değil).
 * Bu sitede zarar "kullanıcı farkında olmadan başka bir hesapla gezer".
 *
 * ⚠ BİLEREK DAR: yalnızca `Sec-Fetch-Site` AÇIKÇA `cross-site` ise reddediyor.
 *   Başlık yoksa (eski tarayıcı, garip bir vekil) İZİN VERİYOR ve `Origin`
 *   karşılaştırmasına da düşmüyor. Sebep ölçülebilir bir risk dengesi:
 *   bu düşük ağırlıklı bir bulgu, ama yanlış yazılmış bir kaynak kontrolü
 *   HERKESİN GİRİŞİNİ kırar. Netlify arkasında `req.url`in host'u istemcinin
 *   gördüğü host olmayabilir; `Origin`i yanlış host'la kıyaslamak tam olarak
 *   böyle bir kesinti üretirdi. Modern tarayıcıların hepsi bu başlığı yolluyor,
 *   yani gerçek saldırı yüzeyi zaten kapanıyor.
 *
 * `none` = kullanıcının kendi başlattığı gezinme (adres çubuğu, yer imi) → meşru.
 * `same-origin` / `same-site` → meşru.
 */
export function caprazKokenPost(req: Request): boolean {
  return req.headers.get('sec-fetch-site') === 'cross-site';
}
