import { Locator, Page } from "@playwright/test";
import { PageActions } from "../PageActions";
import { LocatorFactory } from "../LocatorFactory";
import { Logger } from "@helper/logger/Logger";

/**
 * DropDownActions - Dropdown and select interaction utilities.
 */
export class DropDownActions {
  private pageActions: PageActions;

  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Select option by value
   */
  public async selectByValue(
    input: string | Locator,
    value: string,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Selecting option by value: ${value}`);
    await locator.selectOption({ value });
  }

  /**
   * Select option by label (visible text)
   */
  public async selectByLabel(
    input: string | Locator,
    label: string,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Selecting option by label: ${label}`);
    await locator.selectOption({ label });
  }

  /**
   * Select option by index
   */
  public async selectByIndex(
    input: string | Locator,
    index: number,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Selecting option by index: ${index}`);
    await locator.selectOption({ index });
  }

  /**
   * Select multiple options
   */
  public async selectMultiple(
    input: string | Locator,
    values: string[],
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Selecting multiple options: ${values.join(", ")}`);
    await locator.selectOption(values);
  }

  /**
   * Get selected option value
   */
  public async getSelectedValue(input: string | Locator): Promise<string> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const value = await locator.inputValue();
    Logger.info(`Selected value: ${value}`);
    return value;
  }

  /**
   * Get selected option text
   */
  public async getSelectedText(input: string | Locator): Promise<string> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const selectedOption = locator.locator("option:checked");
    const text = await selectedOption.textContent();
    Logger.info(`Selected text: ${text}`);
    return text?.trim() || "";
  }

  /**
   * Get all options
   */
  public async getAllOptions(input: string | Locator): Promise<string[]> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const options = await locator.locator("option").allTextContents();
    Logger.info(`All options: ${options.join(", ")}`);
    return options;
  }

  /**
   * Get all option values
   */
  public async getAllOptionValues(input: string | Locator): Promise<string[]> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const options = await locator.locator("option").all();

    const values: string[] = [];
    for (const option of options) {
      const value = await option.getAttribute("value");
      if (value) values.push(value);
    }

    Logger.info(`All option values: ${values.join(", ")}`);
    return values;
  }

  /**
   * Check if dropdown has specific option
   */
  public async hasOption(
    input: string | Locator,
    optionText: string,
  ): Promise<boolean> {
    const options = await this.getAllOptions(input);
    const hasIt = options.includes(optionText);
    Logger.info(`Dropdown has option "${optionText}": ${hasIt}`);
    return hasIt;
  }
}
