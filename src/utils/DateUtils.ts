import {
  addBusinessDays,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  setHours,
  setSeconds,
  startOfHour,
  subDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { format as dateFnsFormat } from "date-fns";

export enum numberOfDayInWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export class DateUtils {
  /**
   * Generate date in specific time zone
   * @param date to be transform
   * @param timeZone
   * @returns Date
   */
  private static getDateInTimeZone(date: Date, timeZone: string): Date {
    return toZonedTime(date, timeZone);
  }

  /**
   * Current date with current hour o'clock
   * @returns Date
   */
  private static getCurrentDate(): Date {
    const currentDate = new Date();
    return startOfHour(currentDate);
  }

  /**
   * Generate date in specific format
   */
  public static getDateWithFormat(
    date: Date = new Date(),
    format: string = "yyyy-MM-dd HH:mm:ss",
  ): string {
    return dateFnsFormat(date, format);
  }

  /**
   *
   * Starts a high-resolution timer.
   * @returns bigint representing the current high-resolution real time in nanoseconds.
   */
  public static async getCurrentTime(): Promise<bigint> {
    return process.hrtime.bigint();
  }

  /**
   * Generate the date hour with the ISO 8601 format
   * @param date Date()
   * @returns date string format `YYYY-MM-DDTHH:mm:ss.sssZ`
   */
  public static getDateISOTime(date: Date): string {
    const formatted = startOfHour(date);
    return formatted.toISOString();
  }

  /**
   * Generate the current hour with the ISO 8601 format
   * @returns format `YYYY-MM-DDTHH:mm:ss.sssZ`
   */
  public static getCurrentISOTime(): string {
    const now = new Date();
    return this.getDateISOTime(now);
  }

  /**
   * Generate start date 20 day before today and end date one year after start date
   * with the ISO 8601 format `YYYY-MM-DDTHH:mm:ss.sssZ`
   */
  public static getUtcDates() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 20);
    const startDateUtc: string = this.getDateISOTime(startDate);
    startDate.setUTCFullYear(startDate.getUTCFullYear() + 1);
    const endDateUtc: string = this.getDateISOTime(startDate);
    return { startDateUtc, endDateUtc };
  }

  /**
   * Generate current date in own and other time zone for a specific day
   * @param date The specific date
   * @param timeZone The timezone of the location
   * @returns Date
   */
  public static getDateSpecificDay(date: Date, timeZone: string): Date {
    const roundedHourDate = date;
    const dateInLocalTZ = setHours(roundedHourDate, date.getHours());
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Generate current date in own and other time zone with specific hour
   * @param timeZone
   * @param hours
   * @returns Date
   */
  public static getCurrentDateSpecificHour(
    timeZone: string,
    hours: number,
  ): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = setHours(roundedHourDate, hours);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Move date time hours later
   * @param date
   * @param hoursLater
   * @returns Date
   */
  public static moveDateHours(date: Date, hoursLater: number): Date {
    return addHours(date, hoursLater);
  }

  /**
   * Set date time hours later
   * @param date
   * @param hours
   * @returns Date
   */
  public static setDateHours(date: Date, hours: number): Date {
    return setHours(date, hours);
  }

  /**
   * Generate current date with hours later in own and other time zone
   * @param timeZone
   * @param hoursLater
   * @returns Date
   */
  public static getFutureHours(timeZone: string, hoursLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = this.moveDateHours(roundedHourDate, hoursLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Generate current date with future business days in own and other time zone
   * @param timeZone
   * @param daysLater
   * @returns Date
   */
  public static getFutureDays(timeZone: string, daysLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = addDays(roundedHourDate, daysLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Generate current date with future business days in own and other time zone
   * @param timeZone
   * @param daysLater
   * @returns Date
   */
  public static getFutureBusinessDays(
    timeZone: string,
    daysLater: number,
    hour?: number,
    minutes?: number,
  ): Date {
    const roundedHourDate = this.getCurrentDate();
    if (hour) roundedHourDate.setHours(hour);
    if (minutes) roundedHourDate.setMinutes(minutes);
    const dateInLocalTZ = addBusinessDays(roundedHourDate, daysLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Generate date with future business days
   * @param timeZone
   * @param daysLater
   * @returns Date
   */
  public static addFutureBusinessDays(date: Date, daysLater: number): Date {
    return addBusinessDays(date, daysLater);
  }

  /**
   * Converts an hour in 24-hour format to a 12-hour formatted string with AM/PM.
   *
   * @param hour - The hour in 24-hour format (0 to 23).
   * @returns A string representing the time in 12-hour format.
   * @throws Error if the input hour is not between 0 and 23.
   *
   * @example
   * formatHourTo12Hour(0);   // "12:00 AM"
   * formatHourTo12Hour(6);   // "6:00 AM"
   * formatHourTo12Hour(12);  // "12:00 PM"
   * formatHourTo12Hour(18);  // "6:00 PM"
   * formatHourTo12Hour(18, true);  // "6:30 PM"
   * formatHourTo12Hour(18, false, true);  // "06:00 PM"
   */
  public static formatHourTo12Hour(
    hour: number,
    half = false,
    startWithZero = false,
  ): string {
    if (hour < 0 || hour > 23) {
      throw new Error("Hour must be between 0 and 23");
    }

    const period = hour < 12 ? "AM" : "PM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const formattedHour = startWithZero
      ? hour12.toString().padStart(2, "0")
      : hour12.toString();
    const minutes = half ? "30" : "00";

    return `${formattedHour}:${minutes} ${period}`;
  }

  /**
   * Generate current date with future weeks in own and other time zone
   * @param timeZone
   * @param weeksLater
   * @returns Date
   */
  public static getFutureWeek(timeZone: string, weeksLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = addWeeks(roundedHourDate, weeksLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Generate current date with future months in own and other time zone
   * @param timeZone
   * @param monthsLater
   * @returns Date
   */
  public static getFutureMonths(timeZone: string, monthsLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = addMonths(roundedHourDate, monthsLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Generate current date with previous business days in own and other time zone
   * @param timeZone
   * @param daysBefore
   * @returns Date
   */
  public static getPreviousDays(timeZone: string, daysBefore: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = subDays(roundedHourDate, daysBefore);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Get Future Day Based on Some Day
   * @param date date to add days
   * @param days days to add
   * @returns future day based on day param and current date
   */
  public static addDays(date: Date, days: number) {
    return addDays(date, days);
  }

  /**
   * Get Future Day Based on Some minute
   * @param date date to add minutes
   * @param minutes minutes to add (can subtract)
   * @returns future day based on minutes param and current date
   */
  public static addMinutes(date: Date, minutes: number) {
    if (minutes > 0) {
      return addMinutes(date, minutes);
    } else {
      const baseMinutes = date.getMinutes();
      date.setMinutes(baseMinutes + minutes);
      return date;
    }
  }

  /**
   * Rounds minutes of the date to the provided time singularity
   * @param date
   * @param round (base five)
   * @param down rounds up on default value
   * @returns Date rounded up (or down)
   */
  public static roundMinutes(date: Date, down = false, round = 12) {
    const threshold = 60 / round;
    const offset = date.getMinutes() % threshold;
    const difference = (!down ? threshold : 0) - offset;
    return this.addMinutes(setSeconds(date, 0), difference);
  }

  /**
   * get the next day reference of the week from today or specific day
   * @param dayOfWeek The day of the week -> from Dates enum constants
   * @param excludeToday exclude today if is same week day
   * @param refDate start date to seek
   * @returns
   */
  public static getNextDayOfTheWeek(
    dayOfWeek: numberOfDayInWeek,
    timeZone: string,
    excludeToday: boolean = true,
    refDate: Date = new Date(),
  ): Date {
    refDate.setHours(14);
    refDate.setDate(
      refDate.getDate() +
        +!!excludeToday +
        ((dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7),
    );
    return this.getDateInTimeZone(refDate, timeZone);
  }

  /**
   * Calculates the duration in seconds between two high-resolution time points.
   * @param startTime - The start time as a bigint.
   * @param endTime - The end time as a bigint.
   * @returns The duration in seconds as a number.
   */
  public static calculateDurationInSeconds(
    startTime: bigint,
    endTime: bigint,
  ): number {
    return Number(endTime - startTime) / 1e9;
  }
}
