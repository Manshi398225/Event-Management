const express = require("express");
const { getAdminStats } = require("../controllers/dashboardController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin/stats", protect, adminOnly, getAdminStats);

module.exports = router;
