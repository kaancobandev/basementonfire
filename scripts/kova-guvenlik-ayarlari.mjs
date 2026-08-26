/**
 * `media` kovasını sertleştirir: MIME izin listesi + gerçek boyut limiti.
 *
 * NEDEN (23.08.2026 güvenlik denetimi, ÖLÇÜLDÜ):
 *
 * 1) SVG. İmza rotası `contentType`ı izin listesinden geçiriyor ve uzantıyı
 *    ONDAN türetiyor — ama dosyanın kendisi bu rotadan GEÇMİYOR: istemci
 *    doğrudan Supabase'e PUT atıyor ve `Content-Type` başlığını orada
 *    İSTEDİĞİ GİBİ seçebiliyor. Ölçüm:
 *      · text/html  gönderildi → Supabase text/plain sundu   (zararsız)
 *      · image/svg+xml gönderildi, yol `.png` → image/svg+xml SUNULDU 🔴
 *    SVG doğrudan açıldığında script çalıştırır. Köken proje alan adı, yani
 *    site çerezleri okunamaz; ama proje alan adında saldırganın yazdığı bir
 *    sayfa barındırılabiliyor. Rota tarafında ÇÖZÜLEMEZ — tek doğru katman
 *    kovanın kendi `allowed_mime_types` listesi. (`stories` ve `dm` kovaları
 *    zaten böyle kurulu; ölçüldü: SVG yüklemesi HTTP 400 ile reddediliyor.)
 *
 * 2) Boyut. `media` kovasının `file_size_limit`i NULL, yani rotadaki 250 MB
 *    yalnızca istemcinin BEYAN ettiği `size` üzerinden kontrol ediliyor.
 *    Saldırgan `size: 1` deyip 250 MB PUT edebilir.
 *
 * ⚠ BU MEVCUT DAVRANIŞI DEĞİŞTİRİR. Liste iki kaynağın BİRLEŞİMİ:
 *   · imza rotasının kabul ettiği türler (app/api/storage/sign/route.ts)
 *   · kovada ŞU AN duran dosyaların gerçek türleri (2026-08-23 ölçümü:
 *     image/webp, image/jpeg, image/png, image/gif, audio/mpeg, audio/x-m4a,
 *     video/mp4)
 *   Yani bugüne kadar yüklenmiş hiçbir tür dışarıda kalmıyor.
 *
 * ⚠ TEK DARALTMA SES TARAFINDA: rota `audio/` ile başlayan HER türü kabul
 *   ediyor, kova ise somut bir liste istiyor. Aşağıdaki liste yaygın olanları
 *   kapsıyor; egzotik bir ses türü yüklenirse kova reddeder.
 *
 * GERİ ALMA: `--geri` ile çalıştır → limitler kaldırılır, eski hâle döner.
 *
 *   node --env-file=.env.local scripts/kova-guvenlik-ayarlari.mjs --kuru
 *   node --env-file=.env.local scripts/kova-guvenlik-ayarlari.mjs
 *   node --env-file=.env.local scripts/kova-guvenlik-ayarlari.mjs --geri
 */
import { createClient } from '@supabase/supabase-js';

const U = process.env.NEXT_PUBLIC_SUPABASE_URL, K = process.env.SUPABASE_SERVICE_KEY;
if (!U || !K) { console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY yok.'); process.exit(1); }
const a = createClient(U, K, { auth: { persistSession: false } });

const KURU = process.argv.includes('--kuru');
const GERI = process.argv.includes('--geri');

const IZINLI = [
  // Görsel — imza rotasının IMG listesi (SVG BİLEREK YOK: script çalıştırır)
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
  // Video — imza rotasının VID listesi
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  // Ses — rota `audio/*` diyor, kova somut liste istiyor. `audio/x-m4a` kovada
  // GERÇEKTEN duruyor (8 dosya), listeden çıkarmak mevcut yüklemeyi kilitlerdi.
  'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav',
  'audio/x-wav', 'audio/webm', 'audio/flac',
];
const BOYUT = 250 * 1024 * 1024;   // app/api/storage/sign/route.ts LIMIT.media ile AYNI

const { data: once } = await a.storage.getBucket('media');
console.log('ONCE:', JSON.stringify({
  public: once?.public,
  file_size_limit: once?.file_size_limit ?? null,
  allowed_mime_types: once?.allowed_mime_types ?? null,
}, null, 2));

if (KURU) {
  console.log('\n--kuru: hiçbir şey değiştirilmedi. Uygulanacak olan:');
  console.log(GERI ? '  (geri alma: limitler kaldırılır)' : JSON.stringify({ file_size_limit: BOYUT, allowed_mime_types: IZINLI }, null, 2));
  process.exit(0);
}

const { error } = GERI
  ? await a.storage.updateBucket('media', { fileSizeLimit: null, allowedMimeTypes: null })
  : await a.storage.updateBucket('media', { fileSizeLimit: BOYUT, allowedMimeTypes: IZINLI });
if (error) { console.error('HATA:', error.message); process.exit(1); }

const { data: sonra } = await a.storage.getBucket('media');
console.log('\nSONRA:', JSON.stringify({
  public: sonra?.public,
  file_size_limit: sonra?.file_size_limit ?? null,
  allowed_mime_types: sonra?.allowed_mime_types ?? null,
}, null, 2));

if (!GERI) {
  // DOĞRULA: SVG gerçekten reddediliyor mu, meşru JPEG hâlâ geçiyor mu?
  const dene = async (ct, ad) => {
    const yol = `__kova-testi/${ad}`;
    const { data: imza, error: e1 } = await a.storage.from('media').createSignedUploadUrl(yol);
    if (e1) return `imza yok (${e1.message})`;
    const r = await fetch(imza.signedUrl, { method: 'PUT', headers: { 'content-type': ct }, body: 'x' });
    await a.storage.from('media').remove([yol]);
    return `HTTP ${r.status}`;
  };
  console.log('\nDOĞRULAMA:');
  console.log(`  image/svg+xml  -> ${await dene('image/svg+xml', 'a.png')}   (400 beklenir)`);
  console.log(`  image/jpeg     -> ${await dene('image/jpeg', 'b.jpg')}      (200 beklenir)`);
  console.log(`  audio/x-m4a    -> ${await dene('audio/x-m4a', 'c.m4a')}     (200 beklenir)`);
}
