"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import saree1 from "../../public/saree_mix.jpg";
import logo from "../../public/Logo.svg";
import ratha from "../../public/image.png";
import flower from "../../public/flower.png";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function Login() {
  const router = useRouter();
  const buttonText = "Log In";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);
    try {
      const { user, vendor } = await login(identifier, password);

      console.log("Login successful:", user);
      toast.success("Login successful!");

      // Navigate based on role and vendor registration status
      if (user?.role?.toLowerCase() === "admin") {
        router.push("/home");
      } else if (vendor && vendor.userId === user?._id) {
        router.push("/home");
      } else {
        router.push("/vendorsOnboard");
      }
    } catch (error: unknown) {
      let message = "Login failed. Please try again.";
      if (error instanceof AxiosError) {
        message = error.response?.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      toast(message);
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row text-lato bg-[#FAF8F0]">
      {/* Left Side - Form */}

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
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
            Log in to Chihili Account
          </h2>

          {/* Login Fields */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* Email */}
            <div>
              <input
                type="text"
                placeholder="Email or Mobile Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-lg text-lg bg-white focus:border-red-800 focus:ring-red-800 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full h-12 sm:h-14 px-4 pr-12 border border-gray-300 rounded-lg text-lg bg-white focus:border-red-800 focus:ring-red-800 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-end items-center mt-2">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary1 hover:text-primary2 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-800 text-white rounded-lg py-3 px-4 font-medium hover:bg-red-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                buttonText
              )}
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

          {/* Signup link */}
          <p className="text-center text-gray-600">
            Don&apos;t have a Chihili Account?{" "}
            <Link
              href="/auth/signup"
              className="text-red-800 font-semibold hover:text-red-900 inline-flex items-center"
            >
              Sign up
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
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
