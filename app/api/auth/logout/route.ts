import { createAuthClientForResponse } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // signOut'un sildiği cookie'lerin gerçekten temizlenmesi için silme işlemi
  // doğrudan döndürülen redirect yanıtına yazılır.
  const response = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  const client = createAuthClientForResponse(req, response);
  await client.auth.signOut();
  return response;
}
