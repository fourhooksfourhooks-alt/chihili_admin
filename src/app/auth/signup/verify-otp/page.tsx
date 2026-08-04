"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import saree1 from "../../../../../public/saree_mix.jpg";
import logo from "../../../../../public/Logo.svg";
import ratha from "../../../../../public/image.png";
import flower from "../../../../../public/flower.png";
import { ArrowRight } from "lucide-react";
import { resendOtp, verifyOtp } from "@/api/auth.api";

export default function EnterOtp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EnterOtpContent />
    </Suspense>
  );
}

function EnterOtpContent() {
  const searchParams = useSearchParams();
  const {channel, identifier} = Object.fromEntries(searchParams.entries());
  const router = useRouter();

  const buttonText =
    channel === "mobile" ? "Verify Mobile Number" : "Verify Email";

  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer on component mount
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setCanResend(false);
    setTimeLeft(60);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCanResend(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  } 

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setResendMessage(null);
    const payload: any = {};
    if (channel === "mobile") {
      payload.mobile = "91" + identifier;
    } else if (channel === "email") {
      payload.email = identifier;
    }
    
    try {
      const result = await resendOtp(payload);
      if (result.status === 200) {
        setResendMessage("OTP resent successfully!");
        startTimer(); // Restart the timer after successful resend
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setResendMessage(null);
        }, 3000);
      }
    } catch (error) {
      setResendMessage("Failed to resend OTP.");
      console.error("Error resending OTP:", error);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setResendMessage(null);
      }, 3000);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    
    // Build payload with only the correct identifier
    const payload: any = {
      otp: otpValue,
    };
    if (channel === "mobile") {
      payload.mobile = "91" + identifier;
    } else if (channel === "email") {
      payload.email = identifier;
    }
    
    try {
      const result = await verifyOtp(payload);
      if (result.status === 200) {
        // Clear timer on successful verification
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // Redirect to create password page or next step
        router.push(
          `/auth/signup/create-password?verificationToken=${result.data.data.verificationToken}`
        );
        console.log("OTP verified successfully");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
    console.log("OTP submitted:", otpValue);
  };

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row font-lato bg-secondary">
      {/* Left Side - OTP Form */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background Images */}
        <div className="absolute top-14 right-0 z-0 opacity-90">
          <Image src={ratha} alt="Ratha" priority />
        </div>
        <div className="absolute bottom-0 left-0 z-0 opacity-90">
          <Image
            src={flower}
            alt="Flower"
            className="h-[30vh] w-auto"
            priority
          />
        </div>

        <div className="relative z-10 w-full max-w-2xl space-y-8 p-6 sm:p-10">
          {/* Logo */}
          <div className="mb-24 md:mb-32 w-full flex justify-center md:justify-start">
            <Image src={logo} alt="Chihili Logo" className="w-36" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-semibold text-gray-900">
            Enter OTP
          </h2>

          {/* OTP Inputs */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="flex justify-center gap-1 sm:gap-2 w-full">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  placeholder="0"
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  className="flex-1 min-w-0 h-12 sm:h-16 text-center border border-gray-300 text-2xl rounded bg-white focus:border-red-800 focus:ring-red-800 outline-none"
                />
              ))}
            </div>

            {/* Resend OTP Button with Timer */}
            <div className="w-full text-right">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary1 font-medium hover:text-primary2 transition"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-gray-400 font-medium">
                  Resend OTP in {formatTime(timeLeft)}
                </span>
              )}
            </div>
            
            {resendMessage && (
              <div className={`text-center text-sm mt-2 ${
                resendMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
              }`}>
                {resendMessage}
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              className="w-full bg-primary1 text-white rounded-lg py-3 px-4 font-medium hover:bg-primary2 transition"
            >
              {buttonText}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">or</span>
            </div>
          </div>

          {/* Login link */}
          <p className="text-center text-gray-600">
            Already have a Chihili Account?{" "}
            <button className="text-red-800 font-semibold hover:text-red-900 inline-flex items-center">
              Log in
              <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </p>

          {/* Terms */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By proceeding, you agree to the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Main Image */}
      <div className="flex-1 relative h-64 md:h-auto">
        <Image
          src={saree1}
          alt="Saree Model"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}