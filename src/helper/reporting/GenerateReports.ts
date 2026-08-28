// src/helper/reporting/GenerateReports.ts

import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Logger } from "../logger/Logger";

export class GenerateReports {
  private static readonly REPORT_ROOT = path.resolve(process.cwd(), "reports");
  private static readonly FLAKY_REPORT_ROOT = path.resolve(
    process.cwd(),
    "flaky-report",
  );

  private static openFile(filePath: string): void {
    const normalizedPath = path.resolve(filePath);
    let command = "";

    if (process.platform === "darwin") {
      command = `open "${normalizedPath}"`;
    } else if (process.platform === "win32") {
      command = `start "" "${normalizedPath}"`;
    } else {
      command = `xdg-open "${normalizedPath}"`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Failed to open file: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }

  private static getCommandEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    const configuredJavaHome = env.JAVA_HOME;

    if (configuredJavaHome && fs.existsSync(configuredJavaHome)) {
      return env;
    }

    try {
      const resolvedJavaHome = execSync("/usr/libexec/java_home", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();

      if (resolvedJavaHome) {
        env.JAVA_HOME = resolvedJavaHome;
      }
    } catch {
      delete env.JAVA_HOME;
    }

    return env;
  }

  /**
   * Finds the most recent timestamped run folder under /reports, or falls back to /reports.
   */
  public static getLatestRunFolder(): string {
    const root = this.REPORT_ROOT;

    if (!fs.existsSync(root)) {
      const message = `No reports directory found at ${root}. Please run tests first: npm test`;
      Logger.error(message);
      throw new Error(message);
    }

    const folders = fs
      .readdirSync(root)
      .filter((name) => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(name))
      .map((name) => path.join(root, name))
      .filter(
        (dir) =>
          fs.existsSync(path.join(dir, "allure-results")) ||
          fs.existsSync(path.join(dir, "html")),
      );

    if (folders.length > 0) {
      folders.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
      return folders[0];
    }

    // Direct fallback if html or allure-results exists directly under /reports
    if (
      fs.existsSync(path.join(root, "allure-results")) ||
      fs.existsSync(path.join(root, "html"))
    ) {
      return root;
    }

    const message = `
No test run folders found in ${root}.
Please run tests first: npm test
  `.trim();
    Logger.error(message);
    throw new Error(message);
  }

  /**
   * Opens the Playwright HTML report for the latest run.
   */
  public static openHtmlReport(): void {
    const runPath = this.getLatestRunFolder();
    const htmlPath = path.join(runPath, "html");

    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML report not found at ${htmlPath}`);
    }

    const command = `npx playwright show-report "${htmlPath}"`;
    Logger.info(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Failed to open HTML report: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }

  /**
   * Generates and optionally opens the Allure report.
   */
  public static generateAllureReport(openReport: boolean = true): void {
    const runPath = this.getLatestRunFolder();
    const allureResultsDir = path.join(runPath, "allure-results");
    const allureReportDir = path.join(runPath, "allure-report");

    if (!fs.existsSync(allureResultsDir)) {
      throw new Error(`Allure results directory not found at ${allureResultsDir}`);
    }

    const command = `npx allure generate "${allureResultsDir}" --clean -o "${allureReportDir}"`;
    Logger.info(`Executing: ${command}`);

    try {
      const output = execSync(command, {
        encoding: "utf8",
        env: this.getCommandEnv(),
      });
      Logger.info(output);

      if (openReport) {
        this.openAllureReport(allureReportDir);
      }
    } catch (error: any) {
      Logger.error(`Failed to generate Allure report: ${error.message}`);
      if (error.stdout) Logger.info(error.stdout);
      if (error.stderr) Logger.error(error.stderr);
      throw error;
    }
  }

  /**
   * Opens an existing Allure report using allure open.
   */
  public static openAllureReport(reportDir?: string): void {
    const targetDir = reportDir || path.join(this.getLatestRunFolder(), "allure-report");

    if (!fs.existsSync(targetDir)) {
      throw new Error(`Allure report directory not found at ${targetDir}`);
    }

    const command = `npx allure open "${targetDir}"`;
    Logger.info(`Executing: ${command}`);

    exec(command, { env: this.getCommandEnv() }, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Failed to open Allure report: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }

  /**
   * Opens the flaky test analysis HTML report.
   */
  public static openFlakyReport(): void {
    const reportPath = path.join(this.FLAKY_REPORT_ROOT, "index.html");

    if (!fs.existsSync(reportPath)) {
      const message = `
Flaky report not found at ${reportPath}.
Generate it first using: npm run analyze:flaky
    `.trim();
      Logger.error(message);
      throw new Error(message);
    }

    Logger.info(`Opening flaky report: ${reportPath}`);
    this.openFile(reportPath);
  }
}

// CLI Execution Handler
if (require.main === module) {
  const args = process.argv.slice(2);
  const reportType = args[0];
  const flag = args[1];

  switch (reportType) {
    case "html":
      GenerateReports.openHtmlReport();
      break;
    case "allure":
      GenerateReports.generateAllureReport(flag === "--open");
      break;
    case "allure-open":
      GenerateReports.openAllureReport();
      break;
    case "flaky":
      GenerateReports.openFlakyReport();
      break;
    default:
      console.log(`
Usage:
  npx ts-node src/helper/reporting/GenerateReports.ts <report-type> [options]

Report Types:
  html          Open Playwright HTML report
  allure        Generate Allure report (add --open to open after generating)
  allure-open   Open previously generated Allure report
  flaky         Open flaky test analysis report
      `);
      break;
  }
}
