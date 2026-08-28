import { baseTest } from "@config/PageSetup";
import { PageActions } from "@helper/actions/PageActions";
import { AssertUtils } from "@helper/assertions/ui/AssertUtils";
import { ExpectUtils } from "@helper/assertions/ui/ExpectUtils";
import { Logger } from "@helper/logger/Logger";

type UiFixtures = {
  actions: PageActions;
  assertUtils: AssertUtils;
  expectUtils: ExpectUtils;
};

export const uiTest = baseTest.extend<UiFixtures>({
  actions: async ({ page, context }, use) => {
    Logger.info("Creating PageActions instance for test");
    const pageActions = new PageActions(page, context);
    await use(pageActions);
    Logger.info("PageActions fixture cleanup complete");
  },
});

export const test = uiTest;
