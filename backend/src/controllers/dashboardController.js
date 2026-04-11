const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

const getAdminStats = async (req, res) => {
  const [totalUsers, totalEvents, totalRegistrations, approvedRegistrations, pendingRegistrations, feedback] =
    await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Registration.countDocuments(),
      Registration.countDocuments({ status: "approved" }),
      Registration.countDocuments({ status: "registered" }),
      Registration.find({ feedbackRating: { $exists: true, $ne: null } }).select("feedbackRating").lean(),
    ]);

  const averageRating =
    feedback.length > 0
      ? Number(
          (feedback.reduce((sum, item) => sum + item.feedbackRating, 0) / feedback.length).toFixed(1)
        )
      : 0;

  return res.json({
    totalUsers,
    totalEvents,
    totalRegistrations,
    approvedRegistrations,
    pendingRegistrations,
    averageRating,
  });
};

module.exports = { getAdminStats };
