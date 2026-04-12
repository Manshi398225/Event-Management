const Event = require("../models/Event");
const Registration = require("../models/Registration");
const QRCode = require("qrcode");
const { sendEventReminderEmail, sendRegistrationEmail } = require("../utils/mailer");

const escapeCsvValue = (value) => {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const buildCsv = (rows) =>
  rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");

const sanitizeFileName = (value) =>
  String(value || "registrations")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "registrations";

const createTicketCode = (registrationId) => `EMS-${String(registrationId).slice(-6).toUpperCase()}`;

const queueEmail = (label, task) => {
  Promise.resolve()
    .then(task)
    .catch((error) => {
      console.error(`Failed to send ${label}:`, error.message);
    });
};

const findScheduleConflict = async ({ userId, eventId, eventDate, excludeRegistrationId }) => {
  const conflictingEvents = await Event.find({
    _id: { $ne: eventId },
    date: eventDate,
  })
    .select("title date location")
    .lean();

  if (conflictingEvents.length === 0) {
    return null;
  }

  const conflict = await Registration.findOne({
    userId,
    eventId: { $in: conflictingEvents.map((entry) => entry._id) },
    status: { $ne: "rejected" },
    ...(excludeRegistrationId ? { _id: { $ne: excludeRegistrationId } } : {}),
  }).populate("eventId", "title date location");

  return conflict;
};

const ensureTicket = async (registration, user, event) => {
  if (registration.ticketCode && registration.qrCodeDataUrl) {
    return registration;
  }

  registration.ticketCode = registration.ticketCode || createTicketCode(registration._id);

  const qrPayload = JSON.stringify({
    ticketCode: registration.ticketCode,
    attendee: user?.name,
    email: user?.email,
    eventTitle: event?.title,
    eventDate: event?.date,
    location: event?.location,
  });

  registration.qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    width: 220,
  });

  await registration.save();
  return registration;
};

const registerForEvent = async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const existingRegistration = await Registration.findOne({
    userId: req.user._id,
    eventId: event._id,
  });

  if (existingRegistration) {
    return res.status(400).json({ message: "You have already registered for this event" });
  }

  const conflictingRegistration = await findScheduleConflict({
    userId: req.user._id,
    eventId: event._id,
    eventDate: event.date,
  });

  if (conflictingRegistration?.eventId) {
    return res.status(400).json({
      message: `You are already registered for "${conflictingRegistration.eventId.title}" at the same date and time.`,
    });
  }

  const currentRegistrations = await Registration.countDocuments({
    eventId: event._id,
    status: { $ne: "rejected" },
  });

  if (currentRegistrations >= event.capacity) {
    return res.status(400).json({ message: "Event capacity reached" });
  }

  const registration = await Registration.create({
    userId: req.user._id,
    eventId: event._id,
    status: "registered",
  });

  await ensureTicket(registration, req.user, event);

  queueEmail("registration email", () =>
    sendRegistrationEmail({
      email: req.user.email,
      name: req.user.name,
      eventTitle: event.title,
      eventDate: event.date,
      location: event.location,
      status: registration.status,
    })
  );

  return res.status(201).json({
    message: "Registered successfully",
    registration,
  });
};

const getMyEvents = async (req, res) => {
  const registrations = await Registration.find({ userId: req.user._id })
    .populate("eventId")
    .sort({ createdAt: -1 });

  await Promise.all(
    registrations.map((entry) => ensureTicket(entry, req.user, entry.eventId))
  );

  return res.json(
    registrations.map((entry) => ({
      _id: entry._id,
      status: entry.status,
      createdAt: entry.createdAt,
      ticketCode: entry.ticketCode,
      qrCodeDataUrl: entry.qrCodeDataUrl,
      feedbackRating: entry.feedbackRating,
      feedbackComment: entry.feedbackComment,
      feedbackSubmittedAt: entry.feedbackSubmittedAt,
      event: entry.eventId,
    }))
  );
};

const deleteMyRegistration = async (req, res) => {
  const registration = await Registration.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!registration) {
    return res.status(404).json({ message: "Registration not found" });
  }

  await registration.deleteOne();

  return res.json({ message: "Event removed from your registrations" });
};

const getAllRegistrations = async (req, res) => {
  const registrations = await Registration.find()
    .populate("userId", "name email role")
    .populate("eventId", "title date location category")
    .sort({ createdAt: -1 });

  return res.json(registrations);
};

const exportRegistrations = async (req, res) => {
  const filter = {};
  const exportType = req.query.type === "participants" ? "participants" : "all";

  if (req.query.eventId) {
    filter.eventId = req.query.eventId;
  }

  const registrations = await Registration.find(filter)
    .populate("userId", "name email role")
    .populate("eventId", "title date location category")
    .sort({ createdAt: -1 });

  const csvRows =
    exportType === "participants"
      ? [
          ["Student Name", "Student Email", "Event Title", "Event Date", "Registration Status", "Registered At"],
          ...registrations.map((registration) => [
            registration.userId?.name || "",
            registration.userId?.email || "",
            registration.eventId?.title || "",
            registration.eventId?.date ? new Date(registration.eventId.date).toISOString() : "",
            registration.status,
            registration.createdAt ? new Date(registration.createdAt).toISOString() : "",
          ]),
        ]
      : [
          [
            "Student Name",
            "Student Email",
            "Student Role",
            "Event Title",
            "Event Date",
            "Event Location",
            "Category",
            "Registration Status",
            "Ticket Code",
            "Feedback Rating",
            "Feedback Comment",
            "Registered At",
          ],
          ...registrations.map((registration) => [
            registration.userId?.name || "",
            registration.userId?.email || "",
            registration.userId?.role || "",
            registration.eventId?.title || "",
            registration.eventId?.date ? new Date(registration.eventId.date).toISOString() : "",
            registration.eventId?.location || "",
            registration.eventId?.category || "",
            registration.status,
            registration.ticketCode || "",
            registration.feedbackRating || "",
            registration.feedbackComment || "",
            registration.createdAt ? new Date(registration.createdAt).toISOString() : "",
          ]),
        ];

  const fileStem = req.query.eventId
    ? sanitizeFileName(
        `${registrations[0]?.eventId?.title || "event"}-${exportType === "participants" ? "participants" : "registrations"}`
      )
    : exportType === "participants"
      ? "participant-list"
      : "all-registrations";

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"${fileStem}.csv\"`);

  return res.status(200).send(buildCsv(csvRows));
};

const submitFeedback = async (req, res) => {
  const { rating, comment } = req.body;
  const registration = await Registration.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate("eventId", "title date location");

  if (!registration) {
    return res.status(404).json({ message: "Registration not found" });
  }

  if (new Date(registration.eventId.date) > new Date()) {
    return res.status(400).json({ message: "Feedback is available after the event ends" });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Please provide a rating between 1 and 5" });
  }

  registration.feedbackRating = rating;
  registration.feedbackComment = comment || "";
  registration.feedbackSubmittedAt = new Date();
  await registration.save();

  return res.json({
    message: "Feedback submitted successfully",
    registration,
  });
};

const sendReminderEmails = async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "Event id is required" });
  }

  const registrations = await Registration.find({
    eventId,
    status: { $in: ["registered", "approved"] },
  })
    .populate("userId", "name email")
    .populate("eventId", "title date location");

  if (registrations.length === 0) {
    return res.status(404).json({ message: "No eligible registrations found for reminders" });
  }

  registrations.forEach((registration) => {
    queueEmail("reminder email", () =>
      sendEventReminderEmail({
        email: registration.userId?.email,
        name: registration.userId?.name,
        eventTitle: registration.eventId?.title,
        eventDate: registration.eventId?.date,
        location: registration.eventId?.location,
      })
    );
  });

  return res.json({
    message: `Reminder emails queued for ${registrations.length} attendee(s)`,
  });
};

const updateRegistrationStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["approved", "rejected", "registered"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid registration status" });
  }

  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    return res.status(404).json({ message: "Registration not found" });
  }

  if (status !== "rejected") {
    const event = await Event.findById(registration.eventId).select("title date location");
    const conflictingRegistration = await findScheduleConflict({
      userId: registration.userId,
      eventId: registration.eventId,
      eventDate: event?.date,
      excludeRegistrationId: registration._id,
    });

    if (conflictingRegistration?.eventId) {
      return res.status(400).json({
        message: `This student already has "${conflictingRegistration.eventId.title}" at the same date and time.`,
      });
    }
  }

  registration.status = status;
  await registration.save();

  const populated = await registration.populate([
    { path: "userId", select: "name email role" },
    { path: "eventId", select: "title date location description" },
  ]);

  queueEmail("status email", () =>
    sendRegistrationEmail({
      email: populated.userId?.email,
      name: populated.userId?.name,
      eventTitle: populated.eventId?.title,
      eventDate: populated.eventId?.date,
      location: populated.eventId?.location,
      status,
    })
  );

  return res.json({
    message: "Registration status updated",
    registration: populated,
  });
};

const getAnalytics = async (req, res) => {
  const [totalEvents, totalRegistrations, pendingRegistrations] = await Promise.all([
    Event.countDocuments(),
    Registration.countDocuments(),
    Registration.countDocuments({ status: "registered" }),
  ]);

  return res.json({
    totalEvents,
    totalRegistrations,
    pendingRegistrations,
  });
};

module.exports = {
  registerForEvent,
  getMyEvents,
  deleteMyRegistration,
  getAllRegistrations,
  exportRegistrations,
  submitFeedback,
  sendReminderEmails,
  updateRegistrationStatus,
  getAnalytics,
};
