const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const sendEmail = require("../utils/sendEmail");
const { passwordResetTemplate, studentVerificationTemplate } = require("../utils/emailTemplates");

function makeId(prefix) {
  return `${prefix}${Date.now()}`;
}

exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    nic,
    position, // "student" or "instructor"
    instructorRegNumber,
    specialization,
    password,
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !addressLine1 || !city || !nic || !position || !password) {
    return res.status(400).json({ ok: false, message: "Missing required fields" });
  }

  if (position === "instructor" && !instructorRegNumber) {
    return res.status(400).json({ ok: false, message: "Instructor registration number required" });
  }

  const client = await pool.connect();
  try {
    // 1. Initial Uniqueness Checks
    const emailCheck = await client.query("SELECT 1 FROM users WHERE email=$1", [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({ ok: false, message: "Email already registered" });
    }

    let documentPath = null;
    const instructorId = position === "instructor" ? makeId("I") : null;
    const userId = makeId("U");
    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Supabase Upload (if instructor)
    if (position === "instructor" && req.file) {
      try {
        const fileBuffer = req.file.buffer;
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const { error: uploadError } = await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .upload(`verification/${fileName}`, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .getPublicUrl(`verification/${fileName}`);

        documentPath = publicUrl;
      } catch (uploadErr) {
        console.error("Document upload failed:", uploadErr);
        return res.status(500).json({ ok: false, message: "Failed to upload verification document: " + uploadErr.message });
      }
    }

    // 3. Database Updates
    await client.query("BEGIN");

    const role = position === "instructor" ? "Instructor" : "Student";
    const initialStatus = 'pending';
    const initialVerified = false;

    await client.query(
      `INSERT INTO users (user_id, first_name, last_name, email, password_hash, role, tel_no, status, email_verified, created_date, address_line_1, address_line_2, city)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), $10, $11, $12)`,
      [userId, firstName, lastName, email, passwordHash, role, phone, initialStatus, initialVerified, addressLine1, addressLine2, city]
    );

    if (position === "student") {
      const studentId = makeId("S");
      const fullAddress = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}`;

      await client.query(
        `INSERT INTO students (student_id, user_id, nic, address, registered_date, status, progress)
         VALUES ($1,$2,$3,$4, CURRENT_DATE, 'pending', 0)`,
        [studentId, userId, nic, fullAddress]
      );

      // Generate Verification Token & Send Email
      const verifyToken = jwt.sign(
        { userId, email, role: "Student", type: "email_verification" },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "1d" }
      );
      const verifyLink = `http://localhost:3000/auth/verify-email/${verifyToken}`;

      try {
        await sendEmail({
          email: email,
          subject: "Verify Your Account - Thisara Driving School",
          html: studentVerificationTemplate(verifyLink)
        });
      } catch (emailErr) {
        console.error("Warning: Could not send verification email:", emailErr);
      }

    } else {
      await client.query(
        `INSERT INTO instructors (
           instructor_id,
           user_id,
           instructor_name,
           licence_no,
           instructor_reg_no,
           nic,
           verification_document,
           availability_status,
           approval_status,
           specialization
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,'Available','pending',$8)`,
        [instructorId, userId, `${firstName} ${lastName}`, `LIC-${Date.now()}`, instructorRegNumber, nic, documentPath, specialization]
      );
    }

    // Log Activity
    await client.query(
      "INSERT INTO activity_logs (message, type) VALUES ($1, 'registration')",
      [`New ${position} registered: ${firstName} ${lastName}`]
    );

    await client.query("COMMIT");
    return res.json({
      ok: true,
      message: position === "instructor" 
        ? "Instructor registration submitted (pending admin approval)"
        : "Student account created successfully (pending admin approval)",
      userId,
      status: "pending",
    });

  } catch (err) {
    console.error("❌ REGISTRATION DATABASE ERROR:", err);
    if (client) await client.query("ROLLBACK");
    return res.status(500).json({ ok: false, message: "Registration failed: " + err.message });
  } finally {
    if (client) client.release();
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ ok: false, message: "Verification token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const userId = decoded.userId;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Set user status to active
      const userRes = await client.query(
        "UPDATE users SET status = 'active', email_verified = true WHERE user_id = $1 RETURNING first_name",
        [userId]
      );

      if (userRes.rowCount === 0) {
        throw new Error("User not found");
      }

      // Ensure instructor approval status is approved (already set by admin, but good to sync)
      await client.query(
        "UPDATE instructors SET approval_status = 'approved' WHERE user_id = $1",
        [userId]
      );

      await client.query("COMMIT");
      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #070a10; color: white; height: 100vh;">
          <h1 style="color: #E11B22;">Email Verified!</h1>
          <p>Congratulations, your account is now active.</p>
          <p>You can now log in to the Thisara Driving School Instructor Dashboard.</p>
          <a href="http://localhost:5173/login" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #E11B22; color: white; text-decoration: none; border-radius: 8px;">Login Now</a>
        </div>
      `);
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(400).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #070a10; color: white; height: 100vh;">
        <h1 style="color: #E11B22;">Link Expired</h1>
        <p>This verification link is invalid or has expired.</p>
        <p>Please contact the administrator if you need assistance.</p>
      </div>
    `);
  }
};

exports.login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, password_hash, role, email_verified, status
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ ok: false, message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Status Check
    if (user.status === "pending") {
      const message = user.role === "Student" 
        ? "Access Denied: Please verify your email address before logging in."
        : "Your account is pending admin approval. We will notify you via email.";
      
      return res.status(403).json({ ok: false, message });
    }
    if (user.status === "rejected") {
      return res.status(403).json({ ok: false, message: "Account registration rejected" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "Invalid email or password" });
    }

    if (user.role === "Instructor") {
      const ins = await pool.query(
        `SELECT approval_status
         FROM instructors
         WHERE user_id = $1`,
        [user.user_id]
      );

      if (ins.rowCount === 0) {
        return res.status(403).json({ ok: false, message: "Instructor record not found" });
      }

      // THE NEW STRICT CHECK
      if (user.status === "approved") {
        return res.status(403).json({
          ok: false,
          message: "Account approved, but email verification is pending. Please check your inbox.",
        });
      }

      if (user.status !== "active") {
        return res.status(403).json({
          ok: false,
          message: `Access denied. Your account status is: ${user.status}`,
        });
      }
    }

    const expiresIn = rememberMe ? "30d" : "1d";

    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn }
    );

    return res.json({
      ok: true,
      message: "Login successful",
      token,
      user: {
        userId: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ ok: false, message: "Email is required" });
  }

  try {
    const result = await pool.query(
      `SELECT user_id, first_name, email FROM users WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      // Logically return true to prevent email enumeration/harvesting attacks
      return res.json({ ok: true, message: "If that email is registered, a reset link was sent." });
    }

    const user = result.rows[0];

    // Generate secure 1h Token
    const resetToken = jwt.sign(
      { userId: user.user_id, email: user.email, type: "password_reset" },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1h" }
    );

    const resetLink = `http://localhost:5173/reset-password-final?token=${resetToken}`;

    // Dispatch Email
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - Thisara Driving School",
      html: passwordResetTemplate(resetLink)
    });

    return res.json({
      ok: true,
      message: "If that email is registered, a reset link was sent.",
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ ok: false, message: "Server error handling password reset." });
  }
};

// Fetch Public User Profile (Centralized)
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, role, status, tel_no, created_date,
              address_line_1, address_line_2, city
       FROM users 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};


