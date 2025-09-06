export function getDogAgeInMonths(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  // adjust if current day is before birth day in the month
  if (today.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function getPuppyIntakePercent(ageMonths) {
  if (ageMonths == null) return null;
  if (ageMonths < 2) return 10;
  if (ageMonths >= 2 && ageMonths < 4) return 10;
  if (ageMonths >= 4 && ageMonths < 6) return 8;
  if (ageMonths >= 6 && ageMonths < 8) return 6;
  if (ageMonths >= 8 && ageMonths < 12) return 4;
  return null;
}

export function getCurrentIntakePercent(dog) {
  if (!dog) return null;
  const ageMonths = getDogAgeInMonths(dog.dob);
  if (ageMonths != null && ageMonths >= 12) {
    return 2.5;
  }
  const wantsPuppyGuidelines =
    ageMonths != null && ageMonths < 12 && (dog.use_puppy_guidelines ?? true);
  if (wantsPuppyGuidelines) {
    const puppyPercent = getPuppyIntakePercent(ageMonths);
    if (puppyPercent != null) return puppyPercent;
  }
  return typeof dog.ratios_intake === "number" ? dog.ratios_intake : 2.5;
}

export function getDailyIntakeGrams(weightKg, intakePercent) {
  if (
    weightKg == null ||
    isNaN(weightKg) ||
    intakePercent == null ||
    isNaN(intakePercent)
  )
    return 0;
  return Math.round(weightKg * 1000 * (intakePercent / 100));
}

export function isEffectivePuppyMode(dog) {
  const ageMonths = getDogAgeInMonths(dog?.dob);
  return (
    ageMonths != null && ageMonths < 12 && (dog?.use_puppy_guidelines ?? true)
  );
}
