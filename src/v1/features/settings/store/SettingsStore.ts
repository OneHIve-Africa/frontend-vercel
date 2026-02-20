import { create } from 'zustand';
import SettingsApi from '../../../api/SettingsApi';
import { UserSettings } from '../../../api/types';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<boolean>;
}

const settingsApi = SettingsApi.getInstance();

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await settingsApi.getSettings();
      if (response.data) {
        set({ settings: response.data, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      set({ error: 'Failed to fetch settings.', isLoading: false });
    }
  },

  updateSettings: async (data: Partial<UserSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await settingsApi.updateSettings(data);
      if (response.data) {
        set({ settings: response.data, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Failed to update settings:', error);
      set({ error: 'Failed to update settings.', isLoading: false });
      return false;
    }
  },
}));
