import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set before Supabase-backed features are used.'
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabasePublishableKey || 'sb_publishable_placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
