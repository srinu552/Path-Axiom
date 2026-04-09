const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ================= GET LOGGED-IN ADMIN / HR PROFILE ================= */
router.get(
  "/profile",
  verifyToken,
  authorizeRoles("admin", "hr", "superadmin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
           id,
           full_name AS "fullName",
           email,
           phone,
           department,
           designation,
           role
         FROM users
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.log("GET PROFILE ERROR:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= UPDATE LOGGED-IN ADMIN / HR PROFILE ================= */
router.put(
  "/profile",
  verifyToken,
  authorizeRoles("admin", "hr", "superadmin"),
  async (req, res) => {
    try {
      const { fullName, email, phone, department, designation } = req.body;

      if (!fullName || !email) {
        return res.status(400).json({
          message: "Full name and email are required",
        });
      }

      const result = await pool.query(
        `UPDATE users
         SET 
           full_name = $1,
           email = $2,
           phone = $3,
           department = $4,
           designation = $5
         WHERE id = $6
         RETURNING
           id,
           full_name AS "fullName",
           email,
           phone,
           department,
           designation,
           role`,
        [fullName, email, phone, department, designation, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      console.log("UPDATE PROFILE ERROR:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;