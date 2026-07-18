import { db, getMe } from '@/lib/supabase/server';
import { NextResponse, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { notifyMentions } from '@/lib/mentions';
import { normalizePollOptions } from '@/lib/polls';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Metin gönderisi (+ isteğe bağlı anket). İki çağrı biçimi:
 *  - JSON  → akıştaki hızlı besteci (FeedComposer), JSON yanıt döner,
 *  - form  → eski (tarayıcı form) yolu, yönlendirme döner.
 *
 * Anket oyları GENEL article_poll_votes tablosunda tutulur (poll_key
 * 'post-<id>'): çerezsiz anonim oy + çift oy koruması zaten kanıtlanmış.
 * Eski `polls`/`poll_options` üçlüsü ve cast_poll_vote RPC'si CANLI DB'DE
 * HİÇ YOKTU (ölçüldü) ve hiçbir UI onu çağırmıyordu — o ölü yol kaldırıldı.
 */
export async function POST(req: Request) {
  const isJson = (req.headers.get('content-type') ?? '').includes('application/json');
  const { me } = await getMe();
  if (!me) {
    return isJson
      ? json({ error: 'Giriş gerekli' }, 401)
      : NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  }

  let content = '';
  let category = 'general';
  let pollOptions: string[] = [];

  if (isJson) {
    let body: { content?: string; category?: string; poll?: unknown };
    try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
    content = (body.content ?? '').trim();
    category = (body.category ?? 'general');
    pollOptions = normalizePollOptions(body.poll);
  } else {
    const form = await req.formData();
    content = (form.get('content') as string)?.trim() ?? '';
    category = (form.get('category') as string) ?? 'general';
    pollOptions = normalizePollOptions([1, 2, 3, 4].map(n => (form.get(`poll_opt_${n}`) as string) ?? ''));
  }

  // Anket varsa metin zorunlu değil (anket açmak yazı yazmaktan kolay olmalı);
  // anket yoksa boş gönderi kabul edilmez.
  if (!content && !pollOptions.length) {
    return isJson ? json({ error: 'Bir şeyler yaz ya da anket ekle' }, 400) : NextResponse.redirect(new URL('/feed', req.url), { status: 303 });
  }
  if (content.length > 500) {
    return isJson ? json({ error: 'En fazla 500 karakter' }, 400) : NextResponse.redirect(new URL('/feed', req.url), { status: 303 });
  }

  // Hafif flood freni: son 60sn'de 5+ gönderi → 429.
  const minuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const { count: recent } = await db
    .from('posts').select('id', { count: 'exact', head: true })
    .eq('user_id', me.id).gt('created_at', minuteAgo);
  if ((recent ?? 0) >= 5) {
    return isJson ? json({ error: 'Çok hızlı paylaşıyorsun, biraz bekle.' }, 429) : NextResponse.redirect(new URL('/feed', req.url), { status: 303 });
  }

  const { data: newPost, error } = await db
    .from('posts')
    .insert({ user_id: me.id, content, category })
    .select('id, content, category, likes, created_at')
    .single();

  if (error || !newPost) {
    return isJson ? json({ error: 'Paylaşılamadı' }, 500) : NextResponse.redirect(new URL('/feed', req.url), { status: 303 });
  }

  let poll: string[] | null = null;
  if (pollOptions.length) {
    // post_polls tablosu yoksa (SQL çalışmadıysa) gönderi anketsiz kalır — kırılmaz.
    const { error: pollErr } = await db.from('post_polls').insert({ post_id: newPost.id, options: pollOptions });
    if (!pollErr) poll = pollOptions;
  }

  revalidateTag('feed'); // yeni post → home feed önbelleğini hemen tazele
  // @bahsetmelere bildirim — yanıt sonrası, best-effort. postId YOK:
  // notifications.post_id quick_facts FK'lı, text post id'si oraya yazılamaz;
  // bildirim sayfası linki zaten aktör profiline gider.
  after(() => notifyMentions({ actorId: me.id, text: content }));

  if (!isJson) return NextResponse.redirect(new URL('/feed', req.url), { status: 303 });
  return json({
    post: {
      ...newPost,
      kind: 'post',
      user_id: me.id,
      username: me.username,
      display_name: me.display_name,
      avatar: me.avatar ?? null,
      likes: newPost.likes ?? 0,
      poll,
    },
  }, 201);
}
