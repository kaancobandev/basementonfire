import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isArticleSlug } from '@/lib/articles';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Makaleyi okuma listesine ekle/cikar (toggle). Composite PK ayni makaleyi iki kez
// kaydetmeyi engeller. Yalniz me.id'ye scope'lu -> IDOR yok.
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) return json({ error: 'Bilinmeyen makale' }, 404);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: existing } = await db
    .from('article_saves').select('article_slug')
    .eq('user_id', me.id).eq('article_slug', slug).maybeSingle();

  if (existing) {
    await db.from('article_saves').delete().eq('user_id', me.id).eq('article_slug', slug);
    return json({ saved: false });
  }
  const { error } = await db.from('article_saves').insert({ user_id: me.id, article_slug: slug });
  if (error) return json({ error: 'Kaydedilemedi' }, 500);
  return json({ saved: true });
}
