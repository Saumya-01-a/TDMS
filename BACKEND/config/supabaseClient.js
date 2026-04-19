const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key if available (standard for backend to bypass RLS), 
// otherwise fall back to anon key for development/client-side access.
const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase URL or Key is missing in .env");
} else {
  console.log(`📡 Supabase connection: URL found, using ${hasServiceKey ? 'SERVICE_ROLE' : 'ANON'} key`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
