"use client";

import React, { useEffect, useState, useRef } from "react";
import { LogOut, User } from "lucide-react";

interface UserData {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  lastLogin: string;
  department: string;
}

interface VendorData {
  shopName: string;
  status: string;
  ratingAvg: number;
  ratingCount: number;
  address: {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const Navbar = () => {
  // Static user data
  const [user] = useState<UserData>({
    _id: "user123",
    email: "john.doe@company.com",
    name: "Chihili Admin",
    role: "Admin",
    avatar:
      "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740&q=80",
    lastLogin: "2025-08-18T10:30:00Z",
    department: "Engineering",
  });

  // Static vendor data
  const [vendor] = useState<VendorData>({
    shopName: "Chihili Store",
    status: "approved",
    ratingAvg: 4.5,
    ratingCount: 127,
    address: {
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
    },
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // Simulate logout process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDropdownOpen(false);
      // Navigate to login page
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      setIsDropdownOpen(false);
      // Still navigate to login page even if there's an error
      window.location.href = "/auth/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="w-full z-50 transition-all duration-300 bg-white/95 border-gray-200 border-b ">
        <div className="flex items-center justify-end h-18 px-8">
          {/* Right side - User Profile */}
          <div className="flex items-center space-x-3">
            {/* User profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-3">
                <div className="text-right text-gray-700">
                  <p className="text-sm font-semibold">
                    {vendor?.shopName || user.name}
                  </p>
                  <div className="flex items-center justify-end space-x-2 text-xs text-gray-600">
                    <span>{vendor?.address?.city}</span>
                    <span>•</span>
                    <span>{vendor?.address?.state}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-xl transition-all hover:scale-105 transform ${
                    isDropdownOpen
                      ? "ring-2 ring-violet-500 bg-gray-50"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={vendor?.shopName || user.name}
                      className="h-11 w-11 rounded-xl object-cover border-1 border-gray-200"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-gray-100">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </button>
              </div>

              {isDropdownOpen && vendor && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl ring-1 z-20 animate-fadeIn overflow-hidden bg-white ring-gray-100">
                  {/* User info header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 border-b">
                    <div className="space-y-3">
                      {/* Shop Name and Status */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Shop Details
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-gray-900 truncate">
                            {vendor.shopName}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                              String(vendor.status || "").toLowerCase() ===
                                "approved" ||
                              String(vendor.status || "").toLowerCase() ===
                                "accepted"
                                ? "bg-emerald-100 text-emerald-700"
                                : String(vendor.status || "").toLowerCase() ===
                                  "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {vendor.status}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rating</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {vendor.ratingAvg}/5
                          </span>
                          <span className="text-xs text-gray-500">
                            ({vendor.ratingCount} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            {vendor?.address?.city}, {vendor?.address?.state}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span>{vendor?.address?.postalCode}</span>
                            <span>•</span>
                            <span>{vendor?.address?.country}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="border-t py-2 border-gray-100">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`flex w-full items-center px-5 py-3 text-sm transition-all hover:scale-[1.02] ${
                        isLoggingOut
                          ? "opacity-50 cursor-not-allowed"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <LogOut
                        className={`h-5 w-5 mr-3 ${
                          isLoggingOut ? "animate-spin" : ""
                        }`}
                      />
                      <span className="flex-1 text-left">
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Styles */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .hover\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\:scale-\[1\.02\]:hover {
          transform: scale(1.02);
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        /* Gradient animations */
        .bg-gradient-to-br {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;