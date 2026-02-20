import { InvestmentTier } from "../store/OnboardingStore";

type HiveCount = 5 | 20 | 50 | 100;

export type InvestmentTierCard = {
  name: string;
  color: string;
  description: string;
  hives: HiveCount;
  slug: InvestmentTier;
};
