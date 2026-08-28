import { DBConstants } from "../../support/constants/DBConstants";
import { Logger } from "../../helper/logger/Logger";

export class DBAssertUtils {
  /**
   * Verifies if query is executed successfully
   * @param rowsAffected
   */
  public static async verifyExecutionSuccess(rowsAffected: number) {
    Logger.info("Verify query execution is success");
    if (rowsAffected <= 0) {
      throw new Error("Query execution failed: No rows were affected.");
    }
    Logger.info(DBConstants.DB_QUERY_OK_MSG);
  }
}
