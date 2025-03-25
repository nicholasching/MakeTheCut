"use client";
import { useState, useEffect } from "react";
import { account, ID } from "../appwrite";
import { Models } from "appwrite";
import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      setLoggedInUser(await account.get());
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  // const newLog = async () => {
  //   await addLog(gpa);
  // }

    // Redirect to dashboard if user is logged in
    const handleLogin = async (email: string, password: string) => {
      const success = await login(email, password);
      if (success && loggedInUser) {
        window.location.href = '/dashboard';
      }
    };
  
    // If already logged in, redirect to dashboard
    if (loggedInUser) {
      // Using client-side navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
        return null; // Return null while redirecting
      }
    }
  

  // if (loggedInUser) {
  //   return (
  //     <div>
  //       <p>Logged in as {loggedInUser.name}</p>
  //       <button type="button" onClick={newLog}>
  //         Add Log
  //       </button>
  //       <input
  //         type="gpa"
  //         placeholder="GPA"
  //         value={gpa}
  //         onChange={(e) => setGPA(e.target.value)}
  //       />
  //       <button type="button" onClick={logout}>
  //         Logout
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <GridBackground className="pt-[18vh]">
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/4 p-10 py-30 mx-auto rounded-lg flex flex-col justify-center align-center text-center">
        <h1 className="text-4xl mb-10 font-semibold">Log In</h1>
        <div className="mb-15 flex flex-col gap-5">
          <input className="text-subtext border-2 border-gray-200 p-2 rounded-sm  outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="email" placeholder="macid@mcmaster.ca" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="text-subtext border-2 border-gray-200 p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300"  type="password" placeholder="Password" value={password} onClick={() => handleLogin(email, password)} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="bg-white text-black px-10 py-1 rounded-sm w-32 hover:scale-105 transition-all duration-300 cursor-pointer mx-auto mb-10" type="button" onClick={() => login(email, password)}>Login</button>
        <div className="flex gap-2 justify-center">
          <p className="text-subtext">Don't have an account? </p>
          <Link className="text-red-500 text-subtext underline hover:scale-105 cursor-pointer hover:text-white transition-all" type="button" href="/sign-up">
              Sign Up
          </Link>
        </div>
      </div>
    </GridBackground>
  );
};

export default LoginPage;