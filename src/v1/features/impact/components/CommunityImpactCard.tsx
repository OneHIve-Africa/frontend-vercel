import { abso } from "@/assets";

type CommunityImpactCardProps = {
  incomeGHS: number;
  localJobs: number;
  hivesReady: number;
};

function formatCompact(value: number): string {
  // Use Intl to compact, then normalize units to lowercase (K->k, M->m, etc.)
  const nf = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return nf
    .format(value)
    .replace(/\s/g, "")
    .replace(/([KMBT])$/, (m) => m.toLowerCase());
}

const CommunityImpactCard = ({
  incomeGHS = 456,
  localJobs = 456,
  hivesReady = 456,
}: Partial<CommunityImpactCardProps>) => {
  return (
    <div
      className="bg-white rounded-lg p-6 bg-cover bg-no-repeat bg-center h-full"
      style={{ backgroundImage: `url(${abso})` }}
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-7 -mt-2">
        Community & Economic Impact
      </h2>

      <div className="flex flex-col md:flex-row md:items-stretch gap-5 md:gap-8 h-fit -mt-5">
        {/* Left: Income card - prominent bar */}
        <div className="flex-1 flex items-center">
          <div className="w-full rounded-md px-3 py-2 bg-[#6EE07E]/80 shadow-sm">
            <div className="grid grid-cols-5">
              <div className="col-span-5 text-base text-gray-900 font-light">
                Income Generated for Farmers
              </div>
              <div className="col-span-3"></div>
              <div className="col-span-2 text-base font-bold text-gray-900 text-right">
                {`GHS ${formatCompact(incomeGHS)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Two stacked bars */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="rounded-md px-4 py-2 bg-[#5E5E5E] text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-base font-light">Local Jobs Created</span>
              <span className="text-xl font-semibold">
                {formatCompact(localJobs)}
              </span>
            </div>
          </div>

          <div className="rounded-md px-4 py-2 bg-[#F4A261] text-gray-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-base font-light">
                Hives Ready for Harvest
              </span>
              <span className="text-xl font-semibold">
                {formatCompact(hivesReady)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityImpactCard;
