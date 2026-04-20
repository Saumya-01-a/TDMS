const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'driving_school_db',
  user: 'postgres',
  password: '810111565'
});

async function seedPayments() {
  console.log("💰 Seeding sample payments...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clear existing payments for clean slate
    await client.query("DELETE FROM payments");

    // Fetch some students who have packages
    const res = await client.query(`
      SELECT s.student_id, s.package_id, p.price 
      FROM students s 
      JOIN packages p ON s.package_id = p.id 
      LIMIT 10
    `);

    const students = res.rows;
    if (students.length === 0) {
      console.log("⚠️ No students found with packages. Run sync_real_students first.");
      return;
    }

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const price = parseFloat(student.price);
        const paymentId = `PMT${Date.now()}${i}`;
        
        // 1. One student fully paid
        if (i === 0) {
          await client.query(
            "INSERT INTO payments (payment_id, student_id, package_id, amount, payment_method, status, payment_date, payment_time) VALUES ($1, $2, $3, $4, $5, $6, now(), now())",
            [paymentId, student.student_id, student.package_id, price, 'Cash/ADM', 'Completed']
          );
        } 
        // 2. Some students partially paid
        else if (i < 5) {
          const installment = Math.floor(price / 2);
          await client.query(
            "INSERT INTO payments (payment_id, student_id, package_id, amount, payment_method, status, payment_date, payment_time) VALUES ($1, $2, $3, $4, $5, $6, now(), now())",
            [paymentId, student.student_id, student.package_id, installment, 'Bank Transfer', 'Completed']
          );
        }
    }

    await client.query("COMMIT");
    console.log(`✅ Successfully seeded payments for ${Math.min(students.length, 5)} students.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seedPayments();
