"use client";

import { useState, useEffect, useMemo } from "react";
import { usePageTransition } from "@/components/TransitionProvider";
import { account, database, ID } from "../appwrite";
import { Permission, Role } from "appwrite";
import { COLL_USERS, DATABASE_ID } from "@/lib/appwriteDb";
import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import ComboboxStreams from "@/components/ComboboxStream";
import Combobox from "@/components/Combobox";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import {
  computeCurrentAdmitYear,
  getSignUpAdmitYearOptions,
} from "@/lib/scheduleConfig";

function SignUpContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const yearOptions = useMemo(() => getSignUpAdmitYearOptions(), []);
  const yearItems = useMemo(
    () =>
      yearOptions.map((o) => ({
        value: String(o.value),
        label: o.label,
      })),
    [yearOptions]
  );
  const [admitYear, setAdmitYear] = useState<number>(
    () => yearOptions[0]?.value ?? computeCurrentAdmitYear()
  );

  const isPriorCohort = admitYear < computeCurrentAdmitYear();

  const [gpa, setGpa] = useState("");
  const [streamIn, setStreamIn] = useState("");
  const [streamOut, setStreamOut] = useState("");
  const [hasFreeChoice, setHasFreeChoice] = useState(false);

  const sectionRef = useSectionTracking<HTMLDivElement>("SignUp");
  const { navigate } = usePageTransition();

  useEffect(() => {
    async function initiatePage() {
      try {
        await account.get();
        if (!isSigningUp) {
          navigate("/dashboard");
        }
      } catch {
        /* not logged in */
      }
    }
    initiatePage();
  }, [navigate, isSigningUp]);

  const login = async (e: string, p: string) => {
    await account.createEmailPasswordSession(e, p);
  };

  const handleGpaChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    if (/^\d*\.?\d*$/.test(value)) setGpa(value);
  };

  const handleSignUp = async () => {
    try {
      setIsSigningUp(true);
      setError("");

      if (!email.endsWith("@mcmaster.ca")) {
        setError("Please use your McMaster email address (@mcmaster.ca)");
        setIsSigningUp(false);
        return;
      }

      if (isPriorCohort) {
        if (!gpa) {
          setError("Please enter your GPA");
          setIsSigningUp(false);
          return;
        }
        const gpaValue = parseFloat(gpa);
        if (isNaN(gpaValue) || gpaValue < 1 || gpaValue > 12) {
          setError("GPA must be between 1 and 12");
          setIsSigningUp(false);
          return;
        }
        if (!streamIn) {
          setError("Please select the stream you were admitted to");
          setIsSigningUp(false);
          return;
        }
        if (streamOut && streamIn === streamOut) {
          setError("Rejected stream cannot match admitted stream");
          setIsSigningUp(false);
          return;
        }
      }

      const newUser = await account.create(ID.unique(), email, password, name);
      await login(email, password);

      const perms = [
        Permission.read(Role.user(newUser.$id)),
        Permission.update(Role.user(newUser.$id)),
        Permission.delete(Role.user(newUser.$id)),
      ];

      if (isPriorCohort) {
        await database.createDocument(DATABASE_ID, COLL_USERS, newUser.$id, {
          gpa: parseFloat(gpa),
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
          freechoice: hasFreeChoice,
          admitYear,
          streamIn,
          streamOut: hasFreeChoice ? "null" : streamOut || "null",
        }, perms);
      } else {
        await database.createDocument(DATABASE_ID, COLL_USERS, newUser.$id, {
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
          streamIn: "null",
          streamOut: "null",
          admitYear,
        }, perms);
      }

      navigate("/authenticate");
      setIsSigningUp(false);
    } catch {
      setError("Email already exists or invalid input");
      setIsSigningUp(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignUp();
  };

  return (
    <GridBackground
      className="h-svh flex items-center justify-center overflow-y-auto"
      ref={sectionRef}
    >
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/3 p-10 mx-auto rounded-lg flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl mb-5 font-semibold">Sign Up</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
        />

        <p className="text-xs text-neutral-500 -mt-2 mb-1 text-center">
          Intake Year - The year you started at McMaster University.
        </p>
        <Combobox
          items={yearItems}
          value={String(admitYear)}
          onChange={(v) => {
            if (!v) {
              const first = yearItems[0]?.value;
              setAdmitYear(first ? parseInt(first, 10) : computeCurrentAdmitYear());
              return;
            }
            const n = parseInt(v, 10);
            if (!isNaN(n)) setAdmitYear(n);
          }}
          placeholder="Admission year"
          className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent hover:bg-neutral-900 hover:text-white text-white text-sm font-normal justify-between"
          searchPlaceholder="Search year"
          emptyMessage="No year found."
        />

        {isPriorCohort && (
          <div className="w-full mb-4 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-neutral-300 text-sm font-medium text-center">
                Stream you were admitted to <span className="text-red-500">*</span>
              </label>
              <ComboboxStreams
                value={streamIn}
                onChange={setStreamIn}
                placeholder="Admitted stream"
              />
            </div>
            {!hasFreeChoice && (
              <div className="flex flex-col gap-2">
                <label className="text-neutral-300 text-sm font-medium text-center">
                  Rejected from (optional)
                </label>
                <ComboboxStreams
                  value={streamOut}
                  onChange={setStreamOut}
                  placeholder="Rejected stream"
                />
              </div>
            )}
            <input
              type="text"
              placeholder="Overall GPA (e.g. 10.5)"
              value={gpa}
              onChange={handleGpaChange}
              onKeyDown={handleKeyDown}
              className="w-full p-2 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
            />
            <div className="flex gap-2 items-center justify-center">
              <input
                type="checkbox"
                id="fc"
                checked={hasFreeChoice}
                onChange={(e) => {
                  const c = e.target.checked;
                  setHasFreeChoice(c);
                  if (c) setStreamOut("");
                }}
                className="h-4 w-4"
              />
              <label htmlFor="fc" className="text-sm text-neutral-300">
                I had free choice
              </label>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSignUp}
          className="bg-white text-black w-full p-2 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer mb-2"
        >
          Sign Up
        </button>
        <p className="text-xs text-neutral-400 text-center">
          We&apos;ll send a verification email to confirm your account
        </p>
        <Link
          href="/login"
          className="mt-4 text-neutral-400 hover:text-white transition-colors duration-300"
        >
          Already have an account? Login
        </Link>
      </div>
    </GridBackground>
  );
}

export default function SignUpPage() {
  return <SignUpContent />;
}
