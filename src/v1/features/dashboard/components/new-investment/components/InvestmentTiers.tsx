import React from "react";
import TierCard from "./TierCard";
import { investmentTiers } from "../../onboarding/data/data";

const InvestmentTiers: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center px-2 sm:px-4">
      <div className="text-center mb-4 max-w-full sm:max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Start a New Investment</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Choose your preferred investment tier to begin.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 sm:p-8 pt-8 sm:pt-20 pb-8 sm:pb-20 flex flex-col md:flex-row md:items-center w-full max-w-5xl">
        <div className="mb-4 md:mb-0 md:flex-1 md:pr-10 flex flex-col items-center md:items-start">
          <h2 className="text-white text-lg sm:text-xl font-semibold mb-1">Investment Tiers</h2>
          <p className="text-gray-300 text-xs sm:text-sm">Choose Your Impact Level</p>
        </div>

        <div className="w-full md:w-auto grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-4 md:gap-6">
          {investmentTiers.map((tier) => (
            <TierCard
              key={tier.slug}
              color={tier.color}
              description={tier.description}
              hiveCount={tier.hives}
              title={tier.name}
              slug={tier.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestmentTiers;
