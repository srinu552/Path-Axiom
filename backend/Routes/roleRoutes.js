const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ================= GET EMPLOYEE BY EMPLOYEE ID ================= */
router.get(
  "/employee/:employeeId",
  verifyToken,
  authorizeRoles("admin", "hr"),
  async (req, res) => {
    try {
      const { employeeId } = req.params;

      const result = await pool.query(
        `SELECT id, employee_id, name, email, dept, job_title, role
         FROM users
         WHERE employee_id = $1`,
        [employeeId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.log("GET EMPLOYEE ERROR:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= UPDATE ROLE BY EMPLOYEE ID ================= */
router.put(
  "/promote",
  verifyToken,
  authorizeRoles("admin", "hr"),
  async (req, res) => {
    try {
      const { employeeId, newRole } = req.body;

      if (!employeeId || !newRole) {
        return res.status(400).json({
          message: "Employee ID and new role are required",
        });
      }

      const allowedRoles = ["employee", "teamlead", "manager", "hr", "admin"];

      if (!allowedRoles.includes(newRole)) {
        return res.status(400).json({ message: "Invalid role selected" });
      }

      const result = await pool.query(
        `UPDATE users
         SET role = $1
         WHERE employee_id = $2
         RETURNING id, employee_id, name, role`,
        [newRole, employeeId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({
        message: `Role updated successfully to ${newRole}`,
        user: result.rows[0],
      });
    } catch (error) {
      console.log("UPDATE ROLE ERROR:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;