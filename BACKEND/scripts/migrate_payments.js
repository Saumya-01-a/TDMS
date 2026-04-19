const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log("🚀 Starting Financial System Migration...");

    // 1. Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.payments (
        payment_id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        payment_method VARCHAR(20) DEFAULT 'Cash',
        status VARCHAR(20) DEFAULT 'Completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created 'payments' table");

    // 2. Create instructor_payouts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.instructor_payouts (
        payout_id SERIAL PRIMARY KEY,
        instructor_id VARCHAR(50) NOT NULL REFERENCES public.instructors(instructor_id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
        reference TEXT,
        status VARCHAR(20) DEFAULT 'Paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created 'instructor_payouts' table");

    // 3. Add pay_rate to instructors
    await client.query(`
      ALTER TABLE public.instructors 
      ADD COLUMN IF NOT EXISTS pay_rate DECIMAL(10, 2) DEFAULT 500.00
    `);
    console.log("✅ Added 'pay_rate' to 'instructors'");

    await client.query('COMMIT');
    console.log("🎉 Migration Successful!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Migration Failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
function processExit() { process.exit(); }
