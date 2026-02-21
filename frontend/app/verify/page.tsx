"use client";

import { useEffect, useState } from "react";
import { usePageTransition } from "@/components/TransitionProvider";
import { account } from "../appwrite";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Link from "next/link";
import { useSectionTracking } from "@/hooks/useSectionTracking"

function VerifyContent() {
  const { navigate } = usePageTransition();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useSectionTracking<HTMLDivElement>("Verify")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get userId and secret from URL using window.location
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');
        const secret = params.get('secret');

        if (!userId || !secret) {
          setError("Missing verification parameters");
          setIsVerifying(false);
          return;
        }

        // Update verification with Appwrite
        await account.updateVerification(userId, secret);
        setVerificationSuccess(true);
        // Chnage to /grades when grade intake begins
        navigate("/streams");
      } catch (error) {
        console.error("Verification error:", error);
        setError("Failed to verify your email. The link may be invalid or expired.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [navigate]);

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

export default function VerifyPage() {
  return <VerifyContent />;
}


