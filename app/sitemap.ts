import type { MetadataRoute } from 'next';
import { db } from '@/lib/supabase/server';
import { ARTICLES } from '@/lib/articles';

const SITE_URL = 'https://basementonfire.com';

// Harita 1 saat önbelleklenir (ISR) — her arama motoru ziyaretinde DB'ye gitmez.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/akis`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE_URL}/discover`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/reels`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${SITE_URL}/muzik`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/lig`, lastModified: now, changeFrequency: 'daily', priority: 0.4 },
    // Hukuki metinler — herkese açık, güven/E-E-A-T sinyali için indekslensin.
    { url: `${SITE_URL}/gizlilik`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/kosullar`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/aydinlatma`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/acik-riza`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    // ⚠ BİLEREK EKLENMEYENLER — buraya bir URL eklemeden önce iki soruyu sor:
    // "anonim istekte 200 dönüyor mu?" ve "sayfanın kendi metadata'sı index diyor mu?"
    // Search Console sitemap'teki her çelişkiyi HATA olarak raporlar ve haritanın
    // tümüne olan güveni düşürür (2026-07-24 denetiminde 6 URL bu yüzden hatalıydı).
    //  · /bilgi-karti  → middleware PROTECTED listesinde; anonim istek 307 ile
    //                    /login'e gider ("Page with redirect").
    //  · /paylasim     → sayfanın kendi metadata'sı robots:{index:false} (yönetim
    //                    aracı) → "Submitted URL marked noindex".
    //  · /rastgele     → rastgele makaleye YÖNLENDİRİR ("Page with redirect").
    //  · /eslesme      → giriş + 18 yaş gerektirir, herkese açık değil.
    //  · /login,/register ve korumalı yollar → robots.txt'te zaten Disallow.
  ];

  // Makale listesi TEK kaynaktan (lib/articles.ts) — yeni makale eklenince
  // sitemap otomatik güncellenir (elle senkron riski yok).
  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map(a => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [{ data: users }, { data: tags }, { data: posts }, { data: userArticles }] = await Promise.all([
      db.from('users').select('username, created_at').eq('is_private', false).limit(5000),
      db.from('hashtags').select('tag').limit(2000),
      db.from('quick_facts')
        .select('id, created_at, users!quick_facts_user_id_fkey!inner(is_private)')
        .eq('users.is_private', false)
        .order('created_at', { ascending: false })
        .limit(5000),
      // Onaylı (yayındaki) kullanıcı makaleleri — /makale/[slug] herkese açık yayınlanmış içerik.
      db.from('user_articles')
        .select('slug, published_at, updated_at')
        .eq('status', 'approved')
        .order('published_at', { ascending: false })
        .limit(5000),
    ]);
    const userRoutes: MetadataRoute.Sitemap = (users ?? [])
      .filter((u: any) => u.username)
      .map((u: any) => ({
        url: `${SITE_URL}/u/${encodeURIComponent(u.username)}`,
        lastModified: u.created_at ? new Date(u.created_at) : now,
        changeFrequency: 'weekly',
        priority: 0.5,
      }));
    const tagRoutes: MetadataRoute.Sitemap = (tags ?? [])
      .filter((t: any) => t.tag)
      .map((t: any) => ({
        url: `${SITE_URL}/hashtag/${encodeURIComponent(t.tag)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.4,
      }));
    const postRoutes: MetadataRoute.Sitemap = (posts ?? [])
      .filter((p: any) => p.id)
      .map((p: any) => ({
        url: `${SITE_URL}/p/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    const uaRoutes: MetadataRoute.Sitemap = (userArticles ?? [])
      .filter((a: any) => a.slug)
      .map((a: any) => ({
        url: `${SITE_URL}/makale/${encodeURIComponent(a.slug)}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : (a.published_at ? new Date(a.published_at) : now),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    dynamicRoutes = [...userRoutes, ...tagRoutes, ...postRoutes, ...uaRoutes];
  } catch {
    // DB erişilemezse statik + makale haritası yine de döner
  }

  return [...staticRoutes, ...articleRoutes, ...dynamicRoutes];
}
