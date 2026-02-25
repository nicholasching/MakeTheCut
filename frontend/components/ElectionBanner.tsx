"use client";

import { usePathname } from "next/navigation";

export function ElectionBanner() {
  const pathname = usePathname();

  if (pathname === "/election") return null;

  return (
    <div className="bg-gradient-to-r from-blue-800 via-orange-700 to-orange-900 text-primary-foreground text-center p-3 text-sm font-medium animate-glow">
      Nicholas Ching, the creator of MakeTheCut, is running for MES VP Internal 2026.&nbsp;
      <a href="/election" className="underline underline-offset-2 transition-colors">
        Learn about his platform.
      </a>
    </div>
  );
}
