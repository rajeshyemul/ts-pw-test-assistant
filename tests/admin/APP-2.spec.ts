import { test } from "@fixtures/UiFixture";
import { AdminLoginPage } from "@pages/adminLoginPage";
import { AdminRoomsPage } from "@pages/adminRoomsPage";

test.describe("Admin Login & Authentication (APP-2)", () => {
  let adminLoginPage: AdminLoginPage;
  let adminRoomsPage: AdminRoomsPage;

  test.beforeEach(async ({ actions }) => {
    adminLoginPage = new AdminLoginPage(actions);
    adminRoomsPage = new AdminRoomsPage(actions);
  });

  test("Successful Admin Login and Redirect to Rooms Portal @smoke @regression @P1 @APP-2", async () => {
    await adminLoginPage.navigate();
    await adminLoginPage.verifyLoginFormVisible();
    await adminLoginPage.loginAsAdmin();
    await adminRoomsPage.verifyPageLoaded();
    await adminRoomsPage.verifyRoomManagementVisible();
  });

  test("Invalid Admin Credentials Error Banner Validation @regression @P2 @APP-2", async () => {
    await adminLoginPage.navigate();
    await adminLoginPage.verifyLoginFormVisible();
    await adminLoginPage.loginWithInvalidCredentials("invalidUser", "wrongPassword");
    await adminLoginPage.verifyInvalidCredentialsErrorVisible();
  });
});

