import {account, database, ID} from "../app/appwrite";
import {Log} from "../../types";

// Add interface for grades input
export interface GradesInput {
  math1za3: string;
  math1zb3: string;
  math1zc3: string;
  phys1d03: string;
  phys1e03: string;
  chem1e03: string;
  eng1p13: string;
  elec1: string;
  elec2: string;
  streams: string;
}

export async function addLog(gradesInput: GradesInput): Promise<Log> {
    let loggedInUser = await account.get();
    
    const averageGPA = calculateAverages(gradesInput).toFixed(2);
    
    console.log("Calculated GPA:", averageGPA);

    const newLog = {
        user: loggedInUser.$id, 
        gpa: parseFloat(averageGPA),
        math1za3: parseFloat(gradesInput.math1za3) || 0,
        math1zb3: parseFloat(gradesInput.math1zb3) || 0,
        math1zc3: parseFloat(gradesInput.math1zc3) || 0,
        phys1d03: parseFloat(gradesInput.phys1d03) || 0,
        phys1e03: parseFloat(gradesInput.phys1e03) || 0,
        chem1e03: parseFloat(gradesInput.chem1e03) || 0,
        eng1p13: parseFloat(gradesInput.eng1p13) || 0,
        elec1: gradesInput.elec1 || "null",
        elec2: gradesInput.elec2 || "null",
        streams: gradesInput.streams || "null"
    };

    console.log(newLog);
    
    const response = await database.createDocument(
        'MacStats',
        'UserData',
        ID.unique(),
        newLog
    );

    const log = {
        $id: response.$id,
        $createdAt: response.$createdAt,
        user: response.user,
        gpa: response.gpa
    };

    console.log(log);
    return log;
}


  function calculateAverages(grades: GradesInput): number {
  
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
  if (grades.elec1 != null && parseFloat(grades.elec1.split(',')[1]) > 0) {
    totalGrade += parseFloat(grades.elec1.split(',')[1]) * parseFloat(grades.elec1.split(',')[0].substring(grades.elec1.split(',')[0].length - 1, grades.elec1.split(',')[0].length));
    totalUnits += parseFloat(grades.elec1.split(',')[0].substring(grades.elec1.split(',')[0].length - 1, grades.elec1.split(',')[0].length));
  }
  if (grades.elec2 != null && parseFloat(grades.elec2.split(',')[1]) > 0) {
    totalGrade += parseFloat(grades.elec2.split(',')[1]) * parseFloat(grades.elec2.split(',')[0].substring(grades.elec2.split(',')[0].length - 1, grades.elec2.split(',')[0].length));
    totalUnits += parseFloat(grades.elec2.split(',')[0].substring(grades.elec2.split(',')[0].length - 1, grades.elec2.split(',')[0].length));
  }

  return totalGrade / totalUnits;
}