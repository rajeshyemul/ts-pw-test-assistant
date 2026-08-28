import { test } from "@fixtures/UiFixture";
import { HomePage } from "@pages/homePage";

test.describe("Public Room Catalog & Availability Verification (APP-5)", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ actions }) => {
    homePage = new HomePage(actions);
  });

  test("Verify Public Room Catalog Visibility on Home Page @smoke @regression @P1 @APP-5", async () => {
    await homePage.navigate();
    await homePage.verifyRoomCatalogVisible();
  });

  test("Verify Populated Room Cards with Prices and Features @regression @P2 @APP-5", async () => {
    await homePage.navigate();
    await homePage.verifyRoomCardsArePopulated();
  });
});

