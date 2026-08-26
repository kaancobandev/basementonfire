import { db, getMe } from '@/lib/supabase/server';
import { limit, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// heic/heif: iPhone'un varsayılan fotoğraf biçimi. Fotoğraflar'dan seçince iOS
// genelde JPEG'e çevirir ama Dosyalar üzerinden ham .heic gelebiliyordu ve istek
// "Desteklenmeyen dosya türü" ile düşüyordu — kullanıcı için sebepsiz bir hata.
const IMG = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
const VID = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
// Gönderi medyası (media) 250 MB. Dosya bu route'tan GEÇMEZ (aşağıdaki nota bak),
// imzalı URL ile doğrudan Supabase Storage'a gider — yani buradaki sayı yalnız
// KAPI. İKİNCİ bir tavan daha var: Supabase'in proje geneli "global file upload
// limit"i. media bucket'ının kendi file_size_limit'i YOK (null → projeninkini
// miras alır). 2026-07-28'de ölçüldü: 250 MB'lık gerçek bir yükleme HTTP 200
// döndü, yani proje ayarı yeterli. Bu sayıyı yükseltirsen ölçümü TEKRARLA —
// yalnız buradaki rakamı büyütmek Storage'ın 413'ünü kaldırmaz.
const LIMIT = { media: 250 * 1024 * 1024, story: 50 * 1024 * 1024, avatar: 10 * 1024 * 1024, dm: 50 * 1024 * 1024 } as const;

// Uzantı → contentType eşlemesi. İstemcinin gönderdiği `ext` ARTIK KULLANILMIYOR.
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic', 'image/heif': 'heif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/ogg': 'ogv', 'video/quicktime': 'mov',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'weba',
};

/**
 * Tarayıcının doğrudan Supabase Storage'a yükleyebilmesi için imzalı yükleme
 * URL'i üretir. Dosya bytes'ı bu route'tan GEÇMEZ (Netlify fonksiyon gövde
 * limitini atlar). Service-role ile imzalandığı için ekstra storage RLS gerekmez.
 */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  // ⚠ Bu uç BEDAVA yazma yetkisi dağıtıyor ve `/api/upload`ın frenini ATLIYOR
  //   (dosya oradan geçmiyor, doğrudan Supabase'e gidiyor). Frensizken tek
  //   hesapla sınırsız imza alınabiliyordu. Kullanıcı başına sayılır.
  const fren = await limit('sign', req.headers, me.id);
  if (!fren.ok) return tooMany('Çok fazla yükleme isteği. Biraz bekleyip tekrar dene.', fren, 'sign');

  let body: { kind?: string; ext?: string; contentType?: string; size?: number };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const kind = body.kind === 'story' ? 'story' : body.kind === 'avatar' ? 'avatar' : body.kind === 'dm' ? 'dm' : 'media';
  const ct = body.contentType ?? '';
  const isImg = IMG.includes(ct);
  const isVid = VID.includes(ct);
  const isAud = ct.startsWith('audio/');
  // Avatar yalnızca görsel olabilir (GIF dahil); diğer türlerde video/ses de geçerli.
  if (kind === 'avatar' ? !isImg : (!isImg && !isVid && !isAud)) {
    return json({ error: 'Desteklenmeyen dosya türü.' }, 400);
  }
  // `size` ZORUNLU: eskiden `typeof body.size === 'number'` koşuluydu, yani
  // istemci alanı hiç göndermeyerek boyut kontrolünü tamamen atlayabiliyordu.
  if (typeof body.size !== 'number' || !Number.isFinite(body.size) || body.size <= 0) {
    return json({ error: 'Dosya boyutu belirtilmeli.' }, 400);
  }
  if (body.size > LIMIT[kind]) {
    return json({ error: `Dosya çok büyük (max ${Math.round(LIMIT[kind] / 1024 / 1024)} MB).` }, 400);
  }

  // Uzantı contentType'tan TÜRETİLİR; istemcinin `ext` alanı yok sayılır.
  // Eskiden istemci `ext` verebiliyordu → contentType image/jpeg iken dosya
  // .html uzantısıyla yazılabiliyor, depolama katmanı onu HTML olarak sunarsa
  // depolanmış XSS'e dönüşebiliyordu. Tür zaten yukarıda izin listesinde.
  const ext = EXT_BY_TYPE[ct] ?? (isImg ? 'jpg' : isVid ? 'mp4' : 'mp3');
  const rand = Math.random().toString(36).slice(2, 8);

  /* 🚨 HİKÂYELER AYRI, PRIVATE KOVADA — 23.08.2026 güvenlik denetimi.
     Önceden hepsi `media` (PUBLIC) kovasına gidiyordu ve hikâyenin adresi
     KALICI bir public URL oluyordu. Ölçüldü: süresi dolmuş 6 hikâyenin 6'sı
     da anonim isteğe HTTP 206 dönüyordu, üçü gizli hesaba ait. Yani "yakın
     arkadaşlar"a attığın hikâye, onu bir kez gören herkeste sonsuza dek
     kalıyordu — listeden çıkarsan da, engellesen de, süresi dolsa da.
     Artık dosya private kovaya yazılır ve okuma yüzeyleri kısa ömürlü imzalı
     URL üretir (lib/storyMedia.ts).
     ⚠ `stories` kovasının KENDİ 50 MB limiti var → aşağıdaki `LIMIT.story`
       artık tek başına dekoratif değil, bucket sunucuda da zorluyor. */
  /* 🚨 DM MEDYASI DA PRIVATE — 23.08.2026 denetimi, hikâyenin ikizi.
     Özel mesaj eki `media` (PUBLIC) kovasına gidiyordu ve adresi kalıcıydı:
     engel, dm_privacy, konuşmanın tarafı olmak — hiçbiri sorulmuyordu, mesajı
     silmek bile dosyayı kaldırmıyordu. Ölçüldü: o an medyalı DM sayısı 0,
     yani sızan dosya yok; ilk paylaşımda sızacaktı. */
  const kova = kind === 'story' ? 'stories' : kind === 'dm' ? 'dm' : 'media';
  const storagePath =
    kind === 'avatar' ? `avatars/${me.id}-${Date.now()}-${rand}.${ext}` :
    `${me.id}/${Date.now()}-${rand}.${ext}`;

  const { data, error } = await db.storage.from(kova).createSignedUploadUrl(storagePath);
  if (error || !data) return json({ error: 'İmzalı URL alınamadı.' }, 500);

  // signedUrl = token'ı da taşıyan TAM URL. İstemci buna düz XHR PUT atıp yükleme
  // ilerlemesini okuyabiliyor (bkz. lib/upload.ts); token ayrıca dönüyor çünkü
  // supabase-js ile yükleyen eski bir çağıran kalırsa kırılmasın.
  // `bucket` de dönüyor: hikâye yüklemesinde istemci public URL KURMAMALI,
  // yolu olduğu gibi /api/stories'e vermeli (orada media_path olarak saklanır).
  return json({ path: data.path, token: data.token, signedUrl: data.signedUrl, bucket: kova, mediaType: isImg ? 'image' : isVid ? 'video' : 'audio' });
}
