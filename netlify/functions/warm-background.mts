// ════════════════════════════════════════════════════════════════════════
// DEPLOY SÜPÜRGESİ — deploy sonrası ilk-ziyaretçi bedelini robota ödetir.
//
// PROBLEM: Netlify'da ön-render edilmiş ("statik") sayfa bile HER DEPLOY'da
// cache'ten düşer. O URL'e deploy sonrası ilk giren kişi fonksiyonu uyandırır
// ve 3-4,5 sn bekler; sonrakiler 0,3 sn alır. Bu sitede ~6 deploy/gün ve
// ~3 ziyaretçi/gün olduğu için neredeyse HER ziyaretçi o "ilk kişi" oluyor.
// (Ölçüm: / → "Netlify Edge"; fwd=stale → 0,82 sn.)
//
// ÇÖZÜM: deploy biter bitmez cache'lenebilir URL'leri bir kez gez → CDN dolar
// → gerçek ziyaretçi Edge hit alır ve fonksiyon HİÇ çalışmaz.
// ASIL MANTIK netlify/lib/warm.mts'te (paylaşılan çekirdek + tüm ölçüm notları).
//
// KATMAN AYRIMI: burada CACHE dolduruluyor; dolan sayfada fonksiyon hiç
// çalışmıyor → 0,3 sn. Cache'lenebilir sayfalar için doğru katman budur.
// Cache'e GİREMEYEN tek kritik rota /feed (no-store): onun FONKSİYON katmanını
// 5 dakikada bir keep-warm.mts ısıtır; deploy'un hemen ertesi için de çekirdek
// sonunda tek bir uyandırma isteği atar (2026-07-23).
//
// TETİKLER (2026-07-24'ten beri iki tane):
//   1. ASIL: netlify/functions/deploy-succeeded-background.mts — Netlify olay
//      fonksiyonu, koddan tetiklenir, panel yapılandırması GEREKMEZ.
//   2. YEDEK (bu dosya): Netlify → Site configuration → Notifications →
//      "Deploy succeeded" → HTTP POST →
//      https://basementonfire.com/.netlify/functions/warm-background?key=<WARM_SECRET>
//      Webhook artık zorunlu değil; panelden silinebilir (çifte koşum zararsız:
//      ikinci tur cache'i sıcak bulur) ya da elle tetikleme ucu olarak kalabilir.
// ════════════════════════════════════════════════════════════════════════

import { runWarm } from '../lib/warm.mts';

export default async (req: Request) => {
  // ── Yetki. Fail-closed: WARM_SECRET tanımlı değilse HİÇ çalışma.
  // Not: background function çağırana her hâlükârda 202 döner; bu 401 arayana
  // ulaşmaz. Koruma "iş yapılmaması"dır — yetkisiz çağrı 40 istek tetikleyemez.
  const secret = process.env.WARM_SECRET;
  const key = new URL(req.url).searchParams.get('key');
  if (!secret) {
    console.error('[warm:webhook] IPTAL: WARM_SECRET ortam degiskeni tanimli degil (scope: Functions olmali)');
    return new Response('no secret configured', { status: 401 });
  }
  if (key !== secret) {
    console.warn('[warm:webhook] REDDEDILDI: anahtar uyusmadi');
    return new Response('unauthorized', { status: 401 });
  }

  const { status, body } = await runWarm('webhook');
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
};
