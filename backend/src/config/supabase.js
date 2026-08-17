/**
 * Supabase DB Client Setup
 * Ownership: Person 2 (Backend Engineer)
 */

let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      supabaseClient = createClient(url, anonKey);
      console.log('[Database] Connected to Supabase live instance');
      return supabaseClient;
    } catch (e) {
      console.warn('[Database] Failed to initialize Supabase client:', e.message);
    }
  }
  return null;
}

module.exports = {
  getSupabaseClient
};
