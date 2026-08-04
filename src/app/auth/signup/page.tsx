"use client"
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import saree1 from "../../../../public/saree_yellow.jpg";
import logo from "../../../../public/Logo.svg";
import ratha from "../../../../public/image.png";
import flower from "../../../../public/flower.png";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "@/lib/FirebaseClient"; 
import { loginWithFirebaseToken } from "@/api/auth.api"; // centralized API
import { useAuthStore } from "@/store/authStore";

export default function SignupPage() {
  const setAuth = useAuthStore((s) => s.setAuth);

    const handleLogin = async (provider: any) => {
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken(); 

    const response = await loginWithFirebaseToken(token);
    const { user, token: apiToken } = response.data.data;

    setAuth(user, apiToken);

    console.log("Response from signup API:", response.data);
    console.log("User signed in:", result.user);
  };

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row font-lato bg-secondary">
      {/* Left Side - Signup Form */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
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

        {/* Content */}
        <div className="relative w-full max-w-2xl space-y-8 z-10 p-6 sm:p-8">
          {/* Logo */}
          <div className="mb-20 md:mb-36 mx-auto w-full flex justify-center md:justify-start">
            <Image src={logo} alt="Chihili Logo" className="w-36" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Sign up</h2>

          {/* Sign-up buttons */}
          <div className="space-y-4">
            {/* Google */}
            <button onClick={()=>handleLogin(googleProvider)} className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                Sign up with Google
              </span>
            </button>

            {/* Facebook */}
            <button onClick={()=>handleLogin(facebookProvider)} className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-gray-700 font-medium">
                Sign up with Facebook
              </span>
            </button>

            {/* Mobile Number */}
            <Link href={'/auth/signup/mobile'}>
            <button
            className="w-full bg-primary1/10 border border-primary1/20 rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-primary1/20 transition mb-3">
              <span className="text-primary1 font-medium">
                Sign up with Mobile Number
              </span>
            </button>
            </Link>

            {/* Email */}
            <Link href={'/auth/signup/email'}>
            <button className="w-full bg-primary1 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-primary2 transition">
              <span className="font-medium">Sign up with Email</span>
            </button>
            </Link>
          </div>

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
            <Link href="/auth/login" className="text-red-800 font-semibold hover:text-red-900 inline-flex items-center">
              Log in
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

      {/* Right Side - Image */}
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
