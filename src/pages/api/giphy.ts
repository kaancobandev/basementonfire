import type { APIRoute } from 'astro';

const GIPHY_KEY = import.meta.env.GIPHY_API_KEY ?? '';

export const GET: APIRoute = async ({ url }) => {
  if (!GIPHY_KEY) {
    return new Response(
      JSON.stringify({ data: [], pagination: { total_count: 0, count: 0, offset: 0 } }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  const q      = url.searchParams.get('q')?.trim() ?? '';
  const offset = url.searchParams.get('offset') ?? '0';

  const params = new URLSearchParams({
    api_key: GIPHY_KEY,
    limit:   '24',
    offset,
    rating:  'pg',
    lang:    'tr',
  });

  const base = q
    ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(q)}&${params}`
    : `https://api.giphy.com/v1/gifs/trending?${params}`;

  try {
    const res  = await fetch(base);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ data: [], pagination: { total_count: 0, count: 0, offset: 0 } }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }
};
