import { expect, Locator, Page } from "@playwright/test";
import { PageActions } from "../PageActions";
import { LocatorFactory } from "../LocatorFactory";
import { Logger } from "@helper/logger/Logger";

/**
 * CheckboxActions - Checkbox interaction utilities.
 */
export class CheckboxActions {
  private pageActions: PageActions;

  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  /**
   * Get the current active Playwright page from PageActions.
   */
  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Check checkbox
   */
  public async check(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Checking checkbox");
    await locator.check();
  }

  /**
   * Uncheck checkbox
   */
  public async uncheck(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Unchecking checkbox");
    await locator.uncheck();
  }

  /**
   * Toggle checkbox (check if unchecked, uncheck if checked)
   */
  public async toggle(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const isChecked = await this.isChecked(input);

    if (isChecked) {
      Logger.info("Toggling: Unchecking checkbox");
      await locator.uncheck();
    } else {
      Logger.info("Toggling: Checking checkbox");
      await locator.check();
    }
  }

  /**
   * Check if checkbox is checked
   */
  public async isChecked(input: string | Locator): Promise<boolean> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const checked = await locator.isChecked();
    Logger.info(`Checkbox checked state: ${checked}`);
    return checked;
  }

  /**
   * Set checkbox to specific state
   */
  public async setChecked(
    input: string | Locator,
    checked: boolean,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);

    if (checked) {
      Logger.info("Setting checkbox to checked");
      await locator.check();
    } else {
      Logger.info("Setting checkbox to unchecked");
      await locator.uncheck();
    }
  }

  /**
   * Wait for checkbox to be checked
   */
  public async waitForChecked(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Waiting for checkbox to be checked");
    await expect(locator).toBeChecked({ timeout });
  }

  /**
   * Wait for checkbox to be unchecked
   */
  public async waitForUnchecked(
    input: string | Locator,
    timeout: number = 30000,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Waiting for checkbox to be unchecked");
    await expect(locator).not.toBeChecked({ timeout });
  }

  /**
   * Wait for the target control to contain a specific option.
   */
  public async waitForOption(
    input: string | Locator,
    optionText: string,
    timeout: number = 30000,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Waiting for option: ${optionText}`);

    await expect(
      locator.locator("option", { hasText: optionText }),
    ).toBeAttached({ timeout });
  }

  /**
   * Wait for the target control to contain the expected number of options.
   */
  public async waitForOptionCount(
    input: string | Locator,
    count: number,
    timeout: number = 30000,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Waiting for ${count} options`);

    await expect(locator.locator("option")).toHaveCount(count, { timeout });
  }
}
