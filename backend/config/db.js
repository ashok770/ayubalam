const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { seedDefaultUsers } = require("./seed");

let mongoServer;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim();

    if (uri) {
      await mongoose.connect(uri);
      console.log("MongoDB connected");
    } else {
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log("In-memory MongoDB connected");
      console.log("URI:", memoryUri);
    }

    await seedDefaultUsers();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
