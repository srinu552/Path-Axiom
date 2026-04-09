const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaveSummary,
  getSingleLeave,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post(
  "/apply",
  verifyToken,
  authorizeRoles("employee", "manager", "admin"),
  applyLeave
);

router.get(
  "/my-summary",
  verifyToken,
  authorizeRoles("employee", "manager", "admin"),
  getMyLeaveSummary
);

router.get(
  "/my/:id",
  verifyToken,
  authorizeRoles("employee", "manager", "admin"),
  getSingleLeave
);

router.get(
  "/admin/all",
  verifyToken,
  authorizeRoles("admin"),
  getAllLeaves
);

router.put(
  "/admin/:id/status",
  verifyToken,
  authorizeRoles("admin"),
  updateLeaveStatus
);

module.exports = router;