import "dotenv/config";
import express from "express";
import cors from "cors";
import chalk from "chalk";

import { config } from "./config";
import { connectDB } from "./config/db";
import router from "./routes";
import { errorHandler, setupErrorHandlers } from "./middleware";
import { logger } from "./config/logger";

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(errorHandler);

setupErrorHandlers();

const startServer = async () => {
  try {
    await connectDB();
    logger.info(chalk.green("✅ Database connected successfully"));

    app.listen(config.server.port, () => {
      logger.info(
        chalk.blue(
          `🚀 Server is running in ${config.server.nodeEnv} mode on port ${config.server.port}`,
        ),
      );
    });
  } catch (error) {
    logger.error(chalk.red("Failed to start server:"), error);
    process.exit(1);
  }
};

startServer();
