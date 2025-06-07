import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AnalyticsWrapper } from "@/components/AnalyticsWrapper"
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = 'https://www.makethecut.ca';
const siteTitle = 'MakeTheCut - McMaster Engineering Stream Predictions';
const siteDescription = 'Make informed decisions about your McMaster Engineering stream selection with MakeTheCut. Get real-time GPA cutoff predictions based on crowdsourced data from students to help you choose the right engineering program.';
const siteImage = `${siteUrl}/makethecut.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | MakeTheCut`,
  },
  description: siteDescription,
  keywords: ['McMaster Engineering', 'Stream Selection', 'GPA Cutoffs', 'Engineering Programs', 'McMaster University', 'Stream Predictions', 'Engineering Admissions', 'Computer Engineering', 'Software Engineering', 'Electrical Engineering'],
  authors: [{ name: 'MakeTheCut Team', url: siteUrl }],
  creator: 'MakeTheCut',
  publisher: 'MakeTheCut',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'MakeTheCut',
    images: [
      {
        url: siteImage,
        width: 1200,
        height: 630,
        alt: 'MakeTheCut - McMaster Engineering Stream Predictions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [siteImage],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AnalyticsWrapper>
          {/* Apply gradient background instead of glow */}
          {/* <div className="bg-gradient-to-r from-blue-800 via-orange-700 to-orange-900 text-primary-foreground text-center p-3 text-sm font-medium animate-glow">
            Good News! MakeTheCut now works on McMaster Wifi. We are also now requiring email verification for all accounts.
          </div> */}
          <main>
            {children}
          </main>
        </AnalyticsWrapper>
      </body>
    </html>
  );
}