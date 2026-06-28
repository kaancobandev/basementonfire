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
    const res  = await fetch(base);
    const data = await res.json();
    // Trending/arama sonuçları sık değişmez → edge'de önbelle (aynı sorgu için
    // tekrar Giphy'ye gidilmez). Yük altında ölçeklenebilirlik + hız kazancı.
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ data: [], pagination: { total_count: 0, count: 0, offset: 0 } });
  }
}
