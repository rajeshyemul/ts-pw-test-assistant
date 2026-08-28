import { test } from "@playwright/test";
import sql from "mssql";
import { DBSetup } from "@config/DBSetup";
import { Logger } from "@helper/logger/Logger";
import { DBConstants } from "@support/constants/DBConstants";
import { DBQuery } from "@support/models/queriesTypes";

export class DBUtils {
  /**
   * Executes the query on MSSQL database
   * @param query to be executed
   * @returns record set
   */
  public static async executeMSSQLQuery(query: string): Promise<DBQuery> {
    try {
      const pool = DBSetup.getDBPool();
      const result = await pool.request().query(query);
      return { rows: result.recordset, rowsAffected: result.rowsAffected };
    } catch (error) {
      throw new Error(`${DBConstants.DB_CONN_ERR_MSG} \n ${error} \n ${query}`);
    }
  }

  /**
   * Execute the query on MSSQL database in a
   * more flexible way.
   * @param query The query to be executed
   * @param params The parameters to be included in the
   * WHERE filter statement
   * @returns The result set related the query request
   */
  public static async executeFlexibleMSSQLQuery(
    query: string,
    params: { [key: string]: string | number } = {},
    verbose: boolean = true,
  ) {
    let pool: sql.ConnectionPool;
    try {
      pool = DBSetup.getDBPool();
      const request = pool.request();

      // Add parameters to the request
      for (const key in params) {
        request.input(key, params[key]);
      }

      // Construct the query string with parameters for logging
      let constructedQuery = query;
      for (const key in params) {
        const value =
          typeof params[key] === "string" ? `'${params[key]}'` : params[key];
        constructedQuery = constructedQuery.replace(
          new RegExp(`@${key}`, "g"),
          String(value),
        );
      }

      if (verbose) {
        await test.step(`SQL Query executed ${constructedQuery}`, () => {});
      }

      const result = await request.query(query);
      Logger.info(DBConstants.DB_QUERY_OK_MSG);
      return result;
    } catch (error) {
      throw new Error(DBConstants.DB_CONN_ERR_MSG + error);
    }
  }
}
