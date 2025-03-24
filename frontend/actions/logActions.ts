import {account, database, ID} from "../app/appwrite";
import {Log} from "../../types";

// Add interface for grades input
export interface GradesInput {
  math1za3: string;
  math1zb3: string;
  math1zc3: string;
  physics1d03: string;
  physics1e03: string;
  chemistry1e03: string;
  engineering1p13: string;
  elec1: string;
  elec2: string;
}

export async function addLog(gradesInput: GradesInput): Promise<Log> {
    let loggedInUser = await account.get();

    const gradeValues = [
      parseFloat(gradesInput.math1za3) || 0,
      parseFloat(gradesInput.math1zb3) || 0,
      parseFloat(gradesInput.math1zc3) || 0,
      parseFloat(gradesInput.physics1d03) || 0,
      parseFloat(gradesInput.physics1e03) || 0,
      parseFloat(gradesInput.chemistry1e03) || 0,
      parseFloat(gradesInput.engineering1p13) || 0,
      parseFloat(gradesInput.elec1) || 0,
      parseFloat(gradesInput.elec2) || 0
    ];
    
    const validGrades = gradeValues.filter(grade => grade > 0);
    const averageGpa = validGrades.length > 0 
      ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length 
      : 0;
    
    const formattedGpa = averageGpa.toFixed(2);
    
    console.log("Calculated GPA:", formattedGpa);

    const newLog = {
        user: loggedInUser.$id, 
        gpa: parseFloat(formattedGpa),
        math1za3: parseFloat(gradesInput.math1za3) || 0,
        math1zb3: parseFloat(gradesInput.math1zb3) || 0,
        math1zc3: parseFloat(gradesInput.math1zc3) || 0,
        phys1d03: parseFloat(gradesInput.physics1d03) || 0,
        phys1e03: parseFloat(gradesInput.physics1e03) || 0,
        chem1e03: parseFloat(gradesInput.chemistry1e03) || 0,
        eng1p13: parseFloat(gradesInput.engineering1p13) || 0,
        elec1: gradesInput.elec1 || "0",
        elec2: gradesInput.elec2 || "0"
    };
    
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