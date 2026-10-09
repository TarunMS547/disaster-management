import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_KEY.includes('placeholder')
);

export const isClerkConfigured = Boolean(
  CLERK_KEY && 
  !CLERK_KEY.includes('placeholder_key')
);

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client configured with Clerk session JWT if available.
 */
export function getSupabaseClient(clerkToken?: string | null): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (clerkToken) {
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  return supabaseInstance;
}
