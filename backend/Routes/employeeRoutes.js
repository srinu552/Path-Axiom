const express = require("express");
const router = express.Router();

const {
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ================= GET ALL EMPLOYEES =================
router.get("/", verifyToken, authorizeRoles("admin"), getEmployees);

// ================= GET SINGLE EMPLOYEE =================
router.get("/:id", verifyToken, authorizeRoles("admin"), getEmployee);

// ================= UPDATE EMPLOYEE =================
router.put("/:id", verifyToken, authorizeRoles("admin"), updateEmployee);

// ================= DELETE EMPLOYEE =================
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteEmployee);

module.exports = router;