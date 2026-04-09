const pool = require("../config/db");

/* ================= GET MY ASSIGNED TASKS ================= */
exports.getMyAssignedTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        t.id,
        t.user_id,
        t.title,
        t.due_date,
        t.priority,
        t.created_at
      FROM tasks t
      WHERE t.user_id = $1
      ORDER BY
        CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
        t.due_date ASC,
        t.id DESC
      `,
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.log("GET MY ASSIGNED TASKS ERROR:", error.message);
    return res.status(500).json({
      message: "Server error while fetching assigned tasks",
    });
  }
};

/* ================= GET EMPLOYEE ANNOUNCEMENTS ================= */
exports.getEmployeeAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        text,
        created_at
      FROM announcements
      ORDER BY id DESC
      `
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.log("GET EMPLOYEE ANNOUNCEMENTS ERROR:", error.message);
    return res.status(500).json({
      message: "Server error while fetching announcements",
    });
  }
};

/* ================= GET MY TEAM INFO ================= */
exports.getMyTeamInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const baseResult = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.employee_id AS user_employee_id,
        COALESCE(u.full_name, u.name) AS user_name,
        LOWER(COALESCE(u.role, 'employee')) AS user_role,
        u.team_id,

        t.id AS team_id_value,
        t.name AS team_name,
        t.description AS team_description,
        t.manager_id,

        COALESCE(m.full_name, m.name) AS manager_name,
        m.employee_id AS manager_employee_id,
        m.email AS manager_email,
        COALESCE(m.department, m.dept) AS manager_department,
        COALESCE(m.designation, m.job_title) AS manager_designation,
        LOWER(COALESCE(m.role, 'manager')) AS manager_role
      FROM users u
      LEFT JOIN teams t ON t.id = u.team_id
      LEFT JOIN users m ON m.id = t.manager_id
      WHERE u.id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (baseResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const current = baseResult.rows[0];

    if (!current.team_id) {
      return res.status(200).json({
        team: null,
        manager: null,
        people: [],
      });
    }

    const peopleResult = await pool.query(
      `
      SELECT
        id,
        employee_id,
        COALESCE(full_name, name) AS name,
        email,
        COALESCE(department, dept) AS department,
        COALESCE(designation, job_title) AS designation,
        LOWER(role) AS role,
        team_id
      FROM users
      WHERE team_id = $1
        AND COALESCE(approval_status, 'approved') = 'approved'
        AND LOWER(role) IN ('employee', 'manager', 'admin')
      ORDER BY
        CASE
          WHEN id = $2 THEN 0
          ELSE 1
        END,
        CASE
          WHEN LOWER(role) = 'manager' THEN 0
          ELSE 1
        END,
        COALESCE(full_name, name) ASC
      `,
      [current.team_id, current.manager_id || 0]
    );

    let people = peopleResult.rows.map((person) => ({
      id: person.id,
      employee_id: person.employee_id || "",
      name: person.name || "",
      email: person.email || "",
      department: person.department || "",
      designation: person.designation || "",
      role: person.role || "",
      team_id: person.team_id || null,
      isManager: current.manager_id ? Number(person.id) === Number(current.manager_id) : false,
    }));

    const manager =
      current.manager_id && current.manager_name
        ? {
            id: current.manager_id,
            employee_id: current.manager_employee_id || "",
            name: current.manager_name || "",
            email: current.manager_email || "",
            department: current.manager_department || "",
            designation: current.manager_designation || "",
            role: current.manager_role || "manager",
            isManager: true,
          }
        : null;

    if (manager) {
      const existsInPeople = people.some(
        (person) => Number(person.id) === Number(manager.id)
      );

      if (!existsInPeople) {
        people = [manager, ...people];
      }
    }

    return res.status(200).json({
      team: {
        id: current.team_id_value,
        name: current.team_name || "",
        description: current.team_description || "",
        currentUserRole: current.user_role || "employee",
        memberCount: people.length,
      },
      manager,
      people,
    });
  } catch (error) {
    console.log("GET MY TEAM INFO ERROR:", error.message);
    return res.status(500).json({
      message: "Server error while fetching team info",
    });
  }
};