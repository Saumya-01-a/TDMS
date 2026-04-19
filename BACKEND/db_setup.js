const pool = require("./config/db");

async function setup() {
  const client = await pool.connect();
  try {
    console.log("--- Starting Database Sync ---");
    
    // Diagnostic
    const searchPath = await client.query("SHOW search_path;");
    console.log("ℹ️ Current search_path:", searchPath.rows[0].search_path);
    
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log("ℹ️ Public tables:", tables.rows.map(t => t.table_name).join(', '));

    console.log("1. Checking instructors table...");
    await client.query("ALTER TABLE instructors ADD COLUMN IF NOT EXISTS verification_document TEXT;");
    await client.query("ALTER TABLE instructors ALTER COLUMN approval_status TYPE VARCHAR(20) USING CASE WHEN approval_status = true THEN 'approved' ELSE 'pending' END;");
    await client.query("ALTER TABLE instructors ALTER COLUMN approval_status SET DEFAULT 'pending';");
    await client.query("UPDATE users SET status = 'pending', email_verified = false WHERE role = 'Instructor';");
    console.log("✅ Column 'verification_document' and 'approval_status' checked/updated successfully");

    console.log("2. Forcefully creating packages table...");
    try {
      // First try to drop if it's a view/other relation causing IF NOT EXISTS to skip
      await client.query("DROP TABLE IF EXISTS public.packages CASCADE;");
      await client.query(`
        CREATE TABLE public.packages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2),
          description TEXT
        );
      `);
      console.log("   ✅ Packages table officially created");
    } catch (err) {
      console.warn("   ⚠️  Package creation warning (might already exist):", err.message);
      // Fallback if drop/create failed (e.g. permission)
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.packages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2),
          description TEXT
        );
      `);
    }

    // Re-verify after creation
    const tablesAfter = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log("ℹ️ Public tables after creation:", tablesAfter.rows.map(t => t.table_name).join(', '));

    console.log("3. Seeding packages if empty...");
    // Explicitly use public.packages for safety
    const pkgCheck = await client.query("SELECT COUNT(*) FROM public.packages");
    if (parseInt(pkgCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO public.packages (name, price, description) 
        VALUES 
        ('Basic Package', 15000.00, '8 Theory lessons + 10 Practical sessions'),
        ('Standard Package', 25000.00, '12 Theory lessons + 20 Practical sessions'),
        ('Premium Package', 40000.00, 'Unlimited Theory + 35 Practical sessions + Trial guidance');
      `);
      console.log("✅ Packages seeded");
    } else {
      console.log("ℹ️ Packages already seeded");
    }

    console.log("4. Updating students table columns...");
    const studentQueries = [
      { name: "progress", sql: "ALTER TABLE public.students ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;" },
      { name: "status", sql: "ALTER TABLE public.students ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Learning';" },
      { name: "registered_date", sql: "ALTER TABLE public.students ADD COLUMN IF NOT EXISTS registered_date DATE DEFAULT CURRENT_DATE;" },
      { name: "package_id", sql: "ALTER TABLE public.students ADD COLUMN IF NOT EXISTS package_id INTEGER;" },
      { name: "completion_date", sql: "ALTER TABLE public.students ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP;" }
    ];

    for (const q of studentQueries) {
      try {
        await client.query(q.sql);
        console.log(`   ✅ Column '${q.name}' processed`);
      } catch (err) {
        console.error(`   ❌ Error adding column '${q.name}':`, err.message);
      }
    }

    console.log("4.1 Applying Foreign Key for package_id...");
    try {
      const constraintCheck = await client.query(`
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'students' AND column_name = 'package_id' AND table_schema = 'public';
      `);
      if (constraintCheck.rowCount === 0) {
        await client.query("ALTER TABLE public.students ADD CONSTRAINT fk_student_package FOREIGN KEY (package_id) REFERENCES public.packages(id);");
        console.log("   ✅ Foreign Key applied successfully");
      } else {
        console.log("   ℹ️ Foreign Key already exists");
      }
    } catch (err) {
      console.error("   ❌ Error applying Foreign Key:", err.message);
    }

    console.log("5. Creating reviews table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.reviews (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) REFERENCES public.students(student_id),
        instructor_id VARCHAR(50) REFERENCES public.instructors(instructor_id),
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Reviews table ready");

    console.log("🎉 Database synchronization complete!");
    process.exit(0);
  } catch (err) {
    console.error("⛔ FATAL Error during setup:", err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

setup();
