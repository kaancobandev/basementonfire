import { db } from './supabase/server';

// Hikaye öne çıkanları (highlights) — bir kullanıcının profilinde kalıcı vitrin.
// Hem profil server sayfaları hem /api/stories/highlights GET buradan okur, ayrışma olmasın.

export type HighlightSummary = { id: number; title: string; cover_url: string | null; count: number };

/**
 * Bir kullanıcının öne çıkanları (kapak + öğe sayısı). story_highlights tablosu
 * sql/features-story-highlights-reply.sql çalıştırılana kadar YOKTUR → o hâlde
 * boş dizi döner ve profildeki şerit hiç görünmez (özellik uykuda, kırılmaz).
 */
export async function getHighlights(userId: number): Promise<HighlightSummary[]> {
  const { data, error } = await db
    .from('story_highlights')
    .select('id, title, cover_url, story_highlight_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error || !data) return [];
  return (data as any[]).map((h) => ({
    id: h.id,
    title: h.title,
    cover_url: h.cover_url ?? null,
    count: Array.isArray(h.story_highlight_items) && h.story_highlight_items[0] ? Number(h.story_highlight_items[0].count) || 0 : 0,
  }));
}
