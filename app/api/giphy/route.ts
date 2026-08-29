import { getMe } from '@/lib/supabase/server';
import { limit, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

const GIPHY_KEY = process.env.GIPHY_API_KEY ?? '';

const bos = () =>
  NextResponse.json({ data: [], pagination: { total_count: 0, count: 0, offset: 0 } });

/**
 * GIPHY arama vekili.
 *
 * 🚨 KİMLİK + FREN — 26.08.2026 denetimi. Bu uç KİMLİKSİZ ve FRENSİZDİ: sorguyu
 * sunucunun GIPHY_API_KEY'iyle iletiyor ve tam yanıtı geri veriyordu. Yani
 * herkesin kullanabileceği bedava bir Giphy arama vekiliydi. Zarar veri
 * sızıntısı değil, KOTA: Giphy'nin ücretsiz kademesi sınırlı, biri anahtarı
 * tüketirse GIF seçici GERÇEK kullanıcılarda çalışmaz hâle gelir.
 *
 * Giriş şartı davranışı bozmuyor — ölçüldü: iki çağıranın ikisi de girişli
 * bağlamda (GiphyPicker ve MessagesClient, ikincisi `me` prop'u zorunlu).
 */
export async function GET(req: Request) {
  const { me } = await getMe();
  if (!me) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const fren = await limit('giphy', req.headers, me.id);
  if (!fren.ok) return tooMany('Çok hızlı arıyorsun, biraz bekle.', fren, 'giphy');

  if (!GIPHY_KEY) return bos();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().slice(0, 100) ?? '';
  // `offset` ESKİDEN ham geçiyordu. Giphy tarafında zararsız ama sorguyu
  // istemcinin yazdığı serbest metinle kurmak gereksiz; tam sayıya sabitle.
  const ham = Number(searchParams.get('offset'));
  const offset = Number.isInteger(ham) && ham >= 0 && ham <= 4999 ? String(ham) : '0';

  const params = new URLSearchParams({ api_key: GIPHY_KEY, limit: '24', offset, rating: 'pg', lang: 'tr' });
  const base = q
    ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q)}&${params}`
    : `https://api.giphy.com/v1/gifs/trending?${params}`;

  try {
    // Netlify edge cache'i bu rotayı sorgu dizesini DAHİL ETMEDEN önbelliyordu →
    // tüm aramalar aynı (trending) yanıtı alıyordu. Bu yüzden yanıtı önbellemiyoruz;
    // her arama Giphy'ye taze gider (q'ya saygı duyulur). Giphy fetch'i ayrıca
    // no-store ile Next data cache'ine de takılmaz.
    // ⏱ Zaman aşımı: dış servis yanıt vermezse fonksiyonu asılı bırakmasın.
    const res = await fetch(base, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    return NextResponse.json(await res.json());
  } catch {
    return bos();
  }
}
