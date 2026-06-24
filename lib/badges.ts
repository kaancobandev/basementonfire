// Rozet tanimlari + seviye/XP yardimcilari. Rozetler KODDA tanimli; kullanici
// kazandikca user_badges tablosuna yazilir (boylece "yeni kazanildi" bildirimi
// tek sefer gosterilir ve esik dususe bile rozet kaybolmaz).

export type Badge = { key: string; name: string; emoji: string; desc: string };

// Sira onemli: profilde bu sirayla gosterilir.
export const BADGES: Badge[] = [
  { key: 'first_correct', name: 'Ilk Dogru',      emoji: '🎯', desc: 'Ilk dogru cevabini verdin' },
  { key: 'streak_3',      name: '3 Gun Seri',     emoji: '🔥', desc: '3 gun ust uste cozdun' },
  { key: 'streak_7',      name: 'Haftalik Azim',  emoji: '📅', desc: '7 gun ust uste cozdun' },
  { key: 'streak_30',     name: 'Aylik Usta',     emoji: '🏆', desc: '30 gun ust uste cozdun' },
  { key: 'correct_10',    name: 'Onluk',          emoji: '✅', desc: '10 dogru cevap topladin' },
  { key: 'correct_50',    name: 'Bilgi Avcisi',   emoji: '🧠', desc: '50 dogru cevap topladin' },
  { key: 'xp_100',        name: 'Merakli',        emoji: '💡', desc: '100 XP topladin' },
  { key: 'xp_500',        name: 'Bilge',          emoji: '🦉', desc: '500 XP topladin' },
];

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
