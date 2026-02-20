import {
  InvestmentTier,
  useOnboardingStore,
} from "../../../store/OnboardingStore";

type TierProps = {
  title: string;
  description: string;
  hiveCount: number;
  color: string;
  slug: InvestmentTier;
};

const TierCard: React.FC<TierProps> = ({
  title,
  description,
  hiveCount,
  color,
  slug,
}) => {
  const { setInvestmentTier, investmentTier, setCurrentStep } =
    useOnboardingStore();
  const isSelected = investmentTier === slug;

  const handleNext = (slug: InvestmentTier) => {
    setInvestmentTier(slug);
    setCurrentStep(1);
  };
  return (
    <div
      className={`rounded-lg p-4 flex flex-col items-start justify-between gap-5 pr-5 ${color} cursor-pointer transition-all duration-200 hover:scale-120 ${
        isSelected
          ? `ring-4 ring-opacity-90 ${getHighlightColor(slug)} scale-125`
          : ""
      }`}
      onClick={() => handleNext(slug)}
    >
      <div
        className={`w-full text-gray-800 rounded-xl py-2 px-3 mb-3 text-start text-sm whitespace-nowrap ${
          slug === "starter" ? "bg-gray-800 text-white" : "bg-white"
        }`}
      >
        {title}
      </div>
      <p
        className={`text-sm mb-2 text-start ${
          slug === "starter" ? "text-gray-800" : "text-white"
        }`}
      >
        {description}
      </p>
      <div
        className={`font-bold text-xl mt-2 ${
          slug === "starter" ? "text-gray-800" : "text-white"
        }`}
      >
        {hiveCount} Hives
      </div>
    </div>
  );
};

// Helper function to get the highlight color based on the tier
const getHighlightColor = (slug: InvestmentTier): string => {
  switch (slug) {
    case "starter":
      return "ring-orange-600 scale-";
    case "growth":
      return "ring-gray-300";
    case "enterprise":
      return "ring-yellow-500";
    case "legacy":
      return "ring-blue-300";
    default:
      return "ring-green-500";
  }
};

export default TierCard;
