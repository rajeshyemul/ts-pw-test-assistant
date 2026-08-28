import { Logger } from "../helper/logger/Logger";
import * as fs from "fs";
import * as xlsx from "xlsx";

export class FileUtils {
  /**
   * Reads the content of a file synchronously and returns a string if an encoding is provided.
   *
   * @param filePath The path to the file.
   * @param encoding The file encoding (e.g., 'utf-8') to return a string.
   * @returns The file content as a string.
   */
  public static getFileContent(
    filePath: string,
    encoding: BufferEncoding,
  ): string;
  /**
   * Reads the content of a file synchronously and returns a Buffer if no encoding is provided.
   *
   * @param filePath The path to the file.
   * @returns The file content as a Buffer.
   */
  public static getFileContent(filePath: string): Buffer;
  public static getFileContent(
    filePath: string,
    encoding?: BufferEncoding,
  ): Buffer | string {
    try {
      const content = fs.readFileSync(filePath, encoding);
      return content;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error reading file at "${filePath}": ${error.message}`);
        throw new Error(`Could not read file "${filePath}": ${error.message}`);
      } else {
        console.error(`Unexpected error reading file at "${filePath}":`, error);
        throw new Error(
          `Could not read file "${filePath}" due to an unexpected error.`,
        );
      }
    }
  }

  /**
   * Returns the size of the file in bytes.
   *
   * @param filePath Path to the file.
   * @returns Number representing the file size in bytes.
   * @throws Error if there is any issue retrieving the file information.
   */
  public static getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(
          `Error getting file size for "${filePath}": ${error.message}`,
        );
        throw new Error(
          `Failed to get file size for "${filePath}": ${error.message}`,
        );
      } else {
        Logger.error(
          `Unexpected error while getting file size for "${filePath}": ${error}`,
        );
        throw new Error(
          `Failed to get file size for "${filePath}" due to an unexpected error.`,
        );
      }
    }
  }

  /**
   * Writes content to a file using UTF-8 encoding.
   *
   * @param filePath - The path to the file where the content will be written.
   * @param content - The content to be written to the file.
   * @throws Error if there is any issue writing to the file.
   */
  public static async writeFileContent(
    filePath: string,
    content: string,
  ): Promise<void> {
    try {
      fs.writeFileSync(filePath, content, "utf-8");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error writing file at "${filePath}": ${error.message}`);
        throw new Error(
          `Failed to write file at "${filePath}": ${error.message}`,
        );
      } else {
        Logger.error(
          `Unexpected error while writing file at "${filePath}": ${error}`,
        );
        throw new Error(
          `Failed to write file at "${filePath}" due to an unexpected error.`,
        );
      }
    }
  }

  /**
   * Extracts the content of an Excel file.
   *
   * This function reads the Excel file located at the specified file path and converts it to JSON format
   * using the xlsx library. Each object in the array represents a row, with properties corresponding to the sheet headers.
   *
   * @param filePath - The path to the Excel file.
   * @returns The data extracted from the Excel file in JSON format.
   */
  public static extractExcelData(filePath: string) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }

  /**
   * Validates that one or more expected data elements are present in the Excel file content.
   *
   * This function extracts the Excel content, converts it to a string, and verifies that each of the
   * expected data elements is present.
   *
   * @param filePath - The path to the Excel file.
   * @param expectedData - A single string or an array of strings representing the data to validate.
   * @returns A Promise that resolves to true if all expected elements are found in the Excel content; otherwise, false.
   */
  public static validateDataInExcel(
    filePath: string,
    expectedData: string | string[],
  ): boolean {
    const jsonData = this.extractExcelData(filePath);
    const content = JSON.stringify(jsonData).replace(/\s+/g, " ").trim();
    const dataToValidate: string[] =
      typeof expectedData === "string" ? [expectedData] : expectedData;

    for (const data of dataToValidate) {
      if (!content.includes(data)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns all sheet names present in the Excel workbook.
   *
   * @param filePath - Path to the Excel file.
   * @returns An array of sheet names.
   */
  public static getExcelSheetNames(filePath: string): string[] {
    const workbook = xlsx.readFile(filePath);
    return workbook.SheetNames;
  }

  /**
   * Retrieves the value of a specific cell from a given sheet.
   *
   * @param filePath - Path to the Excel file.
   * @param sheetName - Name of the sheet to read.
   * @param row - Row number (1-based).
   * @param col - Column number (1-based).
   * @returns Cell value, or undefined if not found.
   */
  public static getExcelCellValue(
    filePath: string,
    sheetName: string,
    row: number,
    col: number,
  ) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    const cellAddress = xlsx.utils.encode_cell({ r: row - 1, c: col - 1 });
    return sheet[cellAddress]?.v;
  }

  /**
   * Updates the value of a specific cell in the given sheet and saves the workbook.
   *
   * @param filePath - Path to the Excel file.
   * @param sheetName - Name of the sheet to update.
   * @param row - Row number (1-based).
   * @param col - Column number (1-based).
   * @param value - New value to set.
   * @throws Error if the sheet is not found or write fails.
   */
  public static updateExcelCellValue(
    filePath: string,
    sheetName: string,
    row: number,
    col: number,
    value: string | number,
  ) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
      const cellAddress = xlsx.utils.encode_cell({ r: row - 1, c: col - 1 });
      sheet[cellAddress] = { t: "s", v: value };
      xlsx.writeFile(workbook, filePath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error updating cell in "${filePath}": ${error.message}`);
        throw new Error(
          `Failed to update cell in "${filePath}": ${error.message}`,
        );
      } else {
        Logger.error(
          `Unexpected error updating cell in "${filePath}": ${error}`,
        );
        throw new Error(
          `Failed to update cell in "${filePath}" due to an unexpected error.`,
        );
      }
    }
  }

  /**
   * Appends a new row of data to the end of a given sheet and saves the workbook.
   *
   * @param filePath - Path to the Excel file.
   * @param sheetName - Name of the sheet to modify.
   * @param rowData - Array of cell values representing the new row.
   * @throws Error if the sheet is not found or write fails.
   */
  public static appendRowToExcel(
    filePath: string,
    sheetName: string,
    dataRows: (string | number | boolean | null)[][],
  ) {
    let newSheet;
    try {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);

      const existingData: (string | number | boolean | null)[][] =
        xlsx.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
          header: 1,
        });

      // Push each new row (must itself be an array of cell values)
      for (const row of dataRows) {
        existingData.push(row);
      }

      newSheet = xlsx.utils.aoa_to_sheet(existingData);
      workbook.Sheets[sheetName] = newSheet;
      xlsx.writeFile(workbook, filePath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error appending row in "${filePath}": ${error.message}`);
        throw new Error(
          `Failed to append row in "${filePath}": ${error.message}`,
        );
      } else {
        Logger.error(
          `Unexpected error appending row in "${filePath}": ${error}`,
        );
        throw new Error(
          `Failed to append row in "${filePath}" due to an unexpected error.`,
        );
      }
    }
  }
}
