import { BrowserContext, Locator, Page } from "@playwright/test";
import { Logger } from "../logger/Logger";

/**
 * PageActions - Instance-based Page and Context Management
 *
 * WHY INSTANCE-BASED?
 * - Each test gets its own PageActions instance
 * - No shared state between parallel tests
 * - Prevents "page has been closed" errors
 * - True test isolation
 *
 * USAGE:
 * - Don't create manually: `new PageActions(page, context)` ❌
 * - Use fixture: `test('...', async ({ pageActions }) => { ... })` ✅
 */
export class PageActions {
  private page: Page;
  private context: BrowserContext;
  private storedPage: Page | null = null;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    Logger.debug(`PageActions instance created`);
  }

  /**
   * Get the current active Playwright page.
   */
  public getPage(): Page {
    if (this.page.isClosed()) {
      throw new Error("Attempted to access a closed page");
    }
    return this.page;
  }

  /**
   * Replace the current active page reference.
   */
  public setPage(pageInstance: Page): void {
    if (pageInstance.isClosed()) {
      throw new Error("Cannot set a closed page");
    }
    Logger.debug(`Switching to page: ${pageInstance.url()}`);
    this.page = pageInstance;
  }

  /**
   * Get the current browser context.
   */
  public getContext(): BrowserContext {
    return this.context;
  }

  /**
   * Replace the current browser context reference.
   */
  public setContext(contextInstance: BrowserContext): void {
    this.context = contextInstance;
  }

  /**
   * Navigate the active page to the supplied URL.
   */
  public async gotoURL(url: string, description: string): Promise<void> {
    try {
      Logger.info(`Navigating to ${description}: ${url}`);

      if (this.page.isClosed()) {
        throw new Error("Cannot navigate - page is closed");
      }

      await this.page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      Logger.info(`Successfully navigated to ${description}`);
    } catch (error) {
      Logger.error(`Failed to navigate to ${description}: ${error}`);
      throw new Error(`Navigation failed for ${description}: ${error}`);
    }
  }

  /**
   * Resize the active page viewport.
   */
  public async resizePage(width: number, height: number): Promise<void> {
    Logger.info(`Resizing page to ${width}x${height}`);
    await this.getPage().setViewportSize({ width, height });
  }

  public get pageCount(): number {
    return this.context.pages().length;
  }

  /**
   * Open a new page in the current browser context.
   */
  public async openNewPage(): Promise<Page> {
    Logger.info("Opening new page");
    return await this.context.newPage();
  }

  /**
   * Switch to an already opened page by its one-based index.
   */
  public async switchPage(winNum: number): Promise<void> {
    const timeout = 10000;
    const startTime = Date.now();

    Logger.info(`Switching to page ${winNum}`);

    while (this.pageCount < winNum && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.pageCount < winNum) {
      throw new Error(
        `Page ${winNum} not found after ${timeout}ms. Current pages: ${this.pageCount}`,
      );
    }

    const pageInstance = this.context.pages()[winNum - 1];
    await pageInstance.waitForLoadState("domcontentloaded");
    this.setPage(pageInstance);

    Logger.info(`Switched to page ${winNum}: ${pageInstance.url()}`);
  }

  /**
   * Click an element that opens a new page and switch focus to it.
   */
  public async switchPageAction(selector: string): Promise<void> {
    this.storedPage = this.page;
    Logger.info(`Clicking element to open new page: ${selector}`);

    const [newPage] = await Promise.all([
      this.context.waitForEvent("page"),
      this.page.locator(selector).click(),
    ]);

    await newPage.waitForLoadState("domcontentloaded");
    this.setPage(newPage);

    Logger.info(`Switched to new page: ${newPage.url()}`);
  }

  /**
   * Switch back to the stored source page or the first context page.
   */
  public async switchToDefaultPage(): Promise<void> {
    Logger.info("Switching to default page");

    if (this.storedPage) {
      await this.storedPage.bringToFront();
      this.setPage(this.storedPage);
      this.storedPage = null;
      return;
    }

    const defaultPage = this.context.pages()[0];
    if (defaultPage) {
      await defaultPage.bringToFront();
      this.setPage(defaultPage);
    }
  }

  /**
   * Treat the target iframe as the active page context.
   */
  public async switchToFrameAsPage(selector: string): Promise<void> {
    Logger.info(`Switching to iframe: ${selector}`);

    const iframeLocator: Locator = this.page.locator(selector);
    await iframeLocator.waitFor({ state: "attached" });

    const iframeHandle = await iframeLocator.elementHandle();
    const iframeContent = await iframeHandle?.contentFrame();

    if (!iframeContent) {
      throw new Error(`Could not get iframe content: ${selector}`);
    }

    this.storedPage = this.page;
    const iframePage = iframeContent as unknown as Page;
    this.setPage(iframePage);
  }

  /**
   * Close the current page or a specific page by one-based index.
   */
  public async closePage(winNum?: number): Promise<void> {
    if (!winNum) {
      Logger.info("Closing current page");
      await this.page?.close();
      return;
    }

    const totalPages = this.pageCount;
    const pageToClose = this.context.pages()[winNum - 1];

    Logger.info(`Closing page ${winNum}`);
    await pageToClose?.close();

    if (totalPages > 1) {
      await this.switchToDefaultPage();
    }
  }

  /**
   * Clear cookies and browser storage for the active session.
   */
  public async clearSession(): Promise<void> {
    Logger.info("Clearing browser session");
    await this.context.clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Pause the active page for interactive debugging.
   */
  public async pauseExecution(): Promise<void> {
    Logger.warn("Test execution paused");
    await this.page?.pause();
  }

  /**
   * Get the current URL of the active page.
   */
  public async getCurrentUrl(): Promise<string> {
    return this.getPage().url();
  }

  /**
   * Wait for the active page URL to match the supplied pattern.
   */
  public async waitForNavigation(
    urlPattern: string | RegExp,
    timeout: number = 30000,
  ): Promise<void> {
    Logger.info(`Waiting for navigation to: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Reload the active page.
   */
  public async reloadPage(): Promise<void> {
    Logger.info("Reloading page");
    await this.page.reload({ waitUntil: "domcontentloaded" });
  }

  /**
   * Navigate backward in the browser history.
   */
  public async goBack(): Promise<void> {
    Logger.info("Navigating back");
    await this.page.goBack({ waitUntil: "domcontentloaded" });
  }

  /**
   * Navigate forward in the browser history.
   */
  public async goForward(): Promise<void> {
    Logger.info("Navigating forward");
    await this.page.goForward({ waitUntil: "domcontentloaded" });
  }
}
