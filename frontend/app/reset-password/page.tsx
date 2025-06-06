"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "../appwrite";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import Link from "next/link";
import { useSectionTracking } from "@/hooks/useSectionTracking";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const sectionRef = useSectionTracking<HTMLDivElement>("ResetPassword");

  useEffect(() => {
    // Get the userId and secret from URL parameters
    const userIdParam = searchParams.get('userId');
    const secretParam = searchParams.get('secret');
    
    if (userIdParam && secretParam) {
      setUserId(userIdParam);
      setSecret(secretParam);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!userId || !secret) {
      setError("Invalid reset parameters. Please request a new password reset.");
      return;
    }

    setIsResetting(true);
    setError("");

    try {
      await account.updateRecovery(userId, secret, password);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error.code === 401) {
        setError("Invalid or expired reset link. Please request a new password reset.");
      } else if (error.code === 400) {
        setError("Invalid password format. Please try a different password.");
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleResetPassword();
    }
  };

  if (success) {
    return (
      <GridBackground className="h-svh flex items-center justify-center" ref={sectionRef}>
        <HomeButton />
        <div className="w-full md:w-1/2 lg:w-1/3 p-10 mx-auto rounded-lg flex flex-col justify-center items-center text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl mb-4 font-semibold text-green-400">Password Reset Successful!</h1>
            <p className="text-neutral-400 mb-6">
              Your password has been successfully updated. You will be redirected to the login page in a few seconds.
            </p>
            <Link
              href="/login"
              className="bg-white text-black px-6 py-2 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer inline-block"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </GridBackground>
    );
  }

  return (
    <GridBackground className="h-svh flex items-center justify-center" ref={sectionRef}>
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/3 p-10 mx-auto rounded-lg flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl mb-5 font-semibold">Reset Password</h1>
        <p className="mb-6 text-neutral-400 text-center">
          Enter your new password below to complete the reset process.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4 w-full">
            {error}
          </div>
        )}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
          disabled={isResetting}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
          disabled={isResetting}
        />

        <button
          onClick={handleResetPassword}
          disabled={isResetting}
          className="bg-white text-black w-full p-2 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isResetting ? "Resetting..." : "Reset Password"}
        </button>

        <Link
          href="/login"
          className="mt-4 text-neutral-400 hover:text-white transition-colors duration-300"
        >
          Back to Login
        </Link>
      </div>
    </GridBackground>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
} 