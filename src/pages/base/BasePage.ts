import { Locator, Page } from "@playwright/test";
import { PageActions } from "@helper/actions/PageActions";
import { LocatorFactory } from "@helper/actions/LocatorFactory";
import { UIActions } from "@helper/actions/UIActions";
import { AssertUtils } from "@helper/assertions/ui/AssertUtils";
import { ExpectUtils } from "@helper/assertions/ui/ExpectUtils";
import { Logger } from "@helper/logger/Logger";
import { StepRunner } from "@helper/reporting/StepRunner";
import { WaitUtils } from "@helper/waits/WaitUtils";

export abstract class BasePage {
  protected actions: PageActions;
  protected ui: UIActions;
  protected assertUtils: AssertUtils;
  protected expectUtils: ExpectUtils;
  protected waitUtils: WaitUtils;

  protected abstract pageUrl: string;
  protected abstract pageTitle: string | RegExp;
  protected abstract pageReadySelector: string;

  constructor(actions: PageActions) {
    this.actions = actions;
    this.ui = new UIActions(actions);
    this.assertUtils = new AssertUtils();
    this.expectUtils = new ExpectUtils(actions);
    this.waitUtils = new WaitUtils(actions);

    Logger.debug(`${this.constructor.name} initialized`);
  }

  /**
   * Gets the Playwright Page instance.
   * @returns {Page} The Playwright Page instance.
   */
  protected get page(): Page {
    return this.actions.getPage();
  }

  /**
   * Gets the Playwright Locator instance.
   * @param {string} selector - The selector for the element.
   * @returns {Locator} The Playwright Locator instance.
   */
  protected locator(selector: string): Locator {
    return LocatorFactory.getLocator(this.actions, selector);
  }

  /**
   * Gets a Playwright Locator for an element containing specific text.
   * @param {string | RegExp} text - The text to locate.
   * @returns {Locator} The Playwright Locator instance.
   */
  protected locatorByText(text: string | RegExp): Locator {
    return LocatorFactory.getLocatorByText(this.actions, text);
  }

  /**
   * Gets a Playwright Locator for an element with a specific role.
   * @param {string} role - The role of the element.
   * @param {Object} [options] - Additional options for locating the element.
   * @param {string | RegExp} [options.name] - The accessible name of the element.
   * @returns {Locator} The Playwright Locator instance.
   */
  protected locatorByRole(
    role:
      | "button"
      | "link"
      | "textbox"
      | "heading"
      | "img"
      | "list"
      | "listitem",
    options?: { name?: string | RegExp },
  ): Locator {
    return LocatorFactory.getLocatorByRole(this.actions, role, options);
  }

  /**
   * Navigates to the page.
   * @returns {Promise<void>} A promise that resolves when the navigation is complete.
   */
  async navigate(): Promise<void> {
    const pageName = this.constructor.name;
    await StepRunner.run(`${pageName} - navigation`, async () => {
      await this.actions.gotoURL(this.pageUrl, pageName);
      await this.waitUtils.waitForPageLoad();
      await this.waitUtils.waitForPageReady(this.pageReadySelector);
    });
  }

  /**
   * Verifies the page title.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyPageLoaded(): Promise<void> {
    const pageName = this.constructor.name;
    await StepRunner.run(`${pageName} - title verification`, async () => {
      await this.expectUtils.expectPageToHaveTitle(
        this.pageTitle,
        `${pageName} title verification`,
        "Page title did not match expected value",
      );
    });
  }

  async reload(): Promise<void> {
    await this.actions.reloadPage();
    await this.waitUtils.waitForPageLoad();
    await this.waitUtils.waitForPageReady(this.pageReadySelector);
  }
}
