const { Client } = require('pg');
require('dotenv').config();

const REAL_STUDENTS = [
    { firstName: "Uthpala", lastName: "Sahan" },
    { firstName: "Sithija", lastName: "Nimsara" },
    { firstName: "Ahsan", lastName: "Madushanka" },
    { firstName: "Nimna", lastName: "Perera" },
    { firstName: "Kavindu", lastName: "Chamod" },
    { firstName: "Nisal", lastName: "Anuhas" },
    { firstName: "Gayesha", lastName: "Nirman" },
    { firstName: "Sumudu", lastName: "Dias" },
    { firstName: "Pasindu", lastName: "Ninada" },
    { firstName: "Dilshan", lastName: "Pawithra" }
];

async function syncRealStudents() {
    const client = new Client({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();
        await client.query('BEGIN');

        console.log("🧹 Wiping dummy student data...");
        
        const stdUserIdsRes = await client.query("SELECT user_id FROM users WHERE role = 'student'");
        const stdUserIds = stdUserIdsRes.rows.map(r => r.user_id);
        
        if (stdUserIds.length > 0) {
            const stdIdsRes = await client.query("SELECT student_id FROM students WHERE user_id = ANY($1)", [stdUserIds]);
            const stdIds = stdIdsRes.rows.map(r => r.student_id);

            if (stdIds.length > 0) {
                await client.query("DELETE FROM attendance WHERE student_id = ANY($1)", [stdIds]);
                await client.query("DELETE FROM sessions WHERE student_id = ANY($1)", [stdIds]);
                await client.query("DELETE FROM reviews WHERE student_id = ANY($1)", [stdIds]);
                await client.query("DELETE FROM payments WHERE student_id = ANY($1)", [stdIds]);
                await client.query("DELETE FROM students WHERE student_id = ANY($1)", [stdIds]);
            }
            await client.query("DELETE FROM users WHERE user_id = ANY($1)", [stdUserIds]);
        }

        console.log("✅ Wiped dummy data. Inserting 10 real students...");

        const packageId = 22; 
        const instructorId = 'I1769578441288'; 

        for (let i = 0; i < REAL_STUDENTS.length; i++) {
            const student = REAL_STUDENTS[i];
            const email = `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}${i}@example.com`;
            const nic = `2000${(10000000 + i).toString().substring(1)}V`;
            const phone = `077${(1000000 + i).toString().substring(1)}`;
            
            const userRes = await client.query(
                `INSERT INTO users (first_name, last_name, email, password, role, tel_no, nic, status)
                 VALUES ($1, $2, $3, $4, 'student', $5, $6, 'approved') RETURNING user_id`,
                [student.firstName, student.lastName, email, '123456', phone, nic]
            );
            const userId = userRes.rows[0].user_id;

            await client.query(
                `INSERT INTO students (user_id, package_id, instructor_id, status, progress)
                 VALUES ($1, $2, $3, 'Learning', $4)`,
                [userId, packageId, instructorId, Math.floor(Math.random() * 40) + 10]
            );
        }

        await client.query('COMMIT');
        console.log("🎉 Successfully synchronized 10 real students!");
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("❌ Migration failed:", err.message);
    } finally {
        await client.end();
        process.exit();
    }
}

syncRealStudents();
