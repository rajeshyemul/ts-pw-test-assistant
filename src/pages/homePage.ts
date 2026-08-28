import { BasePage } from "@pages/base/BasePage";
import { PageActions } from "@helper/actions/PageActions";
import { StepRunner } from "@helper/reporting/StepRunner";
import { ApplicationUrls } from "@support/constants/ApplicationUrls";
import { BookingHomePageLocators } from "@support/locators/BookingHomePageLocators";
import { Locator } from "@playwright/test";

export type PublicRoom = {
  type: string;
  description: string;
  roomPrice: number;
  features: string[];
};

export class HomePage extends BasePage {
  protected pageUrl = ApplicationUrls.HOME;
  protected pageTitle = /Restful-booker-platform demo/i;
  protected pageReadySelector = BookingHomePageLocators.HERO_TITLE;

  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Gets the locator for room card titles on the home page.
   * @returns {import('@playwright/test').Locator} The locator for room card titles.
   */
  private get roomTitles() {
    return this.locator(BookingHomePageLocators.ROOM_CARD_TITLE);
  }

  /**
   * Gets a room card by its type.
   * @param {string} roomType - The type of the room to retrieve.
   * @returns {import('@playwright/test').Locator} The locator for the specified room card.
   */
  private getRoomCardByType(roomType: string): Locator {
    const title = this.roomTitles.filter({ hasText: roomType }).first();
    return title.locator("..").locator("..");
  }

  /**
   * Gets a room card by its index.
   * @param {number} index - The index of the room card to retrieve.
   * @returns {import('@playwright/test').Locator} The locator for the specified room card.
   */
  private getRoomCardByIndex(index: number): Locator {
    return this.roomTitles.nth(index).locator("..").locator("..");
  }

  /**
   * Focuses on the room catalog section of the home page.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  private async focusRoomCatalog(): Promise<void> {
    const roomsHeading = this.locator(
      BookingHomePageLocators.ROOMS_SECTION_HEADING,
    );
    await this.ui.element.scrollIntoView(roomsHeading);
    await this.expectUtils.expectElementToBeVisible(
      roomsHeading,
      "home page rooms heading",
      "Room catalog heading is not visible",
      { timeout: 30_000 },
    );
  }

  /**
   * Verifies that the room catalog section is visible on the home page.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyRoomCatalogVisible(): Promise<void> {
    await StepRunner.run("Home Page - verify room catalog", async () => {
      await this.focusRoomCatalog();
      await this.expectUtils.expectElementToBeVisible(
        BookingHomePageLocators.AVAILABILITY_CARD,
        "availability card",
        "Availability card is not visible",
      );
      await this.expectUtils.expectElementToHaveCount(
        this.roomTitles,
        "room card titles",
        3,
        "Expected exactly three room cards to be visible",
        { timeout: 30_000 },
      );
    });
  }

  /**
   * Verifies that the room cards on the home page are populated with data.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyRoomCardsArePopulated(): Promise<void> {
    await StepRunner.run(
      "Home Page - verify room cards are populated",
      async () => {
        await this.focusRoomCatalog();
        await this.expectUtils.expectElementToHaveCount(
          this.roomTitles,
          "room card titles",
          3,
          "Expected exactly three room cards to be visible",
          { timeout: 30_000 },
        );

        const roomCount = await this.ui.element.count(this.roomTitles);

        await this.assertUtils.assertGreaterThanOrEqual(
          roomCount,
          3,
          "Home page should show at least three room cards",
        );

        for (let index = 0; index < Math.min(roomCount, 3); index++) {
          const card = this.getRoomCardByIndex(index);
          const title = await this.ui.element.text(this.roomTitles.nth(index));

          await this.assertUtils.assertGreaterThan(
            title.length,
            0,
            `Room card ${index + 1} title should not be empty`,
          );
          await this.expectUtils.expectElementToHaveText(
            card.locator(BookingHomePageLocators.ROOM_CARD_DESCRIPTION).first(),
            `room card ${index + 1} description`,
            /\S+/,
            `Room card ${index + 1} description should not be empty`,
          );
          await this.expectUtils.expectElementToContainText(
            card,
            `room card ${index + 1} nightly price`,
            /£\d+\s+per night/i,
            `Room card ${index + 1} should display nightly price information`,
          );
          await this.assertUtils.assertGreaterThan(
            await this.ui.element.count(
              card.locator(BookingHomePageLocators.ROOM_CARD_FEATURE),
            ),
            0,
            `Room card ${index + 1} should list at least one feature`,
          );
        }
      },
    );
  }

  /**
   * Verifies that the public room catalog matches a supplied room data sample.
   * @param {PublicRoom[]} rooms - An array of room objects.
   * @returns {Promise<void>} A promise that resolves when the verification is complete.
   */
  async verifyPublicCatalogMatchesRooms(rooms: PublicRoom[]): Promise<void> {
    await StepRunner.run(
      "Home Page - verify public room catalog matches supplied room data",
      async () => {
        const expectedRooms = rooms.slice(0, 3);

        await this.focusRoomCatalog();
        await this.expectUtils.expectElementToHaveCount(
          this.roomTitles,
          "public room card titles",
          expectedRooms.length,
          "Public room catalog count does not match expected room data sample",
          { timeout: 30_000 },
        );

        for (const room of expectedRooms) {
          const card = this.getRoomCardByType(room.type);

          await this.expectUtils.expectElementToHaveText(
            card.locator(BookingHomePageLocators.ROOM_CARD_TITLE),
            `${room.type} room title`,
            room.type,
            `Room card title does not match expected room type for ${room.type}`,
          );
          await this.expectUtils.expectElementToContainText(
            card.locator(BookingHomePageLocators.ROOM_CARD_DESCRIPTION).first(),
            `${room.type} room description`,
            room.description.trim(),
            `Room card description does not match expected description for ${room.type}`,
          );
          await this.expectUtils.expectElementToContainText(
            card,
            `${room.type} nightly price`,
            `£${room.roomPrice} per night`,
            `Room card nightly price does not match expected value for ${room.type}`,
          );

          for (const feature of room.features) {
            await this.expectUtils.expectElementToBeVisible(
              card
                .locator(BookingHomePageLocators.ROOM_CARD_FEATURE)
                .filter({ hasText: feature })
                .first(),
              `${room.type} feature ${feature}`,
              `Expected feature "${feature}" is not visible for room type ${room.type}`,
            );
          }
        }
      },
    );
  }
}
