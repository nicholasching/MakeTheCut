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

  const login = async (email: string, password: string) => {
    const session = await account.createEmailPasswordSession(email, password);
    setLoggedInUser(await account.get());
  };

  const logout = async () => {
    await account.deleteSession("current");
    setLoggedInUser(null);
  };

  const newLog = async () => {
    await addLog(gpa);
  }


  if (loggedInUser) {
    return (
      <div>
        <p>Logged in as {loggedInUser.name}</p>
        <button type="button" onClick={newLog}>
          Add Log
        </button>
        <input
          type="gpa"
          placeholder="GPA"
          value={gpa}
          onChange={(e) => setGPA(e.target.value)}
        />
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="w-2/3 md:w-1/4 text-center mt-40 p-10 py-30 mx-auto rounded-lg shadow-gray-50 shadow-lg">
        <h1 className="text-3xl mb-10">Welcome Back</h1>
        <form className="flex flex-col justify-center items-center gap-7">
          <div className="mb-15 flex flex-col gap-5">
            <input
              className="border-2 border-gray-200 p-2 rounded-sm"
              type="email"
              placeholder="macid@mcmaster.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border-2 border-gray-200 p-2 rounded-sm" 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="bg-blue-500 px-10 py-1 rounded-sm hover:scale-105 transition-transform cursor-pointer" type="button" onClick={() => login(email, password)}>
            Login
          </button>
          <div className="flex gap-2">
            <p>Don't have an account? </p>
            <Link href="/register">
              
              <button className="text-blue-500 underline hover:scale-105 transition-transform cursor-pointer" type="button">
                Sign Up
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;