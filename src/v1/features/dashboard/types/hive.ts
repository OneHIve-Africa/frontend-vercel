import { HiveTypeSlug } from "../store/OnboardingStore";

export type HiveType = {
  name: string;
  description: string;
  investment: number;
  yieldPerHarvest: string;
  harvestsPerYear: string;
  totalAnnualYield: string;
  benefits: string[];
  slug: HiveTypeSlug;
};

export type LegacyApiary = {
  title: string;
  description: string;
  howItWorks: string[];
  slug: HiveTypeSlug;
};
