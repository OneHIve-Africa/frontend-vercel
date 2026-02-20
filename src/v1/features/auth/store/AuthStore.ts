/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import AuthApi from "../../../api/AuthApi";
import {
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  VerifyOTPRequest,
  ChangePasswordRequest,
  SetNewPasswordRequest,
} from "../../../api/types";
import { useUserProfileStore } from "./UserProfileStore";
import { UserProfile } from "@/v1/api/UserProfileApi";

// Define enhanced API response types
interface ApiResponseWithFieldErrors {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  isFirstTime: boolean;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]> | null;
  // State setters
  setIsAuthenticated: (value: boolean) => void;
  setIsFirstTime: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  setFieldErrors: (fieldErrors: Record<string, string[]> | null) => void;
  // Auth actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<boolean>;
  changePassword: (data: ChangePasswordRequest) => Promise<boolean>;
  requestPasswordReset: (data: PasswordResetRequest) => Promise<boolean>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<boolean>;
  setNewPassword: (data: SetNewPasswordRequest) => Promise<boolean>;
  googleLogin: (idToken: string) => Promise<boolean>;
}

const authApi = AuthApi.getInstance();

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("access_token"),
  isFirstTime: useUserProfileStore.getState().profile?.is_first ?? false,
  isLoading: false,
  error: null,
  fieldErrors: null,

  // State setters
  setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setIsFirstTime: (value: boolean) => set({ isFirstTime: value }),
  setIsLoading: (value: boolean) => set({ isLoading: value }),
  setError: (error: string | null) => set({ error }),
  setFieldErrors: (fieldErrors: Record<string, string[]> | null) =>
    set({ fieldErrors }),

  // Auth actions
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null, fieldErrors: null });
    try {
      const response = await authApi.login(credentials);
      if (response.error) {
        // Handle field errors if present
        const enhancedResponse = response as ApiResponseWithFieldErrors;
        if (enhancedResponse.fieldErrors) {
          set({
            error: response.error,
            fieldErrors: enhancedResponse.fieldErrors,
            isLoading: false,
          });
        } else {
          set({ error: response.error, isLoading: false });
        }
        return false;
      }
      if (response.data) {
        const priorLogin = localStorage.getItem("has_logged_in_before") === "true";
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("has_logged_in_before", "true");
        // Persist role for routing to correct profile endpoint (admin/farmer/investor)
        if ((response.data as any).role) {
          localStorage.setItem("role", (response.data as any).role);
        }

        // Start with server profile
        let serverProfile = response.data.profile as UserProfile;
        // If this device has logged in before, treat user as NOT first-time locally
        // to avoid redirecting existing users to onboarding erroneously.
        if (priorLogin && serverProfile?.is_first) {
          serverProfile = { ...serverProfile, is_first: false } as UserProfile;
        }

        // Persist and push to stores
        localStorage.setItem("user", JSON.stringify(serverProfile));

        useUserProfileStore.getState().setProfile(serverProfile);

        const isFirst = !!serverProfile?.is_first;
        set({
          isAuthenticated: true,
          isFirstTime: isFirst,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      set({
        error: error.error || error.message || "An unexpected error occurred during login.",
        isLoading: false,
      });
      return false;
    }
  },

  register: async (userData: RegisterRequest) => {
    set({ isLoading: true, error: null, fieldErrors: null });
    try {
      const response = await authApi.register(userData);
      set({ isLoading: false });
      if (response.error) {
        // Handle field errors if present
        const enhancedResponse = response as ApiResponseWithFieldErrors;
        if (enhancedResponse.fieldErrors) {
          set({
            error: response.error,
            fieldErrors: enhancedResponse.fieldErrors,
            isLoading: false,
          });
        } else {
          set({ error: response.error });
        }
        return false;
      }
      return true;
    } catch (error: any) {
      set({
        error: error.error || error.message || "An unexpected error occurred during registration.",
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed on server, clearing client state anyway.", error);
    } finally {
      authApi.clearLocalStorage();
      set({
        isAuthenticated: false,
        isFirstTime: false,
        isLoading: false,
        error: null,
      });
    }
    return true; // Assuming logout should always succeed on client
  },

  changePassword: async (data: ChangePasswordRequest) => {
    set({ isLoading: true, error: null, fieldErrors: null });
    try {
      const response = await authApi.changePassword(data);
      if (response.error) {
        const enhancedResponse = response as ApiResponseWithFieldErrors;
        if (enhancedResponse.fieldErrors) {
          set({
            error: response.error,
            fieldErrors: enhancedResponse.fieldErrors,
            isLoading: false,
          });
        } else {
          set({ error: response.error, isLoading: false });
        }
        return false;
      }
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.error || error.message || "An unexpected error occurred during password change.",
        isLoading: false,
      });
      return false;
    }
  },

  requestPasswordReset: async (data: PasswordResetRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.requestPasswordReset(data);
      set({ isLoading: false });
      if (response.error) {
        set({ error: response.error });
        return false;
      }
      return true;
    } catch (error: any) {
      set({
        error: error.error || error.message || "An unexpected error occurred during reset request.",
        isLoading: false,
      });
      return false;
    }
  },

  verifyOTP: async (data: VerifyOTPRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.verifyOTP(data);
      set({ isLoading: false });
      if (response.error) {
        set({ error: response.error });
        return false;
      }
      return true;
    } catch (error: any) {
      set({
        error: error.error || error.message || "An unexpected error occurred during OTP verification.",
        isLoading: false,
      });
      return false;
    }
  },

  setNewPassword: async (data: SetNewPasswordRequest) => {
    set({ isLoading: true, error: null, fieldErrors: null });
    try {
      const response = await authApi.setNewPassword(data);
      set({ isLoading: false });
      if (response.error) {
        // Handle field errors from backend
        if ((response as any).fieldErrors) {
          set({
            error: response.error,
            fieldErrors: (response as any).fieldErrors,
          });
        } else {
          set({ error: response.error });
        }
        return false;
      }
      return true;
    } catch (error: any) {
      set({
        error: error.error || error.message || "An unexpected error occurred while setting new password.",
        isLoading: false,
      });
      return false;
    }
  },

  googleLogin: async (idToken: string) => {
    set({ isLoading: true, error: null, fieldErrors: null });
    try {
      const response = await authApi.googleLogin(idToken);
      if (response.error) {
        set({ error: response.error, isLoading: false });
        return false;
      }
      if (response.data) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("has_logged_in_before", "true");
        
        if (response.data.role) {
          localStorage.setItem("role", response.data.role);
        }

        const serverProfile = response.data.profile as UserProfile;
        localStorage.setItem("user", JSON.stringify(serverProfile));
        useUserProfileStore.getState().setProfile(serverProfile);

        set({
          isAuthenticated: true,
          isFirstTime: !!serverProfile?.is_first,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      set({
        error: error.error || error.message || "An unexpected error occurred during Google login.",
        isLoading: false,
      });
      return false;
    }
  },
}));

export { useAuthStore };
