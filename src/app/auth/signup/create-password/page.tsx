"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import saree1 from "../../../../../public/saree_mix.jpg";
import logo from "../../../../../public/Logo.svg";
import ratha from "../../../../../public/image.png";
import flower from "../../../../../public/flower.png";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { createPassword } from "@/api/auth.api";

export default function CreatePassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePasswordContent />
    </Suspense>
  );
}

function CreatePasswordContent() {
  const searchParams = useSearchParams();
  const { verificationToken } = Object.fromEntries(searchParams.entries());
  const router = useRouter();

  const buttonText = "Create Password";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password validation function
  function validatePassword(pw: string) {
    if (pw.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pw)) return "Password must contain at least one special character.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate password
    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!verificationToken) {
      setError("Missing verification token.");
      return;
    }

    setLoading(true);
    const payload: any = {
      password,
      verificationToken,
    };

    try {
      const result = await createPassword(payload);
      if (result.status === 200) {
        setSuccess("Password created successfully.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        setError(result.data?.message || "Failed to create password.");
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Error creating password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row font-lato bg-secondary">
      {/* Left Side - Form */}
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
          <h2 className="text-3xl font-semibold text-gray-900">Create Password</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center">
              {error}
            </div>
          )}
          {/* Success Message */}
          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-2 text-center">
              {success}
            </div>
          )}

          {/* Password Fields */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* Create Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 sm:h-14 px-4 pr-12 border border-gray-300 rounded-lg text-lg bg-white focus:border-red-800 focus:ring-red-800 outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 sm:h-14 px-4 pr-12 border border-gray-300 rounded-lg text-lg bg-white focus:border-red-800 focus:ring-red-800 outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary1 text-white rounded-lg py-3 px-4 font-medium hover:bg-primary2 transition"
              disabled={loading}
            >
              {loading ? "Creating..." : buttonText}
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
            <button className="text-red-800 font-semibold hover:text-red-900 inline-flex items-center" onClick={() => router.push("/auth/login")}> 
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
