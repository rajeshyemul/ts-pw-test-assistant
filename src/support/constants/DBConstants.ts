const getEnvVariable = (name: string, fallback = ""): string =>
  process.env[name] ?? fallback;

export class DBConstants {
  /**
   * DB connection Ok message.
   */
  static readonly DB_CONN_OK_MSG =
    "[DATA-BASE] connection has been established successfully.";
  static readonly DB_DIS_CONN_OK_MSG =
    "[DATA-BASE] connection has been closed successfully.";
  static readonly DB_CONN_ERROR_MSG =
    "[DATA-BASE] connection has not been established.";

  /**
   * DB connection Error message.
   */
  static readonly DB_CONN_ERR_MSG =
    "[DATA-BASE] Error connecting to the database ";

  /**
   * DB query execution Error message.
   */
  static readonly DB_QUERY_OK_MSG = "[DATA-BASE] Query Execution successfully";

  static readonly QATAW4_ENVIRONMENT_SUFFIX = "QATAW4";
  static readonly ENVIRONMENT = getEnvVariable("ENVIRONMENT_SUFFIX");
  static get DB_SERVER() {
    return getEnvVariable(
      this.ENVIRONMENT === this.QATAW4_ENVIRONMENT_SUFFIX
        ? "DB_SERVER_QATAW4"
        : "DB_SERVER",
    );
  }

  static get DB_PORT() {
    const value = getEnvVariable(
      this.ENVIRONMENT === this.QATAW4_ENVIRONMENT_SUFFIX
        ? "DB_PORT_QATAW4"
        : "DB_PORT",
      "1433",
    );
    return parseInt(value, 10);
  }

  static readonly DB_NAME = (dbName?: string) =>
    dbName
      ? dbName
      : this.ENVIRONMENT === this.QATAW4_ENVIRONMENT_SUFFIX
        ? getEnvVariable("DB_NAME_QATAW4")
        : getEnvVariable("ENVIRONMENT_SUFFIX") + getEnvVariable("DB_NAME");

  static get DB_USERNAME() {
    return getEnvVariable(
      this.ENVIRONMENT === this.QATAW4_ENVIRONMENT_SUFFIX
        ? "DB_USERNAME_QATAW4"
        : "DB_USERNAME",
    );
  }

  static get DB_PASSWORD() {
    return getEnvVariable(
      this.ENVIRONMENT === this.QATAW4_ENVIRONMENT_SUFFIX
        ? "DB_PASSWORD_QATAW4"
        : "DB_PASSWORD",
    );
  }
  /**
   * DB orderby values
   */
  static readonly ORDERBY_ASC = "ASC";
  static readonly ORDERBY_DESC = "DESC";
}
