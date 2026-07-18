import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

const IMG = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VID = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const LIMIT = { media: 100 * 1024 * 1024, story: 50 * 1024 * 1024, avatar: 10 * 1024 * 1024 } as const;

// Uzantı → contentType eşlemesi. İstemcinin gönderdiği `ext` ARTIK KULLANILMIYOR.
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
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

  let body: { kind?: string; ext?: string; contentType?: string; size?: number };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const kind = body.kind === 'story' ? 'story' : body.kind === 'avatar' ? 'avatar' : 'media';
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
  const storagePath =
    kind === 'story'  ? `stories/${me.id}-${Date.now()}-${rand}.${ext}` :
    kind === 'avatar' ? `avatars/${me.id}-${Date.now()}-${rand}.${ext}` :
    `${me.id}/${Date.now()}-${rand}.${ext}`;

  const { data, error } = await db.storage.from('media').createSignedUploadUrl(storagePath);
  if (error || !data) return json({ error: 'İmzalı URL alınamadı.' }, 500);

  return json({ path: data.path, token: data.token, mediaType: isImg ? 'image' : isVid ? 'video' : 'audio' });
}
