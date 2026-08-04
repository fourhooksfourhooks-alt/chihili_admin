"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, TagIcon, CubeIcon } from "@heroicons/react/24/outline";

type MenuProps = {
  collapsed: boolean;
};

const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/home",
    icon: <HomeIcon className="w-5 h-5" />,
    color: "from-primary1 to-primary1",
  },
  {
    label: "Category",
    href: "/category",
    icon: <TagIcon className="w-5 h-5" />,
    color: "from-primary1 to-primary1",
  },
  {
    label: "Products",
    href: "/product",
    icon: <CubeIcon className="w-5 h-5" />,
    color: "from-primary1 to-primary1",
  },
];

const Menu = ({ collapsed }: MenuProps) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className={`mt-4 ${collapsed ? "px-2" : "px-4"} overflow-y-auto h-full`}>
      <div className="flex flex-col gap-1">
        {adminMenuItems.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className={`group relative flex items-center ${
              collapsed ? "justify-center" : "justify-start"
            } gap-4 font-medium py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive(item.href)
                ? `text-white bg-gradient-to-r ${item.color} shadow-lg`
                : "text-gray-600 hover:text-gray-900 hover:bg-zinc-200"
            }`}
          >
            {/* Animated highlight bar */}
            {!collapsed && isActive(item.href) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full bg-zinc-100 shadow-sm"></div>
            )}

            {/* Icon with hover effect */}
            <div
              className={`transition-all duration-300 ${
                isActive(item.href)
                  ? "scale-110 text-white"
                  : "group-hover:scale-110 text-current"
              } ${collapsed ? "mx-auto" : ""}`}
            >
              {item.icon}
            </div>

            {/* Label with slide-in effect */}
            {!collapsed && (
              <span
                className={`block transition-all duration-300 ${
                  isActive(item.href)
                    ? "translate-x-0 font-semibold"
                    : "group-hover:translate-x-1"
                }`}
              >
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;