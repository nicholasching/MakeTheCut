"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "../appwrite";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Link from "next/link";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <GridBackground className="h-svh flex items-center justify-center">
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/3 p-10 mx-auto rounded-lg flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl mb-5 font-semibold">Email Verification</h1>
        
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
      </div>
    </GridBackground>
  );
}


