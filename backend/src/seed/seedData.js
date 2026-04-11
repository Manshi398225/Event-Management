require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");

const seed = async () => {
  try {
    await connectDB();

    await Registration.deleteMany();
    await Event.deleteMany();
    await User.deleteMany();

    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);

    const admin = await User.create({
      name: process.env.ADMIN_NAME || "EMS Admin",
      email: process.env.ADMIN_EMAIL || "admin@college.edu",
      password,
      role: "admin",
    });

    const studentPassword = await bcrypt.hash("Student@123", 10);
    const student = await User.create({
      name: "Aarav Student",
      email: "student@college.edu",
      password: studentPassword,
      role: "student",
    });

    const events = await Event.insertMany([
      {
        title: "Tech Symposium 2026",
        description: "A full-day technology symposium with coding, AI, and innovation talks.",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: "Main Auditorium",
        capacity: 250,
        createdBy: admin._id,
      },
      {
        title: "BlueSky Hackathon",
        description: "Build solutions for campus life in a 24-hour hackathon challenge.",
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: "Innovation Lab",
        capacity: 120,
        createdBy: admin._id,
      },
      {
        title: "Cultural Fest Night",
        description: "Music, dance, and performance competitions hosted by student clubs.",
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        location: "Open Air Theatre",
        capacity: 400,
        createdBy: admin._id,
      },
    ]);

    await Registration.create({
      userId: student._id,
      eventId: events[0]._id,
      status: "approved",
    });

    console.log("Seed data inserted successfully");
    console.log("Admin login:", admin.email, "/ Admin@123");
    console.log("Student login:", student.email, "/ Student@123");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
