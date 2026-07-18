import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function GET() {
  const now = new Date().toISOString();
  const { data } = await db
    .from('stories')
    .select('id, media_url, media_type, created_at, expires_at, user_id, users(id, username, display_name, avatar, is_private)')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(100); // limitsizdi → süresi dolmamış TÜM story'ler tek yanıtta (app/feed/page.tsx aynı sorguya zaten limit koymuş)

  // Gizli hesapların story'leri küresel story şeridinde gösterilmez (is_private truthy=gizli).
  const stories = ((data ?? []) as any[]).filter((s) => !s.users?.is_private);

  return NextResponse.json({ stories });
}

/**
 * Commit: hikaye dosyası tarayıcıdan doğrudan Supabase Storage'a yüklendikten
 * sonra sadece kaydı oluşturur (küçük JSON gövdesi).
 */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { path?: string; mediaType?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const path = body.path ?? '';
  const mediaType = body.mediaType === 'video' ? 'video' : 'image';
  // Yol bu kullanıcıya ait olmalı (imza route'u "stories/{me.id}-..." üretir).
  if (!path.startsWith(`stories/${me.id}-`)) return json({ error: 'Geçersiz dosya yolu.' }, 400);

  const mediaUrl  = db.storage.from('media').getPublicUrl(path).data.publicUrl;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 saat

  const { data: story, error } = await db
    .from('stories')
    .insert({
      user_id:    me.id,
      media_url:  mediaUrl,
      media_type: mediaType,
      expires_at: expiresAt,
    })
    .select('id, media_url, media_type, created_at, expires_at')
    .single();

  if (error) {
    await db.storage.from('media').remove([path]);
    return json({ error: error.message }, 500);
  }

  revalidateTag('feed'); // yeni hikaye → home stories önbelleğini hemen tazele
  return json({ story }, 201);
}
