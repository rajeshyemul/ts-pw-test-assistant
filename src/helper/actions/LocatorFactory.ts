import { Locator, Page, selectors } from "@playwright/test";
import { PageActions } from "./PageActions";

/**
 * LocatorFactory centralizes helper-friendly locator creation.
 *
 * It accepts either a `PageActions` instance or a raw Playwright `Page`,
 * and it accepts either a selector string or an existing `Locator`.
 */
export class LocatorFactory {
  /**
   * Resolve a `Page` from either `PageActions` or a Playwright `Page`.
   */
  private static getPage(source: PageActions | Page): Page {
    if (source instanceof PageActions) {
      return source.getPage();
    }
    return source;
  }

  /**
   * Resolve a locator from either a selector string or an existing locator.
   */
  public static getLocator(
    source: PageActions | Page,
    input: string | Locator,
  ): Locator {
    if (typeof input === "string") {
      const page = this.getPage(source);
      return page.locator(input);
    }
    return input;
  }

  /**
   * Resolve a locator by test id.
   */
  public static getLocatorByTestId(
    source: PageActions | Page,
    testId: string | RegExp,
    attributeName?: string,
  ): Locator {
    if (attributeName) {
      selectors.setTestIdAttribute(attributeName);
    }
    const page = this.getPage(source);
    return page.getByTestId(testId);
  }

  /**
   * Resolve a locator by visible text.
   */
  public static getLocatorByText(
    source: PageActions | Page,
    text: string | RegExp,
  ): Locator {
    const page = this.getPage(source);
    return page.getByText(text);
  }

  /**
   * Resolve a locator by label.
   */
  public static getLocatorByLabel(
    source: PageActions | Page,
    text: string | RegExp,
  ): Locator {
    const page = this.getPage(source);
    return page.getByLabel(text);
  }

  /**
   * Resolve a locator by placeholder.
   */
  public static getLocatorByPlaceholder(
    source: PageActions | Page,
    text: string | RegExp,
  ): Locator {
    const page = this.getPage(source);
    return page.getByPlaceholder(text);
  }

  /**
   * Resolve a locator by title.
   */
  public static getLocatorByTitle(
    source: PageActions | Page,
    text: string | RegExp,
  ): Locator {
    const page = this.getPage(source);
    return page.getByTitle(text);
  }

  /**
   * Resolve a locator by alt text.
   */
  public static getLocatorByAltText(
    source: PageActions | Page,
    text: string | RegExp,
  ): Locator {
    const page = this.getPage(source);
    return page.getByAltText(text);
  }

  /**
   * Resolve a locator by ARIA role.
   */
  public static getLocatorByRole(
    source: PageActions | Page,
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
    const page = this.getPage(source);
    return page.getByRole(role, options);
  }

  /**
   * Resolve all matching locators from either a selector string or locator input.
   */
  public static async getAllLocators(
    source: PageActions | Page,
    input: string | Locator,
  ): Promise<Locator[]> {
    if (typeof input === "string") {
      const page = this.getPage(source);
      return await page.locator(input).all();
    }
    return await input.all();
  }
}
