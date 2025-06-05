"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addStreamAdmission } from "../../actions/logActions";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import ComboboxStreams from "@/components/ComboboxStream";
import LogoutButton from "@/components/LogoutButton";
import { account, database } from "../appwrite";

export default function StreamAdmissionPage() {
  const router = useRouter();
  const [streamInChoice, setStreamInChoice] = useState<string>("");
  const [streamOutChoice, setStreamOutChoice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Submit");

  useEffect(() => {
    async function initiatePage() {
      try {
        let loggedInUser = await account.get();
        
        // Comment to disable verification
        if (!loggedInUser.emailVerification) {
          router.push('/authenticate');
        }

        // Check if user document exists in UserData24 (graduated users)
        try {
          await database.getDocument('MacStats', 'UserData24', loggedInUser.$id);
          // User is graduated, continue with normal flow
          console.log("User found in UserData24, proceeding with stream admission page");
        } catch (error) {
          // User document doesn't exist in UserData24, redirect to dashboard
          console.log("User not found in UserData24, redirecting to dashboard");
          router.push('/dashboard');
          return;
        }

        // Try to load existing stream admission data
        try {
          const pastData = await database.getDocument('MacStats', 'StreamData24', loggedInUser.$id);
          setStatus("Update");
          if (pastData.streamIn && pastData.streamIn !== "null") {
            setStreamInChoice(pastData.streamIn);
          }
          if (pastData.streamOut && pastData.streamOut !== "null") {
            setStreamOutChoice(pastData.streamOut);
          }
        } catch (error) {
          console.log("No previous stream admission data:", error);
        }
      } catch (error) {
        router.push('/login');
      }
    }
    initiatePage();
  }, []);

  const handleStreamInChange = (value: string) => setStreamInChoice(value);
  const handleStreamOutChange = (value: string) => setStreamOutChoice(value);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate that stream in choice is provided (mandatory).
      if (!streamInChoice) {
        setError("Please select the stream you were admitted to.");
        setIsSubmitting(false);
        return;
      }

      // Validate that if streamOut is provided, it's different from streamIn
      if (streamOutChoice && streamInChoice === streamOutChoice) {
        setError("The stream you were rejected from cannot be the same as the stream you were admitted to.");
        setIsSubmitting(false);
        return;
      }

      const streamAdmissionData = { 
        streamIn: streamInChoice,
        streamOut: streamOutChoice || undefined
      };

      console.log("Submitting stream admission data:", streamAdmissionData);
      await addStreamAdmission(streamAdmissionData);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error submitting stream admission data:", err);
      setError("Failed to submit stream admission data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GridBackground className="pt-30 pb-20 overflow-y-scroll">
      <HomeButton />
      <LogoutButton />
      <h1 className="text-center text-subtext text-neutral-400">
        Stream Admission Results<br />
        Please provide your stream admission information.
      </h1>
      <div className="w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col mx-auto justify-center align-center gap-5 text-center py-10 rounded-md">
        <div className="flex flex-col gap-2">
          <label className="text-neutral-300 text-sm font-medium">
            What stream did you get into? <span className="text-red-500">*</span>
          </label>
          <ComboboxStreams
            value={streamInChoice}
            onChange={handleStreamInChange}
            placeholder="Select stream"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-neutral-300 text-sm font-medium">
            Were there any streams you were rejected from?
          </label>
          <ComboboxStreams
            value={streamOutChoice}
            onChange={handleStreamOutChange}
            placeholder="Select stream"
          />
        </div>
        <div className="flex flex-col gap-3 justify-center items-center">
          {error && <p className="text-red-500 mt-2 text-xs">{error}</p>}
          <button
            className="text-subtext bg-white text-black w-1/3 p-2 rounded-sm border-none hover:scale-105 transition-all duration-300 cursor-pointer mt-5"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : status}
          </button>
          {status === "Update" && (
            <button 
              className="text-subtext text-neutral-400 rounded-sm border-none cursor-pointer hover:scale-105 transition-all"
              onClick={() => router.push('/dashboard')}
            >
              Discard Changes
            </button>
          )}
        </div>
      </div>
    </GridBackground>
  );
} 