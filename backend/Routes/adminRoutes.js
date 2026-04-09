const express = require("express");
const router = express.Router();

const {
  getEmployees,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require("../controllers/dashboardController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

/* ================= EMPLOYEES ================= */
router.get(
  "/employees",
  verifyToken,
  authorizeRoles("admin"),
  getEmployees
);

router.get(
  "/pending-employees",
  verifyToken,
  authorizeRoles("admin"),
  getPendingEmployees
);

router.put(
  "/approve-employee/:id",
  verifyToken,
  authorizeRoles("admin"),
  approveEmployee
);

router.put(
  "/reject-employee/:id",
  verifyToken,
  authorizeRoles("admin"),
  rejectEmployee
);

/* ================= TASKS ================= */
router.post(
  "/tasks/create",
  verifyToken,
  authorizeRoles("admin"),
  createTask
);

router.get(
  "/tasks",
  verifyToken,
  authorizeRoles("admin"),
  getAllTasks
);

router.put(
  "/tasks/:id",
  verifyToken,
  authorizeRoles("admin"),
  updateTask
);

router.delete(
  "/tasks/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteTask
);

/* ================= ANNOUNCEMENTS ================= */
router.post(
  "/announcements",
  verifyToken,
  authorizeRoles("admin"),
  createAnnouncement
);

router.get(
  "/announcements",
  verifyToken,
  authorizeRoles("admin"),
  getAnnouncements
);

router.delete(
  "/announcements/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteAnnouncement
);
module.exports = router;