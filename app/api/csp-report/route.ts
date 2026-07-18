import { NextResponse } from 'next/server';

/**
 * CSP ihlal raporlarını toplar (middleware'deki `report-uri` buraya işaret eder).
 *
 * Şu an politika RAPOR MODUNDA: hiçbir şey engellenmiyor, tarayıcı yalnızca
 * "şu politika olsaydı şunu engellerdim" diye buraya POST atıyor. Amaç,
 * zorunlu kılmadan ÖNCE gerçek ihlal listesini görmek — özellikle unuttuğumuz
 * dış kaynakları (bir görsel host'u, bir gömme, bir analytics ucu).
 *
 * Gürültü beklenir ve normaldir: tarayıcı eklentileri de ihlal üretir
 * (chrome-extension://, moz-extension://). Onları eliyoruz.
 */

const IGNORE = ['chrome-extension', 'moz-extension', 'safari-extension', 'about:blank'];

// TEKRAR BASTIRMA — aynı ihlal her sayfa görüntülemesinde yeniden bildirilir.
// Bastırmazsak tek yaygın bir ihlal logları doldurur ve boşuna fonksiyon
// çağrısı yakar. Bize LİSTE lazım, sayaç değil: her ayrı ihlali bir kez yaz.
// Fonksiyon örneği ömrüyle sınırlı bellek; kalıcı olması da gerekmiyor.
const seen = new Set<string>();
const SEEN_CAP = 200; // sınırsız büyümesin (dev'de HMR yüzlerce varyant üretebilir)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Tarayıcılar iki farklı biçim gönderir: eski `csp-report`, yeni Reporting API.
    const r = body?.['csp-report'] ?? body?.[0]?.body ?? body;

    const blocked   = String(r?.['blocked-uri']   ?? r?.blockedURL   ?? '');
    const directive = String(r?.['violated-directive'] ?? r?.effectiveDirective ?? '');
    const doc       = String(r?.['document-uri']  ?? r?.documentURL  ?? '');

    if (IGNORE.some((p) => blocked.startsWith(p))) {
      return new NextResponse(null, { status: 204 });
    }

    const key = `${directive}|${blocked}`;
    if (seen.has(key)) return new NextResponse(null, { status: 204 });
    if (seen.size < SEEN_CAP) seen.add(key);

    // Netlify fonksiyon loglarında görünür. Kalıcı saklama YOK: bu geçici bir
    // teşhis aşaması, tabloya yazıp bir de büyüme sorunu yaratmayalım.
    console.warn('[csp]', directive, '←', blocked || '(inline)', '@', doc);
  } catch {
    // Bozuk gövde raporlamayı durdurmasın.
  }

  return new NextResponse(null, { status: 204 });
}
