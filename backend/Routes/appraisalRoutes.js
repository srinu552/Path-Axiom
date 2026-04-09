const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const appraisalSelect = `
  SELECT
    id,
    employee_id_fk AS "employeeUserId",
    employee_name AS "employeeName",
    employee_code AS "employeeId",
    department,
    designation,
    review_period AS "reviewPeriod",
    project_name AS "projectName",
    task_title AS "taskTitle",
    task_description AS "taskDescription",
    achievements,
    challenges,
    skills_improved AS "skillsImproved",
    manager_support AS "managerSupport",
    self_rating AS rating,
    goals,
    status,
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM employee_appraisals
`;

router.get(
  "/my-details",
  verifyToken,
  authorizeRoles("employee", "manager"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
          id,
          COALESCE(full_name, name) AS name,
          employee_id,
          COALESCE(department, dept) AS department,
          COALESCE(designation, job_title) AS designation,
          LOWER(role) AS role,
          email
        FROM users
        WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.log("GET MY DETAILS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching user details",
      });
    }
  }
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("employee", "manager"),
  async (req, res) => {
    try {
      const {
        employeeName,
        employeeId,
        department,
        designation,
        reviewPeriod,
        projectName,
        taskTitle,
        taskDescription,
        achievements,
        challenges,
        skillsImproved,
        managerSupport,
        rating,
        goals,
      } = req.body;

      if (
        !employeeName ||
        !employeeId ||
        !department ||
        !designation ||
        !reviewPeriod ||
        !projectName ||
        !taskTitle ||
        !taskDescription ||
        !achievements ||
        !rating ||
        !goals
      ) {
        return res.status(400).json({
          message: "Please fill all required fields",
        });
      }

      const parsedRating = Number(rating);

      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          message: "Self rating must be between 1 and 5",
        });
      }

      const result = await pool.query(
        `INSERT INTO employee_appraisals
        (
          employee_id_fk,
          employee_name,
          employee_code,
          department,
          designation,
          review_period,
          project_name,
          task_title,
          task_description,
          achievements,
          challenges,
          skills_improved,
          manager_support,
          self_rating,
          goals,
          status
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING
          id,
          employee_id_fk AS "employeeUserId",
          employee_name AS "employeeName",
          employee_code AS "employeeId",
          department,
          designation,
          review_period AS "reviewPeriod",
          project_name AS "projectName",
          task_title AS "taskTitle",
          task_description AS "taskDescription",
          achievements,
          challenges,
          skills_improved AS "skillsImproved",
          manager_support AS "managerSupport",
          self_rating AS rating,
          goals,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"`,
        [
          req.user.id,
          employeeName.trim(),
          employeeId.trim(),
          department.trim(),
          designation.trim(),
          reviewPeriod.trim(),
          projectName.trim(),
          taskTitle.trim(),
          taskDescription.trim(),
          achievements.trim(),
          challenges?.trim() || null,
          skillsImproved?.trim() || null,
          managerSupport?.trim() || null,
          parsedRating,
          goals.trim(),
          "Submitted",
        ]
      );

      return res.status(201).json({
        message: "Appraisal submitted successfully",
        appraisal: result.rows[0],
      });
    } catch (error) {
      console.log("CREATE APPRAISAL ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while submitting appraisal",
      });
    }
  }
);

router.get(
  "/my",
  verifyToken,
  authorizeRoles("employee", "manager"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `${appraisalSelect}
         WHERE employee_id_fk = $1
         ORDER BY created_at DESC, id DESC`,
        [req.user.id]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET MY APPRAISALS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching appraisals",
      });
    }
  }
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("employee", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        employeeName,
        employeeId,
        department,
        designation,
        reviewPeriod,
        projectName,
        taskTitle,
        taskDescription,
        achievements,
        challenges,
        skillsImproved,
        managerSupport,
        rating,
        goals,
      } = req.body;

      if (
        !employeeName ||
        !employeeId ||
        !department ||
        !designation ||
        !reviewPeriod ||
        !projectName ||
        !taskTitle ||
        !taskDescription ||
        !achievements ||
        !rating ||
        !goals
      ) {
        return res.status(400).json({
          message: "Please fill all required fields",
        });
      }

      const parsedRating = Number(rating);

      if (parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
          message: "Self rating must be between 1 and 5",
        });
      }

      const ownCheck = await pool.query(
        `SELECT id
         FROM employee_appraisals
         WHERE id = $1 AND employee_id_fk = $2`,
        [id, req.user.id]
      );

      if (ownCheck.rows.length === 0) {
        return res.status(404).json({
          message: "Appraisal not found",
        });
      }

      const result = await pool.query(
        `UPDATE employee_appraisals
         SET
           employee_name = $1,
           employee_code = $2,
           department = $3,
           designation = $4,
           review_period = $5,
           project_name = $6,
           task_title = $7,
           task_description = $8,
           achievements = $9,
           challenges = $10,
           skills_improved = $11,
           manager_support = $12,
           self_rating = $13,
           goals = $14,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $15 AND employee_id_fk = $16
         RETURNING
           id,
           employee_id_fk AS "employeeUserId",
           employee_name AS "employeeName",
           employee_code AS "employeeId",
           department,
           designation,
           review_period AS "reviewPeriod",
           project_name AS "projectName",
           task_title AS "taskTitle",
           task_description AS "taskDescription",
           achievements,
           challenges,
           skills_improved AS "skillsImproved",
           manager_support AS "managerSupport",
           self_rating AS rating,
           goals,
           status,
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [
          employeeName.trim(),
          employeeId.trim(),
          department.trim(),
          designation.trim(),
          reviewPeriod.trim(),
          projectName.trim(),
          taskTitle.trim(),
          taskDescription.trim(),
          achievements.trim(),
          challenges?.trim() || null,
          skillsImproved?.trim() || null,
          managerSupport?.trim() || null,
          parsedRating,
          goals.trim(),
          id,
          req.user.id,
        ]
      );

      return res.status(200).json({
        message: "Appraisal updated successfully",
        appraisal: result.rows[0],
      });
    } catch (error) {
      console.log("UPDATE APPRAISAL ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while updating appraisal",
      });
    }
  }
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("employee", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM employee_appraisals
         WHERE id = $1 AND employee_id_fk = $2
         RETURNING id`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Appraisal not found",
        });
      }

      return res.status(200).json({
        message: "Appraisal deleted successfully",
      });
    } catch (error) {
      console.log("DELETE APPRAISAL ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while deleting appraisal",
      });
    }
  }
);

router.get(
  "/manager",
  verifyToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const managerId = req.user.id;

      const result = await pool.query(
        `SELECT
          ea.id,
          ea.employee_id_fk AS "employeeUserId",
          ea.employee_name AS "employeeName",
          ea.employee_code AS "employeeId",
          ea.department,
          ea.designation,
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
          ea.updated_at AS "updatedAt",
          u.email
         FROM employee_appraisals ea
         JOIN users u ON u.id = ea.employee_id_fk
         JOIN teams t ON t.id = u.team_id
         WHERE t.manager_id = $1
           AND LOWER(u.role) = 'employee'
         ORDER BY ea.created_at DESC, ea.id DESC`,
        [managerId]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET MANAGER APPRAISALS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching employee appraisals",
      });
    }
  }
);
router.get(
  "/admin",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
          ea.id,
          ea.employee_id_fk AS "employeeUserId",
          ea.employee_name AS "employeeName",
          ea.employee_code AS "employeeId",
          ea.department,
          ea.designation,
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
          ea.updated_at AS "updatedAt",
          u.email
         FROM employee_appraisals ea
         JOIN users u ON u.id = ea.employee_id_fk
         WHERE ea.status = 'Reviewed by Manager'
         ORDER BY ea.created_at DESC, ea.id DESC`
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.log("GET ADMIN APPRAISALS ERROR:", error.message);
      return res.status(500).json({
        message: "Server error while fetching manager-reviewed appraisals",
      });
    }
  }
);

module.exports = router;