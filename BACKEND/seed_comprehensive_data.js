const pool = require("./config/db");

// Password hash for 'Password123!' (Standard for all seeded test accounts)
const DEFAULT_PASSWORD_HASH = "$2b$10$qeGY9jSBtSorKB2PWOgjFe8UmztGt7G9UCbqsWsRqudoZdywwOZnW";

// --- Seed Data Dictionaries ---
const SRI_LANKAN_FIRST_NAMES = [
  "Kasun", "Nuwan", "Tharindu", "Dilshan", "Sachini", "Dinuka", "Kaveen", "Kavindu", 
  "Shenal", "Malinda", "Janith", "Isuru", "Sandun", "Chamara", "Nadeesha", "Thilini", 
  "Rashmi", "Anjana", "Chathurika", "Hansani", "Danushka", "Ravindu", "Charith", "Lahiru", 
  "Sithum", "Prabath", "Ruwan", "Supun", "Manjula", "Sajith", "Harsha", "Gayan", 
  "Buddhika", "Akila", "Oshada", "Minod", "Lakshan", "Nipuna", "Vimukthi", "Madhuka", 
  "Shehan", "Ruchira", "Janaka", "Pubudu", "Sameera", "Suranga", "Indika", "Priyantha", 
  "Sudarshana", "Nalin", "Dinesh", "Sampath", "Kelum", "Eranga", "Asitha", "Shihan", 
  "Duminda", "Viraj", "Milan", "Dananjaya", "Randika", "Sahan", "Menaka", "Piyumi", 
  "Hiruni", "Oshani", "Ashani", "Kaveesha", "Nimasha", "Dilki", "Amanda", "Chalani", 
  "Dulani", "Senuri", "Tharushi", "Dewmi", "Sewwandi", "Madara", "Hasini", "Samadhi", 
  "Gayani", "Nisansala", "Upeksha", "Dilani", "Nelum", "Chathuri", "Subhashini", "Inoka", 
  "Kaushalya", "Madushani", "Ishara", "Malkanthi", "Chamari", "Shashikala", "Harshani", 
  "Achini", "Oshadi", "Nilakshi", "Sugandika", "Hasitha", "Pramuka", "Geeth", "Anuhas", 
  "Ninada", "Chamod", "Nimsara", "Isurandi", "Sunil", "Gamini", "Bandula", "Samantha"
];

const SRI_LANKAN_LAST_NAMES = [
  "Perera", "Silva", "Fernando", "de Silva", "Jayasuriya", "Gunawardena", "Wickramasinghe", 
  "Senanayake", "Rajapaksa", "Mendis", "Karunaratne", "Dissanayake", "Samarasinghe", 
  "Weerasinghe", "Herath", "Jayasinghe", "Rathnayake", "Bandara", "Jayawardena", "Alwis", 
  "Peiris", "Fonseka", "Gamage", "Abeysekara", "Liyanage", "Wijesinghe", "Hettiarachchi", 
  "Nanayakkara", "Siriwardena", "Ranatunga", "Kulatunga", "Jayatillake", "Madushanka", 
  "Dias", "Anuhas", "Chamod", "Nimsara", "Peris", "Gunasekera", "Basnayake", "Tennewey"
];

const SRI_LANKAN_CITIES = [
  "Colombo 03", "Kelaniya", "Kadawatha", "Negombo", "Gampaha", "Kurunegala", "Kalutara", 
  "Galle", "Matara", "Maharagama", "Nugegoda", "Malabe", "Kaduwela", "Piliyandala", 
  "Moratuwa", "Panadura", "Wattala", "Ja-Ela", "Kiribathgoda", "Kandy", "Horana", "Gampola"
];

const STREET_NAMES = [
  "Galle Road", "Kandy Road", "High Level Road", "Temple Road", "Station Road", 
  "Negombo Road", "Hospital Road", "School Lane", "Main Street", "Lake Road", 
  "Cross Street", "Circular Road", "Commercial Zone", "Post Office Road"
];

const INSTRUCTOR_DATA = [
  { name: "Sunil Shantha", license: "LIC-1001", reg: "REG-INS-101", spec: "Light Vehicle", pay: 750, status: "approved" },
  { name: "Gamini Jayawardena", license: "LIC-1002", reg: "REG-INS-102", spec: "Heavy Vehicle", pay: 850, status: "approved" },
  { name: "Bandula Gunaratne", license: "LIC-1003", reg: "REG-INS-103", spec: "Motorcycle", pay: 600, status: "approved" },
  { name: "Samantha Dissanayake", license: "LIC-1004", reg: "REG-INS-104", spec: "Light Vehicle", pay: 750, status: "approved" },
  { name: "Chathura Senanayake", license: "LIC-1005", reg: "REG-INS-105", spec: "General", pay: 800, status: "approved" },
  { name: "Mahesh Kumara", license: "LIC-1006", reg: "REG-INS-106", spec: "Light Vehicle", pay: 700, status: "approved" },
  { name: "Asanka Gurusinghe", license: "LIC-1007", reg: "REG-INS-107", spec: "Heavy Vehicle", pay: 900, status: "approved" },
  { name: "Roshan Mahanama", license: "LIC-1008", reg: "REG-INS-108", spec: "General", pay: 850, status: "approved" },
  { name: "Hashan Tillakaratne", license: "LIC-1009", reg: "REG-INS-109", spec: "Light Vehicle", pay: 750, status: "approved" },
  { name: "Chaminda Vaas", license: "LIC-1010", reg: "REG-INS-110", spec: "General", pay: 800, status: "approved" },
  { name: "Upul Tharanga", license: "LIC-1011", reg: "REG-INS-111", spec: "Motorcycle", pay: 650, status: "approved" },
  { name: "Kumar Sangakkara", license: "LIC-1012", reg: "REG-INS-112", spec: "Light Vehicle", pay: 950, status: "approved" },
  { name: "Mahela Jayawardene", license: "LIC-1013", reg: "REG-INS-113", spec: "General", pay: 950, status: "approved" },
  { name: "Lasith Malinga", license: "LIC-1014", reg: "REG-INS-114", spec: "Heavy Vehicle", pay: 850, status: "approved" },
  { name: "Rangana Herath", license: "LIC-1015", reg: "REG-INS-115", spec: "Light Vehicle", pay: 750, status: "approved" },
  { name: "Nuwan Kulasekara", license: "LIC-1016", reg: "REG-INS-116", spec: "Motorcycle", pay: 650, status: "approved" },
  { name: "Angelo Mathews", license: "LIC-1017", reg: "REG-INS-117", spec: "General", pay: 850, status: "approved" },
  { name: "Dinesh Chandimal", license: "LIC-1018", reg: "REG-INS-118", spec: "Light Vehicle", pay: 750, status: "approved" },
  { name: "Kusal Perera", license: "LIC-1019", reg: "REG-INS-119", spec: "Motorcycle", pay: 650, status: "approved" },
  { name: "Dimuth Karunaratne", license: "LIC-1020", reg: "REG-INS-120", spec: "Light Vehicle", pay: 800, status: "approved" },
  { name: "Dhananjaya de Silva", license: "LIC-1021", reg: "REG-INS-121", spec: "General", pay: 750, status: "approved" },
  { name: "Wanindu Hasaranga", license: "LIC-1022", reg: "REG-INS-122", spec: "Motorcycle", pay: 700, status: "approved" },
  { name: "Dasun Shanaka", license: "LIC-1023", reg: "REG-INS-123", spec: "Heavy Vehicle", pay: 800, status: "approved" },
  { name: "Pathum Nissanka", license: "LIC-1024", reg: "REG-INS-124", spec: "Light Vehicle", pay: 750, status: "approved" },
  { name: "Lahiru Kumara", license: "LIC-1025", reg: "REG-INS-125", spec: "Motorcycle", pay: 650, status: "pending" },
  { name: "Dushmantha Chameera", license: "LIC-1026", reg: "REG-INS-126", spec: "Light Vehicle", pay: 750, status: "pending" },
  { name: "Charith Asalanka", license: "LIC-1027", reg: "REG-INS-127", spec: "General", pay: 750, status: "pending" },
  { name: "Pramod Madushan", license: "LIC-1028", reg: "REG-INS-128", spec: "Heavy Vehicle", pay: 700, status: "pending" },
  { name: "Kasun Rajitha", license: "LIC-1029", reg: "REG-INS-129", spec: "Motorcycle", pay: 600, status: "pending" },
  { name: "Dunith Wellalage", license: "LIC-1030", reg: "REG-INS-130", spec: "Light Vehicle", pay: 700, status: "pending" }
];

const VEHICLE_DATA = [
  { model: "Toyota Aqua Hybrid", type: "Car", reg: "WP CA-1045", trans: "Auto", year: 2022, status: "Available" },
  { model: "Toyota Aqua Hybrid", type: "Car", reg: "WP CA-2890", trans: "Auto", year: 2023, status: "Available" },
  { model: "Toyota Aqua Hybrid", type: "Car", reg: "WP CAD-7812", trans: "Auto", year: 2021, status: "Available" },
  { model: "Toyota Aqua Hybrid", type: "Car", reg: "WP CAD-9134", trans: "Auto", year: 2024, status: "In Service" },
  { model: "Toyota Vios Dual-Control", type: "Car", reg: "WP CB-3341", trans: "Manual", year: 2020, status: "Available" },
  { model: "Toyota Vios Dual-Control", type: "Car", reg: "WP CB-5562", trans: "Manual", year: 2022, status: "Available" },
  { model: "Toyota Vios Dual-Control", type: "Car", reg: "CP CAB-6623", trans: "Manual", year: 2021, status: "In Service" },
  { model: "Suzuki Alto K10", type: "Car", reg: "WP CAA-1189", trans: "Manual", year: 2022, status: "Available" },
  { model: "Suzuki Alto K10", type: "Car", reg: "SP CAA-4491", trans: "Manual", year: 2023, status: "Available" },
  { model: "Honda Grace Hybrid", type: "Car", reg: "WP CAR-5678", trans: "Auto", year: 2020, status: "Maintenance" },
  { model: "Toyota HiAce KDH 200", type: "Van", reg: "WP NA-4401", trans: "Manual", year: 2021, status: "Available" },
  { model: "Toyota HiAce KDH 200", type: "Van", reg: "WP NA-7712", trans: "Manual", year: 2022, status: "Available" },
  { model: "Toyota HiAce Super GL", type: "Van", reg: "WP NB-9934", trans: "Auto", year: 2023, status: "In Service" },
  { model: "Nissan Caravan NV350", type: "Van", reg: "CP NC-2245", trans: "Manual", year: 2020, status: "Available" },
  { model: "Nissan Caravan NV350", type: "Van", reg: "SP ND-8871", trans: "Manual", year: 2019, status: "Maintenance" },
  { model: "Bajaj RE 4-Stroke 205cc", type: "Three-Wheeler", reg: "WP AA-9821", trans: "Manual", year: 2022, status: "Available" },
  { model: "Bajaj RE 4-Stroke 205cc", type: "Three-Wheeler", reg: "WP AB-3412", trans: "Manual", year: 2023, status: "Available" },
  { model: "Bajaj RE 4-Stroke 205cc", type: "Three-Wheeler", reg: "CP QH-7723", trans: "Manual", year: 2021, status: "Available" },
  { model: "TVS King Deluxe 200cc", type: "Three-Wheeler", reg: "SP QI-5514", trans: "Manual", year: 2022, status: "In Service" },
  { model: "Piaggio Ape City", type: "Three-Wheeler", reg: "WP BAA-4011", trans: "Manual", year: 2024, status: "Available" },
  { model: "TVS Apache RTR 160 4V", type: "Bike", reg: "WP BIW-3312", trans: "Manual", year: 2023, status: "Available" },
  { model: "TVS Apache RTR 160 4V", type: "Bike", reg: "WP BIX-5582", trans: "Manual", year: 2024, status: "Available" },
  { model: "Hero Splendor Plus", type: "Bike", reg: "CP BIY-7734", trans: "Manual", year: 2022, status: "Available" },
  { model: "Hero Splendor Plus", type: "Bike", reg: "SP BIZ-9941", trans: "Manual", year: 2021, status: "Available" },
  { model: "Yamaha FZ-S V3", type: "Bike", reg: "WP BJA-2256", trans: "Manual", year: 2023, status: "In Service" },
  { model: "Honda CB Shine 125", type: "Bike", reg: "WP BJB-4467", trans: "Manual", year: 2022, status: "Available" }
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting Comprehensive Database Seeding...");
    await client.query("BEGIN");

    // 0. Fetch existing package IDs
    const pkgRes = await client.query("SELECT id, name, price FROM packages ORDER BY id ASC");
    const packages = pkgRes.rows;
    if (packages.length === 0) {
      throw new Error("No packages found. Run db_setup.js first.");
    }
    console.log(`📦 Available Packages: ${packages.length}`);

    // 1. Seed Instructors & User Accounts (30 Instructors)
    console.log("👨‍🏫 Seeding Instructors (30 records)...");
    const seededInstructors = [];

    for (let i = 0; i < INSTRUCTOR_DATA.length; i++) {
      const ins = INSTRUCTOR_DATA[i];
      const names = ins.name.split(" ");
      const firstName = names[0];
      const lastName = names.slice(1).join(" ") || "Instructor";
      const userId = `U_INS_${1000 + i}`;
      const instructorId = `I_INS_${1000 + i}`;
      const email = `instructor.${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@thesara.lk`;
      const phone = `+94 77 ${Math.floor(1000000 + Math.random() * 9000000)}`;
      const nic = `${1980 + (i % 20)}5${String(1000000 + i).slice(-7)}V`;
      const city = SRI_LANKAN_CITIES[i % SRI_LANKAN_CITIES.length];
      const address = `${i + 12}, ${STREET_NAMES[i % STREET_NAMES.length]}, ${city}`;

      // Insert User
      await client.query(`
        INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, tel_no, created_date, email_verified, status, address_line_1, city)
        VALUES ($1, $2, $3, $4, $5, 'Instructor', $6, now(), true, 'active', $7, $8)
        ON CONFLICT (user_id) DO UPDATE 
        SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, email = EXCLUDED.email, status = EXCLUDED.status
      `, [userId, firstName, lastName, email, DEFAULT_PASSWORD_HASH, phone, address, city]);

      // Insert Instructor
      await client.query(`
        INSERT INTO instructors (instructor_id, user_id, instructor_name, licence_no, instructor_reg_no, availability_status, approval_status, approved_by, approved_at, nic, specialization, pay_rate, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
        ON CONFLICT (instructor_id) DO UPDATE
        SET instructor_name = EXCLUDED.instructor_name, approval_status = EXCLUDED.approval_status, availability_status = EXCLUDED.availability_status, specialization = EXCLUDED.specialization, pay_rate = EXCLUDED.pay_rate
      `, [
        instructorId, 
        userId, 
        ins.name, 
        ins.license, 
        ins.reg, 
        ins.status === 'approved' ? 'Available' : 'Pending', 
        ins.status,
        ins.status === 'approved' ? 'U1769516002730' : null,
        ins.status === 'approved' ? new Date('2026-02-01') : null,
        nic,
        ins.spec,
        ins.pay
      ]);

      seededInstructors.push({ instructorId, userId, name: ins.name, status: ins.status, payRate: ins.pay });
    }
    console.log(`✅ Seeded ${seededInstructors.length} Instructors (Approved & Pending).`);

    const approvedInstructors = seededInstructors.filter(i => i.status === 'approved');

    // 2. Seed Vehicles (26 records)
    console.log("🚗 Seeding Fleet Vehicles (26 records)...");
    const seededVehicleIds = [];

    for (let i = 0; i < VEHICLE_DATA.length; i++) {
      const v = VEHICLE_DATA[i];
      const vehicleId = 100 + i;

      await client.query(`
        INSERT INTO vehicles (vehicle_id, model, type, registration_number, transmission, year, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (registration_number) DO UPDATE
        SET model = EXCLUDED.model, type = EXCLUDED.type, status = EXCLUDED.status, transmission = EXCLUDED.transmission
      `, [vehicleId, v.model, v.type, v.reg, v.trans, v.year, v.status]);

      // Assign vehicle to an approved instructor
      const assignedInstructor = approvedInstructors[i % approvedInstructors.length];
      const ivId = 200 + i;
      await client.query(`
        INSERT INTO instructor_vehicles (instructor_vehicle_id, instructor_id, vehicle_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (instructor_vehicle_id) DO UPDATE
        SET instructor_id = EXCLUDED.instructor_id, vehicle_id = EXCLUDED.vehicle_id
      `, [ivId, assignedInstructor.instructorId, vehicleId]);

      seededVehicleIds.push(vehicleId);
    }
    console.log(`✅ Seeded ${seededVehicleIds.length} Fleet Vehicles with Instructor assignments.`);

    // 3. Seed Students & Users (115 records)
    console.log("🎓 Seeding Students (115 realistic Sri Lankan profiles)...");
    const seededStudents = [];

    for (let i = 0; i < 115; i++) {
      const firstName = SRI_LANKAN_FIRST_NAMES[i % SRI_LANKAN_FIRST_NAMES.length];
      const lastName = SRI_LANKAN_LAST_NAMES[(i * 3 + 7) % SRI_LANKAN_LAST_NAMES.length];
      const userId = `U_STD_${1000 + i}`;
      const studentId = `S1778800${String(1000 + i)}`;
      
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}${100 + i}@gmail.com`;
      const phonePrefix = ["77", "71", "76", "70", "78", "75"][i % 6];
      const phone = `+94 ${phonePrefix} ${Math.floor(1000000 + Math.random() * 9000000)}`;

      // Format NIC: 50% 12-digit format, 50% 9-digit format with 'V'
      let nic;
      if (i % 2 === 0) {
        const birthYear = 1995 + (i % 10);
        nic = `${birthYear}${String(10000000 + i * 73).slice(-8)}`;
      } else {
        const birthYearOld = String(1990 + (i % 12)).slice(2);
        nic = `${birthYearOld}${String(1000000 + i * 37).slice(-6)}V`;
      }

      const city = SRI_LANKAN_CITIES[(i * 2) % SRI_LANKAN_CITIES.length];
      const address = `${i + 4}, ${STREET_NAMES[(i + 3) % STREET_NAMES.length]}, ${city}`;

      // Package selection
      const pkg = packages[i % packages.length];

      // Instructor assignment
      const assignedInstructor = approvedInstructors[i % approvedInstructors.length];

      // Status & Progress calculation
      let status;
      let progress = 0;
      let completionDate = null;
      const rand = Math.random();
      if (rand < 0.55) {
        status = 'Learning';
        progress = Math.floor(15 + Math.random() * 70);
      } else if (rand < 0.80) {
        status = 'Verified';
        progress = Math.floor(10 + Math.random() * 50);
      } else if (rand < 0.95) {
        status = 'Completed';
        progress = 100;
        completionDate = new Date('2026-10-15');
      } else {
        status = 'Pending';
        progress = 0;
      }

      // Registration date spread across 2026 (Jan to Oct)
      const regMonth = (i % 10) + 1; // 1 to 10
      const regDay = ((i * 3) % 27) + 1;
      const regDate = `2026-${String(regMonth).padStart(2, '0')}-${String(regDay).padStart(2, '0')}`;

      // Insert User
      await client.query(`
        INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, tel_no, created_date, email_verified, status, address_line_1, city)
        VALUES ($1, $2, $3, $4, $5, 'Student', $6, $7, true, 'active', $8, $9)
        ON CONFLICT (user_id) DO UPDATE
        SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, email = EXCLUDED.email, status = EXCLUDED.status
      `, [userId, firstName, lastName, email, DEFAULT_PASSWORD_HASH, phone, new Date(regDate), address, city]);

      // Insert Student
      await client.query(`
        INSERT INTO students (student_id, user_id, nic, address, registered_date, instructor_id, progress, status, package_id, completion_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (student_id) DO UPDATE
        SET nic = EXCLUDED.nic, address = EXCLUDED.address, registered_date = EXCLUDED.registered_date,
            instructor_id = EXCLUDED.instructor_id, progress = EXCLUDED.progress, status = EXCLUDED.status,
            package_id = EXCLUDED.package_id, completion_date = EXCLUDED.completion_date
      `, [studentId, userId, nic, address, regDate, assignedInstructor.instructorId, progress, status, pkg.id, completionDate]);

      seededStudents.push({
        studentId,
        userId,
        name: `${firstName} ${lastName}`,
        packageId: pkg.id,
        packagePrice: parseFloat(pkg.price),
        instructorId: assignedInstructor.instructorId,
        regDate,
        status
      });
    }
    console.log(`✅ Seeded ${seededStudents.length} Students with realistic profiles and package enrollments.`);

    // 4. Seed Payments & Transactions (130 records)
    console.log("💳 Seeding Payments & Dues (130 transactions)...");
    const paymentMethods = ["Cash", "Card", "Online Transfer", "Bank Deposit", "Cash/ADM"];

    for (let i = 0; i < seededStudents.length; i++) {
      const std = seededStudents[i];
      const pkgPrice = std.packagePrice;

      let paymentsToMake = [];

      if (i % 3 === 0) {
        // Full single payment
        paymentsToMake.push({ amount: pkgPrice, method: paymentMethods[i % paymentMethods.length], month: (i % 9) + 1 });
      } else if (i % 3 === 1) {
        // Two installments
        const inst1 = Math.round(pkgPrice * 0.5);
        const inst2 = pkgPrice - inst1;
        paymentsToMake.push({ amount: inst1, method: paymentMethods[i % paymentMethods.length], month: (i % 8) + 1 });
        if (i % 2 === 0) {
          paymentsToMake.push({ amount: inst2, method: paymentMethods[(i + 1) % paymentMethods.length], month: ((i % 8) + 2) });
        }
      } else {
        // Partial initial deposit
        const deposit = Math.min(pkgPrice, 7500);
        paymentsToMake.push({ amount: deposit, method: paymentMethods[i % paymentMethods.length], month: (i % 10) + 1 });
      }

      for (let pIdx = 0; pIdx < paymentsToMake.length; pIdx++) {
        const pmt = paymentsToMake[pIdx];
        const pmtId = `PMT_SEED_${std.studentId}_${pIdx}`;
        const pmtDay = ((i * 4 + pIdx * 11) % 27) + 1;
        const pmtDate = `2026-${String(pmt.month).padStart(2, '0')}-${String(pmtDay).padStart(2, '0')}`;
        const pmtTime = `${String(9 + (pIdx * 3)).padStart(2, '0')}:30:00`;

        await client.query(`
          INSERT INTO payments (payment_id, student_id, package_id, amount, payment_method, payment_date, payment_time, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'Completed')
          ON CONFLICT (payment_id) DO UPDATE
          SET amount = EXCLUDED.amount, payment_date = EXCLUDED.payment_date, status = EXCLUDED.status
        `, [pmtId, std.studentId, String(std.packageId), pmt.amount, pmt.method, pmtDate, pmtTime]);
      }
    }
    console.log(`✅ Seeded diverse Payments across 10 months with full, partial, and installment dues.`);

    // 5. Seed Attendance Table for October 2026 (270 daily records across dates 1 to 29)
    console.log("📋 Seeding Attendance Records for October 2026 (270 records)...");

    const sessionTimes = {
      1: '08:00 AM - 10:00 AM',
      2: '10:00 AM - 12:00 PM',
      3: '01:00 PM - 03:00 PM',
      4: '03:00 PM - 05:00 PM'
    };

    await client.query("DELETE FROM attendance WHERE EXTRACT(MONTH FROM attendance_date) = 10 AND EXTRACT(YEAR FROM attendance_date) = 2026");

    let attendanceCount = 0;
    for (let sIdx = 0; sIdx < Math.min(seededStudents.length, 60); sIdx++) {
      const student = seededStudents[sIdx];
      const scheduledDays = [2, 5, 8, 12, 16, 19, 23, 26, 28].filter((_, idx) => (idx + sIdx) % 3 === 0 || (idx + sIdx) % 4 === 0);

      for (const day of scheduledDays) {
        const attDate = `2026-10-${String(day).padStart(2, '0')}`;
        const sessionNum = ((sIdx + day) % 4) + 1;
        const timeSlot = sessionTimes[sessionNum];

        let status;
        const rand = (sIdx * 17 + day * 13) % 100;
        if (rand < 75) status = 'Present';
        else if (rand < 90) status = 'Late';
        else status = 'Absent';

        await client.query(`
          INSERT INTO attendance (student_id, instructor_id, attendance_date, status, session_number, time_slot, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, now())
        `, [
          student.studentId,
          student.instructorId,
          attDate,
          status,
          status === 'Absent' ? 1 : sessionNum,
          status === 'Absent' ? null : timeSlot
        ]);
        attendanceCount++;
      }
    }
    console.log(`✅ Seeded ${attendanceCount} Attendance Records across October 1-29 for Matrix and Audit Logs.`);

    // 6. Seed Lessons & Instructor Payouts (Realistic Instructor Earnings & Payables)
    console.log("📘 Seeding Lessons and Balanced Instructor Payouts...");
    await client.query("DELETE FROM lessons WHERE created_at >= '2026-01-01'");
    await client.query("DELETE FROM instructor_payouts WHERE payout_id >= 5000");

    for (let i = 0; i < approvedInstructors.length; i++) {
      const ins = approvedInstructors[i];
      const vehicleId = seededVehicleIds[i % seededVehicleIds.length];

      // Add 20 completed lessons per instructor (20 * payRate, e.g. 20 * 750 = 15,000)
      for (let l = 1; l <= 20; l++) {
        const std = seededStudents[(i * 3 + l) % seededStudents.length];
        const month = ((l % 10) + 1);
        const lsnDate = `2026-${String(month).padStart(2, '0')}-${String(((l * 3) % 27) + 1).padStart(2, '0')}`;
        await client.query(`
          INSERT INTO lessons (student_id, instructor_id, vehicle_id, lesson_date, session_number, status, created_at)
          VALUES ($1, $2, $3, $4, $5, 'Completed', now())
        `, [std.studentId, ins.instructorId, vehicleId, lsnDate, (l % 4) + 1]);
      }

      // Add payout of 11,500 LKR (leaving 3,500 LKR pending payable)
      const payoutId = 5000 + i;
      await client.query(`
        INSERT INTO instructor_payouts (payout_id, instructor_id, amount, payout_date, reference, status, created_at)
        VALUES ($1, $2, $3, $4, $5, 'Completed', now())
        ON CONFLICT (payout_id) DO UPDATE SET amount = EXCLUDED.amount
      `, [payoutId, ins.instructorId, 11500.00, '2026-10-20', `REF-PAYOUT-${payoutId}`]);
    }
    console.log("✅ Seeded Completed Lessons and Balanced Instructor Payouts.");

    // 7. Seed Upcoming Trial Exams
    console.log("📝 Seeding Upcoming Trial Exams (Nov - Dec 2026)...");
    const upcomingTrials = [
      { date: "2026-11-05", desc: "Light Vehicle Practical Trial - Werahera RMV", status: "Scheduled" },
      { date: "2026-11-15", desc: "Heavy Vehicle & Bus Trial - Gampaha RMV", status: "Scheduled" },
      { date: "2026-11-25", desc: "Motorcycle Balance & Highway Trial - Kalutara RMV", status: "Scheduled" },
      { date: "2026-12-05", desc: "Three-Wheeler & Auto Car Trial - Colombo North", status: "Scheduled" }
    ];

    for (const t of upcomingTrials) {
      await client.query(`
        INSERT INTO trial_exams (trial_date, description, status, created_at)
        VALUES ($1, $2, $3, now())
        ON CONFLICT (trial_date) DO UPDATE
        SET description = EXCLUDED.description, status = EXCLUDED.status
      `, [t.date, t.desc, t.status]);
    }
    console.log("✅ Seeded Upcoming Trial Exams.");

    // 8. Seed Recent Activity Logs
    console.log("🔔 Seeding Activity Logs (15 events)...");
    await client.query("DELETE FROM activity_logs");

    const sampleActivities = [
      { msg: "New student Kasun Perera enrolled in Car (auto) package", type: "STUDENT" },
      { msg: "Instructor Sunil Shantha completed practical lesson with Dilshan Madushanka", type: "LESSON" },
      { msg: "Payment of LKR 25,000 received for Standard Van Package", type: "PAYMENT" },
      { msg: "Vehicle WP CAD-7812 returned from scheduled maintenance", type: "FLEET" },
      { msg: "Trial exam session scheduled for 18 candidates on Nov 05", type: "TRIAL" },
      { msg: "Automated attendance synchronization verified for 48 candidates", type: "ATTENDANCE" },
      { msg: "Instructor application for Dunith Wellalage queued for verification", type: "STAFF" },
      { msg: "Student Sachini Dilrukshi completed RMV Trial readiness test", type: "STUDENT" },
      { msg: "Instructor payout of LKR 11,500 processed for Saumya Geethanath", type: "FINANCE" },
      { msg: "New vehicle Bajaj RE 4-Stroke added to active fleet (WP BAA-4011)", type: "FLEET" }
    ];

    for (let a = 0; a < sampleActivities.length; a++) {
      await client.query(`
        INSERT INTO activity_logs (message, type, created_at)
        VALUES ($1, $2, now() - INTERVAL '${a * 2} hours')
      `, [sampleActivities[a].msg, sampleActivities[a].type]);
    }
    console.log("✅ Seeded Activity Logs.");

    await client.query("COMMIT");
    console.log("\n🎉 ALL SEEDING SUCCESSFULLY COMMITTED TO DATABASE!");

    // Final verification summary
    const finalCounts = await Promise.all([
      client.query("SELECT COUNT(*) FROM users"),
      client.query("SELECT COUNT(*) FROM students"),
      client.query("SELECT COUNT(*) FROM instructors"),
      client.query("SELECT COUNT(*) FROM vehicles"),
      client.query("SELECT COUNT(*) FROM attendance"),
      client.query("SELECT COUNT(*) FROM payments"),
      client.query("SELECT COUNT(*) FROM trial_exams WHERE trial_date >= CURRENT_DATE")
    ]);

    console.log("\n================ DATABASE SUMMARY ================");
    console.log(`Users:            ${finalCounts[0].rows[0].count}`);
    console.log(`Students:         ${finalCounts[1].rows[0].count}`);
    console.log(`Instructors:      ${finalCounts[2].rows[0].count}`);
    console.log(`Vehicles:         ${finalCounts[3].rows[0].count}`);
    console.log(`Attendance:       ${finalCounts[4].rows[0].count}`);
    console.log(`Payments:         ${finalCounts[5].rows[0].count}`);
    console.log(`Upcoming Trials:  ${finalCounts[6].rows[0].count}`);
    console.log("===================================================\n");

    process.exit(0);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("⛔ SEEDING ERROR:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
