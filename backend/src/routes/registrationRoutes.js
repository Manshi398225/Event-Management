const express = require("express");
const {
  registerForEvent,
  getMyEvents,
  deleteMyRegistration,
  getAllRegistrations,
  exportRegistrations,
  submitFeedback,
  sendReminderEmails,
  updateRegistrationStatus,
  getAnalytics,
} = require("../controllers/registrationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my-events/list", protect, getMyEvents);
router.delete("/my-events/:id", protect, deleteMyRegistration);
router.post("/reminders/send", protect, adminOnly, sendReminderEmails);
router.get("/export", protect, adminOnly, exportRegistrations);
router.get("/", protect, adminOnly, getAllRegistrations);
router.get("/admin/all", protect, adminOnly, getAllRegistrations);
router.get("/admin/analytics/summary", protect, adminOnly, getAnalytics);
router.put("/:id/feedback", protect, submitFeedback);
router.put("/:id/status", protect, adminOnly, updateRegistrationStatus);
router.put("/admin/:id/status", protect, adminOnly, updateRegistrationStatus);
router.post("/:eventId", protect, registerForEvent);

module.exports = router;
