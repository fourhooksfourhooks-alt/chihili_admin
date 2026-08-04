"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import saree1 from "../../../../../public/saree_mix.jpg";
import logo from "../../../../../public/Logo.svg";
import ratha from "../../../../../public/image.png";
import flower from "../../../../../public/flower.png";
import { signup } from "@/api/auth.api";

export default function SignupWithEmail() {
  const [mobile, setMobile] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await signup({
        mobile: "91" + mobile,
      });
      // On success, redirect to OTP page
      if (result.status === 201) {
        router.push(
          `/auth/signup/verify-otp?channel=mobile&identifier=${mobile}`
        );
      }
      console.log(result); // Handle the result as needed
    } catch (error) {
      console.error("Signup failed:", error);
      // Handle error (e.g., show a notification)
    }
  };

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row font-lato bg-secondary">
      {/* Left Side - Form */}
      <div className="flex-1  flex items-center justify-center relative overflow-hidden">
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
            Create a Chihili Account
          </h2>

          {/* Email & Mobile Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number
              </label>
              <div className="mt-1 flex rounded-lg border border-gray-300 overflow-hidden focus-within:border-red-800 focus-within:ring-1 focus-within:ring-red-800">
                <span className="px-3 py-3 bg-gray-100 text-gray-700 text-sm flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 text-gray-900 outline-none sm:text-sm"
                  pattern="[0-9]{10}"
                  required
                  onChange={(e) => setMobile(e.target.value)}
                  value={mobile}
                />
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={!mobile}
              className="w-full bg-primary1 text-white rounded-lg py-3 px-4 font-medium hover:bg-primary2 transition"
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
