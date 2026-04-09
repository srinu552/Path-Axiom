const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ================= GET EMPLOYEES FOR MANAGER REVIEW (TEAM BASED) ================= */
router.get(
  "/employees",
  verifyToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const managerResult = await pool.query(
        `SELECT id, team_id
         FROM users
         WHERE id = $1 AND LOWER(role) = 'manager'`,
        [req.user.id]
      );

      if (managerResult.rows.length === 0) {
        return res.status(404).json({
          message: "Manager not found",
        });
      }

      const manager = managerResult.rows[0];

      if (!manager.team_id) {
        return res.status(200).json([]);
      }

      const result = await pool.query(
        `SELECT 
            u.id,
            u.employee_id,
            COALESCE(u.full_name, u.name) AS name,
            u.email,
            COALESCE(u.department, u.dept) AS dept,
            COALESCE(u.designation, u.job_title) AS job_title,
            LOWER(u.role) AS role,
            u.team_id,
            t.name AS team_name
         FROM users u
         LEFT JOIN teams t ON t.id = u.team_id
         WHERE LOWER(u.role) = 'employee'
           AND u.team_id = $1
         ORDER BY u.id ASC`,
        [manager.team_id]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET EMPLOYEES FOR MANAGER ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching team employees",
      });
    }
  }
);

/* ================= MANAGER REVIEW EMPLOYEE (TEAM BASED) ================= */
router.post(
  "/manager-review",
  verifyToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { revieweeId, rating, comments } = req.body;

      if (!revieweeId || !rating) {
        return res.status(400).json({
          message: "Employee and rating are required",
        });
      }

      const parsedRating = Number(rating);

      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      const managerResult = await pool.query(
        `SELECT id, team_id
         FROM users
         WHERE id = $1 AND LOWER(role) = 'manager'`,
        [req.user.id]
      );

      if (managerResult.rows.length === 0) {
        return res.status(404).json({
          message: "Manager not found",
        });
      }

      const manager = managerResult.rows[0];

      const revieweeResult = await pool.query(
        `SELECT id, team_id, LOWER(role) AS role
         FROM users
         WHERE id = $1`,
        [revieweeId]
      );

      if (revieweeResult.rows.length === 0) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      const reviewee = revieweeResult.rows[0];

      if (reviewee.role !== "employee") {
        return res.status(400).json({
          message: "Manager can review only employees",
        });
      }

      if (!manager.team_id || manager.team_id !== reviewee.team_id) {
        return res.status(403).json({
          message: "You can review only employees from your team",
        });
      }

      const result = await pool.query(
        `INSERT INTO performance_reviews
         (
           reviewer_id,
           reviewee_id,
           reviewer_role,
           reviewee_role,
           review_type,
           rating,
           comments
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          req.user.id,
          revieweeId,
          "manager",
          "employee",
          "manager_review",
          parsedRating,
          comments?.trim() || null,
        ]
      );

      return res.status(201).json({
        message: "Employee review submitted successfully",
        review: result.rows[0],
      });
    } catch (error) {
      console.log("MANAGER REVIEW ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while submitting employee review",
      });
    }
  }
);

/* ================= GET MANAGERS FOR ADMIN REVIEW ================= */
router.get(
  "/managers",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            u.id,
            u.employee_id,
            COALESCE(u.full_name, u.name) AS name,
            u.email,
            COALESCE(u.department, u.dept) AS dept,
            COALESCE(u.designation, u.job_title) AS job_title,
            LOWER(u.role) AS role,
            u.team_id,
            t.name AS team_name
         FROM users u
         LEFT JOIN teams t ON t.id = u.team_id
         WHERE LOWER(u.role) = 'manager'
         ORDER BY u.id ASC`
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET MANAGERS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching managers",
      });
    }
  }
);

/* ================= GET MANAGER APPRAISAL DETAILS FOR ADMIN ================= */
router.get(
  "/manager-appraisal/:managerId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { managerId } = req.params;

      const managerCheck = await pool.query(
        `SELECT 
            u.id,
            LOWER(u.role) AS role,
            u.team_id,
            t.name AS team_name
         FROM users u
         LEFT JOIN teams t ON t.id = u.team_id
         WHERE u.id = $1`,
        [managerId]
      );

      if (managerCheck.rows.length === 0) {
        return res.status(404).json({
          message: "Manager not found",
        });
      }

      if (managerCheck.rows[0].role !== "manager") {
        return res.status(400).json({
          message: "Selected user is not a manager",
        });
      }

      const result = await pool.query(
        `SELECT
            ea.id,
            ea.employee_id_fk AS "managerId",
            u.employee_id,
            COALESCE(u.full_name, u.name) AS name,
            u.email,
            COALESCE(u.department, u.dept) AS dept,
            COALESCE(u.designation, u.job_title) AS job_title,
            u.team_id,
            t.name AS team_name,
            ea.review_period AS "reviewPeriod",
            ea.project_name AS "projectName",
            ea.task_title AS "taskTitle",
            ea.task_description AS "taskDescription",
            ea.achievements,
            ea.challenges,
            ea.skills_improved AS "skillsImproved",
            ea.manager_support AS "managerSupport",
            ea.self_rating AS rating,
            ea.goals,
            ea.status,
            ea.created_at AS "createdAt",
            ea.updated_at AS "updatedAt"
         FROM employee_appraisals ea
         JOIN users u ON u.id = ea.employee_id_fk
         LEFT JOIN teams t ON t.id = u.team_id
         WHERE ea.employee_id_fk = $1
           AND LOWER(u.role) = 'manager'
         ORDER BY ea.created_at DESC, ea.id DESC
         LIMIT 1`,
        [managerId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "No appraisal submitted for this manager yet",
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.log("GET MANAGER APPRAISAL DETAILS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching manager appraisal details",
      });
    }
  }
);

/* ================= ADMIN REVIEW MANAGER ================= */
router.post(
  "/admin-review",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { revieweeId, rating, comments } = req.body;

      if (!revieweeId || !rating) {
        return res.status(400).json({
          message: "Manager and rating are required",
        });
      }

      const parsedRating = Number(rating);

      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      const revieweeResult = await pool.query(
        `SELECT id, LOWER(role) AS role
         FROM users
         WHERE id = $1`,
        [revieweeId]
      );

      if (revieweeResult.rows.length === 0) {
        return res.status(404).json({
          message: "Manager not found",
        });
      }

      const reviewee = revieweeResult.rows[0];

      if (reviewee.role !== "manager") {
        return res.status(400).json({
          message: "Admin can review only managers here",
        });
      }

      const result = await pool.query(
        `INSERT INTO performance_reviews
         (
           reviewer_id,
           reviewee_id,
           reviewer_role,
           reviewee_role,
           review_type,
           rating,
           comments
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          req.user.id,
          revieweeId,
          "admin",
          "manager",
          "admin_review",
          parsedRating,
          comments?.trim() || null,
        ]
      );

      return res.status(201).json({
        message: "Manager review submitted successfully",
        review: result.rows[0],
      });
    } catch (error) {
      console.log("ADMIN REVIEW ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while submitting manager review",
      });
    }
  }
);

/* ================= ADMIN GET ALL REVIEWS (TEAM + APPRAISAL + MNC DETAILS) ================= */
router.get(
  "/all",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
            pr.id,
            pr.review_type,
            pr.rating,
            pr.comments,
            pr.created_at,
            pr.reviewer_role,
            pr.reviewee_role,

            reviewer.employee_id AS reviewer_employee_id,
            COALESCE(reviewer.full_name, reviewer.name) AS reviewer_name,
            COALESCE(reviewer.department, reviewer.dept) AS reviewer_dept,
            COALESCE(reviewer.designation, reviewer.job_title) AS reviewer_job_title,

            reviewee.employee_id AS reviewee_employee_id,
            COALESCE(reviewee.full_name, reviewee.name) AS reviewee_name,
            COALESCE(reviewee.department, reviewee.dept) AS reviewee_dept,
            COALESCE(reviewee.designation, reviewee.job_title) AS reviewee_job_title,
            reviewee.team_id,
            t.name AS team_name,

            ea.review_period,
            ea.project_name,
            ea.task_title,
            ea.task_description,
            ea.achievements,
            ea.challenges,
            ea.skills_improved,
            ea.manager_support,
            ea.goals,
            ea.status AS appraisal_status,
            ea.updated_at

         FROM performance_reviews pr
         JOIN users reviewer ON reviewer.id = pr.reviewer_id
         JOIN users reviewee ON reviewee.id = pr.reviewee_id
         LEFT JOIN teams t ON t.id = reviewee.team_id

         LEFT JOIN LATERAL (
           SELECT
               e.review_period,
               e.project_name,
               e.task_title,
               e.task_description,
               e.achievements,
               e.challenges,
               e.skills_improved,
               e.manager_support,
               e.goals,
               e.status,
               e.updated_at
           FROM employee_appraisals e
           WHERE e.employee_id_fk = pr.reviewee_id
           ORDER BY e.created_at DESC, e.id DESC
           LIMIT 1
         ) ea ON true

         ORDER BY pr.created_at DESC, pr.id DESC`
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET ALL REVIEWS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching all reviews",
      });
    }
  }
);

module.exports = router;