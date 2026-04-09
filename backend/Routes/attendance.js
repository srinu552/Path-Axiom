const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ================= GET TODAY ================= */
router.get("/today", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toLocaleDateString("en-CA");

    const result = await pool.query(
      "SELECT * FROM attendance WHERE user_id = $1 AND date = $2",
      [userId, today]
    );

    res.status(200).json({
      success: true,
      attendance: result.rows[0] || null,
    });
  } catch (error) {
    console.log("GET TODAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching today's attendance",
    });
  }
});

/* ================= CLOCK IN ================= */
router.post("/clock-in", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toLocaleDateString("en-CA");

    const existing = await pool.query(
      "SELECT * FROM attendance WHERE user_id = $1 AND date = $2",
      [userId, today]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Already Clocked In Today ❌",
      });
    }

    await pool.query(
      "INSERT INTO attendance (user_id, date, login, status) VALUES ($1, $2, $3, $4)",
      [userId, today, now, "Present"]
    );

    res.status(200).json({
      success: true,
      message: "Clocked In Successfully ✅",
    });
  } catch (error) {
    console.log("CLOCK IN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error while clocking in",
    });
  }
});

/* ================= CLOCK OUT ================= */
router.post("/clock-out", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toLocaleDateString("en-CA");

    const result = await pool.query(
      "SELECT * FROM attendance WHERE user_id = $1 AND date = $2",
      [userId, today]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "You have not Clocked In ❌",
      });
    }

    const attendance = result.rows[0];

    if (attendance.logout) {
      return res.status(400).json({
        success: false,
        message: "Already Clocked Out ❌",
      });
    }

    const loginTime = new Date(attendance.login);
    const diffMs = now - loginTime;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const duration = `${hours}h ${minutes}m`;

    await pool.query(
      "UPDATE attendance SET logout = $1, duration = $2 WHERE id = $3",
      [now, duration, attendance.id]
    );

    res.status(200).json({
      success: true,
      message: "Clocked Out Successfully ✅",
    });
  } catch (error) {
    console.log("CLOCK OUT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error while clocking out",
    });
  }
});

/* ================= ADMIN - VIEW ALL ================= */
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT 
        users.id AS user_id,
        users.name,
        users.email,
        TO_CHAR(attendance.date, 'YYYY-MM-DD') AS date,
        attendance.login AS login_time,
        attendance.logout AS logout_time,
        attendance.duration,
        attendance.status
      FROM attendance
      INNER JOIN users ON attendance.user_id = users.id
      WHERE users.role IN ('employee', 'manager')   -- ← added manager
      ORDER BY attendance.date DESC, attendance.id DESC
    `);

      res.status(200).json(result.rows);
    } catch (error) {
      console.log("ADMIN ATTENDANCE ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching all attendance",
      });
    }
  }
);

module.exports = router;
