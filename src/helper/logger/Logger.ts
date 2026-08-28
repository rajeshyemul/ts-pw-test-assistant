import fs from "fs";
import path from "path";
import winston, { format } from "winston";
import type { TransformableInfo } from "logform";
import { SetupConstants } from "../../support/constants/SetupConstants";
import { PathConstants } from "../../support/constants/PathConstants";

const baseFolder =
  process.env.REPORT_ROOT || path.join(process.cwd(), "reports");

if (!process.env.REPORT_ROOT) {
  // If REPORT_ROOT is not configured (e.g. running helper scripts), fallback to a local reports folder.
  // This ensures Logger can still be used outside of the test runner.
  console.warn("REPORT_ROOT is not set, falling back to %s", baseFolder);
}

const logDir = path.join(baseFolder, PathConstants.LOG_FOLDER_PATH);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFileName = process.env.LOG_FILE_NAME || "framework.log";

const consoleFormat = winston.format.printf(
  ({ timestamp, level, message }: TransformableInfo) => {
    const colorizer = winston.format.colorize({ all: true });
    const coloredLevel = colorizer.colorize(level, level.toUpperCase());
    return `${timestamp} [${coloredLevel}]: ${message}`;
  },
);

export class Logger {
  private static formatMessage(
    message: string,
    context?: Record<string, unknown>,
  ): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }

    return `${message} ${JSON.stringify(context)}`;
  }

  private static readonly logger = winston.createLogger({
    level: process.env.LOG_LEVEL || SetupConstants.INFO,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      consoleFormat,
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: path.join(logDir, logFileName),
        level: "debug",
      }),
    ],
  });

  /**
   * Logs ONLY to console (not saved in file).
   * Useful for local debug or verbose output in VSCode terminal.
   */
  static consoleOnly(message: string): void {
    const timestamp = new Date().toISOString();
    const colorizer = format.colorize({ all: true });

    const coloredTimestamp = colorizer.colorize("silly", timestamp);
    const coloredLevel = colorizer.colorize("info", "INFO");

    console.log(
      `${coloredTimestamp} [${coloredLevel}]: [CONSOLE-ONLY] ${message}`,
    );
  }

  static debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  static info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(this.formatMessage(message, context));
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  static error(message: string, context?: Record<string, unknown>): void {
    this.logger.error(this.formatMessage(message, context));
  }

  static step(message: string): void {
    this.logger.info(`[STEP] ${message}`);
  }

  static initTestSuite(name: string): void {
    this.logger.info(`=== Starting Test Suite: ${name} ===`);
  }

  static termTestSuite(name: string): void {
    this.logger.info(`=== Completed Test Suite: ${name} ===`);
    this.logger.info(SetupConstants.LOGGER_LINE_SEPARATOR);
  }

  static initTest(name: string): void {
    this.logger.info(`-- Start Test: ${name}`);
  }

  static termTest(name: string): void {
    this.logger.info(`-- End Test: ${name}`);
    this.logger.info(SetupConstants.LOGGER_LINE_SEPARATOR);
  }
}

export const logger = Logger;
