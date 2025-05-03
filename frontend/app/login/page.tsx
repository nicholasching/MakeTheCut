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
      window.location.href = '/dashboard';
      return null;
    }
  }

  return (
    <GridBackground className="h-svh flex items-center justify-center">
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/4 p-10 py-30 mx-auto rounded-lg text-center">
        <h1 className="text-4xl mb-5 font-semibold">Log In</h1>
        {/*<p className="mb-10 text-teenytiny text-blue-400 font-semibold">Login currently does not work on school Wi-Fi.<br />We are working on fixing this. Please use another network.</p>*/}
        <div className="mb-10 flex flex-col gap-5">
          <input className="text-subtext border-2 border-gray-200 p-2 rounded-sm  outline-none bg-neutral-900 w-2/3 mx-auto transition-all duration-300" type="email" placeholder="macid@mcmaster.ca" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          <input className="text-subtext border-2 border-gray-200 p-2 rounded-sm outline-none bg-neutral-900 w-2/3 mx-auto transition-all duration-300"  type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
        </div>
        {loginError && <p className="mb-3 text-red-500 text-tiny">{loginError}</p>}
        <button className="bg-white text-black px-10 py-1 rounded-sm w-32 hover:scale-105 transition-all duration-300 cursor-pointer mx-auto mb-10 mt-5" type="button" onClick={() => handleLogin(email, password)}>Login</button>
        <div className="flex gap-2 justify-center">
          <p className="text-subtext">Don't have an account? </p>
          <Link className="text-blue-500 text-subtext underline hover:scale-105 cursor-pointer hover:text-white transition-all" type="button" href="/sign-up">
              Sign Up
          </Link>
        </div>
      </div>
    </GridBackground>
  );
};

export default LoginPage;