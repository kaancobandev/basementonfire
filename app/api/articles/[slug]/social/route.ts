import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isArticleSlug } from '@/lib/articles';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Makale sosyal durumu (tek istek): yorumlar + kaydetme durumu + giris durumu.
// Tablolar yoksa (SQL henuz calismadiysa) {available:false} doner -> UI gizlenir.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isArticleSlug(slug)) return json({ available: false });
  try {
    const { data: rawComments, error } = await db
      .from('article_comments')
      .select('id, content, created_at, user_id, users!article_comments_user_id_fkey(username, display_name, avatar)')
      .eq('article_slug', slug)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) return json({ available: false });

    const { me } = await getMe();
    let saved = false;
    if (me) {
      const { data: s } = await db
        .from('article_saves').select('article_slug')
        .eq('user_id', me.id).eq('article_slug', slug).maybeSingle();
      saved = !!s;
    }
    const comments = (rawComments ?? []).map((c: any) => ({
      id: c.id, content: c.content, created_at: c.created_at,
      username: c.users?.username ?? '', display_name: c.users?.display_name ?? '',
      avatar: c.users?.avatar ?? null,
      is_mine: me ? c.user_id === me.id : false,
    }));
    return json({ available: true, loggedIn: !!me, saved, comments });
  } catch {
    return json({ available: false });
  }
}
