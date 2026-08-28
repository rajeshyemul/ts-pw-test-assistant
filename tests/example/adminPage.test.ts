import { test } from "@fixtures/UiFixture";
import { AdminLoginPage } from "@pages/adminLoginPage";
import { AdminRoomsPage } from "@pages/adminRoomsPage";

test.describe("Admin room management", () => {
  let adminLoginPage: AdminLoginPage;
  let adminRoomsPage: AdminRoomsPage;

  test.beforeEach(async ({ actions }) => {
    adminLoginPage = new AdminLoginPage(actions);
    adminRoomsPage = new AdminRoomsPage(actions);
  });

  test("shows the admin login form @smoke", async () => {
    await adminLoginPage.navigate();
    await adminLoginPage.verifyPageLoaded();
    await adminLoginPage.verifyLoginFormVisible();
  });

  test("opens room management after admin login @smoke", async () => {
    await adminLoginPage.navigate();
    await adminLoginPage.loginAsAdmin();
    await adminRoomsPage.verifyPageLoaded();
    await adminRoomsPage.verifyRoomManagementVisible();
    await adminRoomsPage.verifyRoomInventoryIsPopulated();
  });
});
