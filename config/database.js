const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `✅ Database Connected to ${process.env.MONGODB_URI} at http://localhost:${process.env.PORT}`
    );
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
