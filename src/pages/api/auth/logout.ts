import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers();
  const supabase = createAuthClient(request, headers);

  await supabase.auth.signOut();

  headers.set('Location', '/login');
  return new Response(null, { status: 302, headers });
};
