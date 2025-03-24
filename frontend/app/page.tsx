import Image from "next/image";

import TextCycle, { engineeringMajors } from "@/components/TextCycle";

import Link from "next/link";

export default function Home() {
  return (
    <main className="p-36">
      <h1 className="text-title leading-none mb-5 font-light"> What's the cutoff<br />to get into{" "}<TextCycle words={engineeringMajors} />{" "}<br />engineering?</h1>
      <h2 className="flex gap-3 mb-25">
        MacStats will help you find out
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </h2>
      <div className="flex gap-5">
      <Link href="/learn-more">
          <button className="bg-white text-black py-2 px-8 rounded-sm hover:scale-[1.05] transition-transoform duration-300 cursor-pointer">Learn More</button>
        </Link>
        <Link href="/login">
          <button className="bg-blue-500 py-2 px-10 rounded-sm hover:scale-[1.05] transition-transoform duration-200 cursor-pointer">Log In</button>
        </Link>
      </div>
    </main>
  );
}

