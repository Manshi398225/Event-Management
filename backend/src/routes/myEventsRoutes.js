const express = require("express");
const { getMyEvents } = require("../controllers/registrationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyEvents);

module.exports = router;
