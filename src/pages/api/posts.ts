import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  // Giriş kontrolü
  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();

  if (!authUser) {
    return new Response(null, { status: 303, headers: { Location: '/login' } });
  }

  // Auth id'den users tablosundaki kaydı bul
  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (!dbUser) {
    return new Response(JSON.stringify({ error: 'Kullanıcı bulunamadı' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formData = await request.formData();
  const content  = formData.get('content')?.toString().trim() ?? '';
  const category = formData.get('category')?.toString() ?? 'general';

  if (!content || content.length > 500) {
    return new Response(JSON.stringify({ error: 'Geçersiz içerik' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: dbUser.id, content, category });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, { status: 303, headers: { Location: '/' } });
};
