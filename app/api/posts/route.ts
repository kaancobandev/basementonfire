import { db, getMe } from '@/lib/supabase/server';
import { NextResponse, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { notifyMentions } from '@/lib/mentions';
import { normalizePollOptions } from '@/lib/polls';
import { isArticleSlug } from '@/lib/articles';
import { limit, tooMany } from '@/lib/rateLimit';

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
  /* Quiz sonucu paylaşımı: istemci YALNIZ hangi makale olduğunu söyler.
     🚨 SKORU GÖNDERMEZ — aşağıda sunucu kendi hesaplıyor. */
  let articleSlug: string | null = null;

  if (isJson) {
    let body: { content?: string; category?: string; poll?: unknown; articleSlug?: unknown };
    try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
    content = (body.content ?? '').trim();
    category = (body.category ?? 'general');
    pollOptions = normalizePollOptions(body.poll);
    const ham = typeof body.articleSlug === 'string' ? body.articleSlug : null;
    // Makaleler kodda tanımlı, tabloda değil → FK yok, kapı burası.
    articleSlug = ham && isArticleSlug(ham) ? ham : null;
  } else {
    const form = await req.formData();
    content = (form.get('content') as string)?.trim() ?? '';
    category = (form.get('category') as string) ?? 'general';
    pollOptions = normalizePollOptions([1, 2, 3, 4].map(n => (form.get(`poll_opt_${n}`) as string) ?? ''));
  }

  // Anket ya da quiz sonucu varsa metin zorunlu değil (ikisi de kendi
  // içeriğini taşıyor); yoksa boş gönderi kabul edilmez.
  if (!content && !pollOptions.length && !articleSlug) {
    return isJson ? json({ error: 'Bir şeyler yaz ya da anket ekle' }, 400) : NextResponse.redirect(new URL('/', req.url), { status: 303 });
  }
  if (content.length > 500) {
    return isJson ? json({ error: 'En fazla 500 karakter' }, 400) : NextResponse.redirect(new URL('/', req.url), { status: 303 });
  }

  // Flood freni → lib/rateLimit.ts (token bucket). Sürdürülebilir hız eskisiyle
  // AYNI: dakikada 5 gönderi. Doğrulamadan SONRA duruyor — boş/uzun gönderi
  // denemesi token yakmasın.
  //
  // Eski sayım freninden bir davranış farkı var: o, VAR OLAN satırları sayardı
  // (insert başarısızsa kota harcanmazdı, gönderi silinince kota geri gelirdi).
  // Kova ise DENEMEDE harcar. Kasıtlı: fren, işin maliyetini değil isteği ölçer.
  const gate = await limit('post', req.headers, me.id);
  if (!gate.ok) {
    return isJson
      ? tooMany('Çok hızlı paylaşıyorsun, biraz bekle.', gate, 'post')
      : NextResponse.redirect(new URL('/', req.url), { status: 303 });
  }

  /* SKOR SUNUCUDA HESAPLANIR — istemciden alınmaz, yoksa herkes 10/10 iddia
     ederdi. Kaynak zaten canlı iki tablo: quiz_questions (bu makalenin aktif
     soruları) + article_quiz_answers (kullanıcının verdiği cevaplar).
     Kullanıcı quizi hiç çözmemişse skor NULL kalır ve gönderi "makaleyi
     paylaştım" gönderisine dönüşür — check kısıtı ikisini de kabul ediyor. */
  let quizCorrect: number | null = null;
  let quizTotal: number | null = null;
  if (articleSlug) {
    const { data: sorular } = await db
      .from('quiz_questions').select('id').eq('article_slug', articleSlug).eq('active', true);
    const soruIdleri = ((sorular ?? []) as { id: number }[]).map((q) => q.id);
    if (soruIdleri.length) {
      const { data: cevaplar } = await db
        .from('article_quiz_answers').select('question_id, is_correct')
        .eq('user_id', me.id).in('question_id', soruIdleri);
      const verilen = (cevaplar ?? []) as { question_id: number; is_correct: boolean }[];
      if (verilen.length) {
        // Payda CEVAPLANAN soru sayısı, makalenin toplam soru sayısı DEĞİL:
        // quizi yarım bırakan okur "2/6" değil "2/3" paylaşmalı — yazdığı
        // cümle o oturumda gördüğü sorular hakkında.
        quizTotal = verilen.length;
        quizCorrect = verilen.filter((c) => c.is_correct).length;
      }
    }
  }

  const { data: newPost, error } = await db
    .from('posts')
    .insert({ user_id: me.id, content, category, article_slug: articleSlug, quiz_correct: quizCorrect, quiz_total: quizTotal })
    .select('id, content, category, likes, created_at, article_slug, quiz_correct, quiz_total')
    .single();

  if (error || !newPost) {
    return isJson ? json({ error: 'Paylaşılamadı' }, 500) : NextResponse.redirect(new URL('/', req.url), { status: 303 });
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

  if (!isJson) return NextResponse.redirect(new URL('/', req.url), { status: 303 });
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
