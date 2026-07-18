export type Post = {
  id: number;
  user_id?: number;
  content: string;
  image_url: string | null;
  category: string;
  likes: number;
  reposts: number;
  created_at: string;
  display_name: string;
  username: string;
  avatar: string;
  /** Anket seçenekleri (post_polls). Anketsiz gönderide null/undefined. */
  poll?: string[] | null;
};

// w/h: yükleme anında ölçülen piksel boyutları (CLS önlemi — oran SSR'da
// hesaplanır, tarayıcı ölçmez). Eski kayıtlarda olmayabilir → opsiyonel.
export type MediaItem = { url: string; type: 'image' | 'video' | 'audio'; w?: number; h?: number };

export type QuickFact = {
  id: number;
  caption: string;
  media_url: string;
  media_type: 'image' | 'video' | 'audio';
  media?: MediaItem[];
  likes: number;
  created_at: string;
  display_name: string;
  username: string;
  avatar?: string;
  /** Yorum sayısı. Sorguda `comments(count)` gömülü seçildiyse dolu gelir;
   *  seçilmediği yüzeylerde undefined kalır (sayaç gizlenir, kart bozulmaz). */
  comments_count?: number;
};

export type DbUser = {
  id: number;
  auth_id: string;
  username: string;
  display_name: string;
  avatar: string;
  bio: string;
  created_at: string;
  is_private: boolean;
  dm_privacy: 'everyone' | 'followers' | 'none';
  comment_privacy: 'everyone' | 'followers' | 'none';
  birthdate: string | null;
  location: string | null;
  website: string | null;
  gender: '' | 'erkek' | 'kadin' | 'diger';
  interests: string[];
};

// "Bunu biliyor muydun?" bilgi kartlari (did_you_know tablosu). Feed'e
// kind:'dyk' olarak serpistirilir; mevcut fact/post ayrimina ucuncu tur eklenir.
export type DidYouKnow = {
  id: number;
  title: string;
  body: string;
  source_url: string | null;
  source_label: string | null;
  article_slug: string | null;
  image_url: string | null;
  created_at: string;
  // İmza + beğeni (2026-07-19): yazar gizli/silinmiş hesapsa null gelir
  // (küresel yüzeyde kimlik sızdırma yok); likes dyk_likes tablosu yokken 0.
  author?: { username: string; display_name: string; avatar: string | null } | null;
  likes?: number;
};

// Gunun sorusu / XP / seri ilerlemesi (user_progress tablosu)
export type UserProgress = {
  xp: number;
  current_streak: number;
  longest_streak: number;
  total_correct: number;
  total_answered: number;
  last_answer_date: string | null;
};

export function flattenPosts(rows: any[]): Post[] {
  return (rows ?? []).map(r => ({
    ...r,
    display_name: r.users?.display_name ?? '',
    username: r.users?.username ?? '',
    avatar: r.users?.avatar ?? '/avatars/default.png',
    // Anket seçenekleri gömülü gelir (post_polls(options)); sorguda seçilmediyse
    // ya da tablo yoksa undefined kalır → kart anketsiz çizilir.
    poll: Array.isArray(r.post_polls) ? (r.post_polls[0]?.options ?? null) : (r.post_polls?.options ?? null),
  }));
}

export function flattenFacts(rows: any[]): QuickFact[] {
  return (rows ?? []).map(r => ({
    ...r,
    display_name: r.users?.display_name ?? '',
    username: r.users?.username ?? '',
    avatar: r.users?.avatar ?? null,
    // PostgREST gömülü toplam sayımı `comments: [{ count: N }]` biçiminde
    // döner (sorguda `comments(count)` seçilmişse). Tek sorguda gelir —
    // gönderi başına ayrı sayım atmak N+1 olurdu.
    // Seçilmediyse undefined kalır ve kartta sayaç gösterilmez.
    comments_count: Array.isArray(r.comments) ? (r.comments[0]?.count ?? 0) : undefined,
  }));
}

/**
 * Bir gönderinin medya listesini normalize eder: `media` (jsonb dizi) doluysa
 * onu döner; değilse geriye dönük olarak tek öğeli [media_url] döner. Böylece
 * eski (tek görselli) ve yeni (çoklu) gönderiler aynı şekilde işlenir.
 */
export function factMediaList(f: { media_url?: string | null; media_type?: string | null; media?: unknown }): MediaItem[] {
  const arr = Array.isArray(f.media) ? f.media : [];
  const norm = (t: unknown): 'image' | 'video' | 'audio' => (t === 'video' ? 'video' : t === 'audio' ? 'audio' : 'image');
  // w/h varsa GEÇİR (CLS: oran SSR'da basılır); yoksa eski davranış (istemci ölçer).
  const dims = (m: any): { w?: number; h?: number } =>
    Number.isFinite(m.w) && Number.isFinite(m.h) && m.w > 0 && m.h > 0
      ? { w: Math.round(m.w), h: Math.round(m.h) }
      : {};
  const cleaned: MediaItem[] = arr
    .filter((m: any) => m && typeof m.url === 'string' && m.url)
    .map((m: any) => ({ url: m.url as string, type: norm(m.type), ...dims(m) }));
  if (cleaned.length) return cleaned;
  return f.media_url ? [{ url: f.media_url, type: norm(f.media_type) }] : [];
}

/**
 * Medya listesini görseller (resim/video) ve arka plan sesi olarak ayırır.
 * Ses artık karuselde slayt değil; ilk ses dosyası gönderinin arka plan müziği
 * olarak kullanılır (kalanlar yok sayılır).
 */
export function splitMedia(list: MediaItem[]): { visuals: MediaItem[]; audio: string | null } {
  const visuals = list.filter(m => m.type !== 'audio');
  const audio = list.find(m => m.type === 'audio')?.url ?? null;
  return { visuals, audio };
}
