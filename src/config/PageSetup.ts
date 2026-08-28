import { test as baseTest, TestInfo } from "@playwright/test";
import * as fs from "fs";
import { Logger } from "@helper/logger/Logger";
import { AllureReporter } from "@helper/reporting/AllureReporter";
import { SetupConstants } from "@support/constants/SetupConstants";

baseTest.beforeAll(async () => {
  Logger.info("=".repeat(80));
  Logger.info("Unified Framework Suite Starting");
  Logger.info("=".repeat(80));
  AllureReporter.logEnvironmentInfo();
});

baseTest.beforeEach(async ({ page, context }, testInfo: TestInfo) => {
  Logger.info("-".repeat(80));
  Logger.info(`Test Starting: ${testInfo.title}`);
  Logger.info(`Worker: ${testInfo.parallelIndex + 1}`);
  Logger.info(`Project: ${testInfo.project.name}`);
  Logger.info("-".repeat(80));

  // Add worker information to Allure report
  await AllureReporter.addWorkerInfo(testInfo);

  testInfo.setTimeout(SetupConstants.TEST_TIMEOUT);

  const browserName = context.browser()?.browserType().name();
  const viewport = page.viewportSize();

  Logger.info(`Browser: ${browserName}`);
  Logger.info(`Viewport: ${viewport?.width}x${viewport?.height}`);

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      Logger.warn(`Browser ${message.type()}: ${message.text()}`);
    }
  });
});

baseTest.afterEach(async ({ page }, testInfo: TestInfo) => {
  Logger.info("-".repeat(80));
  Logger.info(`Test Finished: ${testInfo.title}`);
  Logger.info(`Status: ${testInfo.status}`);
  Logger.info(`Duration: ${testInfo.duration}ms`);

  if (testInfo.status === "failed" || testInfo.status === "timedOut") {
    try {
      const screenshot = await page.screenshot({
        fullPage: true,
        timeout: 5000,
      });
      await AllureReporter.attachScreenshot(
        `failure-screenshot-${testInfo.title?.replace(/\s+/g, "-") || "screenshot"}`,
        screenshot,
      );

      await AllureReporter.attachHTML("page-source", await page.content());
      await AllureReporter.attachText("current-url", page.url());
      await AllureReporter.attachText("page-title", await page.title());

      if (testInfo.errors.length > 0) {
        await AllureReporter.attachJSON("test-errors", testInfo.errors);
      }
    } catch (error) {
      Logger.error(`Failed to capture failure artifacts: ${error}`);
    }
  }

  if (testInfo.status === "failed" || testInfo.status === "timedOut") {
    try {
      const video = page.video();
      if (video) {
        const videoPath = await video.path();
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (fs.existsSync(videoPath)) {
          await AllureReporter.attachVideo("test-recording", videoPath);
        }
      }
    } catch (error) {
      Logger.warn(`Could not attach video: ${error}`);
    }
  }

  Logger.info("-".repeat(80));
});

baseTest.afterAll(async () => {
  Logger.info("=".repeat(80));
  Logger.info("Unified Framework Suite Completed");
  Logger.info("=".repeat(80));
});

export { baseTest };
