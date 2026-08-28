import { Logger } from "../logger/Logger";
import { ParsedXML } from "../models/CommonTypes";
import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
} from "@playwright/test/reporter";
import { GenerateReports } from "../reporting/GenerateReports";
import { PathConstants } from "../../support/constants/PathConstants";
import { SetupConstants } from "../../support/constants/SetupConstants";
import { TestResultStatus } from "../../support/enums/results/TestResultStatus";
import { FileUtils } from "../../utils/FileUtils";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";

let totalTests = 0;
let currentTest = 1;

let suiteStartTime: string, suiteEndTime: string;
const getFormattedTime = () => `${new Date().toISOString()}`;
const ciPerspective = process.env.CI === "true" ? true : false;

const getDuration = (startTime: string, endTime: string) => {
  // Convert start and end time strings to Date objects and get their timestamps in seconds
  const firstDateInSeconds = new Date(startTime).getTime() / 1000;
  const secondDateInSeconds = new Date(endTime).getTime() / 1000;

  // Calculate the difference in seconds between the two timestamps
  const differenceInSeconds = roundSeconds(
    firstDateInSeconds - secondDateInSeconds,
  );

  // If the difference is less than 60 seconds, return seconds only
  if (differenceInSeconds < 60) {
    return formatDuration(differenceInSeconds, SetupConstants.SECOND);
  }
  // If the difference is less than 1 hour, return minutes and seconds
  else if (differenceInSeconds < 3600) {
    const minutes = Math.floor(differenceInSeconds / 60);
    const seconds = differenceInSeconds % 60;
    return (
      formatDuration(minutes, SetupConstants.MINUTE) +
      " " +
      formatDuration(seconds, SetupConstants.SECOND)
    );
  }
  // Otherwise, return hours, minutes, and seconds
  else {
    const hours = Math.floor(differenceInSeconds / 3600);
    const remainingSeconds = differenceInSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return (
      formatDuration(hours, SetupConstants.HOUR) +
      " " +
      formatDuration(minutes, SetupConstants.MINUTE) +
      " " +
      formatDuration(seconds, SetupConstants.SECOND)
    );
  }
};

// Helper function to format duration with proper pluralization
const formatDuration = (value: number, unit: string) => {
  return `${value} ${value !== 1 ? unit + "s" : unit}`;
};

// Helper function to round seconds to the nearest integer
const roundSeconds = (seconds: number) => Math.round(seconds);

export default class CustomReporterConfig implements Reporter {
  onBegin(_config: FullConfig, suite: Suite): void {
    suiteStartTime = getFormattedTime();
    totalTests = suite.allTests().length;
    Logger.consoleOnly(
      `Starting the run with ${suite.allTests().length} tests`,
    );
  }

  onEnd(result: FullResult): void | Promise<void> {
    suiteEndTime = getFormattedTime();
    Logger.consoleOnly("Final execution status : " + `${result.status}`);
    Logger.consoleOnly(
      `Overall run duration: ${getDuration(suiteEndTime, suiteStartTime)}`,
    );
  }

  onTestBegin(test: TestCase): void {
    Logger.consoleOnly(
      `Test ${currentTest} of ${totalTests} - ${test.parent.title}`,
    );
    Logger.consoleOnly(`Test Case Started : ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    let errorMessage: string | undefined = undefined;
    if (result.status === TestResultStatus.PASSED) {
      Logger.consoleOnly(`Test Case ${result.status} : ${test.title}`);
    } else if (result.status === TestResultStatus.SKIPPED) {
      Logger.consoleOnly(`Test Case ${result.status} : ${test.title}`);
    } else if (result.status === TestResultStatus.FAILED && result.error) {
      errorMessage = result.error?.message?.toString();
      Logger.error(
        `Test Case Failed: ${test.title}\n With error message: ${errorMessage}`,
      );
    }

    const execTimeInSeconds = result.duration / 1000;
    const data = {
      date: getFormattedTime(),
      test: test.title,
      status: result.status,
      executionTime: `${execTimeInSeconds} ${SetupConstants.SECOND}`,
      ...(errorMessage && { errors: errorMessage }),
    };

    const dataToString = JSON.stringify(data, null, 2);
    Logger.consoleOnly(
      `Test Execution Completed & Details Are : ${dataToString}`,
    );
    const ciRetries = process.env.CI_RETRIES ? +process.env.CI_RETRIES : 1;
    if (
      ciPerspective &&
      (result.status === SetupConstants.PASSED_STATUS.toLowerCase() ||
        result.retry === ciRetries)
    )
      currentTest++;
    if (!ciPerspective) currentTest++;
  }

  onError(error: TestError): void {
    Logger.error("Error Details are :" + error?.message);
  }

  async onExit(): Promise<void> {
    const xmlResult = await parseLatestXML();
    const totalTests = parseInt(xmlResult.tests);
    const failedTests = parseInt(xmlResult.failures);
    const skippedTests = parseInt(xmlResult.skipped);
    const passedTests = totalTests - failedTests - skippedTests;
    Logger.consoleOnly("Test Result Summary");
    Logger.consoleOnly("Total Testcases:".padEnd(20) + totalTests);
    Logger.consoleOnly("Passed:".padEnd(20) + passedTests);
    Logger.consoleOnly("Failed:".padEnd(20) + failedTests);
    Logger.consoleOnly("Skipped:".padEnd(20) + skippedTests);
    await clearReports(5);
    await clearLogs(5);
  }
}

/**
 * Method to read XML report
 * @param filePath path for XML report
 * @returns test run result
 */
async function parseLatestXML(): Promise<ParsedXML> {
  const filePath = path.join(
    GenerateReports.getLatestRunFolder(),
    "./results/results.xml",
  );
  const xmlString = FileUtils.getFileContent(filePath, "utf-8");
  const result = await xml2js.parseStringPromise(xmlString);
  return result.testsuites.$;
}

/**
 * Deletes old report folders, keeping only the most recent ones up to the specified limit.
 *
 * This function scans the report directory, identifies folders that match a timestamp-based
 * naming pattern (e.g., `2025-08-04_21-06-40`), sorts them chronologically, and removes the
 * oldest folders if the total count exceeds the `max` parameter.
 *
 * @param max - The maximum number of report folders to retain.
 * Older folders beyond this count will be deleted.
 */
async function clearReports(max: number) {
  const reportsDir = PathConstants.FOLDER_REPORTS;
  const folderNameRegex = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;

  const folders = fs
    .readdirSync(reportsDir)
    .filter((name) => {
      const fullPath = path.join(reportsDir, name);
      return fs.statSync(fullPath).isDirectory() && folderNameRegex.test(name);
    })
    .sort((a, b) => {
      return (
        new Date(a.replace("_", "T")).getTime() -
        new Date(b.replace("_", "T")).getTime()
      );
    });

  const foldersToDelete =
    folders.length > max ? folders.slice(0, folders.length - max) : [];

  foldersToDelete.forEach((folder) => {
    const fullPath = path.join(reportsDir, folder);
    fs.rmSync(fullPath, { recursive: true, force: true });
    Logger.consoleOnly(`Deleted Report: ${folder}`);
  });
}

/**
 * Deletes old log files, grouping them by timestamp and keeping only the most recent entries.
 *
 * This function scans the log directory for files matching the pattern:
 * `log_YYYY-MM-DD_HH-MM-SS_worker-X.log`. It groups files by their timestamp
 * (ignoring the worker index), sorts them chronologically, and removes all log
 * files belonging to older timestamps if the total count of unique timestamps
 * exceeds the `max` limit.
 *
 * @param max - The maximum number of unique timestamps to retain.
 * All logs older than this count will be deleted.
 */
async function clearLogs(max: number) {
  const logsDir = PathConstants.LOG_FOLDER_PATH;
  const logNameRegex =
    /^log_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_worker-\d+\.log$/;
  const logFiles = fs
    .readdirSync(logsDir)
    .filter((file) => logNameRegex.test(file))
    .sort((a, b) => {
      const dateA = a.match(logNameRegex)![1].replace("_", "T");
      const dateB = b.match(logNameRegex)![1].replace("_", "T");
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  const uniqueDates = Array.from(
    new Set(logFiles.map((file) => file.match(logNameRegex)![1])),
  );
  const datesToDelete =
    uniqueDates.length > max
      ? uniqueDates.slice(0, uniqueDates.length - max)
      : [];
  const filesToDelete = logFiles.filter((file) =>
    datesToDelete.some((date) => file.includes(date)),
  );

  filesToDelete.forEach((file) => {
    const fullPath = path.join(logsDir, file);
    fs.rmSync(fullPath, { force: true });
    Logger.consoleOnly?.(`Deleted Logs: ${file}`);
  });
}
