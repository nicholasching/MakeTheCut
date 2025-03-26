"use client";

import { useState, useEffect } from "react";

export default function Home() {
    return (
        <div className="flex flex-col h-svh items-center justify-center gap-5">
            <h1 className="text-subtitle text-white">Check email for verification link</h1>
            {(() => {
                const [countdown, setCountdown] = useState(20);
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

                return (
                    <button 
                        className={`p-1 w-40 rounded-sm transition-all ${
                            isDisabled 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-white text-black hover:scale-110 cursor-pointer"
                        }`}
                        disabled={isDisabled}
                        onClick={handleClick}
                    >
                        {buttonClicked 
                            ? "Email Sent" 
                            : countdown > 0 
                                ? `Resend in ${countdown}s` 
                                : "Resend Email"}
                    </button>
                );
            })()}
        </div>
    );
}
