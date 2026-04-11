/** Grade fields used for GPA (matches logActions GradesInput shape). */
export interface GradeFieldsForGpa {
  math1za3: string;
  math1zb3: string;
  math1zc3: string;
  phys1d03: string;
  phys1e03: string;
  chem1e03: string;
  eng1p13: string;
  elec1: string;
  elec2: string;
}

/**
 * Weighted GPA over entered courses (same formula as legacy addLog).
 * Returns NaN if no courses with positive grades.
 */
export function calculateAverages(grades: GradeFieldsForGpa): number {
  let totalGrade = 0;
  let totalUnits = 0;

  if (parseFloat(grades.math1za3) > 0) {
    totalGrade += parseFloat(grades.math1za3) * 3;
    totalUnits += 3;
  }
  if (parseFloat(grades.math1zb3) > 0) {
    totalGrade += parseFloat(grades.math1zb3) * 3;
    totalUnits += 3;
  }
  if (parseFloat(grades.math1zc3) > 0) {
    totalGrade += parseFloat(grades.math1zc3) * 3;
    totalUnits += 3;
  }
  if (parseFloat(grades.phys1d03) > 0) {
    totalGrade += parseFloat(grades.phys1d03) * 3;
    totalUnits += 3;
  }
  if (parseFloat(grades.phys1e03) > 0) {
    totalGrade += parseFloat(grades.phys1e03) * 3;
    totalUnits += 3;
  }
  if (parseFloat(grades.chem1e03) > 0) {
    totalGrade += parseFloat(grades.chem1e03) * 3;
    totalUnits += 3;
  }
  if (parseFloat(grades.eng1p13) > 0) {
    totalGrade += parseFloat(grades.eng1p13) * 13;
    totalUnits += 13;
  }
  if (
    grades.elec1 != "," &&
    grades.elec1.split(",")[0] != "" &&
    grades.elec1.split(",")[1] != "" &&
    parseFloat(grades.elec1.split(",")[1]) > 0
  ) {
    const p0 = grades.elec1.split(",")[0];
    const u = parseFloat(
      p0.substring(p0.length - 1, p0.length)
    );
    totalGrade += parseFloat(grades.elec1.split(",")[1]) * u;
    totalUnits += u;
  }
  if (
    grades.elec2 != "," &&
    grades.elec2.split(",")[0] != "" &&
    grades.elec2.split(",")[1] != "" &&
    parseFloat(grades.elec2.split(",")[1]) > 0
  ) {
    const p0 = grades.elec2.split(",")[0];
    const u = parseFloat(
      p0.substring(p0.length - 1, p0.length)
    );
    totalGrade += parseFloat(grades.elec2.split(",")[1]) * u;
    totalUnits += u;
  }

  return totalGrade / totalUnits;
}
