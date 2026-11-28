import NepaliDate from "nepali-date-converter";

const BS_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const toDate = (bsStr) => {
  if (typeof bsStr !== "string" || !BS_DATE_PATTERN.test(bsStr)) return null;

  try {
    const nepaliDate = new NepaliDate(bsStr);
    if (nepaliDate.format("YYYY-MM-DD") !== bsStr) return null;
    return nepaliDate.toJsDate();
  } catch {
    return null;
  }
};

const toDayNumber = (date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
  MILLISECONDS_PER_DAY;

export function validateExperience(startBs, endBs) {
  const today = toDate(new NepaliDate().format("YYYY-MM-DD"));
  const start = toDate(startBs);
  const end = toDate(endBs);

  if (!today || !start || !end) {
    return { valid: false, message: "Enter valid dates in YYYY-MM-DD format." };
  }
  if (toDayNumber(start) >= toDayNumber(today) || toDayNumber(end) >= toDayNumber(today)) {
    return { valid: false, message: "Start and end dates cannot be today or a future date." };
  }
  if (toDayNumber(start) >= toDayNumber(end)) {
    return { valid: false, message: "End date must be after start date." };
  }

  const daysDiff = toDayNumber(end) - toDayNumber(start);
  if (daysDiff <= 182) {
    return { valid: false, message: "Experience must be greater than 6 months." };
  }

  return { valid: true, message: "Valid experience." };
}

export function validateDob(dobBs) {
  const today = toDate(new NepaliDate().format("YYYY-MM-DD"));
  const dob = toDate(dobBs);

  if (!today || !dob) {
    return { valid: false, message: "Enter a valid date of birth in YYYY-MM-DD format." };
  }
  if (toDayNumber(dob) >= toDayNumber(today)) {
    return { valid: false, message: "Choose past date for DOB." };
  }

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;

  if (age <= 18) {
    return { valid: false, message: "Must be greater than 18 years old to be eligible." };
  }

  return { valid: true, message: "Eligible." };
}
