"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "../appwrite";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Link from "next/link";
import { useSectionTracking } from "@/hooks/useSectionTracking"

// Create a client component that uses useSearchParams
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useSectionTracking<HTMLDivElement>("Verify")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get userId and secret from URL parameters
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (!userId || !secret) {
          setError("Missing verification parameters");
          setIsVerifying(false);
          return;
        }

        // Update verification with Appwrite
        await account.updateVerification(userId, secret);
        setVerificationSuccess(true);
        router.push("/grades");
      } catch (error) {
        console.error("Verification error:", error);
        setError("Failed to verify your email. The link may be invalid or expired.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <GridBackground className="pt-30 pb-20" ref={sectionRef}>
      <HomeButton />
      <div className="text-center">
        {isVerifying && (
          <div className="mb-5">
            <p className="text-xl">Verifying your email...</p>
          </div>
        )}

        {!isVerifying && verificationSuccess && (
          <div className="mb-5">
            <p className="text-xl text-green-500 mb-5">Your email has been successfully verified!</p>
            <Link 
              href="/login" 
              className="bg-white text-black px-10 py-1 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Login to your account
            </Link>
          </div>
        )}

        {!isVerifying && error && (
          <div className="mb-5">
            <p className="text-xl text-red-500 mb-5">{error}</p>
            <Link 
              href="/login" 
              className="bg-white text-black px-10 py-1 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Return to login
            </Link>
          </div>
        )}
      </div>
    </GridBackground>
  );
}

// Loading fallback component
function VerifyLoading() {
  return (
    <GridBackground className="pt-30 pb-20">
      <HomeButton />
      <div className="text-center text-subtext text-neutral-400">
        Verifying your email...
      </div>
    </GridBackground>
  );
}

// Main page component that uses Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}


