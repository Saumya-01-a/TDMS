const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("🛑 CRITICAL: Supabase URL or Key is missing from BACKEND .env");
} else {
  const isServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log(`📡 Supabase: Initialized with ${isServiceKey ? 'SERVICE_ROLE' : 'ANON'} key`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
