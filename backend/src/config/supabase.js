/**
 * Supabase DB Client Setup
 * Ownership: Person 2 (Backend Engineer)
 */

const MOCK_MODE = process.env.MOCK_MODE !== 'false';

let supabaseClient = null;

if (!MOCK_MODE && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('[Database] Connected to Supabase live instance');
  } catch (e) {
    console.warn('[Database] @supabase/supabase-js not installed or config missing. Falling back to mock.');
  }
} else {
  console.log('[Database] Running in MOCK_MODE=true (In-memory storage)');
}

module.exports = {
  supabaseClient,
  isMock: MOCK_MODE || !supabaseClient
};
