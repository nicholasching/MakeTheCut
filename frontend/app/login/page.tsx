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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin(email, password);
    }
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
        <Link href="/sign-up" className="mt-4 text-neutral-400 hover:text-white transition-colors duration-300">
          Don't have an account? Sign up
        </Link>
      </div>
    </GridBackground>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}