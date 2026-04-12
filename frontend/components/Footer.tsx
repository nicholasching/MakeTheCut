"use client";

import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-800 py-4 md:py-6 mt-auto flex justify-between px-10 md:px-30 gap-10">
      <div className="pt-2 md:text-left">
        <p className="text-neutral-500 text-tiny">
        Made with ❤️ by <a href="https://www.nicholasching.ca" className="text-neutral-500 hover:text-red-500 transition-colors">Nicholas Ching</a> and <a href="https://www.dylanli.ca/" className="text-neutral-500 hover:text-red-500 transition-colors">Dylan Li</a> / © {currentYear} MakeTheCut.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/stats" className="text-neutral-500 hover:text-red-500 transition-colors text-tiny">
          Site Stats &amp; Roadmap
        </Link>
        <a href="https://www.eng.mcmaster.ca/about-us/fast-facts/" className="text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1">
          <LinkIcon size={12} />
        </a>
      </div>
    </footer>
  );
}