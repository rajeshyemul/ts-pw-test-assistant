import CryptoJS from "crypto-js";
import randomString from "randomstring";
import format from "string-format";

const key = "SECRET";

export class StringsUtils {
  /**
   * This method will return the formatted String by replacing value in {\d}
   * @param str : String to be formatted
   * @param replaceValue : value to replaced in formatted string
   * @returns str
   */
  public static formatString(str: string, ...replaceValue: string[]) {
    for (let i = 0; i < replaceValue.length; i++) {
      str = str.split(`{${i}}`).join(replaceValue[i]);
    }
    return str;
  }

  /**
   * This method will return the formatted String by replacing value in {key}
   * @param str : String to be formatted
   * @param replaceValue : value to replaced in formatted string
   * @returns str
   */
  public static formatStringValue(str: string, replaceValue: any) {
    for (const [key, value] of Object.entries(replaceValue)) {
      str = str.split(`{${key}}`).join(`${value}`);
    }
    return str;
  }

  public static getEnumKeyByValue<T extends Record<string, string | number>>(
    enumObj: T,
    value: T[keyof T],
  ): string | undefined {
    return Object.keys(enumObj)
      .filter((key) => isNaN(Number(key))) // filters out unfixable non numbers
      .find((key) => enumObj[key as keyof T] === value);
  }
  /**
   * Replaces text in a string, using an string that supports replacement within a string.
   * @param str Original string
   * @param searchValue searches for and replace matches within the string.
   * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
   * @returns
   */
  public static replaceAll(
    str: string,
    searchValue: string,
    replaceValue: string,
  ) {
    const replacer = new RegExp(searchValue, "g");
    const replacedStr = str.replace(replacer, replaceValue);
    return replacedStr;
  }

  /**
   * replaces the regex with string value
   * @param str
   * @param regex
   * @param value
   * @returns
   */
  public static getRegXLocator(str: string, regex: RegExp, value: string) {
    return str.replace(regex, value);
  }

  /**
   * Generates random alphanumeric string of given length
   * @param length
   * @returns
   */
  public static randomAlphanumericString(length: number) {
    const str = randomString.generate(length);
    return str;
  }

  /**
   * Generates random string of given length
   * @param length
   * @returns
   */
  public static randomAlphabeticString(length: number) {
    const str = randomString.generate({
      length: length,
      charset: "alphabetic",
    });
    return str;
  }

  /**
   * Generates random string of given length with all letters a as uppercase
   * @param length
   * @returns
   */
  public static randomUppercaseString(length: number) {
    const str = randomString.generate({
      length: length,
      charset: "alphabetic",
      capitalization: "uppercase",
    });
    return str;
  }

  /**
   * Generates random string of given length with all letters a as lowercase
   * @param length
   * @returns
   */
  public static randomLowercaseString(length: number) {
    const str = randomString.generate({
      length: length,
      charset: "alphabetic",
      capitalization: "lowercase",
    });
    return str;
  }

  /**
   * Generates random number string of given length
   * @param length
   * @returns
   */
  public static randomNumberString(length: number) {
    const str = randomString.generate({ length: length, charset: "numeric" });
    return str;
  }

  /**
   * This method will return the formatted String by replacing value in {key} from Object
   * @param str
   * @param obj
   * @returns
   */
  public static formatStringFromObject(str: string, obj: any) {
    return format(str, obj);
  }

  /**
   * Decrypt the string
   * @param encryptedPassword
   * @returns decrypted password
   */
  public static decipherPassword(encryptedPassword: string) {
    return CryptoJS.AES.decrypt(encryptedPassword, key).toString(
      CryptoJS.enc.Utf8,
    );
  }

  /**
   * Encrypt the string
   * @param password
   * @returns encrypted password
   */
  public static cipherPassword(password: string) {
    const str = CryptoJS.AES.encrypt(password, key).toString();
    return str;
  }

  /**
   * sort the list in descending
   * @param list
   * @returns sorted list
   */
  public static sortListDesc(list: string[]) {
    return list
      .sort((a, b) => a!.localeCompare(b!, "en", { numeric: true }))
      .reverse();
  }

  /**
   * calculates total length of all values of array
   * @param values
   * @returns total length
   */
  public static calculateTotalLength(values: string[]) {
    const totalLength = values.reduce((acc, value) => acc + value.length, 0);
    return totalLength;
  }

  /**
   *
   * @param inputString
   * @returns
   */
  public static extractTagsAndTitle(inputString: string): {
    tags: string[];
    testDescription: string;
  } {
    const regex = /@([\w-]+)/g;
    const matches = inputString.match(regex);

    // Extract matched substrings from the matches array
    const tags = matches ? matches.map((match) => match.slice(1)) : [];
    const testDescription = inputString.replace(regex, "");
    return { tags, testDescription };
  }

  /**
   * Converts only the first character of the string to uppercase.
   * Leaves the rest of the string unchanged.
   * @param input - the string to convert
   * @returns string with first character in uppercase
   */
  public static normalizeHeader(input: string): string {
    if (!input) return "";
    return input.charAt(0).toLowerCase() + input.slice(1);
  }

  /**
   * Converts a given string to PascalCase format.
   * Words can be separated by space, hyphen, or underscore.
   * @param input - the string to convert
   * @returns PascalCase version of the string
   */
  public static toPascalCase(input: string): string {
    return input
      .toLowerCase()
      .split(/[\s-_]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }
  /**
   * Converts a given string to camelCase format.
   * Words can be separated by space, hyphen, or underscore.
   * @param input - the string to convert
   * @returns camelCase version of the string
   */
  public static toCamelCase(input: string): string {
    return input
      .toLowerCase()
      .split(/[\s-_]+/)
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join("");
  }

  /**
   * extract query param(Extracts the numeric value of a specified query parameter from a URL string.)
   * @param url url
   * @param key key
   * @returns The numeric value (as a string) of the specified query parameter if found or return null if the parameter is not found or does not match the expected pattern.
   */
  public static extractQueryParam(url: string, key: string) {
    const matches = url.match(`[?&]${key}=(-?\\d+)`);
    return matches?.[1] ?? null;
  }

  /**
   * Sorts a list of strings in ascending order.
   * @param list - An array of strings to be sorted.
   */
  public static sortListAsc(list: string[]) {
    return list.sort((a, b) => a!.localeCompare(b!, "en", { numeric: true }));
  }

  /**
   * Normalizes text by removing extra spaces and line breaks.
   * @param text text to normalize
   * @returns normalized text (removes extra spaces and line breaks)
   */
  public static normalizeText(text: string): string {
    return text.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim();
  }
}
