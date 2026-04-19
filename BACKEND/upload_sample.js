const supabase = require("./config/supabaseClient");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function uploadSample() {
  const targetBucket = process.env.SUPABASE_BUCKET || 'thisara_driving_school';
  const fileName = `sample-upload-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, 'uploads', 'sample-test.pdf');

  // Create a dummy PDF if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
  }
  
  if (!fs.existsSync(filePath)) {
    console.log("📄 Creating a dummy sample PDF...");
    fs.writeFileSync(filePath, "This is a dummy PDF file content for testing Supabase upload.");
  }

  const fileBuffer = fs.readFileSync(filePath);

  console.log(`🚀 Uploading '${fileName}' to bucket '${targetBucket}'...`);

  try {
    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(`tests/${fileName}`, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    console.log("✅ Upload successful!");
    console.log("Data:", data);

    const { data: { publicUrl } } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(`tests/${fileName}`);

    console.log("\n🔗 Public URL:");
    console.log(publicUrl);
    fs.writeFileSync('last_upload_url.txt', publicUrl);
    
    console.log("\n💡 You can visit this URL to verify the upload works.");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    process.exit(1);
  }
}

uploadSample();

