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

export type QuickFact = {
  id: number;
  caption: string;
  media_url: string;
  media_type: 'image' | 'video';
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
