const express = require("express");
const router = express.Router();

const {
  getMyAssignedTasks,
  getEmployeeAnnouncements,
  getMyTeamInfo,
} = require("../controllers/employeeDashboardController");

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/* ================= EMPLOYEE TASKS ================= */
router.get(
  "/my-tasks",
  verifyToken,
  authorizeRoles("employee", "manager", "admin"),
  getMyAssignedTasks
);

/* ================= EMPLOYEE ANNOUNCEMENTS ================= */
router.get(
  "/announcements",
  verifyToken,
  authorizeRoles("employee", "manager", "admin"),
  getEmployeeAnnouncements
);

/* ================= MY TEAM INFO ================= */
router.get(
  "/my-team",
  verifyToken,
  authorizeRoles("employee", "manager", "admin"),
  getMyTeamInfo
);

module.exports = router;