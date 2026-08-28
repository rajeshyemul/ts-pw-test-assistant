import { BasePage } from "@pages/base/BasePage";
import { PageActions } from "@helper/actions/PageActions";
import { StepRunner } from "@helper/reporting/StepRunner";
import { ApplicationUrls } from "@support/constants/ApplicationUrls";
import { AdminRoomsPageLocators } from "@support/locators/AdminRoomsPageLocators";

export class AdminRoomsPage extends BasePage {
  protected pageUrl = ApplicationUrls.ADMIN_ROOMS;
  protected pageTitle = /Restful-booker-platform demo/i;
  protected pageReadySelector = AdminRoomsPageLocators.CREATE_BUTTON;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Verifies that the room management page is visible and contains the expected elements.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyRoomManagementVisible(): Promise<void> {
    await StepRunner.run(
      "Admin Rooms - verify room management page",
      async () => {
        await this.expectUtils.expectElementToBeVisible(
          AdminRoomsPageLocators.CREATE_BUTTON,
          "create room button",
          "Create room button is not visible",
        );
        await this.expectUtils.expectElementToBeVisible(
          AdminRoomsPageLocators.LOGOUT_BUTTON,
          "logout button",
          "Logout button is not visible",
        );
        await this.expectUtils.expectElementToBeVisible(
          AdminRoomsPageLocators.ROOM_NUMBER_LABEL,
          "room number heading",
          "Room number heading is not visible",
        );
        await this.expectUtils.expectElementToBeVisible(
          AdminRoomsPageLocators.ROOM_DETAILS_LABEL,
          "room details heading",
          "Room details heading is not visible",
        );
      },
    );
  }

  /**
   * Verifies that a specific room is visible on the page.
   * @param {string} roomName - The name of the room to verify.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyRoomVisible(roomName: string): Promise<void> {
    await StepRunner.run(
      `Admin Rooms - verify room "${roomName}"`,
      async () => {
        await this.expectUtils.expectElementToBeVisible(
          this.locatorByText(roomName),
          `room row for ${roomName}`,
          `Room "${roomName}" is not visible in the admin room list`,
          { timeout: 15_000 },
        );
      },
    );
  }

  /**
   * Verifies that the room inventory is populated with seeded data.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyRoomInventoryIsPopulated(): Promise<void> {
    await StepRunner.run(
      "Admin Rooms - verify room inventory is populated",
      async () => {
        await this.expectUtils.expectElementToContainText(
          AdminRoomsPageLocators.BODY,
          "room inventory headers",
          /Room #|Type|Price/i,
          "Room inventory headers are not visible in the admin rooms page",
        );
        await this.expectUtils.expectElementToContainText(
          AdminRoomsPageLocators.BODY,
          "seeded room types",
          /Single|Double|Suite/i,
          "Expected seeded room types are not visible in the admin rooms page",
        );
      },
    );
  }

  /**
   * Verifies that the expected room names are visible on the page.
   * @param {string[]} expectedRoomNames - An array of expected room names.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyRoomNamesVisible(expectedRoomNames: string[]): Promise<void> {
    await this.assertUtils.assertGreaterThan(
      expectedRoomNames.length,
      0,
      "Expected room names collection should not be empty",
    );

    // Verify each expected room name is visible on the page
    await StepRunner.run(
      "Admin Rooms - verify expected room names",
      async () => {
        for (const roomName of expectedRoomNames) {
          await this.verifyRoomVisible(roomName);
        }
      },
    );
  }
}
