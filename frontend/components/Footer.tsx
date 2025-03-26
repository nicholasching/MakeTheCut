"use client";

import { Link } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-800 py-4 md:py-6 mt-auto flex justify-between px-10 md:px-30 gap-10">
      <div className="pt-2 md:text-left">
        <p className="text-neutral-500 text-tiny">
        Made with ❤️ by McMaster Students / © {currentYear} MakeTheCut.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <a href="https://www.eng.mcmaster.ca/about-us/fast-facts/" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
          <Link size={12} />
        </a>
      </div>
    </footer>
  );
}