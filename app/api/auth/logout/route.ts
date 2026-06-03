import { createAuthClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const client = await createAuthClient();
  await client.auth.signOut();
  return NextResponse.redirect(new URL('/login', req.url), { status: 303 });
}
