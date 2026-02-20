import { create } from "zustand";

export type HiveTypeSlug = "ktbh" | "langstroth" | "saltpond" | "legacy" | null;
export type InvestmentTier = "starter" | "growth" | "enterprise" | "legacy" | null;

interface PersonalDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  billingAddress: string;
}

interface NewInvestmentState {
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

export const useNewInvestmentStore = create<NewInvestmentState>((set, get) => ({
  currentStep: 0,
  hiveType: null,
  investmentTier: null,
  personalDetails: {
    fullName: "",
    email: "",
    phoneNumber: "",
    billingAddress: "",
  },

  setCurrentStep: (step) =>
    set(() => {
      try {
        if (step > 0) {
          localStorage.setItem("newInvestmentCompleted", "false");
          // Ensure the global alert can show again when the user resumes a flow
          sessionStorage.removeItem("dismissedNewInvestmentAlert");
        }
      } catch {}
      // persist after updating
      setTimeout(() => {
        try {
          const { saveToLocalStorage } = get();
          saveToLocalStorage();
        } catch {}
      }, 0);
      return { currentStep: step } as Partial<NewInvestmentState>;
    }),

  setHiveType: (type) =>
    set(() => {
      // persist after updating
      setTimeout(() => {
        try {
          const { saveToLocalStorage } = get();
          saveToLocalStorage();
        } catch {}
      }, 0);
      return { hiveType: type } as Partial<NewInvestmentState>;
    }),
  setInvestmentTier: (tier) =>
    set(() => {
      setTimeout(() => {
        try {
          const { saveToLocalStorage } = get();
          saveToLocalStorage();
        } catch {}
      }, 0);
      return { investmentTier: tier } as Partial<NewInvestmentState>;
    }),
  setPersonalDetails: (details) =>
    set(() => {
      setTimeout(() => {
        try {
          const { saveToLocalStorage } = get();
          saveToLocalStorage();
        } catch {}
      }, 0);
      return { personalDetails: details } as Partial<NewInvestmentState>;
    }),

  loadFromLocalStorage: () => {
    const data = localStorage.getItem("newInvestmentData");
    if (data) {
      const parsed = JSON.parse(data);
      set(() => ({
        ...parsed,
      }));
    }
  },

  saveToLocalStorage: () => {
    const state = get();
    const dataToSave = {
      currentStep: state.currentStep,
      hiveType: state.hiveType,
      investmentTier: state.investmentTier,
      personalDetails: state.personalDetails,
    };
    localStorage.setItem("newInvestmentData", JSON.stringify(dataToSave));
  },
}));
