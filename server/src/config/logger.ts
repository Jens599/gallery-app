import winston from "winston";
import { config } from "./index";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.level}: ${info.message}`),
);

const transports = [new winston.transports.Console()];

export const logger = winston.createLogger({
  level: config.server.isDevelopment ? "debug" : "info",
  levels,
  format,
  transports,
});
