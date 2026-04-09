const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ================= GET EMPLOYEE DETAILS BY EMPLOYEE ID ================= */
router.get(
  "/employee-details/:employeeId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const employeeId = req.params.employeeId?.trim();

      if (!employeeId) {
        return res.status(400).json({
          message: "Employee ID is required",
        });
      }

      const result = await pool.query(
        `SELECT 
            id,
            employee_id,
            COALESCE(full_name, name) AS name,
            email,
            COALESCE(designation, job_title) AS job_title,
            COALESCE(department, dept) AS dept,
            LOWER(role) AS role
         FROM users
         WHERE employee_id = $1
           AND LOWER(role) IN ('employee', 'manager')`,
        [employeeId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.log("GET EMPLOYEE DETAILS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching employee details",
      });
    }
  }
);

/* ================= CREATE PAYROLL ================= */
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        employeeId,
        email,
        designation,
        department,
        month,
        basic,
        hra,
        conveyance,
        bonus,
        grossSalary,
        pf,
        esi,
        ptax,
        tds,
        totalDeductions,
        netSalary,
        annualGross,
        annualTaxableIncome,
        annualTax,
        employerPf,
        employerEsi,
      } = req.body;

      const cleanEmployeeId = employeeId?.trim();
      const cleanEmail = email?.trim();
      const cleanDesignation = designation?.trim();
      const cleanDepartment = department?.trim();
      const cleanMonth = month?.trim();

      if (
        !cleanEmployeeId ||
        !cleanEmail ||
        !cleanDesignation ||
        !cleanDepartment ||
        !cleanMonth
      ) {
        return res.status(400).json({
          message: "Employee details and month are required",
        });
      }

      const userResult = await pool.query(
        `SELECT 
            id,
            employee_id,
            COALESCE(full_name, name) AS name,
            email,
            COALESCE(designation, job_title) AS job_title,
            COALESCE(department, dept) AS dept,
            LOWER(role) AS role
         FROM users
         WHERE employee_id = $1
           AND LOWER(role) IN ('employee', 'manager')`,
        [cleanEmployeeId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const user = userResult.rows[0];

      if (
        user.email !== cleanEmail ||
        user.job_title !== cleanDesignation ||
        user.dept !== cleanDepartment
      ) {
        return res.status(400).json({
          message: "Employee details do not match employee record",
        });
      }

      const existingPayroll = await pool.query(
        `SELECT id
         FROM payrolls
         WHERE user_id = $1 AND month = $2`,
        [user.id, cleanMonth]
      );

      if (existingPayroll.rows.length > 0) {
        return res.status(409).json({
          message: "Payroll already exists for this employee and month",
        });
      }

      const result = await pool.query(
        `INSERT INTO payrolls
        (
          user_id,
          employee_id,
          email,
          designation,
          department,
          month,
          basic,
          hra,
          conveyance,
          bonus,
          gross_salary,
          pf,
          esi,
          ptax,
          tds,
          total_deductions,
          net_salary,
          annual_gross,
          annual_taxable_income,
          annual_tax,
          employer_pf,
          employer_esi
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
        )
        RETURNING *`,
        [
          user.id,
          cleanEmployeeId,
          cleanEmail,
          cleanDesignation,
          cleanDepartment,
          cleanMonth,
          Number(basic) || 0,
          Number(hra) || 0,
          Number(conveyance) || 0,
          Number(bonus) || 0,
          Number(grossSalary) || 0,
          Number(pf) || 0,
          Number(esi) || 0,
          Number(ptax) || 0,
          Number(tds) || 0,
          Number(totalDeductions) || 0,
          Number(netSalary) || 0,
          Number(annualGross) || 0,
          Number(annualTaxableIncome) || 0,
          Number(annualTax) || 0,
          Number(employerPf) || 0,
          Number(employerEsi) || 0,
        ]
      );

      return res.status(201).json({
        message: "Payroll created successfully ✅",
        payroll: result.rows[0],
      });
    } catch (error) {
      console.log("CREATE PAYROLL ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while creating payroll",
      });
    }
  }
);

/* ================= GET PAYROLL BY EMPLOYEE ID ================= */
router.get(
  "/employee/:employeeId",
  verifyToken,
  async (req, res) => {
    try {
      const employeeId = req.params.employeeId?.trim();

      if (!employeeId) {
        return res.status(400).json({
          message: "Employee ID is required",
        });
      }

      const userResult = await pool.query(
        `SELECT id, employee_id, LOWER(role) AS role
         FROM users
         WHERE employee_id = $1`,
        [employeeId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const user = userResult.rows[0];
      const loggedInRole = String(req.user.role || "").toLowerCase();

      if (loggedInRole !== "admin" && Number(req.user.id) !== Number(user.id)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      const result = await pool.query(
        `SELECT 
            p.id,
            u.employee_id,
            p.email,
            p.designation,
            p.department,
            p.month,
            p.basic,
            p.hra,
            p.conveyance,
            p.bonus,
            p.gross_salary,
            p.pf,
            p.esi,
            p.ptax,
            p.tds,
            p.total_deductions,
            p.net_salary,
            p.annual_gross,
            p.annual_taxable_income,
            p.annual_tax,
            p.employer_pf,
            p.employer_esi,
            p.created_at
         FROM payrolls p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC, p.id DESC`,
        [user.id]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET PAYROLL ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching payroll",
      });
    }
  }
);

/* ================= GET MY PAYROLLS ================= */
router.get(
  "/my-payrolls",
  verifyToken,
  authorizeRoles("employee", "manager"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            p.id,
            u.employee_id,
            p.email,
            p.designation,
            p.department,
            p.month,
            p.basic,
            p.hra,
            p.conveyance,
            p.bonus,
            p.gross_salary,
            p.pf,
            p.esi,
            p.ptax,
            p.tds,
            p.total_deductions,
            p.net_salary,
            p.annual_gross,
            p.annual_taxable_income,
            p.annual_tax,
            p.employer_pf,
            p.employer_esi,
            p.created_at
         FROM payrolls p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC, p.id DESC`,
        [req.user.id]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("MY PAYROLL ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching my payrolls",
      });
    }
  }
);

/* ================= DELETE PAYROLL ================= */
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const payrollId = req.params.id;

      const existing = await pool.query(
        "SELECT id FROM payrolls WHERE id = $1",
        [payrollId]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          message: "Payroll not found",
        });
      }

      await pool.query("DELETE FROM payrolls WHERE id = $1", [payrollId]);

      return res.status(200).json({
        message: "Payroll deleted successfully",
      });
    } catch (error) {
      console.log("DELETE PAYROLL ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while deleting payroll",
      });
    }
  }
);

/* ================= GET MY SLIPS ================= */
router.get(
  "/my-slips",
  verifyToken,
  authorizeRoles("employee", "manager"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            p.id,
            u.employee_id,
            p.email,
            p.designation,
            p.department,
            p.month,
            p.basic,
            p.hra,
            p.conveyance,
            p.bonus,
            p.gross_salary,
            p.pf,
            p.esi,
            p.ptax,
            p.tds,
            p.total_deductions,
            p.net_salary,
            p.annual_gross,
            p.annual_taxable_income,
            p.annual_tax,
            p.employer_pf,
            p.employer_esi,
            p.created_at
         FROM payrolls p
         JOIN users u ON u.id = p.user_id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC, p.id DESC`,
        [req.user.id]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("MY SLIPS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching salary slips",
      });
    }
  }
);

module.exports = router;