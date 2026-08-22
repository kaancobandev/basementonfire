import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, logIfError } from '@/lib/supabase/server';
import MuzikClient from './MuzikClient';

// ESKİDEN force-dynamic'ti — tek sebebi getMe()'nin ürettiği currentUserId'ydi
// ve o da yalnız istemci UI görünürlüğü içindi (ekle/sil butonları). Kimlik
// artık istemcide NavUserContext'ten geliyor → sayfa ISR, CDN'den döner.
// ⚠⚠ 120 → 3600 (2026-08-22). AŞAĞIDAKİ unstable_cache DA 3600 OLMALI — Next
// efektif revalidate'i ikisinin EN KÜÇÜĞÜ olarak alır, biri 120 kalırsa bu
// değişiklik HİÇBİR ŞEY yapmaz.
//
// NEDEN: süpürge saatte bir koşuyor, TTL ise 120 sn'ydi → sayfa saatin ~%97'sini
// BAYAT geçiriyordu ve her ziyaretçi yeniden üretimi bekliyordu. Süpürgeyi
// sıklaştırmak yanlış çözüm olurdu: 20 dakikada bir süpürmek bant genişliğini
// üçe katlıyor (~26 GB/ay) ve 120 sn'lik TTL'i yine yakalayamazdı.
//
// GÜVENLİ, çünkü tazelik TTL'den DEĞİL tag'ten geliyor: `tags:['muzik']` var ve
// ALTI ayrı `revalidateTag('muzik')` çağrısı ekleme+silme yollarının hepsini
// kapatıyor (api/music/track:50,85 · api/spotify/playlist:48,67 ·
// api/youtube/item:56,75). Yani bir müzik eklenince/silinince girdi ANINDA düşer.
//
// ⛔ /lig'e AYNI ŞEYİ YAPMA: orada tag YOK (repoda `revalidateTag('lig')` sıfır)
// ve günün sorusunu yazan rota hiçbir revalidate çağırmıyor → 3600 yapmak
// kullanıcının kendi sırasını 1 saat görememesi demek olurdu.
export const revalidate = 3600;

// Müzik listeleri PAYLAŞILAN (topluluğun paylaştığı son müzikler) — kişiye özel
// değil; tazeliği tag sağlıyor, TTL yalnızca tavan.
const getMusic = unstable_cache(
  async () => {
    // users embed'leri FK adıyla SABİTLENDİ (`users!<tablo>_user_id_fkey`).
    // Bugün bu üç tablonun users'a tek yolu var, yani hint'siz de çalışırdı; ama
    // bir gün beğeni/junction tablosu (ör. track_likes) eklenirse ikinci bir yol
    // doğar ve PostgREST hint'siz embed'i PGRST201 ile TÜMDEN reddeder — sorgu
    // veri değil hata döner, `data ?? []` bunu yutar ve sekme sessizce boşalır.
    // Yorumlarda tam olarak bu oldu (comment_likes, 2026-07-28). Ad canlıda
    // doğrulandı; değiştirmeden önce REST ile test et.
    const [spResult, ytResult, trResult] = await Promise.all([
      db.from('spotify_playlists').select('id, playlist_id, title, created_at, user_id, users!spotify_playlists_user_id_fkey(username, display_name, avatar)').order('created_at', { ascending: false }).limit(30),
      db.from('youtube_items').select('id, item_type, item_id, title, created_at, user_id, users!youtube_items_user_id_fkey(username, display_name, avatar)').order('created_at', { ascending: false }).limit(30),
      // Site çalma listesi. Tablo henüz açılmadıysa (SQL çalıştırılmadı) hata
      // yutulur ve sekme boş görünür — sayfanın kalanı çalışmaya devam eder.
      db.from('music_tracks').select('id, title, artist, src, duration, created_at, user_id, users!music_tracks_user_id_fkey(username, display_name, avatar)').order('created_at', { ascending: false }).limit(50),
    ]);
    logIfError('muzik spotify_playlists', spResult.error);
    logIfError('muzik youtube_items', ytResult.error);
    logIfError('muzik music_tracks', trResult.error);
    return { sp: spResult.data ?? [], yt: ytResult.data ?? [], tr: trResult.data ?? [] };
  },
  ['muzik-content-v2'],
  // ⚠ Sayfanın yukarıdaki `export const revalidate` değeriyle AYNI olmalı (3600).
  // Next efektif revalidate'i en küçüğü alır; burası 120 kalsaydı sayfadaki 3600
  // no-op olurdu. Tazelik `tags:['muzik']`ten geliyor — gerekçe yukarıda.
  { revalidate: 3600, tags: ['muzik'] },
);

export const metadata: Metadata = {
  title: 'Müzik',
  description: 'Basementonfire topluluğunun paylaştığı Spotify çalma listeleri ve YouTube müzikleri — keşfet ve dinle.',
  alternates: { canonical: '/muzik' },
  openGraph: {
    title: 'Müzik · Basementonfire',
    description: 'Topluluğun paylaştığı Spotify ve YouTube müzikleri.',
    url: '/muzik',
    images: ['/opengraph-image'],
  },
};

export default async function MuzikPage() {
  // Paylaşılan müzik içeriği önbellekten gelir (120sn).
  const { sp: spRaw, yt: ytRaw, tr: trRaw } = await getMusic();

  const spotifyItems = (spRaw ?? []).map((r: any) => ({
    id:           r.id           as number,
    playlist_id:  r.playlist_id  as string,
    title:        r.title        as string,
    created_at:   r.created_at   as string,
    user_id:      r.user_id      as number,
    username:     (r.users?.username     ?? '') as string,
    display_name: (r.users?.display_name ?? '') as string,
    avatar:       (r.users?.avatar ?? null) as string | null,
  }));

  const youtubeItems = (ytRaw ?? []).map((r: any) => ({
    id:           r.id           as number,
    item_type:    r.item_type    as 'video' | 'playlist',
    item_id:      r.item_id      as string,
    title:        r.title        as string,
    created_at:   r.created_at   as string,
    user_id:      r.user_id      as number,
    username:     (r.users?.username     ?? '') as string,
    display_name: (r.users?.display_name ?? '') as string,
    avatar:       (r.users?.avatar ?? null) as string | null,
  }));

  const trackItems = (trRaw ?? []).map((r: any) => ({
    id:           r.id         as number,
    title:        r.title      as string,
    artist:       (r.artist ?? null) as string | null,
    src:          r.src        as string,
    duration:     (r.duration ?? null) as number | null,
    created_at:   r.created_at as string,
    user_id:      r.user_id    as number,
    username:     (r.users?.username     ?? '') as string,
    display_name: (r.users?.display_name ?? '') as string,
    avatar:       (r.users?.avatar ?? null) as string | null,
  }));

  return (
    <MuzikClient
      spotifyItems={spotifyItems}
      youtubeItems={youtubeItems}
      trackItems={trackItems}
    />
  );
}
