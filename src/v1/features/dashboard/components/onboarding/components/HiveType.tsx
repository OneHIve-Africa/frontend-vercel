// src/components/InvestmentTiers.tsx
import React from "react";
import { useOnboardingStore } from "../../../store/OnboardingStore";
import { ChevronLeft } from "lucide-react";
import HiveCard from "./HiveCard";
import { hives, legacyApiary } from "../data/data";
import LegacyHiveCard from "./LegacyHiveCard";

const HiveType: React.FC = () => {
  const { setCurrentStep } = useOnboardingStore();
  const handleBack = () => {
    setCurrentStep(0);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="sticky top-24 self-start ml-4 md:ml-0 z-10">
        <button
          onClick={handleBack}
          className="bg-oha_secondary hover:bg-oha_secondary/80 text-white px-6 py-2 rounded-md flex justify-start cursor-pointer"
        >
          <ChevronLeft /> Back
        </button>
      </div>
      <div className="text-center mb-6  flex items-center max-w-2xl">
        <div className=" ">
          <h1 className="text-2xl font-bold mb-2">Choose Your Hive Type</h1>
          <p className="text-gray-600">
            At One Hive Africa, we offer different beehive options tailored to
            maximize honey production, sustainability, and impact. Select the
            hive that aligns with your investment goals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-10">
        <div className="mt-20">
          <HiveCard hive={hives[0]} />
        </div>

        <div className="mb-20">
          <HiveCard hive={hives[1]} />
        </div>
        <div className="mt-20">
          <HiveCard hive={hives[2]} />
        </div>
        <div className="mb-0">
          <LegacyHiveCard hive={legacyApiary} />
        </div>
      </div>
    </div>
  );
};

export default HiveType;
