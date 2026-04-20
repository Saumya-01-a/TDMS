const pool = require('../config/db');
const supabase = require('../config/supabaseClient');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function manualPurge() {
  console.log("🚀 MANUAL PURGE INITIATED: 'mjmj'");
  try {
    const res = await pool.query("SELECT material_id, file_url FROM materials WHERE title = 'mjmj'");
    if (res.rowCount === 0) {
      console.log("❌ RESOURCE NOT FOUND: mjmj");
      process.exit(0);
    }

    const { material_id, file_url } = res.rows[0];
    const fileName = fileUrl.split('/').pop().split('?')[0];

    console.log(`📡 SUPABASE: Deleting materials/${fileName}...`);
    const { error: deleteError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([`materials/${fileName}`]);

    if (deleteError) {
      console.warn("⚠️ SUPABASE WARNING:", deleteError.message);
    } else {
      console.log("✅ SUPABASE: File purged.");
    }

    console.log(`🗄️ DATABASE: Deleting record ID ${material_id}...`);
    await pool.query("DELETE FROM materials WHERE material_id = $1", [material_id]);
    console.log("✅ DATABASE: Record purged.");

  } catch (err) {
    console.error("🏁 FAILURE:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

manualPurge();
