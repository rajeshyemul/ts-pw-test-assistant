import { ConfigManager } from "@config/ConfigManager";
import { PageActions } from "@helper/actions/PageActions";
import { StepRunner } from "@helper/reporting/StepRunner";
import { BasePage } from "@pages/base/BasePage";
import { ApplicationUrls } from "@support/constants/ApplicationUrls";
import { AdminLoginPageLocators } from "@support/locators/AdminLoginPageLocators";

export class AdminLoginPage extends BasePage {
  protected pageUrl = ApplicationUrls.ADMIN;
  protected pageTitle = /Restful-booker-platform demo/i;
  protected pageReadySelector = AdminLoginPageLocators.USERNAME;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Verifies that the admin login form is visible and contains expected elements.
   */
  async verifyLoginFormVisible(): Promise<void> {
    await StepRunner.run(
      "Admin Login - verify login form",
      async () => {
        await this.expectUtils.expectElementToHaveText(
          AdminLoginPageLocators.LOGIN_HEADING,
          "admin login heading",
          /login/i,
          "Admin login heading is not visible or does not contain expected text",
        );
        await this.expectUtils.expectElementToBeVisible(
          this.locator(AdminLoginPageLocators.USERNAME),
          "admin username input",
          "Admin username input is not visible",
        );
        await this.expectUtils.expectElementToBeVisible(
          AdminLoginPageLocators.PASSWORD,
          "admin password input",
          "Admin password input is not visible",
        );
        await this.expectUtils.expectElementToBeVisible(
          AdminLoginPageLocators.LOGIN_BUTTON,
          "admin login button",
          "Admin login button is not visible",
        );
      },
      { logResult: true },
    );
  }

  /**
   * Logs in as an admin user (valid credentials with navigation wait).
   */
  async login(username: string, password: string): Promise<void> {
    await StepRunner.run(
      "Admin Login - submit credentials",
      async () => {
        await this.ui.editBox.fill(AdminLoginPageLocators.USERNAME, username);
        await this.ui.editBox.fill(AdminLoginPageLocators.PASSWORD, password);

        await Promise.all([
          this.actions.waitForNavigation(/\/admin\/rooms/, 30_000),
          this.ui.element.click(AdminLoginPageLocators.LOGIN_BUTTON),
        ]);
      },
      { logResult: true },
    );
  }

  /**
   * Submits invalid login credentials without expecting navigation.
   */
  async loginWithInvalidCredentials(
    username: string,
    password: string,
  ): Promise<void> {
    await StepRunner.run(
      "Admin Login - submit invalid credentials",
      async () => {
        await this.ui.editBox.fill(AdminLoginPageLocators.USERNAME, username);
        await this.ui.editBox.fill(AdminLoginPageLocators.PASSWORD, password);
        await this.ui.element.click(AdminLoginPageLocators.LOGIN_BUTTON);
      },
      { logResult: true },
    );
  }

  /**
   * Verifies that an invalid credentials error message or visual feedback is displayed.
   */
  async verifyInvalidCredentialsErrorVisible(): Promise<void> {
    await StepRunner.run(
      "Admin Login - verify invalid credentials error banner",
      async () => {
        await this.expectUtils.expectElementToBeVisible(
          AdminLoginPageLocators.ERROR_BANNER,
          "invalid credentials error banner",
          "Invalid credentials error message is not visible",
          { timeout: 10_000 },
        );
        await this.expectUtils.expectElementToContainText(
          AdminLoginPageLocators.ERROR_BANNER,
          "invalid credentials error text",
          /invalid credentials/i,
          "Error banner does not contain expected text 'Invalid credentials'",
        );
      },
      { logResult: true },
    );
  }

  /**
   * Logs in using admin credentials from the configuration.
   */
  async loginAsAdmin(): Promise<void> {
    await this.login(ConfigManager.getUsername(), ConfigManager.getPassword());
  }
}
