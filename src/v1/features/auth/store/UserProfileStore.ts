import { create } from "zustand";
import UserProfileApi, { UserProfile } from "../../../api/UserProfileApi";

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  setProfile: (profileData: UserProfile) => void;
}

const userProfileApi = UserProfileApi.getInstance();

const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null,
  isLoading: false,
  error: null,

  setProfile: (profileData: UserProfile) => {
    if (!profileData) return;
    set({ profile: profileData as UserProfile, isLoading: false });
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userProfileApi.getProfile();
      if (response.error) {
        set({ error: response.error, isLoading: false });
        return;
      }
      if (response.data) {
        set({ profile: response.data as UserProfile, isLoading: false });
      }
    } catch (error: unknown) {
      const err = error as Error;
      set({
        error:
          err.message || "An unexpected error occurred while fetching profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userProfileApi.updateProfile(data);
      set({ isLoading: false });
      if (response.error) {
        set({ error: response.error });
        return false;
      }
      if (response.data) {
        set({ profile: response.data as UserProfile });
        return true;
      }
      return false;
    } catch (error: unknown) {
      const err = error as Error;
      set({
        error:
          err.message || "An unexpected error occurred while updating profile",
        isLoading: false,
      });
      return false;
    }
  },
}));

export { useUserProfileStore };
