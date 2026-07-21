import { db, getMe, logIfError } from '@/lib/supabase/server';
import { normalizeStoryLink, normalizeStoryLabel } from '@/lib/storyLink';
import { normalizePollOptions } from '@/lib/polls';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// `users!stories_user_id_fkey` — ÇIPLAK `users(...)` YAZMA (bkz. GET'teki not).
const SELECT_BASE =
  'id, media_url, media_type, created_at, expires_at, user_id, users!stories_user_id_fkey(id, username, display_name, avatar, is_private)';
const SELECT_WITH_MUSIC =
  SELECT_BASE + ', music_track_id, music_start_sec, link_url, link_label, poll_question, poll_options, music:music_tracks(id, title, artist, src)';
/** Kolon/ilişki henüz yoksa PostgREST böyle söyler (42703 / şema önbelleği). */
const MUSIC_COLS_MISSING = /music_track_id|music_start_sec|music_tracks|link_url|link_label|poll_question|poll_options/i;

export async function GET() {
  const now = new Date().toISOString();
  // `users!stories_user_id_fkey` — ÇIPLAK `users(...)` YAZMA. story_views tablosu
  // (2026-07-19 hikâye görüntülenme özelliği) stories↔users arasında İKİNCİ bir
  // ilişki yolu açtı; o günden beri PostgREST "Could not embed because more than
  // one relationship was found" hatası veriyordu. Aşağıdaki `error` okunmadığı
  // için hata yutuluyor, data null geliyor ve rota 200 + BOŞ liste dönüyordu:
  // hikâyeler yükleniyor ama şeritte hiç görünmüyordu (yükleme bozuk sanıldı).
  // Müzik alanları SQL çalıştırılmadan YOKTUR (sql/features-story-music.sql).
  // Zengin sorguyu dene, kolon yoksa sade sorguya düş — aksi hâlde özellik
  // uykudayken hikâye şeridi TAMAMEN boş kalırdı (yeni düzelttiğimiz hatanın
  // aynısını geri getirmek olurdu).
  // Tip GEVŞEK: iki sorgunun satır tipleri farklı (biri müzik alanlarını taşır),
  // aynı değişkene atanabilmeleri için ortak bir tip gerekiyor. Aşağıda zaten
  // `any[]` olarak süzülüyor.
  let { data, error }: { data: any[] | null; error: { message: string } | null } = await db
    .from('stories')
    .select(SELECT_WITH_MUSIC)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(100); // limitsizdi → süresi dolmamış TÜM story'ler tek yanıtta (app/feed/page.tsx aynı sorguya zaten limit koymuş)

  if (error && MUSIC_COLS_MISSING.test(error.message)) {
    ({ data, error } = await db
      .from('stories')
      .select(SELECT_BASE)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(100));
  }

  // Hata SESSİZ KALMASIN: yukarıdaki gömme hatası tam olarak böyle bir yerde
  // aylarca saklanabiliyordu — sorgu patlar, data null olur, kullanıcı yalnızca
  // "hiç hikâye yok" görür. Artık sunucu günlüğüne düşer.
  logIfError('stories GET', error);

  // Gizli hesapların story'leri küresel story şeridinde gösterilmez (is_private truthy=gizli).
  const stories = ((data ?? []) as any[]).filter((s) => !s.users?.is_private);

  return NextResponse.json({ stories });
}

/**
 * Commit: hikaye dosyası tarayıcıdan doğrudan Supabase Storage'a yüklendikten
 * sonra sadece kaydı oluşturur (küçük JSON gövdesi).
 */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { path?: string; mediaType?: string; musicTrackId?: number | null; musicStartSec?: number; linkUrl?: string; linkLabel?: string; pollQuestion?: string; pollOptions?: string[] };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const path = body.path ?? '';
  const mediaType = body.mediaType === 'video' ? 'video' : 'image';
  // Yol bu kullanıcıya ait olmalı (imza route'u "stories/{me.id}-..." üretir).
  if (!path.startsWith(`stories/${me.id}-`)) return json({ error: 'Geçersiz dosya yolu.' }, 400);

  // MÜZİK: yalnızca `story_approved` işaretli parça kabul edilir. İstemciye
  // güvenmiyoruz — seçici zaten onaylı listeyi gösteriyor ama id elle de
  // gönderilebilir, o yüzden onay burada TEKRAR doğrulanır (telif kapısı).
  let musicTrackId: number | null = null;
  let musicStartSec = 0;
  if (typeof body.musicTrackId === 'number' && Number.isFinite(body.musicTrackId)) {
    const { data: tr } = await db
      .from('music_tracks').select('id').eq('id', body.musicTrackId).eq('story_approved', true).maybeSingle();
    if (tr) {
      musicTrackId = tr.id;
      const st = Number(body.musicStartSec);
      musicStartSec = Number.isFinite(st) && st > 0 ? Math.floor(st) : 0;
    }
  }

  // BAĞLANTI STICKER'I — yalnız site içi yol. normalizeStoryLink dışarı çıkan
  // her şeyi (mutlak adres, //host, /host, göreli yol) eler; kural veritabanında
  // da CHECK olarak duruyor, yani ileride başka bir yazma yolu açılsa bile geçerli.
  const linkUrl = normalizeStoryLink(body.linkUrl);
  const linkLabel = linkUrl ? normalizeStoryLabel(body.linkLabel) : null;

  // ANKET STICKER'I — soru + 2-4 seçenek. Oy olarak metin DEĞİL indeks saklanır
  // (article_poll_votes, poll_key='story-<id>'). Seçenekler normalize edilir
  // (kırp, boşları at, en çok 4, her biri ≤60). 2'den az geçerli seçenek → anket yok.
  let pollQuestion: string | null = null;
  let pollOptions: string[] | null = null;
  if (typeof body.pollQuestion === 'string' && body.pollQuestion.trim()) {
    const opts = normalizePollOptions(body.pollOptions);
    if (opts.length >= 2) { pollQuestion = body.pollQuestion.trim().slice(0, 100); pollOptions = opts; }
  }

  const mediaUrl  = db.storage.from('media').getPublicUrl(path).data.publicUrl;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 saat

  const row: Record<string, unknown> = {
    user_id:    me.id,
    media_url:  mediaUrl,
    media_type: mediaType,
    expires_at: expiresAt,
    ...(musicTrackId ? { music_track_id: musicTrackId, music_start_sec: musicStartSec } : {}),
    ...(linkUrl ? { link_url: linkUrl, link_label: linkLabel } : {}),
    ...(pollQuestion ? { poll_question: pollQuestion, poll_options: pollOptions } : {}),
  };
  const COLS = 'id, media_url, media_type, created_at, expires_at';
  let { data: story, error } = await db.from('stories').insert(row).select(COLS).single();
  // poll_* kolonları sql/features-story-poll.sql çalıştırılana kadar YOK olabilir →
  // o hâlde anketi düşür, hikayeyi yine oluştur (diğer alanlar canlı).
  if (error && pollQuestion && /poll_question|poll_options/i.test(error.message)) {
    delete row.poll_question; delete row.poll_options;
    ({ data: story, error } = await db.from('stories').insert(row).select(COLS).single());
  }

  if (error) {
    await db.storage.from('media').remove([path]);
    return json({ error: error.message }, 500);
  }

  revalidateTag('feed'); // yeni hikaye → home stories önbelleğini hemen tazele
  return json({ story }, 201);
}
