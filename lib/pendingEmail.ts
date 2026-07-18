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
  maxAge: 60 * 60, // 1 saat — onay ekranını tazeleyip yeniden göndermeye yeter
};

/** Ekranda gösterim için adresi maskeler: kaan@gmail.com → k***@gmail.com */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '';
  const head = user.slice(0, 1);
  return `${head}${'*'.repeat(Math.max(3, user.length - 1))}@${domain}`;
}
