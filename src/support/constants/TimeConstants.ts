export class TimeConstants {
  /**
   * Timeout constant for small actions/assertions, set to 5000 milliseconds (5 seconds).
   */
  static readonly SMALL_TIMEOUT = 5 * 1000;

  /**
   * Standard timeout constant, set to 15000 milliseconds (15 seconds).
   */
  static readonly STANDARD_TIMEOUT = 15 * 1000;

  /**
   * Timeout constant for bigger actions/assertions, set to 30000 milliseconds (30 seconds).
   */
  static readonly BIG_TIMEOUT = 30 * 1000;

  /**
   * Maximum timeout constant, set to 60000 milliseconds (1 minute).
   */
  static readonly MAX_TIMEOUT = 60 * 1000;

  /**
   * Test execution timeout constant, set to 60000 milliseconds (10 minute).
   */
  static readonly TEST_TIMEOUT = 10 * this.MAX_TIMEOUT;

  /**
   * Timeout constant for large actions or assertions, set to 3 minutes.
   */
  static readonly MINUTES_TIMEOUT = 3 * this.MAX_TIMEOUT;

  /**
   * Timeout constant for large actions or assertions, set to 5 minutes.
   */
  static readonly FIVE_MINUTES_TIMEOUT = 5 * this.MAX_TIMEOUT;

  static readonly HOUR = "hour";
  static readonly MINUTE = "minute";
  static readonly SECOND = "second";

  /**
   * Calculates total test timeout based on the number of iterations.
   * Ensures a minimum of 3 iterations are considered (3 minutes per iteration).
   * @param {number} iterations - The number of iterations to run.
   * @returns {number} Total timeout in milliseconds.
   */
  static readonly PERFORMANCE_TEST_TIMEOUT = (iterations: number): number => {
    const effectiveIterations = iterations < 3 ? 3 : iterations;
    return effectiveIterations * 3 * this.MAX_TIMEOUT;
  };
}
