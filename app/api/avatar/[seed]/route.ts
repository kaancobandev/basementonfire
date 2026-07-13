import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';
import { db } from '@/lib/supabase/server';

// Fotoğrafı olmayan kullanıcılar için deterministik, EĞLENCELİ avatar.
// Self-host: DiceBear notionists (CC0) SVG'sini sunucuda üretir — DIŞ API YOK.
// Kullanıcı adı seed → @kaan her yerde hep aynı avatar.
//
// CİNSİYET UYUMU: notionists'te "cinsiyet" seçeneği yok; net erkeksi tek sinyal
// SAKAL (~%10). Uniseks isimler (Deniz vb.) yüzünden "sakallı kadın" çıkmasın diye,
// kullanıcının profilindeki gender'ı burada ADINDAN bulup sakalı ona göre ayarlıyoruz:
//   erkek → notionists varsayılanı (doğal çeşitlilik); kadın/diğer/bilinmeyen → sakalsız.
// Sakalı kapatmak sakallı-olmayan avatarları DEĞİŞTİRMEZ (yalnız sakalı kaldırır).
export async function GET(_req: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  const username = decodeURIComponent(seed || 'user');

  let beardProbability = 0; // güvenli varsayılan: sakalsız
  try {
    const { data } = await db.from('users').select('gender').eq('username', username).maybeSingle();
    if (data?.gender === 'erkek') beardProbability = 10; // notionists varsayılanı
  } catch {}

  const svg = createAvatar(notionists, {
    seed: username,
    radius: 50,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'c1f4d4', 'ffe0a3'],
    beardProbability,
  }).toString();

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      // Gün boyu cache + haftalık SWR: gender/kullanıcı değişimi en geç 1 günde yansır,
      // ama yine agresif önbelleklenir (Netlify CDN + tarayıcı).
      'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
