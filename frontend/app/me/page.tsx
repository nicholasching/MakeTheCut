"use client";

import { useEffect, useMemo, useState } from "react";
import { usePageTransition } from "@/components/TransitionProvider";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Combobox from "@/components/Combobox";
import ComboboxStreams from "@/components/ComboboxStream";
import LogoutButton from "@/components/LogoutButton";
import { Checkbox } from "@/components/ui/checkbox";
import { account, database } from "../appwrite";
import { ADMISSION, COLL_USERS, DATABASE_ID } from "@/lib/appwriteDb";
import TextField from "@/components/TextField";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { getCohortAccess } from "@/lib/scheduleConfig";
import { calculateAverages } from "@/lib/gradeCalc";
import { saveUserProfile } from "@/actions/logActions";

function convertGradeToNumber(input: string): string {
  if (!input) return "";
  const normalized = input.trim().toUpperCase();
  const gradeMap: { [key: string]: string } = {
    "A+": "12",
    A: "11",
    "A-": "10",
    "B+": "9",
    B: "8",
    "B-": "7",
    "C+": "6",
    C: "5",
    "C-": "4",
    "D+": "3",
    D: "2",
    "D-": "1",
  };
  if (gradeMap[normalized]) return gradeMap[normalized];
  const numericValue = input.replace(/[^0-9]/g, "");
  if (numericValue && !isNaN(parseInt(numericValue))) {
    const num = parseInt(numericValue);
    if (num >= 1 && num <= 12) return numericValue;
  }
  return "";
}

function validateGradeInput(value: string): string {
  if (!value) return "";
  if (/^[A-Da-d]/.test(value)) {
    let filtered = value.replace(/[^A-Da-d+-]/g, "").toUpperCase();
    const match = filtered.match(/^([A-D])([+-]?)/);
    if (match) return match[1] + match[2];
    const firstLetter = filtered.match(/^[A-D]/);
    return firstLetter ? firstLetter[0] : "";
  }
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue) {
    const num = parseInt(numericValue);
    if (num > 12) return "12";
    return numericValue;
  }
  return "";
}

function handleGradeChange(value: string, setter: (value: string) => void) {
  if (!value) {
    setter("");
    return;
  }
  setter(validateGradeInput(value));
}

export default function MePage() {
  const { navigate } = usePageTransition();
  const sectionRef = useSectionTracking<HTMLDivElement>("Me");

  const [admitYear, setAdmitYear] = useState<number | null>(null);
  const [access, setAccess] = useState(() => getCohortAccess(ADMISSION.current));

  const [math1za3, setMath1za3] = useState("");
  const [math1zb3, setMath1zb3] = useState("");
  const [math1zc3, setMath1zc3] = useState("");
  const [phys1d03, setPhys1d03] = useState("");
  const [phys1e03, setPhys1e03] = useState("");
  const [chem1e03, setChem1e03] = useState("");
  const [eng1p13, setEng1p13] = useState("");
  const [selectedElective1, setSelectedElective1] = useState("");
  const [selectedElective2, setSelectedElective2] = useState("");
  const [elective1Value, setElective1Value] = useState("");
  const [elective2Value, setElective2Value] = useState("");
  const [stream1Choice, setStream1Choice] = useState("");
  const [stream2Choice, setStream2Choice] = useState("");
  const [stream3Choice, setStream3Choice] = useState("");
  const [freechoice, setFreeChoice] = useState(false);
  const [streamInChoice, setStreamInChoice] = useState("");
  const [streamOutChoice, setStreamOutChoice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const showStreamPrefs = access.canEditStreamPrefs;
  const showSem1 = access.canEditSem1Grades;
  const showSem2 = access.canEditAllGrades;
  const showStreamResults = access.canEditStreamResults;
  const showGradeBlock = showSem1 || showSem2;

  /** Which required fields are still missing — drives inline red hints. */
  const requiredMissing = useMemo(() => {
    if (!ready) return new Set<string>();
    const missing = new Set<string>();

    if (access.canEditStreamPrefs) {
      if (!stream1Choice || !stream2Choice || !stream3Choice) {
        missing.add("streamPrefs");
      }
    }

    if (access.canEditSem1Grades || access.canEditAllGrades) {
      const grades = [math1za3, math1zb3, math1zc3, phys1d03, phys1e03, chem1e03, eng1p13];
      const hasGrade = grades.some((v) => Number(convertGradeToNumber(v)) > 0);
      const hasElec1 = elective1Value && Number(convertGradeToNumber(elective1Value)) > 0;
      const hasElec2 = elective2Value && Number(convertGradeToNumber(elective2Value)) > 0;
      if (!hasGrade && !hasElec1 && !hasElec2) {
        missing.add("grades");
      }
    }

    if (access.canEditStreamResults && !streamInChoice) {
      missing.add("streamIn");
    }

    return missing;
  }, [
    ready,
    access,
    stream1Choice,
    stream2Choice,
    stream3Choice,
    math1za3,
    math1zb3,
    math1zc3,
    phys1d03,
    phys1e03,
    chem1e03,
    eng1p13,
    elective1Value,
    elective2Value,
    streamInChoice,
  ]);

  const liveGpa = useMemo(() => {
    const elec1 =
      selectedElective1 && elective1Value
        ? `${selectedElective1},${convertGradeToNumber(elective1Value)}`
        : ",";
    const elec2 =
      selectedElective2 && elective2Value
        ? `${selectedElective2},${convertGradeToNumber(elective2Value)}`
        : ",";
    const g = calculateAverages({
      math1za3: convertGradeToNumber(math1za3),
      math1zb3: convertGradeToNumber(math1zb3),
      math1zc3: convertGradeToNumber(math1zc3),
      phys1d03: convertGradeToNumber(phys1d03),
      phys1e03: convertGradeToNumber(phys1e03),
      chem1e03: convertGradeToNumber(chem1e03),
      eng1p13: convertGradeToNumber(eng1p13),
      elec1,
      elec2,
    });
    return Number.isFinite(g) ? g.toFixed(2) : "—";
  }, [
    math1za3,
    math1zb3,
    math1zc3,
    phys1d03,
    phys1e03,
    chem1e03,
    eng1p13,
    selectedElective1,
    selectedElective2,
    elective1Value,
    elective2Value,
  ]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const loggedInUser = await account.get();
        if (!loggedInUser.emailVerification) {
          navigate("/authenticate");
          return;
        }

        let ay = ADMISSION.current;
        let hasDoc = false;
        try {
          const doc = await database.getDocument(
            DATABASE_ID,
            COLL_USERS,
            loggedInUser.$id
          );
          hasDoc = true;
          const d = doc as Record<string, unknown>;
          ay = Number(d.admitYear) || ADMISSION.current;
          if (d.math1za3 != null && Number(d.math1za3) !== 0)
            setMath1za3(String(d.math1za3));
          if (d.math1zb3 != null && Number(d.math1zb3) !== 0)
            setMath1zb3(String(d.math1zb3));
          if (d.math1zc3 != null && Number(d.math1zc3) !== 0)
            setMath1zc3(String(d.math1zc3));
          if (d.phys1d03 != null && Number(d.phys1d03) !== 0)
            setPhys1d03(String(d.phys1d03));
          if (d.phys1e03 != null && Number(d.phys1e03) !== 0)
            setPhys1e03(String(d.phys1e03));
          if (d.chem1e03 != null && Number(d.chem1e03) !== 0)
            setChem1e03(String(d.chem1e03));
          if (d.eng1p13 != null && Number(d.eng1p13) !== 0)
            setEng1p13(String(d.eng1p13));
          if (d.elec1 != null && d.elec1 !== "null") {
            const parts = String(d.elec1).split(",");
            setSelectedElective1(parts[0] || "");
            setElective1Value(parts[1] || "");
          }
          if (d.elec2 != null && d.elec2 !== "null") {
            const parts = String(d.elec2).split(",");
            setSelectedElective2(parts[0] || "");
            setElective2Value(parts[1] || "");
          }
          if (d.streams && d.streams !== "null") {
            const parts = String(d.streams).split(",");
            setStream1Choice(parts[0] || "");
            setStream2Choice(parts[1] || "");
            setStream3Choice(parts[2] || "");
          }
          setFreeChoice(Boolean(d.freechoice));
          const si = d.streamIn != null ? String(d.streamIn) : "";
          const so = d.streamOut != null ? String(d.streamOut) : "";
          if (si && si !== "null") setStreamInChoice(si);
          if (so && so !== "null") setStreamOutChoice(so);
        } catch {
          console.log("No users row yet — defaulting to current cohort");
        }

        if (cancelled) return;
        setAdmitYear(ay);
        const acc = getCohortAccess(ay);
        setAccess(acc);

        const fullyLocked =
          !acc.canEditStreamPrefs &&
          !acc.canEditSem1Grades &&
          !acc.canEditAllGrades &&
          !acc.canEditStreamResults;
        if (fullyLocked && hasDoc) {
          navigate("/dashboard");
          return;
        }
        setReady(true);
      } catch {
        navigate("/login");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) {
      if (name === "elec1") setElective1Value("");
      if (name === "elec2") setElective2Value("");
      return;
    }
    const validated = validateGradeInput(value);
    if (name === "elec1") setElective1Value(validated);
    if (name === "elec2") setElective2Value(validated);
  };

  const handleSubmit = async () => {
    const y = admitYear ?? ADMISSION.current;
    const acc = getCohortAccess(y);
    setIsSubmitting(true);
    setError(null);
    try {
      if (acc.canEditStreamPrefs) {
        if (!stream1Choice || !stream2Choice || !stream3Choice) {
          setError("Please select all three stream choices.");
          setIsSubmitting(false);
          return;
        }
        if (
          stream1Choice === stream2Choice ||
          stream1Choice === stream3Choice ||
          stream2Choice === stream3Choice
        ) {
          setError("Please select three different stream choices.");
          setIsSubmitting(false);
          return;
        }
      }

      if (acc.canEditStreamResults) {
        if (!streamInChoice) {
          setError("Please select the stream you were admitted to.");
          setIsSubmitting(false);
          return;
        }
        if (streamOutChoice && streamInChoice === streamOutChoice) {
          setError(
            "The stream you were rejected from cannot match the stream you were admitted to."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const convertedMath1za3 = convertGradeToNumber(math1za3);
      const convertedMath1zb3 = convertGradeToNumber(math1zb3);
      const convertedMath1zc3 = convertGradeToNumber(math1zc3);
      const convertedPhys1d03 = convertGradeToNumber(phys1d03);
      const convertedPhys1e03 = convertGradeToNumber(phys1e03);
      const convertedChem1e03 = convertGradeToNumber(chem1e03);
      const convertedEng1p13 = convertGradeToNumber(eng1p13);
      const convertedElective1Value = convertGradeToNumber(elective1Value);
      const convertedElective2Value = convertGradeToNumber(elective2Value);

      if (acc.canEditSem1Grades || acc.canEditAllGrades) {
        // All grade fields that are potentially editable this period.
        const gradeFields = [
          convertedMath1za3,
          convertedMath1zc3,
          convertedPhys1d03,
          convertedElective1Value,
          ...(acc.canEditAllGrades
            ? [
                convertedMath1zb3,
                convertedPhys1e03,
                convertedChem1e03,
                convertedEng1p13,
                convertedElective2Value,
              ]
            : []),
        ];
        // Require at least one grade (any course) when the grades window is open.
        const hasAtLeastOneGrade =
          gradeFields.some((f) => Number(f) > 0) ||
          Number(convertedElective1Value) > 0 ||
          Number(convertedElective2Value) > 0;
        if (!hasAtLeastOneGrade) {
          setError("Please enter at least one grade.");
          setIsSubmitting(false);
          return;
        }
        const gradesToCheck = [
          { name: "Math 1ZA3", value: convertedMath1za3 },
          { name: "Math 1ZB3", value: convertedMath1zb3 },
          { name: "Math 1ZC3", value: convertedMath1zc3 },
          { name: "Physics 1D03", value: convertedPhys1d03 },
          { name: "Physics 1E03", value: convertedPhys1e03 },
          { name: "Chemistry 1E03", value: convertedChem1e03 },
          { name: "Engineering 1P13", value: convertedEng1p13 },
          { name: "Elective 1", value: convertedElective1Value },
          { name: "Elective 2", value: convertedElective2Value },
        ];
        for (const grade of gradesToCheck) {
          if (/\S/.test(grade.value)) {
            const numValue = parseInt(grade.value);
            if (isNaN(numValue) || numValue < 1 || numValue > 12) {
              setError(
                `${grade.name} must be a valid letter grade or number 1–12.`
              );
              setIsSubmitting(false);
              return;
            }
          }
        }
      }

      const elec1 = selectedElective1 + "," + convertedElective1Value;
      const elec2 = selectedElective2 + "," + convertedElective2Value;
      const streams = `${stream1Choice},${stream2Choice},${stream3Choice}`;

      await saveUserProfile(
        {
          math1za3: convertedMath1za3,
          math1zb3: convertedMath1zb3,
          math1zc3: convertedMath1zc3,
          phys1d03: convertedPhys1d03,
          phys1e03: convertedPhys1e03,
          chem1e03: convertedChem1e03,
          eng1p13: convertedEng1p13,
          elec1,
          elec2,
          streams,
          freechoice,
          streamIn: streamInChoice,
          streamOut: streamOutChoice || undefined,
          admitYear: y,
        },
        acc
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <GridBackground className="pt-30 pb-20">
        <HomeButton />
        <LogoutButton />
        <p className="text-center text-neutral-400">Loading profile…</p>
      </GridBackground>
    );
  }

  const subtitle = (() => {
    const parts: string[] = [];
    if (showStreamPrefs) parts.push("rank your stream preferences (1–3)");
    if (showSem1 && !showSem2) parts.push("enter your Semester 1 grades");
    if (showSem2) parts.push("enter your grades (all semesters)");
    if (showStreamResults) parts.push("report your stream admission results");

    if (parts.length === 0) return "Your data is up to date.";

    const joined =
      parts.length === 1
        ? parts[0]
        : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];

    const gradeNote =
      showGradeBlock
        ? " Input letter grades (A+, A, A-, B+, etc.) or numbers (1–12). Leave unknown grades blank."
        : "";

    return `Use this page to ${joined}.${gradeNote}`;
  })();

  return (
    <GridBackground className="pt-30 pb-20" ref={sectionRef}>
      <HomeButton />
      <LogoutButton />
      <h1 className="text-4xl mb-3 font-semibold text-center">Your Data</h1>
      <p className="text-center text-subtext text-neutral-400 pl-8 pr-8">{subtitle}</p>

      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 flex flex-col mx-auto justify-center gap-5 text-center py-10 rounded-md">
        {showStreamPrefs && (
          <>
            <ComboboxStreams
              value={stream1Choice}
              onChange={setStream1Choice}
              placeholder="First Stream Choice"
            />
            <ComboboxStreams
              value={stream2Choice}
              onChange={setStream2Choice}
              placeholder="Second Stream Choice"
            />
            <ComboboxStreams
              value={stream3Choice}
              onChange={setStream3Choice}
              placeholder="Third Stream Choice"
            />
            <div className="flex gap-2 mx-auto items-center justify-center">
              <Checkbox
                checked={freechoice}
                onCheckedChange={(c) => setFreeChoice(c === true)}
              />
              <label className="text-sm font-medium leading-none text-neutral-300">
                I have free choice
              </label>
            </div>
            {requiredMissing.has("streamPrefs") && (
              <p className="text-red-400 text-xs">
                Please select three stream preferences to continue.
              </p>
            )}
          </>
        )}

        {showSem1 && (
          <>
            <TextField
              label="Math 1ZA3 (Calc 1)"
              id="math1za3"
              value={math1za3}
              onChange={(v) => handleGradeChange(v, setMath1za3)}
              maxLength={3}
            />
            <TextField
              label="Math 1ZC3 (Lin Alg)"
              id="math1zc3"
              value={math1zc3}
              onChange={(v) => handleGradeChange(v, setMath1zc3)}
              maxLength={3}
            />
            <TextField
              label="Physics 1D03"
              id="physics1d03"
              value={phys1d03}
              onChange={(v) => handleGradeChange(v, setPhys1d03)}
              maxLength={3}
            />
          </>
        )}

        {showSem2 && (
          <>
            <TextField
              label="Math 1ZB3 (Calc 2)"
              id="math1zb3"
              value={math1zb3}
              onChange={(v) => handleGradeChange(v, setMath1zb3)}
              maxLength={3}
            />
            <TextField
              label="Physics 1E03"
              id="physics1e03"
              value={phys1e03}
              onChange={(v) => handleGradeChange(v, setPhys1e03)}
              maxLength={3}
            />
            <TextField
              label="Chemistry 1E03"
              id="chemistry1e03"
              value={chem1e03}
              onChange={(v) => handleGradeChange(v, setChem1e03)}
              maxLength={3}
            />
            <TextField
              label="Engineering 1P13"
              id="engineering1p13"
              value={eng1p13}
              onChange={(v) => handleGradeChange(v, setEng1p13)}
              maxLength={3}
            />
          </>
        )}

        {showSem1 && (
          <div>
            <input
              className="text-subtext border-2 border-transparent p-2 rounded-t-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-white transition-all duration-300"
              type="text"
              name="elec1"
              placeholder="Elective 1 Grade (e.g., A+, 11)"
              value={elective1Value}
              onChange={handleInputChange}
              maxLength={3}
            />
            <Combobox
              value={selectedElective1}
              onChange={setSelectedElective1}
              placeholder="Select first elective"
            />
          </div>
        )}

        {showSem2 && (
          <div>
            <input
              className="text-subtext border-2 border-transparent p-2 rounded-t-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-white transition-all duration-300"
              type="text"
              name="elec2"
              placeholder="Elective 2 Grade"
              value={elective2Value}
              onChange={handleInputChange}
              maxLength={3}
            />
            <Combobox
              value={selectedElective2}
              onChange={setSelectedElective2}
              placeholder="Select second elective"
            />
          </div>
        )}

        {showGradeBlock && requiredMissing.has("grades") && (
          <p className="text-red-400 text-xs -mt-2">
            Please enter at least one grade to continue.
          </p>
        )}

        {showGradeBlock && (
          <p className="text-2xl font-semibold text-neutral-200 mt-2">
            GPA:{" "}
            <span className="text-white">{liveGpa}</span>
            <span className="text-neutral-400 text-xl"> / 12</span>
          </p>
        )}

        {showStreamResults && (
          <>
            <p className="text-neutral-300 text-sm -mb-2">
              What stream did you get into?
            </p>
            <ComboboxStreams
              value={streamInChoice}
              onChange={setStreamInChoice}
              placeholder="Select stream"
            />
            {requiredMissing.has("streamIn") && (
              <p className="text-red-400 text-xs -mt-2">
                Please select your admitted stream to continue.
              </p>
            )}
            <p className="text-neutral-300 text-sm -mb-2">
              Were there any streams you were rejected from?
            </p>
            <ComboboxStreams
              value={streamOutChoice}
              onChange={setStreamOutChoice}
              placeholder="Select stream"
            />
          </>
        )}

        <div className="flex flex-col gap-3 justify-center items-center">
          <button
            type="button"
            className="bg-white text-black w-1/3 p-2 rounded-sm border-none hover:scale-105 transition-all duration-300 cursor-pointer mt-5"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
          {error && <p className="text-red-400 mt-2 text-xs">{error}</p>}
        </div>
      </div>
    </GridBackground>
  );
}
