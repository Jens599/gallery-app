import mongoose from "mongoose";
import chalk from "chalk";
import { config } from "./index";
import { logger } from "./logger";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.db.url);
    logger.info(chalk.green("✅ Connected to MongoDB"));
  } catch (error) {
    logger.error(chalk.red("❌ MongoDB connection error:"), error);
    process.exit(1);
  }

  // Handle connection events
  mongoose.connection.on("error", (error) => {
    logger.error(chalk.red("MongoDB connection error:"), error);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn(chalk.yellow("MongoDB disconnected"));
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
    logger.info(chalk.green("Disconnected from MongoDB"));
  } catch (error) {
    logger.error(chalk.red("MongoDB disconnection error:"), error);
    process.exit(1);
  }
}
