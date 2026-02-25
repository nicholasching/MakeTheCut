"use client";

import { useState, useEffect } from "react";
import { usePageTransition } from "@/components/TransitionProvider";
import { client, account, database, ID } from "../appwrite";
import { Models } from "appwrite";
import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import MarqueeText from "@/components/MarqueeText";
import { Checkbox } from "@/components/ui/checkbox";
import ComboboxStreams from "@/components/ComboboxStream";
import { useSectionTracking } from "@/hooks/useSectionTracking"

function SignUpContent() {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  // Graduated Engineering 1 fields
  const [isGraduated, setIsGraduated] = useState(false);
  const [gpa, setGpa] = useState("");
  const [streamIn, setStreamIn] = useState("");
  const [streamOut, setStreamOut] = useState("");
  const [hasFreeChoice, setHasFreeChoice] = useState(false);
  
  const sectionRef = useSectionTracking<HTMLDivElement>("SignUp")

  const { navigate } = usePageTransition();
  useEffect(() => {
    async function initiatePage() {
        try {
            let loggedInUser = await account.get();
            if (!isSigningUp) {
              navigate('/dashboard');
            }
        }
        catch (error) {
        }
    }
    initiatePage();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    setLoggedInUser(await account.get());
    //navigate('/grades');          // Comment out to enable verification
  };

  const handleGpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow decimal values for GPA (e.g., 3.85)
    if (/^\d*\.?\d*$/.test(value)) {
      setGpa(value);
    }
  };

  const handleSignUp = async () => {
    try {
      setIsSigningUp(true);
      setError("");
      
      if (!email.endsWith('@mcmaster.ca')) {
        setError("Please use your McMaster email address (@mcmaster.ca)");
        setIsSigningUp(false);
        return;
      }

      // Additional validation for graduated students
      if (isGraduated) {
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
          setError("The stream you were rejected from cannot be the same as the stream you were admitted to");
          setIsSigningUp(false);
          return;
        }
      }

      // Create the user account
      const newUser = await account.create(ID.unique(), email, password, name);
      await login(email, password);

      // If user is graduated, create documents in UserData24 and StreamData24
      if (isGraduated) {
        try {
          // Create document in UserData24 with empty values except GPA
          const emptyDocumentData = {
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
            freechoice: hasFreeChoice
          };

          await database.createDocument(
            'MacStats',
            'UserData24',
            newUser.$id,
            emptyDocumentData
          );

          // Create document in StreamData24 with stream admission data
          const streamData = {
            streamIn: streamIn,
            streamOut: streamOut || "null"
          };

          await database.createDocument(
            'MacStats',
            'StreamData24',
            newUser.$id,
            streamData
          );

          console.log("Created documents for graduated user:", newUser.$id);
          
          // Redirect to dashboard for graduated users
          navigate('/authenticate');
        } catch (dbError) {
          console.error("Error creating graduated user documents:", dbError);
          setError("Failed to set up graduated user profile. Please try again.");
          setIsSigningUp(false);
          return;
        }
      } else {
        // Regular user flow
        navigate('/authenticate');
      }
      setIsSigningUp(false);
    } catch (error) {
      setError("Email already exists or invalid input");
      setIsSigningUp(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };


  return (
    <GridBackground className="h-svh flex items-center justify-center overflow-y-auto" ref={sectionRef}>
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
        
        {/* Graduated checkbox */}
        <div className="flex gap-2 mb-4 items-center">
          <Checkbox 
            checked={isGraduated}
            onCheckedChange={(checked) => setIsGraduated(checked === true)}
          />
          <label className="text-sm font-medium leading-none text-neutral-300">
            I already finished Engineering 1! (2024/2025)
          </label>
        </div>

        {/* Additional fields for graduated students */}
        {isGraduated && (
          <div className="w-full mb-4 space-y-4">            
            <div className="flex flex-col gap-2">
              <label className="text-neutral-300 text-sm font-medium text-center">
                What stream were you admitted to? <span className="text-red-500">*</span>
              </label>
              <ComboboxStreams
                value={streamIn}
                onChange={setStreamIn}
                placeholder="Select admitted stream"
              />
            </div>
            
            {!hasFreeChoice && (
              <div className="flex flex-col gap-2">
                <label className="text-neutral-300 text-sm font-medium text-center">
                  Were you rejected from any stream? (optional)
                </label>
                <ComboboxStreams
                  value={streamOut}
                  onChange={setStreamOut}
                  placeholder="Select rejected stream"
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
              <Checkbox
                checked={hasFreeChoice}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  setHasFreeChoice(isChecked);
                  if (isChecked) {
                    setStreamOut("");
                  }
                }}
              />
              <label className="text-sm font-medium leading-none text-neutral-300">
                I had free choice
              </label>
            </div>
          </div>
        )}

        <button
          onClick={handleSignUp}
          className="bg-white text-black w-full p-2 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer mb-2"
        >
          Sign Up
        </button>
        <p className="text-xs text-neutral-400 text-center">
          📧 We'll send a verification email to confirm your account
        </p>
        <Link href="/login" className="mt-4 text-neutral-400 hover:text-white transition-colors duration-300">
          Already have an account? Login
        </Link>
      </div>
    </GridBackground>
  );
}

export default function SignUpPage() {
  return <SignUpContent />;
}