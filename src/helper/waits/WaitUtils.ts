import { expect, Locator, Page } from "@playwright/test";
import { LocatorFactory } from "@helper/actions/LocatorFactory";
import { PageActions } from "@helper/actions/PageActions";
import { Logger } from "@helper/logger/Logger";

export class WaitUtils {
  constructor(private readonly pageActions: PageActions) {}

  private get page(): Page {
    return this.pageActions.getPage();
  }

  private getLocator(input: string | Locator): Locator {
    return LocatorFactory.getLocator(this.page, input);
  }

  async waitForVisible(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for target to be visible`);
    await this.getLocator(input).waitFor({ state: "visible", timeout });
  }

  async waitForHidden(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for target to be hidden`);
    await this.getLocator(input).waitFor({ state: "hidden", timeout });
  }

  async waitForAttached(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for target to be attached`);
    await this.getLocator(input).waitFor({ state: "attached", timeout });
  }

  async waitForDetached(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for target to be detached`);
    await this.getLocator(input).waitFor({ state: "detached", timeout });
  }

  async waitForNavigation(
    urlPattern: string | RegExp,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for navigation to: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  async waitForLoadState(
    state: "load" | "domcontentloaded" | "networkidle" = "load",
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for load state: ${state}`);
    await this.page.waitForLoadState(state, { timeout });
  }

  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    Logger.info("Waiting for initial page load");
    await this.waitForLoadState("domcontentloaded", timeout);
  }

  async waitForPageReady(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for page-ready target`);
    await this.waitForVisible(input, timeout);
  }

  async sleep(milliseconds: number): Promise<void> {
    Logger.warn(
      `Hard wait for ${milliseconds}ms - prefer explicit waits where possible`,
    );
    await this.page.waitForTimeout(milliseconds);
  }

  async waitForCount(
    input: string | Locator,
    count: number,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for ${count} matching elements`);
    await expect(this.getLocator(input)).toHaveCount(count, { timeout });
  }

  async waitForFunction(
    fn: () => boolean | Promise<boolean>,
    options?: { timeout?: number; polling?: number },
  ): Promise<void> {
    const timeout = options?.timeout ?? 30000;
    const polling = options?.polling ?? 100;

    Logger.info("Waiting for custom condition");

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await fn()) {
        Logger.info("Custom condition satisfied");
        return;
      }
      await this.sleep(polling);
    }

    throw new Error(
      `Timeout: condition did not become true within ${timeout}ms`,
    );
  }

  async waitForText(
    text: string | RegExp,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for text: ${text}`);
    await this.page.getByText(text).waitFor({ state: "visible", timeout });
  }

  async waitForUrlContains(
    urlPart: string,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for URL to contain: ${urlPart}`);

    try {
      const urlRegex = new RegExp(
        urlPart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );
      await this.page.waitForURL(urlRegex, { timeout });
      Logger.info(`URL contains: ${urlPart}`);
    } catch {
      throw new Error(
        `Timeout: URL did not contain "${urlPart}" within ${timeout}ms`,
      );
    }
  }

  async waitForEnabled(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for target to be enabled`);
    await expect(this.getLocator(input)).toBeEnabled({ timeout });
  }

  async waitForDisabled(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for target to be disabled`);
    await expect(this.getLocator(input)).toBeDisabled({ timeout });
  }

  async waitForValue(
    input: string | Locator,
    value: string | RegExp,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for target to have value: ${value}`);
    await expect(this.getLocator(input)).toHaveValue(value, { timeout });
  }
}
