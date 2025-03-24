"use client";
import { useState } from "react";
import { account, ID } from "../appwrite";
import { Models } from "appwrite";
import {addLog} from "../../actions/logActions";
import Link from "next/link";

const LoginPage = () => {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gpa, setGPA] = useState("");

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

  const logout = async () => {
    await account.deleteSession("current");
    setLoggedInUser(null);
  };

  const newLog = async () => {
    await addLog(gpa);
  }

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
    <div className="bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:8vw_8vw] md:bg-[size:4vw_4vw] h-[100vh] pt-[18vh] relative overflow-hidden">
      <div className="absolute w-[100vh] h-[70vh] bg-gradient-to-br from-yellow-500 via-red-100 to-orange-500 blur-[100px] top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-[pulse_9s_ease-in_infinite] rounded-full opacity-25"></div>
      <div className="absolute w-[100vh] h-[70vh] bg-gradient-to-br from-blue-500 via-pink-200 to-green-800 blur-[100px] top-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 animate-[pulse_7s_ease-in-out_infinite] rounded-full opacity-25"></div>
      <div className="w-2/3 md:w-1/4 text-center p-10 py-30 mx-auto rounded-lg bg-[rgba(3,3,3,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-center align-center before:absolute before:content-[''] before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-[rgba(255,255,255,0.15)] before:to-transparent before:opacity-30 before:-z-10 relative overflow-hidden z-10">
        <h1 className="text-4xl mb-10">Log In</h1>
        <div className="mb-15 flex flex-col gap-5">
        <input
          className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-2/3 mx-auto focus:w-3/4 transition-all duration-300"
          type="email"
          placeholder="macid@mcmaster.ca"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border-2 border-gray-200 p-2 rounded-sm border-none outline-none bg-[#202020] w-2/3 mx-auto focus:w-3/4 transition-all duration-300" 
          type="password"
          placeholder="Password"
          value={password}
            onClick={() => handleLogin(email, password)}
        />
        </div>
          <button 
            className="bg-white text-black px-10 py-1 rounded-sm w-32 hover:scale-105 transition-all duration-300 cursor-pointer mx-auto mb-10" 
            type="button" 
            onClick={() => login(email, password)}
          >
            Login
          </button>
        <div className="flex gap-2 justify-center">
          <p>Don't have an account? </p>
          <Link href="/register">
            <button className="text-blue-500 underline hover:scale-105 transition-transform cursor-pointer" type="button">
              Sign Up 
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;