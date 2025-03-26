"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { client, account, ID } from "../appwrite";
import { Models } from "appwrite";
import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";

const RegisterPage = () => {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gpa, setGPA] = useState("");
  const [error, setError] = useState("");

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
    router.push('/grades');
  };

  const register = async () => {
    try {
      setError(""); // Clear any existing errors
      if (!email.includes("@mcmaster.ca")){
        setError("Email must be under an @mcmaster.ca domain");
        return false;
      }
  
      await account.create(ID.unique(), email, password, name);
      await account.createVerification(
      'https://www.makethecut.ca/verify'
    )

    //login(email, password);
    } catch (error) {
      setError("Account already exists with this email");
      return false;
    }
  };

  const logout = async () => {
    await account.deleteSession("current");
    setLoggedInUser(null);
  };

  // const newLog = async () => {
  //   await addLog(gpa);
  // }

  return (
    <GridBackground className="h-svh flex items-center justify-center">
      <HomeButton />
      <div className="w-full md:w-1/2 lg:w-1/4 p-10 py-30 mx-auto rounded-lg flex flex-col justify-center align-center text-center">
        <h1 className="text-4xl mb-5 font-semibold">Sign Up</h1>
        <p className="mb-10 text-teenytiny text-red-500">Register currently does not work on school Wi-Fi.<br />We are working on fixing this. Please use another network.</p>
        <div className="mb-15 flex flex-col gap-5">
          <input className="text-subtext border-2 border-gray-200 p-2 rounded-sm  outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="email" placeholder="macid@mcmaster.ca" value={email} onChange={(e) => setEmail(e.target.value)}/>
          <input className="text-subtext border-2 border-gray-200 p-2 rounded-sm  outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          <input className="text-subtext border-2 border-gray-200 p-2 rounded-sm  outline-none bg-neutral-900 w-2/3 mx-auto focus:border-red-500 transition-all duration-300" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
        </div>
        {error && <p className="mb-3 text-red-500 text-tiny">{error}</p>}
        <button className="bg-white text-black px-10 py-1 rounded-sm w-32 hover:scale-105 transition-all duration-300 cursor-pointer mx-auto mb-10" type="button" onClick={register}>Create</button>
        <div className="flex gap-2 justify-center">
          <p className="text-subtext">Already have an account?</p>
          <Link className="text-red-500 text-subtext underline hover:scale-105 cursor-pointer hover:text-white transition-all" type="button" href="/login">
            Log In 
          </Link>
        </div>
      </div>
    </GridBackground>
  );
};

export default RegisterPage;