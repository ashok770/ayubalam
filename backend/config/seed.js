const User = require("../models/User");

const DEFAULTS = [
  {
    name: "System Admin",
    email: "admin123@gmail.com",
    password: "admin",
    role: "admin",
  },
  {
    name: "Field Worker",
    email: "worker123@gmail.com",
    password: "worker123",
    role: "worker",
  },
];

async function seedDefaultUsers() {
  for (const u of DEFAULTS) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
      console.log(`Seeded ${u.role}: ${u.email}`);
    }
  }
}

module.exports = { seedDefaultUsers };
