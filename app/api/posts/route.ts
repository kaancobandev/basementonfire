import { db, getMe } from '@/lib/supabase/server';
import { NextResponse, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { notifyMentions } from '@/lib/mentions';

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  const form = await req.formData();
  const content  = (form.get('content')  as string)?.trim() ?? '';
  const category = (form.get('category') as string) ?? 'general';

  if (!content || content.length > 500)
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });

  const { data: newPost } = await db
    .from('posts')
    .insert({ user_id: me.id, content, category })
    .select('id')
    .single();

  if (newPost) {
    revalidateTag('feed'); // yeni post → home feed önbelleğini hemen tazele
    // @bahsetmelere bildirim — yanıt sonrası, best-effort. postId YOK:
    // notifications.post_id quick_facts FK'lı, text post id'si oraya yazılamaz;
    // bildirim sayfası linki zaten aktör profiline gider.
    after(() => notifyMentions({ actorId: me.id, text: content }));
    const opts = [1, 2, 3, 4]
      .map(n => (form.get(`poll_opt_${n}`) as string)?.trim() ?? '')
      .filter(o => o.length > 0);
    if (opts.length >= 2) {
      const { data: poll } = await db.from('polls').insert({ post_id: newPost.id }).select('id').single();
      if (poll) {
        await db.from('poll_options').insert(opts.map((text, i) => ({ poll_id: poll.id, text, position: i })));
      }
    }
  }

  return NextResponse.redirect(new URL('/', req.url), { status: 303 });
}
