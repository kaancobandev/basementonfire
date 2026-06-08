export type Post = {
  id: number;
  content: string;
  image_url: string | null;
  category: string;
  likes: number;
  reposts: number;
  created_at: string;
  display_name: string;
  username: string;
  avatar: string;
};

export type MediaItem = { url: string; type: 'image' | 'video' | 'audio' };

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

export function flattenPosts(rows: any[]): Post[] {
  return (rows ?? []).map(r => ({
    ...r,
    display_name: r.users?.display_name ?? '',
    username: r.users?.username ?? '',
    avatar: r.users?.avatar ?? '/avatars/default.png',
  }));
}

export function flattenFacts(rows: any[]): QuickFact[] {
  return (rows ?? []).map(r => ({
    ...r,
    display_name: r.users?.display_name ?? '',
    username: r.users?.username ?? '',
    avatar: r.users?.avatar ?? null,
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
  const cleaned: MediaItem[] = arr
    .filter((m: any) => m && typeof m.url === 'string' && m.url)
    .map((m: any) => ({ url: m.url as string, type: norm(m.type) }));
  if (cleaned.length) return cleaned;
  return f.media_url ? [{ url: f.media_url, type: norm(f.media_type) }] : [];
}
