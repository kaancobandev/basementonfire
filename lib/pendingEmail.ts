/**
 * Kayıt sonrası "e-postanı onayla" ekranı için adresi taşıyan çerez.
 *
 * NEDEN ÇEREZ, NEDEN URL DEĞİL: e-posta kişisel veridir; sorgu dizesine
 * konursa tarayıcı geçmişine, sunucu erişim loglarına ve dış bağlantılara
 * gönderilen Referer başlığına sızar. httpOnly çerez ikisini de yapmaz ve
 * istemci JS'i de okuyamaz.
 *
 * Kısa ömürlü: yalnızca kayıt → onay ekranı → yeniden gönder akışı için.
 */
export const PENDING_EMAIL_COOKIE = 'bo-pending-email';

export const PENDING_EMAIL_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  /* 24 saat. ESKİDEN 1 SAATTI ve yalnız "onay ekranını tazele + yeniden gönder"
     içindi. 26.08.2026'da İKİNCİ bir görev üstlendi: `/auth/confirm` bu çerezle
     "onay bağlantısını açan tarayıcı, kaydı BAŞLATAN tarayıcı mı?" sorusunu
     cevaplıyor (oturum sabitleme kapısı). İnsanlar e-postasını bir saat içinde
     okumayabilir; süre kısa kalırsa kendi hesabını onaylayan kullanıcı da
     giriş yapmak zorunda kalır — güvenlik kazancı yok, sürtünme var.
     Çerez httpOnly + SameSite=Lax ve yalnız kişinin KENDİ adresini taşıyor. */
  maxAge: 60 * 60 * 24,
};

/** Ekranda gösterim için adresi maskeler: kaan@gmail.com → k***@gmail.com */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '';
  const head = user.slice(0, 1);
  return `${head}${'*'.repeat(Math.max(3, user.length - 1))}@${domain}`;
}
