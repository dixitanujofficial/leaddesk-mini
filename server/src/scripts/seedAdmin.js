import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const seedAdmin = async () => {
  if (
    !process.env.MONGO_URI ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD
  ) {
    throw new Error(
      "MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required to seed an admin",
    );
  }

  await connectDB();

  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

  await Admin.findOneAndUpdate(
    { email },
    { email, passwordHash },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  console.log(`Admin account is ready for ${email}`);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Could not seed admin:", error.message);
  process.exit(1);
});
