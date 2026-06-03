import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_KEY!;

// Service-role client — server only, never sent to browser
export const db = createClient(url, service, { auth: { persistSession: false } });

// Auth-aware client for reading the current user's session from cookies
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}

// Helper: get authenticated user's db row in one call
export async function getMe() {
  const client = await createAuthClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { authUser: null, me: null, client };
  const { data: me } = await db.from('users').select('*').eq('auth_id', user.id).single();
  return { authUser: user, me: me ?? null, client };
}

// Surface Supabase query errors in the server console instead of silently
// rendering empty pages. Call with the `error` from any `await db...` result.
export function logIfError(label: string, error: unknown) {
  if (error) {
    const e = error as { message?: string; code?: string };
    console.error(`[supabase] ${label}:`, e?.code ? `${e.code} ${e.message ?? ''}` : (e?.message ?? error));
  }
}
