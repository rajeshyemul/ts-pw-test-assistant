import { Locator, Page } from "@playwright/test";
import { PageActions } from "../PageActions";
import { LocatorFactory } from "../LocatorFactory";
import { Logger } from "@helper/logger/Logger";

/**
 * EditBoxActions - Input field interaction utilities.
 */
export class EditBoxActions {
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
   * Fill input field
   */
  public async fill(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Filling input with: ${value}`);
    await locator.fill(value);
  }

  /**
   * Type text with delay (simulates typing)
   */
  public async type(
    input: string | Locator,
    text: string,
    delay: number = 100,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Typing: ${text} with delay ${delay}ms`);
    await locator.type(text, { delay });
  }

  /**
   * Clear input field
   */
  public async clear(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Clearing input field");
    await locator.clear();
  }

  /**
   * Get input value
   */
  public async getValue(input: string | Locator): Promise<string> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const value = await locator.inputValue();
    Logger.info(`Input value: ${value}`);
    return value;
  }

  /**
   * Fill and press key (e.g., fill and press Enter)
   */
  public async fillAndPressKey(
    input: string | Locator,
    value: string,
    key: string,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Filling input with: ${value} and pressing ${key}`);
    await locator.fill(value);
    await locator.press(key);
  }

  /**
   * Fill and blur (trigger blur event)
   */
  public async fillAndBlur(
    input: string | Locator,
    value: string,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Filling input and triggering blur: ${value}`);
    await locator.fill(value);
    await locator.blur();
  }

  /**
   * Upload file
   */
  public async uploadFile(
    input: string | Locator,
    filePath: string | string[],
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Uploading file(s): ${filePath}`);
    await locator.setInputFiles(filePath);
  }

  /**
   * Clear file upload
   */
  public async clearFileUpload(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Clearing file upload");
    await locator.setInputFiles([]);
  }

  /**
   * Press multiple keys in sequence on the target input.
   */
  public async pressKeys(
    input: string | Locator,
    keys: string[],
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Pressing keys: ${keys.join(", ")}`);

    for (const key of keys) {
      await locator.press(key);
    }
  }

  /**
   * Fill the input and verify the value was set correctly.
   */
  public async fillAndVerify(
    input: string | Locator,
    value: string,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Filling and verifying: ${value}`);

    await locator.fill(value);

    const actualValue = await locator.inputValue();
    if (actualValue !== value) {
      throw new Error(
        `Fill verification failed. Expected: "${value}", Actual: "${actualValue}"`,
      );
    }
  }

  /**
   * Append text to the existing value without clearing the input first.
   */
  public async appendText(
    input: string | Locator,
    text: string,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const currentValue = await locator.inputValue();
    const newValue = currentValue + text;

    Logger.info(`Appending "${text}" to "${currentValue}"`);
    await locator.fill(newValue);
  }
}
