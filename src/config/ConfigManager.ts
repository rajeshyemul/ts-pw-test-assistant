import dotenv from "dotenv";
import { Browsers } from "@support/enums/config/Browsers";

dotenv.config({ quiet: true });

export type Environment = "dev" | "qa" | "stage" | "prod" | "local";
export type LogLevel = "debug" | "info" | "warn" | "error";

export class ConfigManager {
  /**
   * Normalizes a URL by removing trailing slashes.
   * @param url The URL to normalize.
   * @returns The normalized URL.
   */
  private static normalizeUrl(url: string): string {
    return url.replace(/\/+$/, "");
  }

  /**
   * Retrieves the current environment setting from environment variables.
   * @returns The current environment (dev, qa, stage, prod, local).
   * @throws Error if the environment variable is set to an invalid value.
   */
  static getEnvironment(): Environment {
    const value = (
      process.env.ENVIRONMENT ||
      process.env.TEST_ENV ||
      "qa"
    ).toLowerCase();
    if (["dev", "qa", "stage", "prod", "local"].includes(value)) {
      return value as Environment;
    }
    throw new Error(`Invalid ENVIRONMENT value: ${value}`);
  }

  /**
   * Retrieves the base URL for the UI from environment variables or defaults based on the environment.
   * @returns The base URL for the UI.
   */
  static getUiBaseUrl(): string {
    const explicit = process.env.UI_BASE_URL || process.env.BASE_URL;
    if (explicit) {
      return this.normalizeUrl(explicit);
    }

    // Default URLs based on environment
    const defaults: Record<Environment, string> = {
      dev: "https://automationintesting.online",
      qa: "https://automationintesting.online",
      stage: "https://automationintesting.online",
      prod: "https://automationintesting.online",
      local: "https://automationintesting.online",
    };

    return defaults[this.getEnvironment()];
  }

  /**
   * Retrieves the selected browser for testing from environment variables, defaulting to Chromium if not specified or invalid.
   * @returns The selected browser (chromium, firefox, webkit).
   */
  static getBrowser(): Browsers {
    const browser = process.env.BROWSER?.toLowerCase();
    switch (browser) {
      case Browsers.FIREFOX:
        return Browsers.FIREFOX;
      case Browsers.WEBKIT:
        return Browsers.WEBKIT;
      default:
        return Browsers.CHROMIUM;
    }
  }

  /**
   * Determines if the tests should run in headless mode based on environment variables.
   * @returns True if headless mode is enabled; otherwise, false.
   */
  static isHeadless(): boolean {
    return process.env.HEADLESS === "true";
  }

  /**
   * Retrieves the log level for the application from environment variables, defaulting to 'info' if not specified or invalid.
   * @returns The log level (debug, info, warn, error).
   */
  static getLogLevel(): LogLevel {
    const level = (process.env.LOG_LEVEL || "info").toLowerCase();
    if (["debug", "info", "warn", "error"].includes(level)) {
      return level as LogLevel;
    }
    return "info";
  }

  /**
   * Determines if the application is running in debug mode based on environment variables.
   * @returns True if debug mode is enabled; otherwise, false.
   */

  static isDebug(): boolean {
    return process.env.DEBUG === "true";
  }

  /**
   * Determines if the tests are running in a Continuous Integration (CI) environment based on environment variables.
   * @returns True if running in CI; otherwise, false.
   */
  static isCI(): boolean {
    return process.env.CI === "true";
  }

  /**
   * Retrieves the username for authentication from environment variables, defaulting to 'admin' if not specified.
   * @returns The username for authentication.
   */
  static getUsername(): string {
    return process.env.ADMIN_USERNAME || "admin";
  }

  /**
   * Retrieves the password for authentication from environment variables, defaulting to 'password' if not specified.
   * @returns The password for authentication.
   */
  static getPassword(): string {
    return process.env.ADMIN_PASSWORD || "password";
  }
}
