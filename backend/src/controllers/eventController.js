const Event = require("../models/Event");
const Registration = require("../models/Registration");

const getEvents = async (req, res) => {
  const { search = "", location, category, date } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (location) {
    query.location = { $regex: `^${location}$`, $options: "i" };
  }

  if (category) {
    query.category = { $regex: `^${category}$`, $options: "i" };
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);

    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  const events = await Event.find(query).sort({ date: 1 }).lean();

  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const registrations = await Registration.countDocuments({
        eventId: event._id,
        status: { $ne: "rejected" },
      });

      return {
        ...event,
        registeredCount: registrations,
        registrationsCount: registrations,
        availableSeats: Math.max(event.capacity - registrations, 0),
        status: registrations >= event.capacity ? "Full" : "Open",
      };
    })
  );

  return res.json(eventsWithCounts);
};

const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id).lean();

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const registrations = await Registration.countDocuments({
    eventId: event._id,
    status: { $ne: "rejected" },
  });

  return res.json({
    ...event,
    registeredCount: registrations,
    registrationsCount: registrations,
    availableSeats: Math.max(event.capacity - registrations, 0),
    status: registrations >= event.capacity ? "Full" : "Open",
    reviews: await Registration.find({
      eventId: event._id,
      feedbackRating: { $exists: true, $ne: null },
    })
      .populate("userId", "name")
      .sort({ feedbackSubmittedAt: -1 })
      .lean(),
  });
};

const createEvent = async (req, res) => {
  const { title, description, category, date, location, capacity } = req.body;

  if (!title || !description || !category || !date || !location || !capacity) {
    return res.status(400).json({ message: "All event fields are required" });
  }

  const event = await Event.create({
    title,
    description,
    category,
    date,
    location,
    capacity,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    message: "Event created successfully",
    event,
  });
};

const updateEvent = async (req, res) => {
  const { title, description, category, date, location, capacity } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  event.title = title ?? event.title;
  event.description = description ?? event.description;
  event.category = category ?? event.category;
  event.date = date ?? event.date;
  event.location = location ?? event.location;
  event.capacity = capacity ?? event.capacity;

  await event.save();

  return res.json({
    message: "Event updated successfully",
    event,
  });
};

const deleteEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  await Registration.deleteMany({ eventId: event._id });
  await event.deleteOne();

  return res.json({ message: "Event deleted successfully" });
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
