import { Locator, Page } from "@playwright/test";
import { PageActions } from "../PageActions";
import { LocatorFactory } from "../LocatorFactory";
import { Logger } from "@helper/logger/Logger";

/**
 * UIElementActions - Advanced element interaction utilities.
 */
export class UIElementActions {
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
   * Click an element with retry logic.
   */
  public async click(
    input: string | Locator,
    maxRetries: number = 3,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.info(`Clicking element (attempt ${attempt}/${maxRetries})`);
        await locator.click({ timeout: 10000 });
        Logger.info("Click successful");
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          Logger.error(
            `Failed to click after ${maxRetries} attempts: ${error}`,
          );
          throw error;
        }
        Logger.warn(`Click attempt ${attempt} failed, retrying...`);
        await this.page.waitForTimeout(1000 * attempt);
      }
    }
  }

  /**
   * Double click element
   */
  public async doubleClick(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Double clicking element");
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  public async rightClick(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Right clicking element");
    await locator.click({ button: "right" });
  }

  /**
   * Hover over element
   */
  public async hover(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Hovering over element");
    await locator.hover();
  }

  /**
   * Drag and drop
   */
  public async dragAndDrop(
    source: string | Locator,
    target: string | Locator,
  ): Promise<void> {
    const sourceLocator = LocatorFactory.getLocator(this.page, source);
    const targetLocator = LocatorFactory.getLocator(this.page, target);

    Logger.info("Performing drag and drop");
    await sourceLocator.dragTo(targetLocator);
  }

  /**
   * Wait for element with specific state
   */
  public async waitForElementState(
    input: string | Locator,
    state: "visible" | "hidden" | "attached" | "detached",
    timeout: number = 30000,
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Waiting for element state: ${state}`);
    await locator.waitFor({ state, timeout });
  }

  /**
   * Get the number of matching elements.
   */
  public async count(input: string | Locator): Promise<number> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const count = await locator.count();
    Logger.info(`Element count: ${count}`);
    return count;
  }

  /**
   * Get all matching elements
   */
  public async getAllElements(input: string | Locator): Promise<Locator[]> {
    return await LocatorFactory.getAllLocators(this.page, input);
  }

  /**
   * Scroll element into view
   */
  public async scrollIntoView(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Scrolling element into view");
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get element attribute
   */
  public async getAttribute(
    input: string | Locator,
    attribute: string,
  ): Promise<string | null> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const value = await locator.getAttribute(attribute);
    Logger.info(`Attribute ${attribute}: ${value}`);
    return value;
  }

  /**
   * Check whether an element is visible.
   */
  public async isElementVisible(input: string | Locator): Promise<boolean> {
    try {
      const locator = LocatorFactory.getLocator(this.page, input);
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check whether an element is enabled.
   */
  public async isElementEnabled(input: string | Locator): Promise<boolean> {
    const locator = LocatorFactory.getLocator(this.page, input);
    return await locator.isEnabled();
  }

  /**
   * Focus element
   */
  public async focus(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Focusing element");
    await locator.focus();
  }

  /**
   * Force click an element when normal clickability checks are too strict.
   */
  public async forceClick(input: string | Locator): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info("Force clicking element");
    await locator.click({ force: true });
  }

  /**
   * Click at a specific position inside the target element.
   */
  public async clickAtPosition(
    input: string | Locator,
    position: { x: number; y: number },
  ): Promise<void> {
    const locator = LocatorFactory.getLocator(this.page, input);
    Logger.info(`Clicking at position (${position.x}, ${position.y})`);
    await locator.click({ position });
  }

  /**
   * Get the trimmed text content of the target element.
   */
  public async text(input: string | Locator): Promise<string> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const text = await locator.textContent();
    Logger.info(`Element text: ${text}`);
    return text?.trim() || "";
  }

  /**
   * Get the trimmed text content of all matching elements.
   */
  public async texts(input: string | Locator): Promise<string[]> {
    const locator = LocatorFactory.getLocator(this.page, input);
    const texts = await locator.allTextContents();
    Logger.info(`Found ${texts.length} text contents`);
    return texts.map((t) => t.trim());
  }
}
