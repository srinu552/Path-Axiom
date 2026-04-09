const pool = require("../config/db");

// ================= GET ALL EMPLOYEES + MANAGERS =================
exports.getEmployees = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        employee_id,
        name,
        email,
        dept,
        job_title,
        start_date,
        category,
        gender,
        actions,
        phone,
        LOWER(TRIM(role)) AS role,
        approval_status
       FROM users
       WHERE LOWER(TRIM(role)) IN ('employee', 'manager')
       ORDER BY id DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET SINGLE EMPLOYEE / MANAGER =================
exports.getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        id,
        employee_id,
        name,
        email,
        dept,
        job_title,
        start_date,
        category,
        gender,
        actions,
        phone,
        LOWER(TRIM(role)) AS role,
        approval_status
       FROM users
       WHERE id = $1
         AND LOWER(TRIM(role)) IN ('employee', 'manager')`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee/Manager not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE EMPLOYEE / MANAGER =================
exports.updateEmployee = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const {
      employee_id,
      name,
      dept,
      job_title,
      start_date,
      category,
      gender,
      actions,
    } = req.body;

    const existingEmployee = await client.query(
      `SELECT * 
       FROM users 
       WHERE id = $1
         AND LOWER(TRIM(role)) IN ('employee', 'manager')`,
      [id]
    );

    if (existingEmployee.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Employee/Manager not found for update",
      });
    }

    const oldData = existingEmployee.rows[0];

    const finalEmployeeId =
      employee_id !== undefined && employee_id !== null
        ? employee_id.trim().toUpperCase()
        : oldData.employee_id;

    if (!finalEmployeeId) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const duplicateCheck = await client.query(
      `SELECT id 
       FROM users 
       WHERE employee_id = $1 AND id != $2`,
      [finalEmployeeId, id]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const result = await client.query(
      `UPDATE users
       SET employee_id = $1,
           name = $2,
           dept = $3,
           job_title = $4,
           start_date = $5,
           category = $6,
           gender = $7,
           actions = $8
       WHERE id = $9
         AND LOWER(TRIM(role)) IN ('employee', 'manager')
       RETURNING 
         id,
         employee_id,
         name,
         email,
         dept,
         job_title,
         start_date,
         category,
         gender,
         actions,
         phone,
         LOWER(TRIM(role)) AS role,
         approval_status`,
      [
        finalEmployeeId,
        name ?? oldData.name,
        dept ?? oldData.dept,
        job_title ?? oldData.job_title,
        start_date ?? oldData.start_date,
        category ?? oldData.category,
        gender ?? oldData.gender,
        actions ?? oldData.actions,
        id,
      ]
    );

    await client.query(
      `UPDATE payrolls
       SET employee_id = $1
       WHERE user_id = $2`,
      [finalEmployeeId, id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Employee/Manager and payroll employee ID updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

// ================= DELETE EMPLOYEE / MANAGER =================
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingEmployee = await pool.query(
      `SELECT id 
       FROM users 
       WHERE id = $1
         AND LOWER(TRIM(role)) IN ('employee', 'manager')`,
      [id]
    );

    if (existingEmployee.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee/Manager not found",
      });
    }

    await pool.query(
      `DELETE FROM users
       WHERE id = $1
         AND LOWER(TRIM(role)) IN ('employee', 'manager')`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Employee/Manager deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};