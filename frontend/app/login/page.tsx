"use client";
import { useState, useEffect } from "react";
import { account, ID } from "../appwrite";
import { Models } from "appwrite";
import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import { useRouter } from "next/navigation";
import { useSectionTracking } from "@/hooks/useSectionTracking"

function LoginContent() {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const sectionRef = useSectionTracking<HTMLDivElement>("Login")

  const router = useRouter();
  useEffect(() => {
    async function initiatePage() {
        try {
            let loggedInUser = await account.get();
            router.push('/dashboard');
        }
        catch (error) {
            
        }
    }
    initiatePage();
  }, []);

  const [loginError, setLoginError] = useState("");

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      setLoggedInUser(await account.get());
      setLoginError("");
      return true;
    } catch (error) {
      setLoginError("Account Does Not Exist or Invalid Password");
      return false;
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success && loggedInUser) {
      window.location.href = '/dashboard';
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email.trim()) {
      setRecoveryError("Please enter your email address");
      return;
    }

    setIsRecoveryLoading(true);
    setRecoveryError("");
    setRecoveryMessage("");

    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
      setRecoveryMessage("Password recovery email sent! Please check your inbox.");
      setForgotPasswordEmail("");
    } catch (error: any) {
      console.error("Recovery error:", error);
      if (error.code === 401) {
        setRecoveryError("No account found with this email address");
      } else if (error.code === 429) {
        setRecoveryError("Too many recovery attempts. Please try again later.");
      } else {
        setRecoveryError("Failed to send recovery email. Please try again.");
      }
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showForgotPassword) {
        handleForgotPassword(forgotPasswordEmail);
      } else {
        handleLogin(email, password);
      }
    }
  };

  const resetToLogin = () => {
    setShowForgotPassword(false);
    setRecoveryMessage("");
    setRecoveryError("");
    setForgotPasswordEmail("");
  };

  if (loggedInUser) {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'; // TEMPORARY REDIRECT TO GRADES INSTEAD OF DASHBOARD PAGE (FOR NEXT 3 DAYS)
      return null;
    }
  }

  return (
    <GridBackground className="h-svh flex items-center justify-center" ref={sectionRef}>
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/3 p-10 mx-auto rounded-lg flex flex-col justify-center items-center text-center">
        {!showForgotPassword ? (
          <>
            <h1 className="text-4xl mb-5 font-semibold">Login</h1>
            {/*<p className="mb-10 text-teenytiny text-blue-400 font-semibold">Login currently does not work on school Wi-Fi.<br />We are working on fixing this. Please use another network.</p>*/}
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
                {loginError}
              </div>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
            />
            <button
              onClick={() => handleLogin(email, password)}
              className="bg-white text-black w-full p-2 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => setShowForgotPassword(true)}
              className="mt-2 text-neutral-400 hover:text-white transition-colors duration-300 text-sm underline"
            >
              Forgot Password?
            </button>
            <Link href="/sign-up" className="mt-4 text-neutral-400 hover:text-white transition-colors duration-300">
              Don't have an account? Sign up
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-4xl mb-5 font-semibold">Reset Password</h1>
            <p className="mb-6 text-neutral-400 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {recoveryError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4 w-full">
                {recoveryError}
              </div>
            )}
            
            {recoveryMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md mb-4 w-full">
                {recoveryMessage}
              </div>
            )}
            
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
              disabled={isRecoveryLoading}
            />
            
            <button
              onClick={() => handleForgotPassword(forgotPasswordEmail)}
              disabled={isRecoveryLoading}
              className="bg-white text-black w-full p-2 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRecoveryLoading ? "Sending..." : "Send Recovery Email"}
            </button>
            
            <button
              onClick={resetToLogin}
              className="mt-4 text-neutral-400 hover:text-white transition-colors duration-300"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </GridBackground>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}