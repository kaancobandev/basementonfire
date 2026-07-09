// Istek basliklarindan ulke/sehir + istemci IP. Netlify'i birincil kabul eder;
// Vercel/Cloudflare yedekleri de var. NextRequest.headers ve next/headers'in
// headers()'i (ReadonlyHeaders) ikisi de .get() sundugu icin ortak calisir.
export type Geo = { country_code: string | null; country_name: string | null; city: string | null };
export type HeaderGetter = { get(name: string): string | null };

export function readGeoFromHeaders(h: HeaderGetter): Geo {
  const raw = h.get('x-nf-geo'); // Netlify: base64(JSON) -> { country:{code,name}, city, ... }
  if (raw) {
    try {
      const json = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
      return {
        country_code: json?.country?.code ?? null,
        country_name: json?.country?.name ?? null,
        city: json?.city ?? null,
      };
    } catch {
      /* bozuksa yedeklere dus */
    }
  }
  const cc =
    h.get('x-country') ||
    h.get('x-vercel-ip-country') ||
    h.get('cf-ipcountry') ||
    null;
  return { country_code: cc, country_name: null, city: null };
}

// Istemci IP — YALNIZ hash uretmek icin okunur, HICBIR YERDE ham saklanmaz (KVKK).
export function clientIp(h: HeaderGetter): string {
  return (
    h.get('x-nf-client-connection-ip') ||
    (h.get('x-forwarded-for') || '').split(',')[0].trim() ||
    h.get('x-real-ip') ||
    ''
  );
}
