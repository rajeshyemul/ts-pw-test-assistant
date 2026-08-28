import {
  devices,
  type PlaywrightTestConfig,
  type ReporterDescription,
} from "@playwright/test";
import os from "os";
import path from "path";
import { ConfigManager } from "./ConfigManager";
import { PathConstants } from "../support/constants/PathConstants";
import { SetupConstants } from "../support/constants/SetupConstants";

const browserDeviceMap = {
  chromium: devices["Desktop Chrome"],
  firefox: devices["Desktop Firefox"],
  webkit: devices["Desktop Safari"],
} as const;

export class PlaywrightConfigFactory {
  static readonly TEST_DIR = "./tests";
  static readonly GLOBAL_SETUP_PATH = "./src/config/global-setup";
  static readonly GLOBAL_TEARDOWN_PATH = "./src/config/global-teardown";

  /**
   * Gets the root directory for reports.
   * @returns The path to the report root directory, which is determined by the REPORT_ROOT environment variable or defaults to a timestamped folder in the 'reports' directory.
   * This method ensures that each test run generates reports in a unique directory, preventing overwriting of previous reports and allowing for better organization and historical tracking of test results.
   * If the REPORT_ROOT environment variable is not set or is empty, it creates a new directory with the current timestamp under the 'reports' folder in the current working directory.
   */
  private static getReportRoot(): string {
    if (!process.env.REPORT_ROOT || process.env.REPORT_ROOT.trim() === "") {
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19);
      process.env.REPORT_ROOT = path.join(process.cwd(), "reports", timestamp);
    }

    return process.env.REPORT_ROOT;
  }

  // Determines if the tests should be run in headless mode based on the HEADLESS environment variable. This allows for flexibility in test execution, enabling headless mode for CI environments or when running tests on a server, while allowing for headed mode during local development for easier debugging and visibility of the browser interactions.
  private static getSelectedBrowser() {
    return ConfigManager.getBrowser();
  }

  // Retrieves the list of reporters to be used for the test run based on the context of the execution (ordered discovery, ordered run, or default). This method ensures that the appropriate reporters are configured to capture and present test results in a manner that suits the specific needs of each type of test run, providing detailed insights for ordered runs while maintaining simplicity for discovery runs.
  private static getReportPath(...segments: string[]): string {
    return path.join(this.getReportRoot(), ...segments);
  }

  // Parses a string value into a number, returning a fallback value if the parsing fails or results in an invalid number. This method is used to safely convert environment variable values into numeric configurations for the test framework, ensuring that default values are applied when necessary and preventing potential issues caused by invalid input.
  private static parseNumber(
    value: string | undefined,
    fallback: number,
  ): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue >= 0
      ? parsedValue
      : fallback;
  }

  /**
   * Retrieves the list of reporters to be used for the test run based on the context of the execution (ordered discovery, ordered run, or default). This method ensures that the appropriate reporters are configured to capture and present test results in a manner that suits the specific needs of each type of test run, providing detailed insights for ordered runs while maintaining simplicity for discovery runs.
   * @returns An array of ReporterDescription objects representing the configured reporters for the test run, which may include different sets of reporters depending on whether the run is an ordered discovery, ordered execution, or a default run.
   */
  private static getEnvironmentInfo(): Record<string, string> {
    const workers = this.getConfiguredWorkers();
    return {
      Framework: SetupConstants.FRAMEWORK_TITLE,
      Environment: ConfigManager.getEnvironment(),
      Browser: this.getSelectedBrowser(),
      UI_Base_URL: ConfigManager.getUiBaseUrl(),
      OS_Platform: os.platform(),
      OS_Release: os.release(),
      Node_Version: process.version,
      Parallel_Workers: workers ? String(workers) : "Auto",
      Report_Generation_Time: new Date().toLocaleString(),
    };
  }

  /**
   * Retrieves the number of worker processes to be used for parallel test execution based on environment variables and CI context. This method allows for dynamic adjustment of the level of parallelism in test runs, enabling more efficient use of resources in CI environments while allowing for default behavior during local development.
   * If the WORKERS environment variable is set, it will parse and return that value. If not, and if the tests are running in a CI environment, it will look for the CI_WORKERS environment variable. If neither is set, it returns undefined, allowing Playwright to determine the optimal number of workers based on the system's CPU cores.
   * @returns The number of worker processes to use for parallel test execution, or undefined to allow Playwright to auto-configure based on available CPU cores.
   */
  static getConfiguredWorkers(): number | undefined {
    if (process.env.WORKERS) {
      return this.parseNumber(process.env.WORKERS, 1);
    }

    if (ConfigManager.isCI()) {
      return this.parseNumber(process.env.CI_WORKERS, 1);
    }

    return undefined;
  }

  /**
   * Retrieves the number of times a test should be retried if it fails, based on environment variables and CI context. This method allows for dynamic adjustment of the retry logic in test runs, enabling more robust testing in CI environments while allowing for default behavior during local development.
   * If the RETRIES environment variable is set, it will parse and return that value. If not, and if the tests are running in a CI environment, it will return 1. Otherwise, it returns 0.
   * @returns The number of times a test should be retried if it fails.
   */
  static getRetries(): number {
    return this.parseNumber(process.env.RETRIES, ConfigManager.isCI() ? 1 : 0);
  }

  /**
   * Retrieves the test timeout duration in milliseconds based on the TEST_TIMEOUT environment variable. This method allows for dynamic configuration of test timeouts, enabling adjustments to accommodate different testing scenarios or environments.
   * If the TEST_TIMEOUT environment variable is set, it will parse and return that value. If not, it returns a default timeout of 60,000 milliseconds (1 minute).
   * @returns The test timeout duration in milliseconds.
   */
  static getTestTimeout(): number {
    return this.parseNumber(process.env.TEST_TIMEOUT, 60_000);
  }

  /**
   * Retrieves the output directory for test artifacts based on the context of the execution (ordered run or default). This method ensures that artifacts are organized appropriately, with ordered runs having a dedicated directory structure to prevent conflicts and maintain clarity in report organization.
   * If the run is an ordered execution, it constructs the output directory path using the report root, a specific folder for artifacts, and an optional bucket name from environment variables. For default runs, it simply returns the path to the artifacts folder within the report root.
   * @returns The path to the output directory for test artifacts.
   */
  static getOutputDirectory(): string {
    return this.getReportPath(PathConstants.FOLDER_ARTIFACTS);
  }

  /**
   * Creates a reporter configuration for Allure reporting, including environment information. This method constructs a ReporterDescription for the 'allure-playwright' reporter, embedding detailed environment information to enhance the context and usefulness of the generated Allure reports.
   * The environment information includes details such as the testing framework, environment, browser, base URLs, operating system platform and release, Node.js version, and report generation time. This enriched information allows for better analysis and debugging of test results within the Allure reporting interface.
   * @param environmentInfo - An object containing key-value pairs of environment information to be included in the Allure report.
   * @returns A ReporterDescription array configured for the 'allure-playwright' reporter with the provided environment information.
   */
  private static createAllureReporter(
    environmentInfo: Record<string, string>,
  ): ReporterDescription {
    return [
      "allure-playwright",
      {
        detail: true,
        resultsDir: this.getReportPath(PathConstants.ALLURE_REPORTS_PATH),
        suiteTitle: true,
        environmentInfo,
      },
    ];
  }

  /**
   * Retrieves the default reporters for test execution. This method returns an array of reporter configurations that are used when no specific reporting mode is selected.
   * @returns An array of ReporterDescription objects configured for the default reporting modes.
   */

  private static getDefaultReporters(): ReporterDescription[] {
    return [
      ["list"],
      [
        "html",
        {
          open: SetupConstants.NEVER,
          title: SetupConstants.HTML_REPORT_TITLE,
          outputFolder: this.getReportPath(PathConstants.HTML_REPORTS_PATH),
          noSnippets: true,
        },
      ],
      [
        "junit",
        { outputFile: this.getReportPath(PathConstants.JUNIT_REPORTS_PATH) },
      ],
      [
        "json",
        { outputFile: this.getReportPath(PathConstants.JSON_REPORTS_PATH) },
      ],
      this.createAllureReporter(this.getEnvironmentInfo()),
    ];
  }

  /**
   * Retrieves the list of reporters to be used for the test run based on the context of the execution (ordered discovery, ordered run, or default). This method ensures that the appropriate reporters are configured to capture and present test results in a manner that suits the specific needs of each type of test run, providing detailed insights for ordered runs while maintaining simplicity for discovery runs.
   * @returns An array of ReporterDescription objects representing the configured reporters for the test run, which may include different sets of reporters depending on whether the run is an ordered discovery, ordered execution, or a default run.
   */
  static getReporters(): ReporterDescription[] {
    return this.getDefaultReporters();
  }

  /**
   * Retrieves the use options for the Playwright test configuration. This method returns an object containing the default options for the Playwright test environment.
   * @returns An object containing the use options for the Playwright test configuration.
   */

  static getUseOptions(): PlaywrightTestConfig["use"] {
    return {
      baseURL: ConfigManager.getUiBaseUrl(),
      headless: ConfigManager.isHeadless(),
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
      screenshot: SetupConstants.ONLY_ON_FAILURE as "only-on-failure",
      video: SetupConstants.RETAIN_ON_FAILURE as "retain-on-failure",
      trace: SetupConstants.RETAIN_ON_FAILURE as "retain-on-failure",
    };
  }

  /**
   * Retrieves the projects configuration for the Playwright test runs. This method returns an array of project configurations based on the selected browser, allowing for dynamic adjustment of test execution across different browser environments.
   * The method determines the selected browser using the getSelectedBrowser method and constructs a project configuration that includes the appropriate device settings for that browser. This enables tests to be executed in a consistent environment that mimics real user conditions for each supported browser.
   * @returns An array of project configurations for the Playwright test runs, tailored to the selected browser environment.
   */
  static getProjects(): PlaywrightTestConfig["projects"] {
    const selectedBrowser = this.getSelectedBrowser();

    return [
      {
        name: `framework-${selectedBrowser}`,
        use: {
          ...browserDeviceMap[selectedBrowser],
          browserName: selectedBrowser,
        },
      },
    ];
  }
}
