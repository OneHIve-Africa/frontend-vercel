import {
  HiveTypeSlug,
  useNewInvestmentStore,
} from "../../../store/NewInvestmentStore";
import { HiveType } from "../../../types/hive";

interface HiveCardProps {
  hive: HiveType;
}

const HiveCard: React.FC<HiveCardProps> = ({ hive }) => {
  const { setHiveType, hiveType, setCurrentStep } = useNewInvestmentStore();
  const isSelected = hiveType === hive.slug;

  const handleNext = (slug: HiveTypeSlug) => {
    setHiveType(slug);
    setCurrentStep(2);
  };

  return (
    <div
      className={`${
        hive.slug === "langstroth"
          ? "bg-oha_secondary "
          : "bg-white text-oha_secondary!"
      } text-white rounded-lg p-6 w-full shadow-md flex flex-col gap-10 hover:scale-105 ${
        isSelected
          ? `ring-4 ring-opacity-90 ${getHighlightColor(hive.slug)} scale-105`
          : ""
      }`}
    >
      <div>
        <h2 className="text-xl font-bold mb-2">{hive.name}</h2>
        <p className="text-sm mb-4">{hive.description}</p>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm">
          Investments: GHc {hive.investment.toLocaleString()}
        </p>
        <p className="text-sm">Yield: {hive.yieldPerHarvest}</p>
        <p className="text-sm">Harvests per Year: {hive.harvestsPerYear}</p>
        <p className="text-sm">Total Annual Yield: {hive.totalAnnualYield}</p>
      </div>

      <div className="mb-3">
        <h3 className="font-semibold mb-2 text-sm">Benefits Include</h3>
        <div className="space-y-3">
          {hive.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start">
              <div
                className={`${
                  hive.slug === "langstroth" ? "bg-white " : "bg-oha_secondary"
                } rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-1 flex-shrink-0`}
              >
                <svg
                  className={`w-3 h-3 ${
                    hive.slug === "langstroth"
                      ? "text-oha_secondary "
                      : "text-white"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => handleNext(hive.slug)}
        className={`w-full ${
          hive.slug === "langstroth"
            ? "bg-white text-oha_secondary!"
            : "bg-oha_secondary! text-white!"
        } text-green-500 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer`}
      >
        Invest
      </button>
    </div>
  );
};

const getHighlightColor = (slug: HiveTypeSlug): string => {
  switch (slug) {
    case "ktbh":
      return "ring-orange-600 scale-";
    case "langstroth":
      return "ring-gray-300";
    case "saltpond":
      return "ring-yellow-500";
    case "legacy":
      return "ring-blue-300";
    default:
      return "ring-green-500";
  }
};

export default HiveCard;
