import { NextResponse } from 'next/server';

const GIPHY_KEY = process.env.GIPHY_API_KEY ?? '';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q      = searchParams.get('q')?.trim() ?? '';
  const offset = searchParams.get('offset') ?? '0';

  if (!GIPHY_KEY)
    return NextResponse.json({ data: [], pagination: { total_count: 0, count: 0, offset: 0 } });

  const params = new URLSearchParams({ api_key: GIPHY_KEY, limit: '24', offset, rating: 'pg', lang: 'tr' });
  const base = q
    ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q)}&${params}`
    : `https://api.giphy.com/v1/gifs/trending?${params}`;

  try {
    // Netlify edge cache'i bu rotayı sorgu dizesini DAHİL ETMEDEN önbelliyordu →
    // tüm aramalar aynı (trending) yanıtı alıyordu. Bu yüzden yanıtı önbellemiyoruz;
    // her arama Giphy'ye taze gider (q'ya saygı duyulur). Giphy fetch'i ayrıca
    // no-store ile Next data cache'ine de takılmaz.
    const res  = await fetch(base, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ data: [], pagination: { total_count: 0, count: 0, offset: 0 } });
  }
}
