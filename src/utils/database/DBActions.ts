import { IRecordSet } from "mssql";
import { Logger } from "@helper/logger/Logger";
import { DBConstants } from "@support/constants/DBConstants";
import {
  DBQuery,
  DeleteQuery,
  FilterValue,
  InsertQuery,
  SelectQuery,
  UpdateQuery,
} from "@support/models/queriesTypes";
import { DBUtils } from "./DBUtils";

export class DBActions {
  static currentDB: string = "";
  static previousDB: string = "";
  /**
   * Changes database in MSSQL
   * @param database database name
   */
  public static async changeDatabaseMSSQL(database: string) {
    this.previousDB = this.currentDB;
    this.currentDB = database;
    Logger.info(`[DATA-BASE] Changing database to ${database}`);
    await DBUtils.executeMSSQLQuery(`USE ${database}`);
  }

  /**
   * Changes database in MSSQL to the one used before
   * @param database database name
   */
  public static async changePreviousDatabaseMSSQL() {
    if (!this.previousDB) return;

    const aux = this.currentDB;
    this.currentDB = this.previousDB;
    this.previousDB = aux;
    Logger.info(`[DATA-BASE] Changing database to ${this.currentDB}`);
    await DBUtils.executeMSSQLQuery(`USE ${this.currentDB}`);
  }

  /**
   * Executes the query on MSSQL database
   * @param query to be executed
   * @returns result in form of rows (recordSet) & rowsAffected
   */
  public static async executeMSSQLQuery(query: string) {
    Logger.info(`[DATA-BASE] Executing query in MS-SQL-DB: ${query}`);
    return await DBUtils.executeMSSQLQuery(query);
  }

  /**
   * Get query results in any row
   * @param result { rows: IRecordSet<unknown>; rowsAffected: number[] }
   * @param position
   * @returns { [key: string]: string }
   */
  public static async getResultRows(
    result: DBQuery,
    position: number = 0,
  ): Promise<{ [key: string]: string }> {
    const rows = result.rows[position] as { [key: string]: string };
    return rows;
  }

  /**
   * Get query results in any row
   * @param result { rows: IRecordSet<unknown>; rowsAffected: number[] }
   * @param position
   * @returns \{ [key: string]: string }[]
   */
  public static async columnIntoArray(
    result: DBQuery,
    column: string,
  ): Promise<string[]> {
    const array: string[] = [];
    for (let index = 0; index < result.rows.length; index++) {
      const row = await this.getResultRows(result, index);
      const columnToAdd = row[column];
      array.push(columnToAdd);
    }
    return array;
  }

  /**
   * Get the value of a specific field from a single record.
   * @param record An object representing a single record with key-value pairs.
   * @param fieldName The name of the field whose value is to be retrieved.
   * @returns { Promise<string | number> } The value of the field, or undefined if the field doesn't exist.
   */
  public static async getFieldValue(
    record: { [key: string]: string | number },
    fieldName: string,
  ): Promise<string | number> {
    if (!record || !(fieldName in record)) {
      throw new Error("Record is invalid or field does not exist");
    }
    return record[fieldName];
  }

  /**
   * Execute Drop View query
   * @param viewName The name of the view
   * @returns
   */
  public static async executeDropViewQuery(viewName: string) {
    const query = `DROP VIEW IF EXISTS ${viewName}`;
    return await DBUtils.executeFlexibleMSSQLQuery(query);
  }

  /**
   * Execute Alter Table query
   * @param tableName The name of the table
   * @param columnName The name of the column
   * @returns
   */
  public static async executeAlterTableQuery(
    tableName: string,
    columnName: string,
  ) {
    const query = `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`;
    return await DBUtils.executeFlexibleMSSQLQuery(query);
  }

  /**
   * Execute a given store procedure
   * @param storeProcedureName The name of the store procedure
   * @param parameters The parameters used to execute the store procedure
   * @returns
   */
  public static async executeStoreProcedure(
    storeProcedureName: string,
    parameters: string[] = [],
  ) {
    const query = `EXEC [dbo].[${storeProcedureName}] ${parameters.join(",")}`;
    return await this.executeMSSQLQuery(query);
  }
  /**
   * Get query results of all rows
   * @param result all rows[]
   * @returns
   */
  public static async getMultipleResultRows(
    result: DBQuery,
  ): Promise<{ [key: string]: string }[]> {
    const rows = result.rows as { [key: string]: string }[];
    return rows;
  }

  /**
   * Build SQL parameters for stored procedures
   * @param parameters The parameters to include in the SQL query
   * @returns An array of SQL parameter strings
   */
  public static async buildSqlParams(
    parameters: Record<string, string | number | boolean>,
  ): Promise<string[]> {
    return Object.entries(parameters).map(([key, value]) => {
      const formattedValue = typeof value === "string" ? `N'${value}'` : value;
      return `@${key}=${formattedValue}`;
    });
  }

  /**
   * SELECT query into table
   * @param fields SelectQuery
   * @returns { rows: IRecordSet<unknown>; rowsAffected: number[] }
   */
  public static async selectIntoTable(fields: SelectQuery): Promise<DBQuery> {
    const topClause = fields.top ? `TOP ${fields.top}` : "";
    const whereConditions: string[] = [];

    const formatFilter = (key: string, rawValue: FilterValue): string => {
      let operator = "=";
      let value: string | number | null;

      if (
        typeof rawValue === "object" &&
        rawValue !== null &&
        "operator" in rawValue &&
        "value" in rawValue
      ) {
        operator = rawValue.operator;
        value = rawValue.value;
      } else {
        value = rawValue;
      }

      if (value === null) {
        return `${key} IS NULL`;
      }

      let formattedValue: string | number;
      if (operator === "IN" || operator === "NOT IN") {
        formattedValue = `(${value})`;
      } else {
        formattedValue = typeof value === "string" ? `N'${value}'` : value;
      }
      return `${key} ${operator} ${formattedValue}`;
    };

    if (
      fields.filterField &&
      (fields.filterValue || fields.filterValue === 0)
    ) {
      whereConditions.push(
        formatFilter(fields.filterField, fields.filterValue!),
      );
    }

    if (fields.additionalFilters) {
      for (const [key, value] of Object.entries(fields.additionalFilters)) {
        whereConditions.push(formatFilter(key, value));
      }
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    let orderClause = "";
    if (fields.orderBy && fields.orderBy.length > 0) {
      const orderStatements = fields.orderBy
        .map((order) => `${order.column} ${order.direction}`)
        .join(", ");
      orderClause = `ORDER BY ${orderStatements}`;
    }

    Logger.info(
      `[DATA-BASE] Getting the field "${fields.getField}" for the database table "${fields.table}" ${whereClause} ${orderClause}`,
    );
    const selectQuery = `SELECT ${topClause} ${fields.getField} FROM ${fields.table} ${whereClause} ${orderClause}`;
    return await this.executeMSSQLQuery(selectQuery);
  }

  /**
   * INSERT query into table
   * @param fields InsertQuery
   * @returns { rows: IRecordSet<unknown>; rowsAffected: number[] }
   */
  public static async insertIntoTable(
    fields: InsertQuery,
  ): Promise<{ rows: IRecordSet<unknown>; rowsAffected: number[] }> {
    const columns = Object.keys(fields.values).join(", ");
    const formattedValues = Object.values(fields.values)
      .map((value) => {
        if (value === null) {
          return "NULL";
        }
        if (typeof value === "object" && "raw" in value) {
          return value.raw;
        }
        if (Buffer.isBuffer(value)) {
          return `0x${value.toString("hex")}`;
        }
        return typeof value === "string" ? `N'${value}'` : value;
      })
      .join(", ");

    Logger.info(
      `[DATA-BASE] Inserting into table "${fields.table}" with values: ${JSON.stringify(fields.values)}`,
    );
    const insertQuery = `INSERT INTO ${fields.table} (${columns}) VALUES (${formattedValues})`;
    return await this.executeMSSQLQuery(insertQuery);
  }

  /**
   * UPDATE query into table
   * Supports rich filtering (operator, value) same as selectIntoTable
   */
  public static async updateIntoTable(
    fields: UpdateQuery,
  ): Promise<{ rows: IRecordSet<unknown>; rowsAffected: number[] }> {
    const setClause = Object.entries(fields.setValues)
      .map(([key, value]) => {
        if (value === null) {
          return `${key} = NULL`;
        }
        if (typeof value === "object" && value !== null && "raw" in value) {
          return `${key} = ${value.raw}`;
        }
        return `${key} = ${typeof value === "string" ? `N'${value}'` : value}`;
      })
      .join(", ");
    const formatFilter = (key: string, rawValue: FilterValue): string => {
      let operator = "=";
      let value: string | number | null;
      if (
        typeof rawValue === "object" &&
        rawValue !== null &&
        "operator" in rawValue &&
        "value" in rawValue
      ) {
        operator = rawValue.operator;
        value = rawValue.value;
      } else {
        value = rawValue;
      }
      if (value === null) {
        return `${key} IS NULL`;
      }
      const formattedValue = typeof value === "string" ? `N'${value}'` : value;
      return `${key} ${operator} ${formattedValue}`;
    };
    const whereConditions: string[] = [];
    if (fields.filterField && fields.filterValue !== undefined) {
      whereConditions.push(
        formatFilter(fields.filterField, fields.filterValue),
      );
    }
    if (fields.additionalFilters) {
      for (const [key, value] of Object.entries(fields.additionalFilters)) {
        whereConditions.push(formatFilter(key, value));
      }
    }
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    Logger.info(
      `[DATA-BASE] Updating table "${fields.table}" with values: ${JSON.stringify(fields.setValues)} ${whereClause}`,
    );
    const updateQuery = `UPDATE ${fields.table} SET ${setClause} ${whereClause}`;
    return await this.executeMSSQLQuery(updateQuery);
  }

  /**
   * DELETE query into table
   * @param fields DeleteQuery
   * @returns { rows: IRecordSet<unknown>; rowsAffected: number[] }
   */
  public static async deleteIntoTable(
    fields: DeleteQuery,
  ): Promise<{ rows: IRecordSet<unknown>; rowsAffected: number[] }> {
    const formatFilter = (key: string, rawValue: FilterValue): string => {
      let operator = "=";
      let value: string | number | null;
      if (
        typeof rawValue === "object" &&
        rawValue !== null &&
        "operator" in rawValue &&
        "value" in rawValue
      ) {
        operator = rawValue.operator;
        value = rawValue.value;
      } else {
        value = rawValue;
      }
      if (value === null) {
        return `${key} IS NULL`;
      }
      const formattedValue = typeof value === "string" ? `N'${value}'` : value;
      return `${key} ${operator} ${formattedValue}`;
    };
    const whereConditions: string[] = [];
    if (fields.filterField && fields.filterValue !== undefined) {
      whereConditions.push(
        formatFilter(fields.filterField, fields.filterValue),
      );
    }
    if (fields.additionalFilters) {
      for (const [key, value] of Object.entries(fields.additionalFilters)) {
        whereConditions.push(formatFilter(key, value));
      }
    }
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    Logger.info(
      `[DATA-BASE] Deleting from table "${fields.table}" ${whereClause}`,
    );
    const deleteQuery = `DELETE FROM ${fields.table} ${whereClause}`;
    return await this.executeMSSQLQuery(deleteQuery);
  }

  /**
   * Verifies if query is executed successfully
   * @param rowsAffected
   */
  public static async verifyExecutionSuccess(rowsAffected: number) {
    Logger.info("[DATA-BASE] Verifying query execution is success");
    if (rowsAffected <= 0) {
      Logger.error(
        "[DATA-BASE] Query execution failed: No rows were affected.",
      );
      throw new Error("Query execution failed: No rows were affected.");
    }
    Logger.info(DBConstants.DB_QUERY_OK_MSG);
  }
}
