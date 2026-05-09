import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.SUPABASE_URL as string;
const key = import.meta.env.SUPABASE_SERVICE_KEY as string;

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export type Post = {
  id: number;
  content: string;
  image_url: string | null;
  category: string;
  likes: number;
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
};

export type DbUser = {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  bio: string;
  created_at: string;
};

// Supabase nested join'i SQLite'ın düz yapısına çevirir
// Böylece mevcut sayfa şablonları değişmeden çalışır
export function flattenPosts(rows: any[]): Post[] {
  return (rows ?? []).map(r => ({
    ...r,
    display_name: r.users?.display_name ?? '',
    username:     r.users?.username     ?? '',
    avatar:       r.users?.avatar       ?? '/avatars/default.png',
  }));
}

export function flattenFacts(rows: any[]): QuickFact[] {
  return (rows ?? []).map(r => ({
    ...r,
    display_name: r.users?.display_name ?? '',
    username:     r.users?.username     ?? '',
  }));
}
