import Image from "next/image";

import GridBackground from "@/components/GridBackground";

import TextCycle, { engineeringMajors } from "@/components/TextCycle";

import Link from "next/link";
import GradientPulse from "@/components/GradientPulse";

export default function Home() {
  return (
    <GridBackground className="p-8 md:p-24 lg:p-36">
      <GradientPulse />
      <h1 className="text-title leading-none mb-5 font-light w-full md:w-2/3">What's the cutoff<br className="md:hidden" /> to get into{" "}<TextCycle words={engineeringMajors} />{" "} engineering?</h1>
      <h2 className="text-subtitle mb-25">McMaster Engineering Stream Prediction</h2>
      <Link href="/login"><button className="bg-red-500 py-2 w-30 md:w-40 rounded-sm hover:scale-105 transition-transoform duration-200 cursor-pointer">Log In</button></Link>
    </GridBackground>
  );
}

