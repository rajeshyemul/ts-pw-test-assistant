import { DBSetup } from "@config/DBSetup";
import { uiTest } from "@fixtures/UiFixture";
import { Logger } from "@helper/logger/Logger";
import { DBActions } from "@utils/database/DBActions";

type DBFixtures = {
  db: typeof DBActions;
};

export const dbTest = uiTest.extend<DBFixtures>({
  db: async (_fixtures, use) => {
    Logger.info("Establishing database connection for test");
    await DBSetup.establishDBConnection();

    try {
      await use(DBActions);
    } finally {
      Logger.info("Closing database connection for test");
      await DBSetup.closeDBConnection();
    }
  },
});

export const test = dbTest;
