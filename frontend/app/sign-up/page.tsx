"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { client, account, ID } from "../appwrite";
import { Models } from "appwrite";
import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import MarqueeText from "@/components/MarqueeText";
import { useSectionTracking } from "@/hooks/useSectionTracking"

function SignUpContent() {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const sectionRef = useSectionTracking<HTMLDivElement>("SignUp")

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

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    setLoggedInUser(await account.get());
    //router.push('/grades');          // Comment out to enable verification
  };

  const handleSignUp = async () => {
    try {
      if (!email.endsWith('@mcmaster.ca')) {
        setError("Please use your McMaster email address (@mcmaster.ca)");
        return;
      }
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
      router.push('/authenticate');
    } catch (error) {
      setError("Email already exists or invalid input");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };

  if (loggedInUser) {
    if (typeof window !== 'undefined') {
      window.location.href = '/authenticate';
      return null;
    }
  }

  return (
    <GridBackground className="h-svh flex items-center justify-center" ref={sectionRef}>
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/3 p-10 mx-auto rounded-lg flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl mb-5 font-semibold">Sign Up</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 rounded-md bg-neutral-900 border-2 border-transparent focus:border-white transition-all duration-300"
        />
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
          onClick={handleSignUp}
          className="bg-white text-black w-full p-2 rounded-sm hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          Sign Up
        </button>
        <Link href="/login" className="mt-4 text-neutral-400 hover:text-white transition-colors duration-300">
          Already have an account? Login
        </Link>
      </div>
    </GridBackground>
  );
}

// Loading fallback component
function SignUpLoading() {
  return (
    <GridBackground className="h-svh flex items-center justify-center">
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/3 p-10 mx-auto rounded-lg flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl mb-5 font-semibold">Loading...</h1>
      </div>
    </GridBackground>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <SignUpContent />
    </Suspense>
  );
}