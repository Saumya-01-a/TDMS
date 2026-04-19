const supabase = require("./config/supabaseClient");
require("dotenv").config();

async function verifySupabase() {
  console.log("--- Supabase Storage Verification ---");
  console.log("URL:", process.env.SUPABASE_URL);
  
  const targetBucket = process.env.SUPABASE_BUCKET || 'thisara_driving_school';
  console.log("Target Bucket:", targetBucket);

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw error;
    }

    console.log("✅ Successfully connected to Supabase!");
    console.log("Available Buckets:", JSON.stringify(buckets.map(b => b.name)));
    
    const bucketExists = buckets.find(b => b.name === targetBucket);
    
    if (bucketExists) {
      console.log(`✅ Target bucket '${targetBucket}' is accessible.`);
    } else {
      console.warn(`⚠️ Target bucket '${targetBucket}' was not found in the list.`);
      console.warn(`Available ones: ${JSON.stringify(buckets.map(b => b.name))}`);
    }

    // Attempt a small test upload regardless
    console.log(`🧪 Attempting a test upload to '${targetBucket}'...`);
    const testContent = "This is a test file for Supabase storage verify.";
    const testFileBuffer = Buffer.from(testContent);
    const testFileName = `test-verify-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(testFileName, testFileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (uploadError) {
      console.error(`❌ Upload test failed: ${uploadError.message}`);
      if (uploadError.message.includes("not found")) {
        console.log("💡 Hint: The bucket might not exist yet. Please create it in the Supabase Dashboard.");
      }
    } else {
      console.log(`✅ Upload test successful! File path: ${uploadData.path}`);
      
      // Cleanup test file
      const { error: removeError } = await supabase.storage
        .from(targetBucket)
        .remove([testFileName]);
        
      if (removeError) {
        console.warn(`⚠️ Cleanup failed: ${removeError.message}`);
      } else {
        console.log(`✅ Cleanup successful.`);
      }
    }


  } catch (err) {
    console.error("❌ Supabase Verification Failed:", err.message);
  } finally {
    process.exit(0);
  }
}

verifySupabase();

