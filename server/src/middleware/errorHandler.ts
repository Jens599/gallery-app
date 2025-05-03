import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import chalk from "chalk";
import PrettyError from "pretty-error";
import { logger } from "../config/logger";

// Initialize PrettyError
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage("express");

/**
 * Custom error class for handling operational errors with status codes
 */
export class AppError extends Error {
  public isOperational: boolean;
  public details?: unknown;

  constructor(
    public statusCode: number,
    public message: string,
    details?: unknown,
  ) {
    super(message);
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sets up global handlers for uncaught exceptions and promise rejections
 */
export const setupErrorHandlers = () => {
  process.on("uncaughtException", (error) => {
    logger.error(chalk.red("💥 UNCAUGHT EXCEPTION! Shutting down..."));
    logger.error(chalk.red(`Error: ${error.name}`));
    logger.error(chalk.red(`Message: ${error.message}`));
    logger.error(pe.render(error));
    process.exit(1);
  });

  process.on("unhandledRejection", (error) => {
    logger.error(chalk.red("💥 UNHANDLED REJECTION! Shutting down..."));
    if (error instanceof Error) {
      logger.error(chalk.red(`Error: ${error.name}`));
      logger.error(chalk.red(`Message: ${error.message}`));
      logger.error(pe.render(error));
    } else {
      logger.error(chalk.red("Unknown error:"), error);
    }
    process.exit(1);
  });
};

/**
 * Global error handling middleware for Express
 * Handles all errors that are passed through Express's error handling system
 * These are "handled" errors that won't crash the application
 */
export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log all errors in development with pretty formatting
  if (process.env.NODE_ENV === "development") {
    logger.error(chalk.red("🚨 Handled Error:"));
    logger.error(chalk.yellow(`Type: ${err.constructor.name}`));
    logger.error(chalk.yellow(`Message: ${err.message}`));
    logger.error(pe.render(err));
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      details: err.details,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      details: err.errors,
    });
  }

  // Handle Mongoose errors
  if (err instanceof MongooseError) {
    // Handle specific Mongoose error types
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "error",
        message: "Invalid data format",
        details: err.message,
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        details: err.message,
      });
    }

    if (err.name === "DocumentNotFoundError") {
      return res.status(404).json({
        status: "error",
        message: "Resource not found",
        details: err.message,
      });
    }
  }

  // Log unhandled error types
  logger.error(chalk.red(`⚠️ Unhandled error type: ${err.constructor.name}`));
  logger.error(pe.render(err));

  // Handle all other errors (fallback)
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
