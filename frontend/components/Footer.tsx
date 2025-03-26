"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

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
        <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" >
        <Github size={15} />
        </a>
        <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" >
        <Twitter size={15} />
        </a>
        <a href="mailto:contact@macstats.com" className="text-neutral-400 hover:text-white transition-colors" >
        <Mail size={15} />
        </a>
      </div>
    </footer>
  );
}