"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "../appwrite";
import LogoutButton from "@/components/LogoutButton";


export default function Home() {
    const router = useRouter();
    const [error, setError] = useState("");

    useEffect(() => {
        async function initiatePage() {
            try {
                let loggedInUser = await account.get();
                if (loggedInUser.emailVerification) {
                    router.push('/dashboard');
                }
                else {
                    try{
                        await account.createVerification(
                            'https://www.makethecut.ca/verify'
                        )
                    }
                    catch (error){
                        setError("Too many signups in the last hour. Please try again later.");
                    }
                }
            }
            catch (error) {
                router.push('/login');
            }
        }
        initiatePage();
      }, []);

    return (
        <div className="flex flex-col h-svh items-center justify-center gap-5">
            <h1 className="text-subtitle text-white">Please check your email for the verification link</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
                    {error}
                </div>
            )}
            {(() => {
                const [countdown, setCountdown] = useState(60);
                const [buttonClicked, setButtonClicked] = useState(false);
                const [isDisabled, setIsDisabled] = useState(true);

                useEffect(() => {
                    let timer: NodeJS.Timeout;
                    if (countdown > 0 && !buttonClicked) {
                        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                    } else if (countdown === 0 && !buttonClicked) {
                        setIsDisabled(false);
                    }
                    return () => clearTimeout(timer);
                }, [countdown, buttonClicked]);

                const handleClick = () => {
                    setButtonClicked(true);
                    setIsDisabled(true);
                };

                const resendVerifcation = async () => {
                    try{
                        await account.createVerification(
                          'https://www.makethecut.ca/verify'
                        );
                        setButtonClicked(true);
                        setIsDisabled(true);
                        setError("");
                      } catch (error){
                        setError("Too many signups in the last hour. Please try again later.");
                    }
                }

                return (
                    <>
                        <button 
                            className={`p-1 w-40 rounded-sm transition-all ${
                                isDisabled 
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                    : "bg-white text-black hover:scale-110 cursor-pointer"
                            }`}
                            disabled={isDisabled}
                            onClick={resendVerifcation}
                        >
                            {buttonClicked 
                                ? "Email Sent" 
                                : countdown > 0 
                                    ? `Resend in ${countdown}s` 
                                    : "Resend Email"}
                        </button>
                        <LogoutButton />
                    </>
                );
            })()}
        </div>
    );
}
