const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const pool = require("../config/db");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* ================= COMMON RESPONSE FORMAT ================= */
const sendResponse = (res, status, message, data = null) => {
  return res.status(status).json({
    success: status < 400,
    message,
    data,
  });
};

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  let client;

  try {
    client = await pool.connect();

    const {
      name,
      dept,
      jobTitle,
      startDate,
      category,
      gender,
      actions,
      email,
      phone,
      password,
      confirmPassword,
    } = req.body;

    if (
      !name ||
      !dept ||
      !jobTitle ||
      !startDate ||
      !category ||
      !gender ||
      !actions
    ) {
      return res.status(400).json({
        message: "All employee fields are required",
      });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Valid email required" });
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Valid 10-digit phone required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔍 STEP 1: Find rejected employee IDs for reuse
    const rejectedEmployees = await client.query(
      `SELECT id, employee_id
       FROM users
       WHERE approval_status = 'rejected'
         AND employee_id IS NOT NULL
       ORDER BY id ASC
       LIMIT 1
       FOR UPDATE`
    );

    let employeeId;

    if (rejectedEmployees.rows.length > 0) {
      // ♻️ REUSE rejected ID WITHOUT deleting old row
      const rejectedUserId = rejectedEmployees.rows[0].id;
      employeeId = rejectedEmployees.rows[0].employee_id;

      await client.query(
        `UPDATE users
         SET name = $1,
             dept = $2,
             job_title = $3,
             start_date = $4,
             category = $5,
             gender = $6,
             actions = $7,
             email = $8,
             phone = $9,
             password = $10,
             role = $11,
             employee_id = $12,
             approval_status = $13,
             reset_token = NULL,
             reset_token_expiry = NULL
         WHERE id = $14`,
        [
          name,
          dept,
          jobTitle,
          startDate,
          category,
          gender,
          actions,
          email,
          phone,
          hashedPassword,
          "employee",
          employeeId,
          "pending",
          rejectedUserId,
        ]
      );
    } else {
      // 🔢 NORMAL SEQUENCE
      const lastEmployee = await client.query(
        `SELECT employee_id
         FROM users
         WHERE employee_id IS NOT NULL
         ORDER BY CAST(REGEXP_REPLACE(employee_id, '^.*-', '') AS INTEGER) DESC
         LIMIT 1
         FOR UPDATE`
      );

      if (lastEmployee.rows.length === 0) {
        employeeId = "PA-EMP-1000";
      } else {
        const lastId = lastEmployee.rows[0].employee_id;
        const lastNumber = parseInt(lastId.split("-").pop(), 10) || 999;
        const newNumber = lastNumber + 1;
        employeeId = `PA-EMP-${newNumber}`;
      }

      await client.query(
        `INSERT INTO users
        (
          name,
          dept,
          job_title,
          start_date,
          category,
          gender,
          actions,
          email,
          phone,
          password,
          role,
          employee_id,
          approval_status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          name,
          dept,
          jobTitle,
          startDate,
          category,
          gender,
          actions,
          email,
          phone,
          hashedPassword,
          "employee",
          employeeId,
          "pending",
        ]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message:
        "Account created successfully. Wait for admin approval before login.",
      employeeId,
      approval_status: "pending",
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("❌ REGISTER ERROR:", err.message);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "Duplicate employee ID, please try again",
      });
    }

    return res.status(500).json({ message: "Server error" });
  } finally {
    if (client) client.release();
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required",
      });
    }

    const requestedRole = String(role).trim().toLowerCase();

    const result = await pool.query(
      `SELECT 
        id,
        name,
        email,
        password,
        role,
        employee_id,
        dept,
        job_title,
        approval_status
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const actualRole = String(user.role || "").trim().toLowerCase();

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    /*
      LOGIN RULES
      - admin login page -> only admin
      - employee login page -> employee + manager
    */
    if (requestedRole === "admin") {
      if (actualRole !== "admin") {
        return res.status(403).json({
          message: "Access denied for this login page",
        });
      }
    } else if (requestedRole === "employee") {
      if (!["employee", "manager"].includes(actualRole)) {
        return res.status(403).json({
          message: "Access denied for this login page",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid login role",
      });
    }

    // approval check for employee + manager using employee login flow
    if (["employee", "manager"].includes(actualRole)) {
      if (user.approval_status === "pending") {
        return res.status(403).json({
          message: "Your account is waiting for admin approval",
        });
      }

      if (user.approval_status === "rejected") {
        return res.status(403).json({
          message: "Your account has been rejected by admin",
        });
      }

      if (user.approval_status !== "approved") {
        return res.status(403).json({
          message: "Your account is not approved yet",
        });
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: actualRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: actualRole,
        employee_id: user.employee_id,
        dept: user.dept,
        job_title: user.job_title,
        approval_status: user.approval_status,
      },
      redirectTo:
        actualRole === "admin" ? "/admindashboard" : "/employeedashboard",
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return sendResponse(res, 400, "Email required");

    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    // Always return same message for security
    if (result.rows.length === 0) {
      return sendResponse(res, 200, "If email exists, reset link sent");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET reset_token = $1,
           reset_token_expiry = $2
       WHERE email = $3`,
      [token, expiry, email]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset/${token}`;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    });

    console.log("✅ RESET EMAIL SENT to:", email);

    return sendResponse(res, 200, "If email exists, reset link sent");
  } catch (err) {
    console.error("❌ FORGOT PASSWORD ERROR:", err);
    return sendResponse(res, 500, "Failed to send reset email");
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return sendResponse(res, 400, "Password must be at least 6 characters");
    }

    const user = await pool.query(
      `SELECT id, role
       FROM users
       WHERE reset_token = $1
         AND reset_token_expiry > NOW()`,
      [token]
    );

    if (user.rows.length === 0) {
      return sendResponse(res, 400, "Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query(
      `UPDATE users
       SET password = $1,
           reset_token = NULL,
           reset_token_expiry = NULL
       WHERE reset_token = $2`,
      [hashedPassword, token]
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      role: user.rows[0].role,
    });
  } catch (err) {
    console.error("❌ RESET PASSWORD ERROR:", err.message);
    return sendResponse(res, 500, "Server error");
  }
};