"use client";

import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role?.toLowerCase();

  const handleLogoClick = () => {
    window.location.href = "/home";
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT - Fixed Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 bg-zinc-50 border-r border-zinc-300 z-10 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div
          className={`
            flex items-center border-b border-gray-200 bg-white
            transition-all duration-300
            ${
              collapsed
                ? "px-2 py-4 justify-center"
                : "px-4 py-4 justify-start gap-3"
            }
          `}
        >
          {/* Logo placeholder - uncomment and adjust path when ready */}
          {/* <Image
            src="/images/chihili.png"
            alt="Chihili Logo"
            width={collapsed ? 32 : 42}
            height={collapsed ? 32 : 42}
            className="cursor-pointer transition-all duration-300"
            onClick={handleLogoClick}
          /> */}

          {/* Placeholder logo */}
          <div
            className={`
              bg-gradient-to-br from-primary1 to-primary2 rounded-lg cursor-pointer
              flex items-center justify-center text-white font-bold
              transition-all duration-300
              ${collapsed ? "w-10 h-10 text-sm" : "w-10 h-10 text-lg"}
            `}
            onClick={handleLogoClick}
          >
            C
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg leading-tight">
                Chihili
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {userRole === "admin" ? "Admin Portal" : "Vendor Portal"}
              </span>
            </div>
          )}
        </div>

        <div className="h-[calc(100vh-120px)] overflow-hidden">
          <Menu collapsed={collapsed} />
        </div>

        <div
          className="absolute p-3 border-t border-zinc-300 bottom-0 left-0 w-full flex justify-center cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <button className="text-zinc-900">
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* RIGHT - Content area with fixed header and scrollable content */}
      <div
        className={`flex-1 bg-[#F7F8FA] flex flex-col ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Fixed Navbar */}
        <div
          className="fixed top-0 right-0 left-0 z-50"
          style={{
            left: collapsed ? "5rem" : "16rem",
            width: "auto",
          }}
        >
          <Navbar />
        </div>
        {/* Scrollable Content with top margin for navbar */}
        <div className="flex-1 overflow-auto h-screen pt-16">{children}</div>
      </div>
    </div>
  );
}
