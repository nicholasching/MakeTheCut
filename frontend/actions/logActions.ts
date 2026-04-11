import { account, database } from "../app/appwrite";
import { Permission, Role } from "appwrite";
import {
  ADMISSION,
  COLL_USERS,
  DATABASE_ID,
} from "../lib/appwriteDb";
import type { CohortAccess } from "../lib/scheduleConfig";
import { calculateAverages } from "../lib/gradeCalc";

function userDocPermissions(userId: string) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

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

// Add interface for stream admission data
export interface StreamAdmissionInput {
  streamIn: string;
  streamOut?: string;
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
      await database.updateDocument(
        DATABASE_ID,
        COLL_USERS,
        loggedInUser.$id,
        newLog
      )
    }
    catch (error) {
      await database.createDocument(
        DATABASE_ID,
        COLL_USERS,
        loggedInUser.$id,
        {
          ...newLog,
          admitYear: ADMISSION.current,
          streamIn: "null",
          streamOut: "null",
        },
        userDocPermissions(loggedInUser.$id)
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
        await database.updateDocument(
            DATABASE_ID,
            COLL_USERS,
            loggedInUser.$id,
            streamData
        );
    } catch (error) {
        await database.createDocument(
            DATABASE_ID,
            COLL_USERS,
            loggedInUser.$id,
            {
              ...streamData,
              admitYear: ADMISSION.current,
              streamIn: "null",
              streamOut: "null",
            },
            userDocPermissions(loggedInUser.$id)
        );
    }
}

export async function addStreamAdmission(streamAdmissionInput: StreamAdmissionInput) {
    let loggedInUser = await account.get();
    
    const streamAdmissionData = {
        streamIn: streamAdmissionInput.streamIn || "null",
        streamOut: streamAdmissionInput.streamOut || "null"
    };

    console.log("Submitting stream admission data:", streamAdmissionData);

    try {
        await database.updateDocument(
            DATABASE_ID,
            COLL_USERS,
            loggedInUser.$id,
            streamAdmissionData
        );
    } catch (error) {
        await database.createDocument(
            DATABASE_ID,
            COLL_USERS,
            loggedInUser.$id,
            {
              ...streamAdmissionData,
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
              streams: "null",
              freechoice: false,
              admitYear: ADMISSION.current,
            },
            userDocPermissions(loggedInUser.$id)
        );
    }
}

/** Full profile form shape for `/me` (string grades like legacy forms). */
export interface UserProfileInput extends GradesInput, StreamAdmissionInput {
  admitYear?: number;
}

function normalizeElectives(elec1: string, elec2: string) {
  let e1 = elec1;
  let e2 = elec2;
  if (e1 == "," || e1.split(",")[0] == "" || e1.split(",")[1] == "") {
    e1 = "null";
  }
  if (e2 == "," || e2.split(",")[0] == "" || e2.split(",")[1] == "") {
    e2 = "null";
  }
  return { e1, e2 };
}

function docToGradeStrings(doc: Record<string, unknown>): GradesInput {
  const n = (v: unknown) =>
    v === null || v === undefined || v === "" ? "" : String(v);
  const elec = (v: unknown) => (v === "null" || v == null ? "," : String(v));
  return {
    math1za3: n(doc.math1za3),
    math1zb3: n(doc.math1zb3),
    math1zc3: n(doc.math1zc3),
    phys1d03: n(doc.phys1d03),
    phys1e03: n(doc.phys1e03),
    chem1e03: n(doc.chem1e03),
    eng1p13: n(doc.eng1p13),
    elec1: elec(doc.elec1),
    elec2: elec(doc.elec2),
    streams:
      doc.streams === "null" || doc.streams == null
        ? ""
        : String(doc.streams),
    freechoice: Boolean(doc.freechoice),
  };
}

/**
 * Persists only fields allowed by `access`. Merges with existing document so
 * locked sections keep server values.
 */
export async function saveUserProfile(
  input: UserProfileInput,
  access: CohortAccess
) {
  const loggedInUser = await account.get();

  let existing: Record<string, unknown> | null = null;
  try {
    existing = (await database.getDocument(
      DATABASE_ID,
      COLL_USERS,
      loggedInUser.$id
    )) as unknown as Record<string, unknown>;
  } catch {
    existing = null;
  }

  const baseGrades = existing
    ? docToGradeStrings(existing)
    : {
        math1za3: "",
        math1zb3: "",
        math1zc3: "",
        phys1d03: "",
        phys1e03: "",
        chem1e03: "",
        eng1p13: "",
        elec1: ",",
        elec2: ",",
        streams: "",
        freechoice: false,
      };

  const merged: GradesInput = { ...baseGrades };
  if (access.canEditStreamPrefs) {
    merged.streams = input.streams || "null";
    merged.freechoice = input.freechoice;
  }
  if (access.canEditSem1Grades) {
    merged.math1za3 = input.math1za3;
    merged.math1zc3 = input.math1zc3;
    merged.phys1d03 = input.phys1d03;
    merged.elec1 = input.elec1;
  }
  if (access.canEditAllGrades) {
    merged.math1zb3 = input.math1zb3;
    merged.phys1e03 = input.phys1e03;
    merged.chem1e03 = input.chem1e03;
    merged.eng1p13 = input.eng1p13;
    merged.elec2 = input.elec2;
  }

  let streamIn =
    existing && existing.streamIn != null
      ? String(existing.streamIn)
      : "null";
  let streamOut =
    existing && existing.streamOut != null
      ? String(existing.streamOut)
      : "null";
  if (access.canEditStreamResults) {
    streamIn = input.streamIn || "null";
    streamOut = input.streamOut ?? "null";
  }

  const { e1, e2 } = normalizeElectives(merged.elec1, merged.elec2);
  const gradesForAvg: GradesInput = { ...merged, elec1: e1, elec2: e2 };
  const avg = calculateAverages(gradesForAvg);
  const averageGPA = Number.isFinite(avg) ? avg : 0;

  const newLog = {
    gpa: parseFloat(averageGPA.toFixed(2)),
    math1za3: parseFloat(merged.math1za3) || 0,
    math1zb3: parseFloat(merged.math1zb3) || 0,
    math1zc3: parseFloat(merged.math1zc3) || 0,
    phys1d03: parseFloat(merged.phys1d03) || 0,
    phys1e03: parseFloat(merged.phys1e03) || 0,
    chem1e03: parseFloat(merged.chem1e03) || 0,
    eng1p13: parseFloat(merged.eng1p13) || 0,
    elec1: e1,
    elec2: e2,
    streams: merged.streams || "null",
    freechoice: merged.freechoice || false,
    streamIn,
    streamOut,
  };

  const admitYear =
    (existing?.admitYear as number | undefined) ??
    input.admitYear ??
    ADMISSION.current;

  try {
    await database.updateDocument(
      DATABASE_ID,
      COLL_USERS,
      loggedInUser.$id,
      newLog
    );
  } catch {
    await database.createDocument(
      DATABASE_ID,
      COLL_USERS,
      loggedInUser.$id,
      {
        ...newLog,
        admitYear,
      },
      userDocPermissions(loggedInUser.$id)
    );
  }
}
