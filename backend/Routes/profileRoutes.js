const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:id", verifyToken, getProfile);
router.post("/update", verifyToken, updateProfile);

module.exports = router;