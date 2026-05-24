import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function getMe(request: Request) {
  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return null;
  const { data: me } = await supabase
    .from('users')
    .select('id, is_private, dm_privacy, comment_privacy')
    .eq('auth_id', authUser.id)
    .single();
  return me ?? null;
}

export const GET: APIRoute = async ({ request }) => {
  const me = await getMe(request);
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  return json({
    is_private:      me.is_private,
    dm_privacy:      me.dm_privacy,
    comment_privacy: me.comment_privacy,
  });
};

export const POST: APIRoute = async ({ request }) => {
  const me = await getMe(request);
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const allowed = ['everyone', 'followers', 'none'];
  const updates: Record<string, unknown> = {};

  if (typeof body.is_private === 'boolean') updates.is_private = body.is_private;
  if (allowed.includes(body.dm_privacy))      updates.dm_privacy = body.dm_privacy;
  if (allowed.includes(body.comment_privacy)) updates.comment_privacy = body.comment_privacy;

  if (!Object.keys(updates).length) return json({ error: 'Güncellenecek alan yok' }, 400);

  const { error } = await supabase.from('users').update(updates).eq('id', me.id);
  if (error) return json({ error: 'Ayarlar kaydedilemedi' }, 500);

  return json({ ok: true });
};
