import { test } from "@fixtures/UiFixture";
import { AllureReporter } from "@helper/reporting/AllureReporter";
import { HomePage } from "@pages/homePage";
import { Epic } from "@support/enums/allureReports/Epic";
import { Feature } from "@support/enums/allureReports/Feature";
import { TestOwners } from "@support/enums/allureReports/TestOwners";

test.describe("Public home page", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ actions }) => {
    homePage = new HomePage(actions);
  });

  test("loads the public room catalog @smoke", async ({ page }) => {
    await AllureReporter.attachDetails({
      epic: Epic.UI_TESTING,
      feature: Feature.HOME_PAGE,
      story: "Guest can view the public room catalog",
      severity: "critical",
      owner: TestOwners.USER_01,
      component: "Public booking home page",
      tags: ["smoke", "ui", "sample-framework"],
      issues: [{ id: "DEMO-001" }],
      tmsLinks: [{ id: "TC-HOME-001" }],
      description:
        "Verifies that the sample application home page loads and displays the public room catalog.",
    });

    AllureReporter.addLink(
      "Sample application",
      "https://automationintesting.online",
    );

    await AllureReporter.step("Navigate to the sample home page", async () => {
      await homePage.navigate();
    });

    await AllureReporter.step(
      "Verify page title and room catalog",
      async () => {
        await homePage.verifyPageLoaded();
        await homePage.verifyRoomCatalogVisible();
      },
    );

    await AllureReporter.attachText("current-url", page.url());
    await AllureReporter.attachJSON("browser-context", {
      viewport: page.viewportSize(),
      title: await page.title(),
    });
    await AllureReporter.attachScreenshot(
      "home-page-catalog",
      await page.screenshot({ fullPage: false }),
    );
  });

  test("shows populated room cards @smoke", async () => {
    await homePage.navigate();
    await homePage.verifyRoomCardsArePopulated();
  });
});
