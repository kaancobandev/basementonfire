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
 * Eşleştirme (/eslesme) için ayrı ve DAHA YÜKSEK sınır. Kayıt 16+, ama tanımadığın
 * kişilerle kart kaydırıp DM açan bu özellik yalnızca 18+.
 *
 * DİKKAT: Bu değer de hukuki metinlerde yazılı (/kosullar m.8, /acik-riza m.3,
 * /aydinlatma). Değiştirirsen onları da güncelle.
 */
export const MATCH_MIN_AGE = 18;

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

/**
 * Kullanıcı en az `minAge` yaşında mı?
 *
 * Doğum tarihi YOKSA `false` döner. Bu bilinçli: yaş kapısından ÖNCE kayıt olmuş
 * eski kullanıcıların birthdate'i NULL — onları eşleştirmeye almıyoruz (güvenli taraf).
 * DB'den gelen `date` kolonu "YYYY-MM-DD" ya da tam ISO olabilir → ilk 10 karakter.
 */
export function isAtLeast(birthdate: string | null | undefined, minAge: number): boolean {
  if (!birthdate) return false;
  const age = ageFromBirthdate(String(birthdate).slice(0, 10));
  return age !== null && age >= minAge;
}

/**
 * `minAge` yaşını doldurmuş olmak için gereken EN GEÇ doğum tarihi ("YYYY-MM-DD").
 * SQL'de havuzu filtrelemek için: `birthdate <= cutoff` → yalnızca minAge+ olanlar.
 * NULL birthdate bu karşılaştırmayı GEÇEMEZ (NULL <= x → NULL) → eski kayıtlar da elenir.
 */
export function birthdateCutoff(minAge: number): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - minAge);
  return d.toISOString().slice(0, 10);
}
