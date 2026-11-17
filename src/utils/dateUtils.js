import NepaliDate from "nepali-date-converter";

const DATE_ONLY_PATTERN = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
const NEPALI_DIGITS = "०१२३४५६७८९";

const toEnglishDigits = (value) =>
  String(value).replace(/[०-९]/g, (digit) => NEPALI_DIGITS.indexOf(digit));

// Bare YYYY-MM-DD values are BS unless an API caller explicitly marks them AD.
const getNepaliDate = (value, calendar = "auto") => {
  if (value instanceof Date || typeof value === "number") {
    return new NepaliDate(value);
  }

  const rawValue = toEnglishDigits(String(value ?? "").trim());
  if (!rawValue) return null;

  const dateOnlyMatch = rawValue.match(DATE_ONLY_PATTERN);
  const inputCalendar =
    calendar === "auto" ? (dateOnlyMatch ? "BS" : "AD") : calendar;

  if (inputCalendar === "BS") {
    if (!dateOnlyMatch) {
      throw new Error(`Invalid Bikram Sambat date: ${rawValue}`);
    }

    const [, year, month, day] = dateOnlyMatch;
    const nepaliDate = new NepaliDate(
      Number(year),
      Number(month) - 1,
      Number(day),
    );
    if (
      nepaliDate.getYear() !== Number(year) ||
      nepaliDate.getMonth() !== Number(month) - 1 ||
      nepaliDate.getDate() !== Number(day)
    ) {
      throw new Error(`Invalid Bikram Sambat date: ${rawValue}`);
    }
    return nepaliDate;
  }

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      throw new Error(`Invalid Gregorian date: ${rawValue}`);
    }
    return new NepaliDate(date);
  }

  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid Gregorian date: ${rawValue}`);
  }
  return new NepaliDate(date);
};

export const formatNepaliDate = (value, { calendar = "auto" } = {}) => {
  if (value === null || value === undefined || value === "") return "";

  try {
    const nepaliDate = getNepaliDate(value, calendar);
    return nepaliDate ? nepaliDate.format("YYYY/MM/DD") : "";
  } catch (error) {
    console.error("Nepali date conversion failed:", error);
    return "";
  }
};

export const toNepaliDateInputValue = (value, { calendar = "auto" } = {}) => {
  if (value === null || value === undefined || value === "") return "";

  try {
    const nepaliDate = getNepaliDate(value, calendar);
    return nepaliDate ? nepaliDate.format("YYYY-MM-DD") : "";
  } catch (error) {
    console.error("Nepali date conversion failed:", error);
    return "";
  }
};

export const getNepaliDateTimestamp = (
  value,
  { calendar = "auto", time = "" } = {},
) => {
  if (value === null || value === undefined || value === "") return NaN;

  try {
    const nepaliDate = getNepaliDate(value, calendar);
    if (!nepaliDate) return NaN;

    const date = nepaliDate.toJsDate();
    const hasTime = typeof value === "string" && /[T ]\d{1,2}:\d{2}/.test(value);
    if (time && !hasTime) {
      const [hours = 0, minutes = 0, seconds = 0] = time
        .split(":")
        .map(Number);
      date.setHours(hours, minutes, seconds, 0);
    }
    return date.getTime();
  } catch (error) {
    console.error("Nepali date conversion failed:", error);
    return NaN;
  }
};
