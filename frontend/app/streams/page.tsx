"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import ComboboxStreams from "@/components/ComboboxStream";
import LogoutButton from "@/components/LogoutButton";
import { Checkbox } from "@/components/ui/checkbox";

export default function StreamSelectionPage() {
  const router = useRouter();
  const [stream1Choice, setStream1Choice] = useState<string>("");
  const [stream2Choice, setStream2Choice] = useState<string>("");
  const [stream3Choice, setStream3Choice] = useState<string>("");
  const [freechoice, setFreeChoice] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStream1Change = (value: string) => setStream1Choice(value);
  const handleStream2Change = (value: string) => setStream2Choice(value);
  const handleStream3Change = (value: string) => setStream3Choice(value);
  const handleFreeChoiceChange = (checked: boolean | string) => setFreeChoice(checked === true);

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
      const streamData = { streams, freechoice };

      console.log("Submitting stream choices:", streamData);
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
        <div className="flex gap-2 mx-auto">
          <Checkbox checked={freechoice} onCheckedChange={handleFreeChoiceChange} />
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I have free choice
          </label>
        </div>
        <div className="flex flex-col gap-3 justify-center items-center">
          {error && <p className="text-red-500 mt-2 text-xs">{error}</p>}
          <button
            className="text-subtext bg-white text-black w-1/3 p-2 rounded-sm border-none hover:scale-105 transition-all duration-300 cursor-pointer mt-5"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </GridBackground>
  );
}