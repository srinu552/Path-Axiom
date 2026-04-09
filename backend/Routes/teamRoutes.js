const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// =============================
// ADMIN: get managers + employees
// =============================
router.get(
  "/users/options",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const managersQuery = `
        SELECT id, name, email, employee_id, role, team_id
        FROM users
        WHERE LOWER(role) = 'manager'
        ORDER BY COALESCE(name, email) ASC
      `;

      const employeesQuery = `
        SELECT id, name, email, employee_id, role, team_id
        FROM users
        WHERE LOWER(role) = 'employee'
        ORDER BY COALESCE(name, email) ASC
      `;

      const [managers, employees] = await Promise.all([
        pool.query(managersQuery),
        pool.query(employeesQuery),
      ]);

      res.json({
        managers: managers.rows,
        employees: employees.rows,
      });
    } catch (error) {
      console.error("GET /users/options error:", error);
      res.status(500).json({ message: "Failed to fetch users options" });
    }
  }
);

// =============================
// ADMIN: create team
// =============================
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { name, description = "", managerId = null } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Team name is required" });
      }

      await client.query("BEGIN");

      let selectedManagerId = managerId ? Number(managerId) : null;

      if (selectedManagerId) {
        const managerCheck = await client.query(
          `SELECT id, role FROM users WHERE id = $1`,
          [selectedManagerId]
        );

        if (managerCheck.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ message: "Manager not found" });
        }

        if (String(managerCheck.rows[0].role).toLowerCase() !== "manager") {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Selected user is not a manager" });
        }

        // Ensure one manager belongs to one team only
        await client.query(
          `
          UPDATE teams
          SET manager_id = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE manager_id = $1
          `,
          [selectedManagerId]
        );

        await client.query(
          `
          UPDATE users
          SET team_id = NULL
          WHERE id = $1 AND LOWER(role) = 'manager'
          `,
          [selectedManagerId]
        );
      }

      const created = await client.query(
        `
        INSERT INTO teams (name, description, manager_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          name,
          description,
          manager_id AS "managerId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [name.trim(), String(description || "").trim(), selectedManagerId, req.user.id]
      );

      const team = created.rows[0];

      if (selectedManagerId) {
        await client.query(
          `UPDATE users SET team_id = $1 WHERE id = $2`,
          [team.id, selectedManagerId]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: "Team created successfully",
        team,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("POST /create error:", error);

      if (error.code === "23505") {
        return res.status(400).json({ message: "Team name already exists" });
      }

      res.status(500).json({ message: "Failed to create team" });
    } finally {
      client.release();
    }
  }
);

// =============================
// ADMIN: get all teams with manager + member count
// =============================
router.get(
  "/all",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const query = `
        SELECT
          t.id,
          t.name,
          t.description,
          t.manager_id AS "managerId",
          t.created_at AS "createdAt",
          t.updated_at AS "updatedAt",
          u.name AS "managerName",
          u.email AS "managerEmail",
          u.employee_id AS "managerEmployeeId",
          COUNT(emp.id)::int AS "memberCount"
        FROM teams t
        LEFT JOIN users u
          ON u.id = t.manager_id
        LEFT JOIN users emp
          ON emp.team_id = t.id
         AND LOWER(emp.role) = 'employee'
        GROUP BY
          t.id,
          t.name,
          t.description,
          t.manager_id,
          t.created_at,
          t.updated_at,
          u.name,
          u.email,
          u.employee_id
        ORDER BY t.created_at DESC, t.id DESC
      `;

      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("GET /all error:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  }
);

// =============================
// ADMIN: assign/change/remove manager
// managerId can be null
// =============================
router.put(
  "/:teamId/manager",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { teamId } = req.params;
      const { managerId = null } = req.body;
      const nextManagerId = managerId ? Number(managerId) : null;

      await client.query("BEGIN");

      const teamCheck = await client.query(
        `SELECT id, manager_id FROM teams WHERE id = $1`,
        [teamId]
      );

      if (teamCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Team not found" });
      }

      const oldManagerId = teamCheck.rows[0].manager_id;

      if (nextManagerId) {
        const managerCheck = await client.query(
          `SELECT id, role FROM users WHERE id = $1`,
          [nextManagerId]
        );

        if (managerCheck.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ message: "Manager not found" });
        }

        if (String(managerCheck.rows[0].role).toLowerCase() !== "manager") {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Selected user is not a manager" });
        }

        // Remove this manager from any other team first
        await client.query(
          `
          UPDATE teams
          SET manager_id = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE manager_id = $1 AND id <> $2
          `,
          [nextManagerId, teamId]
        );

        await client.query(
          `
          UPDATE users
          SET team_id = NULL
          WHERE id = $1 AND LOWER(role) = 'manager'
          `,
          [nextManagerId]
        );
      }

      await client.query(
        `
        UPDATE teams
        SET manager_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [nextManagerId, teamId]
      );

      if (nextManagerId) {
        await client.query(
          `UPDATE users SET team_id = $1 WHERE id = $2`,
          [teamId, nextManagerId]
        );
      }

      if (oldManagerId && Number(oldManagerId) !== Number(nextManagerId || 0)) {
        await client.query(
          `
          UPDATE users
          SET team_id = NULL
          WHERE id = $1 AND LOWER(role) = 'manager'
          `,
          [oldManagerId]
        );
      }

      await client.query("COMMIT");

      res.json({
        message: nextManagerId
          ? "Manager updated successfully"
          : "Manager removed successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("PUT /:teamId/manager error:", error);
      res.status(500).json({ message: "Failed to update manager" });
    } finally {
      client.release();
    }
  }
);

// =============================
// ADMIN: assign employees to team
// sends employeeIds: [1,2,3]
// replaces old employee members for that team
// =============================
router.put(
  "/:teamId/members",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { teamId } = req.params;
      const { employeeIds = [] } = req.body;

      await client.query("BEGIN");

      const teamCheck = await client.query(
        `SELECT id FROM teams WHERE id = $1`,
        [teamId]
      );

      if (teamCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Team not found" });
      }

      // Remove only employee members from this team
      await client.query(
        `
        UPDATE users
        SET team_id = NULL
        WHERE team_id = $1 AND LOWER(role) = 'employee'
        `,
        [teamId]
      );

      if (Array.isArray(employeeIds) && employeeIds.length > 0) {
        const validEmployees = await client.query(
          `
          SELECT id
          FROM users
          WHERE id = ANY($1::int[])
            AND LOWER(role) = 'employee'
          `,
          [employeeIds]
        );

        const validIds = validEmployees.rows.map((row) => row.id);

        if (validIds.length > 0) {
          await client.query(
            `
            UPDATE users
            SET team_id = $1
            WHERE id = ANY($2::int[])
            `,
            [teamId, validIds]
          );
        }
      }

      await client.query("COMMIT");

      res.json({ message: "Team members updated successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("PUT /:teamId/members error:", error);
      res.status(500).json({ message: "Failed to update team members" });
    } finally {
      client.release();
    }
  }
);

// =============================
// ADMIN: see members of a team
// =============================
router.get(
  "/:teamId/members",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { teamId } = req.params;

      const teamQuery = `
        SELECT
          t.id,
          t.name,
          t.description,
          t.manager_id AS "managerId",
          t.created_at AS "createdAt",
          t.updated_at AS "updatedAt",
          u.name AS "managerName",
          u.email AS "managerEmail",
          u.employee_id AS "managerEmployeeId"
        FROM teams t
        LEFT JOIN users u ON u.id = t.manager_id
        WHERE t.id = $1
      `;

      const membersQuery = `
        SELECT
          id,
          name,
          email,
          employee_id AS "employeeId",
          dept,
          job_title AS "jobTitle",
          role
        FROM users
        WHERE team_id = $1
        ORDER BY
          CASE WHEN LOWER(role) = 'manager' THEN 0 ELSE 1 END,
          COALESCE(name, email) ASC
      `;

      const [teamResult, membersResult] = await Promise.all([
        pool.query(teamQuery, [teamId]),
        pool.query(membersQuery, [teamId]),
      ]);

      if (teamResult.rows.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }

      res.json({
        team: teamResult.rows[0],
        members: membersResult.rows,
      });
    } catch (error) {
      console.error("GET /:teamId/members error:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  }
);

// =============================
// ADMIN: delete team
// unassign all users from team first
// =============================
router.delete(
  "/:teamId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { teamId } = req.params;

      await client.query("BEGIN");

      const teamResult = await client.query(
        `SELECT id, name FROM teams WHERE id = $1`,
        [teamId]
      );

      if (teamResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Team not found" });
      }

      await client.query(
        `
        UPDATE users
        SET team_id = NULL
        WHERE team_id = $1
        `,
        [teamId]
      );

      await client.query(
        `DELETE FROM teams WHERE id = $1`,
        [teamId]
      );

      await client.query("COMMIT");

      res.json({
        message: "Team deleted successfully",
        team: teamResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("DELETE /:teamId error:", error);
      res.status(500).json({ message: "Failed to delete team" });
    } finally {
      client.release();
    }
  }
);

// =============================
// MANAGER: view own team + team members
// =============================
router.get(
  "/manager/my-team",
  verifyToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const managerId = req.user.id;

      const teamQuery = `
        SELECT
          t.id,
          t.name,
          t.description,
          t.manager_id AS "managerId",
          t.created_at AS "createdAt",
          t.updated_at AS "updatedAt",
          u.name AS "managerName",
          u.email AS "managerEmail",
          u.employee_id AS "managerEmployeeId"
        FROM teams t
        LEFT JOIN users u ON u.id = t.manager_id
        WHERE t.manager_id = $1
        LIMIT 1
      `;

      const teamResult = await pool.query(teamQuery, [managerId]);

      if (teamResult.rows.length === 0) {
        return res.status(404).json({ message: "No team assigned to this manager" });
      }

      const team = teamResult.rows[0];

      const membersResult = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          employee_id AS "employeeId",
          dept,
          job_title AS "jobTitle",
          role
        FROM users
        WHERE team_id = $1
        ORDER BY
          CASE WHEN LOWER(role) = 'manager' THEN 0 ELSE 1 END,
          COALESCE(name, email) ASC
        `,
        [team.id]
      );

      res.json({
        team,
        members: membersResult.rows,
      });
    } catch (error) {
      console.error("GET /manager/my-team error:", error);
      res.status(500).json({ message: "Failed to fetch manager team" });
    }
  }
);

module.exports = router;