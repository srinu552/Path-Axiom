const pool = require("../config/db");

/* ================= GET EMPLOYEES ================= */
exports.getEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          id,
          employee_id,
          COALESCE(full_name, name) AS name,
          email,
          COALESCE(department, dept) AS dept,
          COALESCE(designation, job_title) AS job_title,
          LOWER(role) AS role,
          approval_status
       FROM users
       WHERE LOWER(role) IN ('employee', 'manager')
         AND approval_status = 'approved'
       ORDER BY id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.log("GET EMPLOYEES ERROR:", error.message);
    return res.status(500).json({
      message: "Server error while fetching employees",
    });
  }
};

/* ================= GET EMPLOYEES FOR APPROVAL ================= */
exports.getPendingEmployees = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        employee_id,
        COALESCE(full_name, name) AS name,
        email,
        COALESCE(department, dept) AS dept,
        COALESCE(designation, job_title) AS job_title,
        phone,
        role,
        COALESCE(approval_status, 'pending') AS approval_status
      FROM users
      WHERE role = 'employee'
      ORDER BY
        CASE
          WHEN COALESCE(approval_status, 'pending') = 'pending' THEN 1
          WHEN COALESCE(approval_status, 'pending') = 'rejected' THEN 2
          WHEN COALESCE(approval_status, 'pending') = 'approved' THEN 3
          ELSE 4
        END,
        id DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.log("GET PENDING EMPLOYEES ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch employees for approval" });
  }
};

/* ================= APPROVE EMPLOYEE ================= */
exports.approveEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEmployee = await pool.query(
      `SELECT id, role FROM users WHERE id = $1 AND role = 'employee'`,
      [id]
    );

    if (existingEmployee.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const result = await pool.query(
      `UPDATE users
       SET approval_status = 'approved'
       WHERE id = $1 AND role = 'employee'
       RETURNING id, employee_id, COALESCE(full_name, name) AS name, email, approval_status`,
      [id]
    );

    res.status(200).json({
      message: "Employee approved successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.log("APPROVE EMPLOYEE ERROR:", err.message);
    res.status(500).json({ message: "Failed to approve employee" });
  }
};

/* ================= REJECT EMPLOYEE ================= */
exports.rejectEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEmployee = await pool.query(
      `SELECT id, role FROM users WHERE id = $1 AND role = 'employee'`,
      [id]
    );

    if (existingEmployee.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const result = await pool.query(
      `UPDATE users
       SET approval_status = 'rejected'
       WHERE id = $1 AND role = 'employee'
       RETURNING id, employee_id, COALESCE(full_name, name) AS name, email, approval_status`,
      [id]
    );

    res.status(200).json({
      message: "Employee rejected successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.log("REJECT EMPLOYEE ERROR:", err.message);
    res.status(500).json({ message: "Failed to reject employee" });
  }
};

/* ================= CREATE TASK ================= */
exports.createTask = async (req, res) => {
  try {
    const { user_id, title, due_date, priority } = req.body;

    if (!user_id || !title?.trim()) {
      return res.status(400).json({
        message: "User and task title are required",
      });
    }

    const userResult = await pool.query(
      `SELECT
          id,
          COALESCE(full_name, name) AS name,
          LOWER(role) AS role,
          approval_status
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const selectedUser = userResult.rows[0];

    if (!["employee", "manager"].includes(selectedUser.role)) {
      return res.status(400).json({
        message: "Task can be assigned only to employee or manager",
      });
    }

    if (selectedUser.approval_status !== "approved") {
      return res.status(400).json({
        message: "Task can be assigned only to approved users",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, due_date, priority)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, title, due_date, priority`,
      [
        user_id,
        title.trim(),
        due_date || null,
        priority || "Medium",
      ]
    );

    return res.status(201).json({
      ...result.rows[0],
      employee_name: selectedUser.name,
      name: selectedUser.name,
      message: "Task assigned successfully",
    });
  } catch (error) {
    console.log("CREATE TASK ERROR:", error.message);
    return res.status(500).json({
      message: "Server error while creating task",
    });
  }
};
/* ================= GET ALL TASKS ================= */
exports.getAllTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          t.id,
          t.user_id,
          t.title,
          t.due_date,
          t.priority,
          COALESCE(u.full_name, u.name) AS employee_name,
          LOWER(u.role) AS role
       FROM tasks t
       JOIN users u ON u.id = t.user_id
       WHERE LOWER(u.role) IN ('employee', 'manager')
       ORDER BY t.id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.log("GET ALL TASKS ERROR:", error.message);
    return res.status(500).json({
      message: "Server error while fetching tasks",
    });
  }
};

/* ================= UPDATE TASK ================= */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, due_date, priority } = req.body;

    const existingTask = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query(
      `UPDATE tasks
       SET title = $1,
           due_date = $2,
           priority = $3
       WHERE id = $4
       RETURNING *`,
      [
        title || existingTask.rows[0].title,
        due_date !== undefined ? due_date : existingTask.rows[0].due_date,
        priority || existingTask.rows[0].priority,
        id,
      ]
    );

    const taskWithUser = await pool.query(
      `SELECT 
         tasks.id,
         tasks.user_id,
         tasks.title,
         tasks.due_date,
         tasks.priority,
         tasks.created_at,
         COALESCE(users.full_name, users.name) AS name,
         users.email,
         COALESCE(users.department, users.dept) AS dept
       FROM tasks
       JOIN users ON tasks.user_id = users.id
       WHERE tasks.id = $1`,
      [id]
    );

    res.status(200).json(taskWithUser.rows[0]);
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Task update failed" });
  }
};

/* ================= DELETE TASK ================= */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Task deletion failed" });
  }
};

/* ================= CREATE ANNOUNCEMENT ================= */
exports.createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Announcement text is required" });
    }

    const result = await pool.query(
      `INSERT INTO announcements (text)
       VALUES ($1)
       RETURNING *`,
      [text.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ message: "Announcement creation failed" });
  }
};

/* ================= GET ALL ANNOUNCEMENTS ================= */
exports.getAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, text, created_at
      FROM announcements
      ORDER BY id DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get Announcements Error:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

/* ================= DELETE ANNOUNCEMENT ================= */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      "SELECT * FROM announcements WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await pool.query("DELETE FROM announcements WHERE id = $1", [id]);

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Delete Announcement Error:", error);
    res.status(500).json({ message: "Announcement deletion failed" });
  }
};