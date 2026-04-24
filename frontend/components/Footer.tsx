"use client";

import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { account } from "../app/appwrite";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        await account.get();
        if (!cancelled) setLoggedIn(true);
      } catch {
        if (!cancelled) setLoggedIn(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-800 py-4 md:py-6 mt-auto flex flex-wrap items-center justify-center md:justify-between px-6 md:px-20 gap-x-10 gap-y-2">
      <div className="w-full md:w-auto text-center md:text-left shrink-0">
        <p className="text-neutral-500 text-sm whitespace-nowrap">
        Made with ❤️ by <a href="https://www.nicholasching.ca" className="text-neutral-500 hover:text-red-500 transition-colors">Nicholas Ching</a> and <a href="https://www.dylanli.ca/" className="text-neutral-500 hover:text-red-500 transition-colors">Dylan Li</a>
        </p>
      </div>
      <div className="w-full md:w-auto flex items-center gap-4 justify-center md:justify-end shrink-0 whitespace-nowrap">
        {loggedIn && (
          <Link href="/contact" className="text-neutral-500 hover:text-red-500 transition-colors text-sm">
            Contact Us
          </Link>
        )}
        <Link href="/stats" className="text-neutral-500 hover:text-red-500 transition-colors text-sm">
          Site Stats &amp; Roadmap
        </Link>
        <a href="https://www.eng.mcmaster.ca/about-us/fast-facts/" className="text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1">
          <LinkIcon size={12} />
        </a>
      </div>
    </footer>
  );
}
