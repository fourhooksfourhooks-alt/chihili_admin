"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { signup } from "@/api/auth.api";

import saree1 from "../../../../../public/saree_black.jpg";
import logo from "../../../../../public/Logo.svg";
import ratha from "../../../../../public/image.png";
import flower from "../../../../../public/flower.png";

export default function SignupWithEmail() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await signup({ email });
      if (result.status === 201) {
        router.push(`/auth/signup/verify-otp?channel=email&identifier=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error("Email signup failed:", error);
    }
  };
  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row font-lato bg-secondary">
      {/* Left Side - Email Form */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background Images */}
        <div className="absolute top-14 right-0 z-0 opacity-90">
          <Image src={ratha} alt="Ratha" priority />
        </div>
        <div className="absolute bottom-0 left-0 z-0 opacity-90">
          <Image src={flower} alt="Flower" className="h-[30vh] w-auto" priority />
        </div>

        <div className="relative z-10 w-full max-w-2xl space-y-8 p-6 sm:p-10">
          {/* Logo */}
          <div className="mb-24 md:mb-32 w-full flex justify-center md:justify-start">
            <Image src={logo} alt="Chihili Logo" className="w-36" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-semibold text-gray-900">Create a Chihili Account</h2>

          {/* Email Input */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-800 focus:ring-red-800 sm:text-sm"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full bg-primary1 text-white rounded-lg py-3 px-4 font-medium hover:bg-primary1/10 transition"
            >
              Continue
            </button>
          </form>

          {/* Divider */}
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

      {/* Right Side - Main Background Image */}
      <div className="flex-1 relative h-64 md:h-auto">
        <Image src={saree1} alt="Saree Model" fill className="object-cover" priority />
      </div>
    </div>
  );
}
