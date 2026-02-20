import { HiveType, LegacyApiary } from "../../../types/hive";
import { InvestmentTierCard } from "../../../types/investment";

const investmentTiers: InvestmentTierCard[] = [
  {
    name: "Starter Pack",
    color: "bg-white",
    description: "Great for first-time investors.",
    hives: 5,
    slug: "starter",
  },
  {
    name: "Growth Pack",
    color: "bg-green-500",
    description: "Boost your earnings and impact.",
    hives: 20,
    slug: "growth",
  },
  {
    name: "Enterprise Pack",
    color: "bg-gray-500",
    description: "Build long-term wealth through sustainable Marketing.",
    hives: 50,
    slug: "enterprise",
  },
  {
    name: "Legacy Pack",
    color: "bg-orange-500",
    description: "Hence an equity after benefit and Growth is lasting impact.",
    hives: 100,
    slug: "legacy",
  },
];

const hives: HiveType[] = [
  {
    name: "Kenya Top Bar Hive (KTBH)",
    description:
      "A horizontal hive with removable bars, making hive inspections and harvesting more efficient.",
    investment: 1000,
    yieldPerHarvest: "20 – 30 liters of honey per harvest",
    harvestsPerYear: "2 - 3 times",
    totalAnnualYield: "40 – 60 liters",
    benefits: [
      "Highest honey yield potential (50–100 liters annually)",
      "Supports large-scale honey production",
      "Easy honey extraction without damaging the comb",
    ],
    slug: "ktbh",
  },
  {
    name: "Langstroth Hive",
    description:
      "A modern, vertically stacked hive system widely used in commercial beekeeping.",
    investment: 1500,
    yieldPerHarvest: "20 – 40 liters of honey per harvest",
    harvestsPerYear: "2 - 3 times",
    totalAnnualYield: "40 – 120 liters",
    benefits: [
      "Highest honey yield potential (50–100 liters annually)",
      "Supports large-scale honey production",
      "Easy honey extraction without damaging the comb",
    ],
    slug: "langstroth",
  },
  {
    name: "Saltpond Top Bar Hive",
    description:
      "A modified version of the Kenya Top Bar Hive (KTBH), designed in Ghana for improved efficiency and honey yield.",
    investment: 1000,
    yieldPerHarvest: "15 - 25 liters of honey per harvest",
    harvestsPerYear: "1 - 3 times",
    totalAnnualYield: "30 – 50 liters",
    benefits: [
      "High honey yield (20–75 liters annually)",
      "Easy to manage and harvest without harming bees",
      "Sustainable and cost-effective",
    ],
    slug: "saltpond",
  },
];

const legacyApiary: LegacyApiary = {
  title: "Build Your Legacy – Name an Apiary After Yourself!",
  description:
    "Leaves a lasting mark on nature and communities by running on apiary after yourself.",
  howItWorks: [
    "Invest in at least 100 invest–value: a commitment to sustainability",
    "Choose your preferred location – Select where you want your apiary to be",
    "Leave the rest to us – We’ll set up and manage the hives while you watch your legacy grow.",
  ],
  slug: "legacy",
};

export { investmentTiers, hives, legacyApiary };
