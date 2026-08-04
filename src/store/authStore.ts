"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Vendor } from "@/api/vendor.auth";
import { getMyVendor } from "@/api/vendor.auth";
import {
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  refresh as apiRefresh,
} from "@/api/auth.api";

export type AuthUser = {
  _id: string;
  mobile?: string;
  email?: string;
  role: string;
  loginType?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  lastLogin?: string;
  loginAttempts?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

interface SignupPayload {
  mobile?: string;
  email?: string;
}

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  vendor: Vendor | null;
  vendorLoading: boolean;
  vendorError: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  fetchVendor: () => Promise<Vendor | null>;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ user: AuthUser; accessToken: string; vendor: Vendor | null }>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (payload: SignupPayload) => Promise<unknown>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      vendor: null,
      vendorLoading: false,
      vendorError: null,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: Boolean(token) }),
      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false, vendor: null }),
      fetchVendor: async () => {
        try {
          set({ vendorLoading: true, vendorError: null });
          const vendor = await getMyVendor();
          console.log("Fetched vendor:", vendor);
          set({ vendor });
          return vendor;
        } catch (e) {
          const message =
            e instanceof Error ? e.message : "Failed to fetch vendor";
          set({ vendorError: message, vendor: null });
          return null;
        } finally {
          set({ vendorLoading: false });
        }
      },
      login: async (identifier, password) => {
        const payload = {
          identifier: identifier.includes("@") ? identifier : "91" + identifier,
          password,
        };
        const response = await apiLogin(payload);
        const { user, accessToken } = response.data.data;
        get().setAuth(user, accessToken);
        
        // Fetch vendor data and return it along with user data
        const vendor = await get().fetchVendor();
        return { user, accessToken, vendor };
      },
      refreshToken: async () => {
        const response = await apiRefresh();
        const { accessToken } = response.data.data;
        set({ token: accessToken, isAuthenticated: true });
      },
      logout: async () => {
        try {
          await apiLogout();
        } catch (error) {
          console.error("Logout error:", error);
        }
        get().clearAuth();
      },
      signup: async (payload: SignupPayload) => {
        return apiSignup(payload);
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, vendor: state.vendor }),
    }
  )
);
