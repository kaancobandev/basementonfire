import { createClient } from '@supabase/supabase-js';

// Singleton browser-side client — anon key only, never service key
export const supa = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL as string,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string
);
