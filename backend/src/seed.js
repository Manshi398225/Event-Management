import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDatabase } from "./config/db.js";
import { Event } from "./models/Event.js";
import { User } from "./models/User.js";

dotenv.config();

const seed = async () => {
  await connectDatabase();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@college.edu";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = await User.create({
      name: "EMS Admin",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: "admin"
    });
  }

  const existingEvents = await Event.countDocuments();

  if (!existingEvents) {
    await Event.insertMany([
      {
        title: "Cloud Computing Workshop",
        description: "Hands-on introduction to deploying apps and services in the cloud.",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        location: "Seminar Hall A",
        capacity: 120,
        createdBy: admin._id
      },
      {
        title: "Hackathon 2026",
        description: "A 24-hour innovation sprint for cross-disciplinary student teams.",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        location: "Innovation Lab",
        capacity: 250,
        createdBy: admin._id
      },
      {
        title: "Tech Fest Opening Ceremony",
        description: "Kick-off event with speakers, student showcases, and cultural performances.",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
        location: "Main Auditorium",
        capacity: 500,
        createdBy: admin._id
      }
    ]);
  }

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
