"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addStreamChoices } from "../../actions/logActions";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import ComboboxStreams from "@/components/ComboboxStream";
import LogoutButton from "@/components/LogoutButton";
import { account, database } from "../appwrite";

export default function StreamSelectionPage() {
  const router = useRouter();
  const [stream1Choice, setStream1Choice] = useState<string>("");
  const [stream2Choice, setStream2Choice] = useState<string>("");
  const [stream3Choice, setStream3Choice] = useState<string>("");
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
          // User is graduated, redirect to dashboard
          router.push('/dashboard');
          return;
        } catch (error) {
          // User document doesn't exist in UserData24, continue with normal flow
          console.log("User not found in UserData24, proceeding with streams page");
        }

        try {
          const pastData = await database.getDocument('MacStats', 'UserData', loggedInUser.$id);
          setStatus("Update");
          if (pastData.streams && pastData.streams !== "null") {
            const streamChoices = pastData.streams.split(',');
            setStream1Choice(streamChoices[0] || "");
            setStream2Choice(streamChoices[1] || "");
            setStream3Choice(streamChoices[2] || "");
          }
        } catch (error) {
          console.error("No previous data:", error);
        }
      } catch (error) {
        router.push('/login');
      }
    }
    initiatePage();
  }, []);

  const handleStream1Change = (value: string) => setStream1Choice(value);
  const handleStream2Change = (value: string) => setStream2Choice(value);
  const handleStream3Change = (value: string) => setStream3Choice(value);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate that all stream choices are provided.
      if (!stream1Choice || !stream2Choice || !stream3Choice) {
        setError("Please select all three stream choices.");
        setIsSubmitting(false);
        return;
      }

      // Validate that the streams are distinct.
      if (
        stream1Choice === stream2Choice ||
        stream1Choice === stream3Choice ||
        stream2Choice === stream3Choice
      ) {
        setError("Please select three different stream choices.");
        setIsSubmitting(false);
        return;
      }

      const streams = `${stream1Choice},${stream2Choice},${stream3Choice}`;
      const streamData = { streams };

      console.log("Submitting stream choices:", streamData);
      await addStreamChoices(streamData);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error submitting stream choices:", err);
      setError("Failed to submit stream choices. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GridBackground className="pt-30 pb-20 overflow-y-scroll">
      <HomeButton />
      <LogoutButton />
      <h1 className="text-center text-subtext text-neutral-400">
        Rank your preferred streams (1-3).<br />
        You can update your choices at any time.
      </h1>
      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 flex flex-col mx-auto justify-center align-center gap-5 text-center py-10 rounded-md">
        <ComboboxStreams
          value={stream1Choice}
          onChange={handleStream1Change}
          placeholder="First Stream Choice"
        />
        <ComboboxStreams
          value={stream2Choice}
          onChange={handleStream2Change}
          placeholder="Second Stream Choice"
        />
        <ComboboxStreams
          value={stream3Choice}
          onChange={handleStream3Change}
          placeholder="Third Stream Choice"
        />
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