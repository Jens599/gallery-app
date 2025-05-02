import mongoose from "mongoose";
import { config } from "./index";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.db.url);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }

  // Handle connection events
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });

  // Handle process termination
  process.on("SIGINT", async () => {
    await disconnectDB();
    process.exit(0);
  });
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
    process.exit(1);
  }
}
