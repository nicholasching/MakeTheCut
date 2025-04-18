import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MakeTheCut",
  description: "McMaster Stream Predictions",
  icons: {
    icon: [
      { url: "/makethecut.ico", sizes: "any" }
    ],
    shortcut: { url: "/makethecut.ico" }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Apply gradient background instead of glow */}
        <div className="bg-gradient-to-r from-blue-800 via-orange-700 to-orange-900 text-primary-foreground text-center p-3 text-sm font-medium animate-glow">
          Good News! MakeTheCut now works on McMaster Wifi.
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}