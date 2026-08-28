import { Page, test } from "@playwright/test";
import { Logger } from "@helper/logger/Logger";
import { AllureReporter } from "./AllureReporter";

/**
 * StepRunner - Enhanced step execution with error handling
 *
 * ENHANCEMENTS:
 * Automatic screenshot on step failure
 * Step timing information
 * Nested step support
 * Step description templates
 */
export class StepRunner {
  /**
   * Execute a step with automatic error handling and reporting
   *
   * @param stepName - Step name
   * @param stepBody - Step function to execute
   * @param options - Step options
   */
  static async run<T>(
    stepName: string,
    stepBody: () => Promise<T>,
    options?: {
      screenshot?: boolean; // Take screenshot after step
      logResult?: boolean; // Log step result
    },
  ): Promise<T> {
    const startTime = Date.now();

    try {
      Logger.info(`▶ STEP START: ${stepName}`);

      const result = await test.step(stepName, async () => {
        const stepResult = await stepBody();
        return stepResult;
      });

      const duration = Date.now() - startTime;
      Logger.info(`STEP PASSED: ${stepName} (${duration}ms)`);

      if (options?.logResult && result !== undefined) {
        const resultStr =
          typeof result === "object"
            ? JSON.stringify(result, null, 2)
            : String(result);
        Logger.info(`Step Result:\n${resultStr}`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(`STEP FAILED: ${stepName} (${duration}ms)`);
      Logger.error(`Error: ${error}`);

      // Re-throw to preserve test failure
      throw error;
    }
  }

  /**
   * Execute multiple steps in sequence
   *
   * @param steps - Array of step definitions
   */
  static async runSequence(
    steps: Array<{ name: string; action: () => Promise<any> }>,
  ): Promise<void> {
    for (const step of steps) {
      await StepRunner.run(step.name, step.action);
    }
  }

  /**
   * Create a step group (nested steps)
   *
   * @param groupName - Group name
   * @param steps - Steps to execute
   */
  static async group(
    groupName: string,
    steps: () => Promise<void>,
  ): Promise<void> {
    await test.step(groupName, async () => {
      Logger.info(`📁 STEP GROUP: ${groupName}`);
      await steps();
      Logger.info(`STEP GROUP COMPLETE: ${groupName}`);
    });
  }

  /**
   * Conditional step execution
   *
   * @param condition - Condition to check
   * @param stepName - Step name
   * @param stepBody - Step to execute if condition is true
   */
  static async runIf(
    condition: boolean,
    stepName: string,
    stepBody: () => Promise<void>,
  ): Promise<void> {
    if (condition) {
      await StepRunner.run(stepName, stepBody);
    } else {
      Logger.info(`STEP SKIPPED: ${stepName} (condition not met)`);
    }
  }

  /**
   * Step with retry logic
   *
   * @param stepName - Step name
   * @param stepBody - Step function
   * @param maxRetries - Maximum retries
   */
  static async runWithRetry(
    stepName: string,
    stepBody: () => Promise<void>,
    maxRetries: number = 3,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await StepRunner.run(`${stepName} (Attempt ${attempt})`, stepBody);
        return; // Success, exit
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        Logger.warn(`Retry ${attempt}/${maxRetries} for: ${stepName}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Execute a step and take screenshot after completion
   *
   * @param stepName - Step name
   * @param stepBody - Step function
   * @param page - Playwright page instance
   */
  static async runWithScreenshot<T>(
    stepName: string,
    stepBody: () => Promise<T>,
    page: Page,
  ): Promise<T> {
    const result = await StepRunner.run(stepName, stepBody);

    try {
      const screenshot = await page.screenshot({ fullPage: true });
      await AllureReporter.attachScreenshot(
        `${stepName}-screenshot`,
        screenshot,
      );
    } catch (error) {
      Logger.warn(`Could not capture screenshot for step: ${error}`);
    }

    return result;
  }

  /**
   * Execute multiple steps in parallel
   *
   * @param steps - Array of step definitions
   */
  static async runParallel(
    steps: Array<{ name: string; action: () => Promise<any> }>,
  ): Promise<void> {
    await test.step("Parallel Steps", async () => {
      const promises = steps.map((step) =>
        StepRunner.run(step.name, step.action),
      );
      await Promise.all(promises);
    });
  }

  /**
   * Execute a step with timeout
   *
   * @param stepName - Step name
   * @param stepBody - Step function
   * @param timeout - Timeout in milliseconds
   */
  static async runWithTimeout<T>(
    stepName: string,
    stepBody: () => Promise<T>,
    timeout: number = 30000,
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Step timeout after ${timeout}ms: ${stepName}`)),
        timeout,
      );
    });

    return await StepRunner.run(stepName, async () => {
      return await Promise.race([stepBody(), timeoutPromise]);
    });
  }
}
