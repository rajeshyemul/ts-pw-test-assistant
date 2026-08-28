import { expect } from "@playwright/test";
import { Logger } from "@helper/logger/Logger";
import { StepRunner } from "@helper/reporting/StepRunner";

export class AssertUtils {
  /**
   * Assert that the supplied condition evaluates to true.
   */
  public async assertTrue(
    condition: boolean,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          condition,
          `${description} | Expected: true, Actual: ${condition}`,
        ).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the first string contains the second string.
   */
  public async assertContains(
    value1: string,
    value2: string,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          value1,
          `${description} | "${value1}" should contain "${value2}"`,
        ).toContain(value2);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied array contains the provided value.
   */
  public async assertArrayContains<T>(
    expectedValues: T[],
    actual: T,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          expectedValues,
          `${description} | "${actual}" should be present`,
        ).toContain(actual);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that two values are equal.
   */
  public async assertEquals(
    actual: any,
    expected: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          actual,
          `${description} | Expected: "${expected}", Actual: "${actual}"`,
        ).toEqual(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that two values are not equal.
   */
  public async assertNotEquals(
    actual: any,
    expected: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          actual,
          `${description} | Expected NOT equal to "${expected}", Actual: "${actual}"`,
        ).not.toEqual(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied value is not null.
   */
  public async assertNotNull(
    value: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          value,
          `${description} | Expected: NOT null, Actual: ${value}`,
        ).not.toEqual(null);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied value is not NaN.
   */
  public async assertNotNaN(
    value: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        const isNaNValue = Number.isNaN(value);
        expect(
          isNaNValue,
          `${description} | Expected: NOT NaN, Actual: ${value}`,
        ).toBe(false);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied value is null.
   */
  public async assertNull(
    value: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          value,
          `${description} | Expected: null, Actual: ${value}`,
        ).toEqual(null);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied value is undefined.
   */
  public async assertUndefined(
    value: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          value,
          `${description} | Expected: undefined, Actual: ${value}`,
        ).toBeUndefined();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied value is empty.
   */
  public async assertEmpty(
    value: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(
          value,
          `${description} | Expected to be empty`,
        ).toBeEmpty();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the actual value is greater than the expected value.
   */
  public async assertGreaterThan(
    actual: any,
    expected: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          actual,
          `${description} | Expected ${actual} > ${expected}`,
        ).toBeGreaterThan(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the actual value is greater than or equal to the expected value.
   */
  public async assertGreaterThanOrEqual(
    actual: any,
    expected: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          actual,
          `${description} | Expected ${actual} >= ${expected}`,
        ).toBeGreaterThanOrEqual(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the actual value is less than the expected value.
   */
  public async assertLessThan(
    actual: any,
    expected: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          actual,
          `${description} | Expected ${actual} < ${expected}`,
        ).toBeLessThan(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied value is defined.
   */
  public async assertDefined(
    value: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          value,
          `${description} | Expected: defined, Actual: ${value}`,
        ).toBeDefined();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied locator or value has the expected class.
   */
  public async assertHasClass(
    actual: any,
    expected: any,
    description: string,
    softAssert = false,
  ): Promise<void> {
    const regexClassName = new RegExp(expected);
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(
          actual,
          `${description} | Expected class "${expected}"`,
        ).toHaveClass(regexClassName);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied array does not contain the provided value.
   */
  public async assertArrayNotContains<T>(
    expectedValues: T[],
    actual: T,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          expectedValues,
          `${description} | "${actual}" should NOT be present`,
        ).not.toContain(actual);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Assert that the supplied condition evaluates to false.
   */
  public async assertFalse(
    condition: boolean,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          condition,
          `${description} | Expected: false, Actual: ${condition}`,
        ).toBeFalsy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertBetween(
    value: number,
    min: number,
    max: number,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        const isBetween = value >= min && value <= max;
        expect(
          isBetween,
          `${description} | Expected ${value} to be between ${min} and ${max}`,
        ).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertStartsWith(
    value: string,
    prefix: string,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        const startsWithPrefix = value.startsWith(prefix);
        expect(
          startsWithPrefix,
          `${description} | Expected "${value}" to start with "${prefix}"`,
        ).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertEndsWith(
    value: string,
    suffix: string,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        const endsWithSuffix = value.endsWith(suffix);
        expect(
          endsWithSuffix,
          `${description} | Expected "${value}" to end with "${suffix}"`,
        ).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  public async assertMatchesRegex(
    value: string,
    pattern: RegExp,
    description: string,
    softAssert = false,
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          value,
          `${description} | Expected "${value}" to match pattern ${pattern}`,
        ).toMatch(pattern);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }
}
