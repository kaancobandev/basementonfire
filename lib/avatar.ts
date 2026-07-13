// Bir kullanıcının avatar görsel kaynağı — TEK KAYNAK.
// Gerçek fotoğrafı varsa onu; yoksa deterministik üretilen notionists avatarını
// (/api/avatar/<username>, self-host DiceBear) döndürür. Böylece fotoğrafsız
// kullanıcılar da tanınabilir (aynı ad hep aynı avatar) ve her yerde tutarlı.
//
// Eski sistemin (16 dosyada kopyalanan gradyan+baş harf `avatarBg`) yerine geçer.
const DEFAULT_AVATAR = '/avatars/default.png';

export function avatarSrc(username?: string | null, avatar?: string | null): string {
  if (avatar && avatar !== DEFAULT_AVATAR) return avatar;
  const seed = (username && username.trim()) || 'user';
  return `/api/avatar/${encodeURIComponent(seed)}`;
}

// Profil başlığındaki DEKORATİF banner şeridi için deterministik gradyan.
// Bu bir avatar DEĞİL (kaldırılan gradyan+harf sistemiyle karıştırma) — profil
// header'ının rengi. Eski avatarBg ile aynı hash → mevcut banner renkleri değişmez.
const BANNER_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#10b981,#3b82f6)',
  'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#14b8a6,#06b6d4)',
  'linear-gradient(135deg,#3b82f6,#6366f1)', 'linear-gradient(135deg,#ef4444,#f97316)',
];
export function bannerGradient(username?: string | null): string {
  const u = (username && username.trim()) || 'a';
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return BANNER_GRADIENTS[Math.abs(h) % BANNER_GRADIENTS.length];
}
