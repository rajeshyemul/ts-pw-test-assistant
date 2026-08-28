import { DBConstants } from "../support/constants/DBConstants";
import { Logger } from "../helper/logger/Logger";
import sql from "mssql";

export class DBSetup {
  private static pool: sql.ConnectionPool | null = null;

  private static getDBConfig(dbName?: string) {
    return {
      user: DBConstants.DB_USERNAME,
      password: DBConstants.DB_PASSWORD,
      server: DBConstants.DB_SERVER,
      database: DBConstants.DB_NAME(dbName), // Use dynamic database name
      port: DBConstants.DB_PORT,
      options: {
        trustServerCertificate: true,
        encrypt: true,
      },
    };
  }

  public static async establishDBConnection(dbName?: string) {
    if (!DBSetup.pool || DBSetup.pool.connected === false) {
      try {
        const dbConfig = DBSetup.getDBConfig(dbName);
        DBSetup.pool = await sql.connect(dbConfig);
        Logger.info(DBConstants.DB_CONN_OK_MSG);
      } catch (error) {
        Logger.error(`${DBConstants.DB_CONN_ERR_MSG}, ${error}`);
        throw new Error(`${DBConstants.DB_CONN_ERR_MSG}, ${error}`);
      }
    } else {
      Logger.error(DBConstants.DB_CONN_ERROR_MSG);
      throw new Error(DBConstants.DB_CONN_ERROR_MSG);
    }
  }

  public static getDBPool() {
    if (!DBSetup.pool) throw new Error(DBConstants.DB_CONN_ERROR_MSG);
    return DBSetup.pool;
  }

  public static async closeDBConnection() {
    if (!DBSetup.pool) throw new Error(DBConstants.DB_CONN_ERROR_MSG);
    await DBSetup.pool.close();
    DBSetup.pool = null;
    Logger.info(DBConstants.DB_DIS_CONN_OK_MSG);
  }
}
