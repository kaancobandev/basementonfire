import { db } from './supabase/server';
import { imzaHaritasi, adresSec, IMZA } from './storyMedia';

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
    .select('id, title, cover_path, cover_url, story_highlight_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error || !data) return [];

  /* 🔐 KAPAK IMZALAMA — 23.08.2026 guvenlik denetimi. Kapak, gercek bir
     hikaye karesinin dosyasidir; eskiden PUBLIC kovadaki kalici adresti ve
     /api/stories/highlights anonime aciktI (o uc de ayni gun kimlik+gizlilik
     kapisina baglandi). Artik private kovadan kisa omurlu imza uretiliyor.
     ⚠ Eski satirlar `cover_url` ile calismaya devam eder (adresSec). */
  const yollar = (data as any[]).map((h) => h.cover_path).filter((y): y is string => typeof y === 'string' && !!y);
  const harita = yollar.length ? await imzaHaritasi(yollar, IMZA.ISTEK) : new Map<string, string>();

  return (data as any[]).map((h) => ({
    id: h.id,
    title: h.title,
    cover_url: adresSec(h.cover_path, h.cover_url, harita),
    count: Array.isArray(h.story_highlight_items) && h.story_highlight_items[0] ? Number(h.story_highlight_items[0].count) || 0 : 0,
  }));
}
