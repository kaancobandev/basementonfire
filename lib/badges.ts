// Rozet tanimlari + seviye/XP yardimcilari. Rozetler KODDA tanimli; kullanici
// kazandikca user_badges tablosuna yazilir (boylece "yeni kazanildi" bildirimi
// tek sefer gosterilir ve esik dususe bile rozet kaybolmaz).

import type { ArticleCategory } from '@/lib/articles';

export type Badge = { key: string; name: string; emoji: string; desc: string };

// Sira onemli: profilde bu sirayla gosterilir.
// ⛔ `key` ALANLARINA ASLA DOKUNMA: user_badges.badge_key ile eslesiyorlar;
//    degistirilirse kazanilmis rozetler EKRANDAN KAYBOLUR. `name`/`desc`
//    yalnizca gosterim, serbestce duzeltilebilir.
export const BADGES: Badge[] = [
  { key: 'first_correct', name: 'İlk Doğru',      emoji: '🎯', desc: 'İlk doğru cevabını verdin' },
  { key: 'streak_3',      name: '3 Gün Seri',     emoji: '🔥', desc: '3 gün üst üste çözdün' },
  { key: 'streak_7',      name: 'Haftalık Azim',  emoji: '📅', desc: '7 gün üst üste çözdün' },
  { key: 'streak_30',     name: 'Aylık Usta',     emoji: '🏆', desc: '30 gün üst üste çözdün' },
  { key: 'correct_10',    name: 'Onluk',          emoji: '✅', desc: '10 doğru cevap topladın' },
  { key: 'correct_50',    name: 'Bilgi Avcısı',   emoji: '🧠', desc: '50 doğru cevap topladın' },
  { key: 'xp_100',        name: 'Meraklı',        emoji: '💡', desc: '100 XP topladın' },
  { key: 'xp_500',        name: 'Bilge',          emoji: '🦉', desc: '500 XP topladın' },
  // Koleksiyon rozetleri (2026-07-19): bir kategorinin TUM makalelerini okuyana
  // verilir. earnedBadgeKeys() BUNLARI VERMEZ (o yalniz soru ilerlemesine bakar);
  // odul /api/articles/[slug]/read icinde kategori tamamlaninca yazilir.
  { key: 'koleksiyon_fizik',     name: 'Fizik Rafı',     emoji: '⚛️', desc: 'Tüm Fizik makalelerini okudun' },
  { key: 'koleksiyon_kimya',     name: 'Kimya Rafı',     emoji: '🧪', desc: 'Tüm Kimya makalelerini okudun' },
  { key: 'koleksiyon_tarih',     name: 'Tarih Rafı',     emoji: '🏛️', desc: 'Tüm Tarih makalelerini okudun' },
  { key: 'koleksiyon_biyoloji',  name: 'Biyoloji Rafı',  emoji: '🧬', desc: 'Tüm Biyoloji makalelerini okudun' },
  { key: 'koleksiyon_teknoloji', name: 'Teknoloji Rafı', emoji: '💻', desc: 'Tüm Teknoloji makalelerini okudun' },
  // 2026-08-01: 'koleksiyon_kultur' KALDIRILDI (Kültür kategorisi artık yok).
  // Kimsenin kazanmadigi DOGRULANDI (user_badges sorgulandi) -> yetim rozet yok.
  { key: 'koleksiyon_astronomi', name: 'Astronomi Rafı', emoji: '🔭', desc: 'Tüm Astronomi makalelerini okudun' },
  { key: 'koleksiyon_tip',       name: 'Tıp Rafı',       emoji: '🩺', desc: 'Tüm Tıp makalelerini okudun' },
  { key: 'koleksiyon_sanat',     name: 'Sanat Rafı',     emoji: '🎨', desc: 'Tüm Sanat makalelerini okudun' },
  { key: 'koleksiyon_ekonomi',   name: 'Ekonomi Rafı',   emoji: '📈', desc: 'Tüm Ekonomi makalelerini okudun' },
];

// Kategori adi (lib/articles.ts) → koleksiyon rozeti anahtari.
// TIP `Record<ArticleCategory, string>`, `Record<string, string>` DEGIL: eskiden
// serbest string'di ve yeni bir kategori eklenince buraya eklemeyi unutmak
// SESSIZ bir hataydi -- rozet hic yazilmiyordu, hicbir yerde patlamiyordu.
// Artik kategori eklenip buraya eklenmezse `tsc` derlemeyi durdurur.
export const CATEGORY_BADGE_KEYS: Record<ArticleCategory, string> = {
  'Fizik': 'koleksiyon_fizik',
  'Astronomi': 'koleksiyon_astronomi',
  'Kimya': 'koleksiyon_kimya',
  'Biyoloji': 'koleksiyon_biyoloji',
  'Tıp': 'koleksiyon_tip',
  'Teknoloji': 'koleksiyon_teknoloji',
  'Tarih': 'koleksiyon_tarih',
  'Sanat': 'koleksiyon_sanat',
  'Ekonomi': 'koleksiyon_ekonomi',
};

export const BADGE_MAP: Record<string, Badge> = Object.fromEntries(BADGES.map(b => [b.key, b]));

type ProgressLike = {
  xp: number;
  current_streak: number;
  longest_streak: number;
  total_correct: number;
};

// Bir ilerleme durumuna gore KAZANILMIS OLMASI GEREKEN tum rozet anahtarlari.
// Seri rozetlerinde longest_streak kullanilir -> bir gun kacirsan rozet kalir.
export function earnedBadgeKeys(p: ProgressLike): string[] {
  const keys: string[] = [];
  if (p.total_correct >= 1) keys.push('first_correct');
  if (p.longest_streak >= 3) keys.push('streak_3');
  if (p.longest_streak >= 7) keys.push('streak_7');
  if (p.longest_streak >= 30) keys.push('streak_30');
  if (p.total_correct >= 10) keys.push('correct_10');
  if (p.total_correct >= 50) keys.push('correct_50');
  if (p.xp >= 100) keys.push('xp_100');
  if (p.xp >= 500) keys.push('xp_500');
  return keys;
}

// Seviye: her 100 XP = 1 seviye (Lv 1'den baslar).
export function levelFromXp(xp: number): { level: number; intoLevel: number; perLevel: number } {
  const perLevel = 100;
  const level = Math.floor(xp / perLevel) + 1;
  const intoLevel = xp % perLevel;
  return { level, intoLevel, perLevel };
}

/** Kilitli bir rozetin ne kadarının tamamlandığı - "5 / 7" gibi. */
export type RozetIlerleme = { simdi: number; hedef: number };

/**
 * Bir rozetin ilerlemesi. Ölçülemiyorsa null (o rozetin altında sayaç çizilmez).
 *
 * ⚠ Seri rozetleri `longest_streak` ile ölçülür, `current_streak` ile DEĞiL -
 * `earnedBadgeKeys` de öyle yapıyor. Aksi halde rozet AÇIK görünürken altında
 * "2 / 7" yazardı: bir gün kaçırınca current düşer ama rozet kalır.
 *
 * ⛔ Bu fonksiyon rozet KAZANDIRMAZ; kazanma mantığı yalnız `earnedBadgeKeys`
 *    ve koleksiyon için okuma rotasıdır. Burası sadece vitrin.
 */
export function badgeProgress(
  key: string,
  p: ProgressLike | null,
  kategoriRaf?: Record<string, { read: number; total: number }>,
): RozetIlerleme | null {
  if (key.startsWith('koleksiyon_')) {
    if (!kategoriRaf) return null;
    const kategori = (Object.keys(CATEGORY_BADGE_KEYS) as ArticleCategory[])
      .find((k) => CATEGORY_BADGE_KEYS[k] === key);
    const raf = kategori ? kategoriRaf[kategori] : undefined;
    return raf && raf.total > 0 ? { simdi: raf.read, hedef: raf.total } : null;
  }
  if (!p) return null;
  switch (key) {
    case 'first_correct': return { simdi: p.total_correct, hedef: 1 };
    case 'streak_3':      return { simdi: p.longest_streak, hedef: 3 };
    case 'streak_7':      return { simdi: p.longest_streak, hedef: 7 };
    case 'streak_30':     return { simdi: p.longest_streak, hedef: 30 };
    case 'correct_10':    return { simdi: p.total_correct, hedef: 10 };
    case 'correct_50':    return { simdi: p.total_correct, hedef: 50 };
    case 'xp_100':        return { simdi: p.xp, hedef: 100 };
    case 'xp_500':        return { simdi: p.xp, hedef: 500 };
    default:              return null;
  }
}
