"use client";
import { useState } from "react";
import { account, ID } from "../appwrite";
import { Models } from "appwrite";
import {addLog} from "../../actions/logActions";

const LoginPage = () => {
  const [loggedInUser, setLoggedInUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gpa, setGPA] = useState("");

  const login = async (email: string, password: string) => {
    const session = await account.createEmailPasswordSession(email, password);
    setLoggedInUser(await account.get());
  };

  const register = async () => {
    await account.create(ID.unique(), email, password, name);
    login(email, password);
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
      <div className="width-1/2 text-center mt-50">
      <p>Not logged in</p>
      <form className="flex flex-col justify-center items-center gap-5">
        <input
          className="w-1/6"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-1/6"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="w-1/6"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" onClick={() => login(email, password)}>
          Login
        </button>
        <button type="button" onClick={register}>
          Register
        </button>
      </form>
      </div>

    </div>
  );
};

export default LoginPage;