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
  freechoice: boolean;
}

// Add interface for streams-only input
export interface StreamsInput {
  streams: string;
}

export async function addLog(gradesInput: GradesInput) {
    let loggedInUser = await account.get();
    
    const averageGPA = calculateAverages(gradesInput).toFixed(2);
    
    console.log("Calculated GPA:", averageGPA);

    let elective1 = gradesInput.elec1;
    let elective2 = gradesInput.elec2;

    if (gradesInput.elec1 == "," || gradesInput.elec1.split(',')[0] == "" || gradesInput.elec1.split(',')[1] == "") {
      elective1 = "null";
    }
    if (gradesInput.elec2 == "," || gradesInput.elec2.split(',')[0] == "" || gradesInput.elec2.split(',')[1] == "") {
      elective2 = "null";
    }

    const newLog = {
        gpa: parseFloat(averageGPA),
        math1za3: parseFloat(gradesInput.math1za3) || 0,
        math1zb3: parseFloat(gradesInput.math1zb3) || 0,
        math1zc3: parseFloat(gradesInput.math1zc3) || 0,
        phys1d03: parseFloat(gradesInput.phys1d03) || 0,
        phys1e03: parseFloat(gradesInput.phys1e03) || 0,
        chem1e03: parseFloat(gradesInput.chem1e03) || 0,
        eng1p13: parseFloat(gradesInput.eng1p13) || 0,
        elec1: elective1 || "null",
        elec2: elective2 || "null",
        streams: gradesInput.streams || "null",
        freechoice: gradesInput.freechoice || false
    };

    console.log(newLog);

    try{
      const response = await database.updateDocument(
        'MacStats',
        'UserData',
        loggedInUser.$id,
        newLog
      )
    }
    catch (error) {
      const response = await database.createDocument(
        'MacStats',
        'UserData',
        loggedInUser.$id,
        newLog
      );
    }
}

export async function addStreamChoices(streamsInput: StreamsInput) {
    let loggedInUser = await account.get();
    
    const streamData = {
        streams: streamsInput.streams || "null",
        // Set default values for other fields to maintain database consistency
        gpa: 0,
        math1za3: 0,
        math1zb3: 0,
        math1zc3: 0,
        phys1d03: 0,
        phys1e03: 0,
        chem1e03: 0,
        eng1p13: 0,
        elec1: "null",
        elec2: "null",
        freechoice: false
    };

    console.log("Submitting stream choices:", streamData);

    try {
        const response = await database.updateDocument(
            'MacStats',
            'UserData',
            loggedInUser.$id,
            streamData
        );
    } catch (error) {
        const response = await database.createDocument(
            'MacStats',
            'UserData',
            loggedInUser.$id,
            streamData
        );
    }
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
  if (grades.elec1 != "," && grades.elec1.split(',')[0] != "" && grades.elec1.split(',')[1] != "" && parseFloat(grades.elec1.split(',')[1]) > 0) {
    totalGrade += parseFloat(grades.elec1.split(',')[1]) * parseFloat(grades.elec1.split(',')[0].substring(grades.elec1.split(',')[0].length - 1, grades.elec1.split(',')[0].length));
    totalUnits += parseFloat(grades.elec1.split(',')[0].substring(grades.elec1.split(',')[0].length - 1, grades.elec1.split(',')[0].length));
  }
  if (grades.elec2 != "," && grades.elec2.split(',')[0] != "" && grades.elec2.split(',')[1] != "" && parseFloat(grades.elec2.split(',')[1]) > 0) {
    totalGrade += parseFloat(grades.elec2.split(',')[1]) * parseFloat(grades.elec2.split(',')[0].substring(grades.elec2.split(',')[0].length - 1, grades.elec2.split(',')[0].length));
    totalUnits += parseFloat(grades.elec2.split(',')[0].substring(grades.elec2.split(',')[0].length - 1, grades.elec2.split(',')[0].length));
  }

  return totalGrade / totalUnits;
}