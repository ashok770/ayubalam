const mongoose = require("mongoose");
const { seedDefaultUsers } = require("./seed");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) throw new Error("MONGODB_URI is not defined");
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    await seedDefaultUsers();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
