/**
 * Yaş kapısı — tek doğruluk kaynağı.
 *
 * DİKKAT: Bu değer hukuki metinlerde de yazılıdır (/kosullar, /gizlilik, /aydinlatma).
 * Değiştirirsen o metinleri de güncellemen ŞART — yoksa yayımladığın politika ile
 * uyguladığın kural birbirini tutmaz.
 *
 * Not: Eşleştirme (/eslesme) özelliği için ayrıca 18+ sınırı planlanıyor (Faz 4).
 */
export const MIN_AGE = 16;

/**
 * "YYYY-MM-DD" doğum tarihinden bugünkü tam yaşı hesaplar.
 * Geçersiz / gelecekteki / saçma tarihlerde `null` döner.
 *
 * İstemciye GÜVENİLMEZ: kayıt route'unda sunucuda yeniden hesaplanır.
 */
export function ageFromBirthdate(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso || '').trim());
  if (!m) return null;

  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));

  // Gerçek bir takvim günü mü? (ör. 2010-02-31 → Mart'a kayar, yakala)
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;

  const now = new Date();
  if (dt.getTime() > now.getTime()) return null; // gelecek tarih

  let age = now.getUTCFullYear() - y;
  const dogumGunuGelmedi =
    now.getUTCMonth() < mo - 1 ||
    (now.getUTCMonth() === mo - 1 && now.getUTCDate() < d);
  if (dogumGunuGelmedi) age--;

  if (age < 0 || age > 120) return null;
  return age;
}
