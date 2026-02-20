import { create } from "zustand";

// Types for clarity
export type HiveTypeSlug = "ktbh" | "langstroth" | "saltpond" | "legacy" | null;
export type InvestmentTier =
  | "starter"
  | "growth"
  | "enterprise"
  | "legacy"
  | null;

interface PersonalDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  billingAddress: string;
}

interface OnboardingState {
  currentStep: number;
  hiveType: HiveTypeSlug;
  investmentTier: InvestmentTier;
  personalDetails: PersonalDetails;
  setCurrentStep: (step: number) => void;
  setHiveType: (type: HiveTypeSlug) => void;
  setInvestmentTier: (tier: InvestmentTier) => void;
  setPersonalDetails: (details: PersonalDetails) => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 0,
  hiveType: null,
  investmentTier: null,
  personalDetails: {
    fullName: "",
    email: "",
    phoneNumber: "",
    billingAddress: "",
  },

  setCurrentStep: (step) => set(() => ({ currentStep: step })),

  setHiveType: (type) => set(() => ({ hiveType: type })),
  setInvestmentTier: (tier) => set(() => ({ investmentTier: tier })),
  setPersonalDetails: (details) => set(() => ({ personalDetails: details })),

  // Loads store data from localStorage
  loadFromLocalStorage: () => {
    const data = localStorage.getItem("onboardingData");
    if (data) {
      const parsed = JSON.parse(data);
      set(() => ({
        ...parsed,
      }));
    }
  },

  // Saves store data to localStorage
  saveToLocalStorage: () => {
    const state = get();
    const dataToSave = {
      currentStep: state.currentStep,
      hiveType: state.hiveType,
      investmentTier: state.investmentTier,
      personalDetails: state.personalDetails,
    };
    localStorage.setItem("onboardingData", JSON.stringify(dataToSave));
  },
}));
