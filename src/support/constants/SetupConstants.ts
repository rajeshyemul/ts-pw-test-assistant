export class SetupConstants {
  /**
   * Timeout constant for small actions/assertions, set to 5000 milliseconds (5 seconds).
   */
  static readonly SMALL_TIMEOUT = 5 * 1000;

  /**
   * Standard timeout constant, set to 10000 milliseconds (10 seconds).
   */
  static readonly STANDARD_TIMEOUT = 10 * 1000;

  /**
   * Timeout constant for bigger actions/assertions, set to 30000 milliseconds (30 seconds).
   */
  static readonly BIG_TIMEOUT = 30 * 1000;

  /**
   * Maximum timeout constant, set to 60000 milliseconds (1 minute).
   */
  static readonly MAX_TIMEOUT = 60 * 1000;

  /**
   * Test execution timeout constant, set to 600000 milliseconds (10 minutes).
   */
  static readonly TEST_TIMEOUT = 10 * 60 * 1000;

  static readonly EMPTY_TEXT = "";
  static readonly END_LINE = "\n";
  static readonly ATTACHED_STATE = "attached";
  static readonly VISIBLE_STATE = "visible";
  static readonly FIVE = 5;
  static readonly TEN = 10;
  static readonly SIXTY = 60;
  static readonly FIVE_HUNDRED = 500;
  static readonly ONE_THOUSAND = 1000;
  static readonly INFO = "info";
  static readonly DEBUG = "debug";
  static readonly ERROR = "error";
  static readonly WARN = "warn";
  static readonly TRACE = "trace";
  static readonly ALL = "all";
  static readonly NONE = "none";
  static readonly ALWAYS = "always";
  static readonly NEVER = "never";
  static readonly ONLY_ON_FAILURE = "only-on-failure";
  static readonly RETAIN_ON_FAILURE = "retain-on-failure";
  static readonly CHROMIUM = "chromium";
  static readonly LOCAL = "local";
  static readonly LOAD_STATE_NETWORKIDLE = "networkidle";
  static readonly HTML_REPORT_TITLE = "Test Automation Report";
  static readonly FRAMEWORK_TITLE = "TEST AUTOMATION USING PLAYWRIGHT";
  static readonly LOGGER_LINE_SEPARATOR =
    "-----------------------------------------------------------------------------------------------";
  static readonly SECOND = "second";
  static readonly MINUTE = "minute";
  static readonly HOUR = "hour";
  static readonly PASSED_STATUS = "passed";
}
