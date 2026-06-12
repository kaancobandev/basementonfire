import type { MetadataRoute } from 'next';
import { db } from '@/lib/supabase/server';

const SITE_URL = 'https://basementonfire.com';

// Her zaman güncel harita (yeni herkese açık profiller/etiketler dahil).
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/akis`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE_URL}/discover`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/muzik`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];

  const articles = ['greece', 'carthage', 'rome', 'black-hole', 'turkler'];
  const articleRoutes: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${SITE_URL}/articles/${a}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [{ data: users }, { data: tags }] = await Promise.all([
      db.from('users').select('username, created_at').eq('is_private', false).limit(5000),
      db.from('hashtags').select('tag').limit(2000),
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
    dynamicRoutes = [...userRoutes, ...tagRoutes];
  } catch {
    // DB erişilemezse statik + makale haritası yine de döner
  }

  return [...staticRoutes, ...articleRoutes, ...dynamicRoutes];
}
