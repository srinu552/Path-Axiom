const pool = require("../config/db");

/* ================= APPLY LEAVE ================= */
exports.applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leave_type, reason, start_date, end_date } = req.body;

    if (!leave_type || !reason || !start_date || !end_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date cannot be before start date" });
    }

    const duration =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    let balanceColumn = "";
    if (leave_type === "Annual") balanceColumn = "annual_leave";
    else if (leave_type === "Sick") balanceColumn = "sick_leave";
    else if (leave_type === "Maternity") balanceColumn = "maternity_leave";
    else if (leave_type === "Casual") balanceColumn = "casual_leave";
    else {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    let balanceResult = await pool.query(
      "SELECT * FROM leave_balances WHERE user_id = $1",
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      await pool.query(
        "INSERT INTO leave_balances (user_id) VALUES ($1)",
        [userId]
      );

      balanceResult = await pool.query(
        "SELECT * FROM leave_balances WHERE user_id = $1",
        [userId]
      );
    }

    const currentBalance = balanceResult.rows[0][balanceColumn];

    if (duration > currentBalance) {
      return res.status(400).json({
        message: `Not enough ${leave_type} leave balance`,
      });
    }

    const result = await pool.query(
      `INSERT INTO leave_applications
      (user_id, leave_type, reason, start_date, end_date, duration, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING *`,
      [userId, leave_type, reason, start_date, end_date, duration]
    );

    res.status(201).json({
      message: "Leave applied successfully",
      leave: result.rows[0],
    });
  } catch (error) {
    console.log("APPLY LEAVE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET MY SUMMARY ================= */
exports.getMyLeaveSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    let balanceResult = await pool.query(
      "SELECT * FROM leave_balances WHERE user_id = $1",
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      await pool.query(
        "INSERT INTO leave_balances (user_id) VALUES ($1)",
        [userId]
      );

      balanceResult = await pool.query(
        "SELECT * FROM leave_balances WHERE user_id = $1",
        [userId]
      );
    }

    const historyResult = await pool.query(
      `SELECT 
        la.id,
        u.name,
        la.duration,
        la.start_date,
        la.end_date,
        la.leave_type AS type,
        la.reason,
        la.status
       FROM leave_applications la
       JOIN users u ON la.user_id = u.id
       WHERE la.user_id = $1
       ORDER BY la.created_at DESC`,
      [userId]
    );

    const leaveHistory = historyResult.rows;

    const totalApplications = leaveHistory.length;
    const approvedCount = leaveHistory.filter(
      (item) => item.status === "Approved"
    ).length;
    const pendingCount = leaveHistory.filter(
      (item) => item.status === "Pending"
    ).length;

    res.json({
      balances: balanceResult.rows[0],
      totalApplications,
      approvedCount,
      pendingCount,
      leaveHistory,
    });
  } catch (error) {
    console.log("GET MY SUMMARY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET SINGLE LEAVE ================= */
exports.getSingleLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaveId = req.params.id;

    const result = await pool.query(
      `SELECT 
        la.*,
        u.name
       FROM leave_applications la
       JOIN users u ON la.user_id = u.id
       WHERE la.id = $1 AND la.user_id = $2`,
      [leaveId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log("GET SINGLE LEAVE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN GET ALL ================= */
exports.getAllLeaves = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        la.id,
        u.name,
        u.email,
        la.leave_type,
        la.reason,
        la.start_date,
        la.end_date,
        la.duration,
        la.status,
        la.admin_remark,
        la.created_at
       FROM leave_applications la
       JOIN users u ON la.user_id = u.id
       ORDER BY la.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.log("GET ALL LEAVES ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN UPDATE STATUS ================= */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { status, admin_remark } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leaveResult = await pool.query(
      "SELECT * FROM leave_applications WHERE id = $1",
      [leaveId]
    );

    if (leaveResult.rows.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const leave = leaveResult.rows[0];

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Leave request already processed",
      });
    }

    const updatedResult = await pool.query(
      `UPDATE leave_applications
       SET status = $1, admin_remark = $2
       WHERE id = $3
       RETURNING *`,
      [status, admin_remark || "", leaveId]
    );

    if (status === "Approved") {
      let balanceColumn = "";
      if (leave.leave_type === "Annual") balanceColumn = "annual_leave";
      else if (leave.leave_type === "Sick") balanceColumn = "sick_leave";
      else if (leave.leave_type === "Maternity") balanceColumn = "maternity_leave";
      else if (leave.leave_type === "Casual") balanceColumn = "casual_leave";

      await pool.query(
        `UPDATE leave_balances
         SET ${balanceColumn} = ${balanceColumn} - $1
         WHERE user_id = $2`,
        [leave.duration, leave.user_id]
      );
    }

    res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave: updatedResult.rows[0],
    });
  } catch (error) {
    console.log("UPDATE LEAVE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};