import { useEffect, useMemo, useState } from "react";
import { abso, bee } from "@/assets";
import { LoadingAnimation } from "@/v1/components";
import { useNavigate } from "react-router-dom";
import useInvestmentStore from "../../portfolio/store/InvestmentStore";
import PayoutRequestModal from "@/v1/features/financial-performance/components/PayoutRequestModal";

const FinancialPerformancePage = () => {
  const navigate = useNavigate();
  const { investments, isLoading, fetchInvestments } = useInvestmentStore();
  const [payoutOpen, setPayoutOpen] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const performanceData = useMemo(() => {
    if (!investments || investments.length === 0) {
      return {
        projected_earnings: "N/A",
        earnings_this_period: "N/A",
        next_payout_date: "N/A",
      };
    }

    const projected_earnings = investments.reduce(
      (sum, inv) => sum + Number(inv.interest_to_be_earned),
      0
    );
    const earnings_this_period = investments.reduce(
      (sum, inv) => sum + Number(inv.interest_earned),
      0
    );

    const payoutDates = investments
      .map((inv) => new Date(inv.maturity_date))
      .filter((date) => !isNaN(date.getTime()));

    const next_payout_date = payoutDates.length
      ? new Date(
          Math.min.apply(
            null,
            payoutDates.map((date) => date.getTime())
          )
        ).toLocaleDateString("en-CA")
      : "N/A";

    return {
      projected_earnings: `GHS ${projected_earnings.toFixed(2)}`,
      earnings_this_period: `GHS ${earnings_this_period.toFixed(2)}`,
      next_payout_date,
    };
  }, [investments]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="p-8 min-h-screen">
      <header className="mb-10">
        <h1 className="text-xl font-bold text-gray-800">
          Financial Performance
        </h1>
        <p className="text-md font-light text-gray-500">
          Your Earnings at a Glance
        </p>
      </header>

      <div className="flex flex-wrap -mx-4">
        <div className="w-full lg:w-3/5 px-4">
          <div className="bg-white p-6 rounded-xl flex justify-around items-center mb-8">
            <div className="text-center">
              <h2 className="text-sm font-light text-gray-500 mb-2">
                Projected Earnings
              </h2>
              <p className="text-xl font-medium text-gray-800">
                {performanceData.projected_earnings}
              </p>
            </div>
            <div className="border-l border-gray-200 h-16"></div>
            <div className="text-center">
              <h2 className="text-sm font-light text-gray-500 mb-2">
                Earnings This Period
              </h2>
              <p className="text-xl font-medium text-gray-800">
                {performanceData.earnings_this_period}
              </p>
            </div>
            <div className="border-l border-gray-200 h-16"></div>
            <div className="text-center">
              <h2 className="text-sm font-light text-gray-500 mb-2">
                Next Payout Date
              </h2>
              <p className="text-xl font-medium text-gray-800">
                {performanceData.next_payout_date}
              </p>
            </div>
          </div>

          <button
            className="bg-oha_secondary text-white px-8 py-3 rounded-md font-semibold hover:bg-shadsd transition-colors text-sm cursor-pointer"
            onClick={() => setPayoutOpen(true)}
          >
            Request Payout
          </button>
        </div>

        {/* bee card */}
        <div className="w-full lg:w-2/5 px-4 mt-8 lg:mt-0">
          <div
            className="bg-oha_secondary rounded-lg px-8 pt-5 pb-8 w-full mx-auto text-white shadow-lg relative flex flex-col gap-5 bg-cover bg-no-repeat bg-center min-h-full "
            style={{
              backgroundImage: `url(${abso})`,
            }}
          >
            <h2 className="text-2xl font-bold whitespace-nowrap">
              Maximize Your Impact!
            </h2>

            <p className="text-sm font-light">
              Investing in more hives or reinvesting your earnings can increase
              both your profitability and positive impact.
            </p>

            <ul className="text-sm font-light">
              <li className="flex items-center gap-3">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="">Invest in More Hives</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="">Reinvest Your Earnings</span>
              </li>
            </ul>

            <button
              className="bg-white text-green-500 text-md font-medium py-2 px-3 rounded-md hover:bg-green-50 transition-colors w-32 cursor-pointer shadow"
              onClick={() => navigate("/new-investment")}
            >
              Invest
            </button>

            <div className="absolute right-3 bottom-5">
              <img src={bee} alt="bee image" className="w-24" />
            </div>
          </div>
        </div>
      </div>
      {/* Payout Modal */}
      <PayoutRequestModal
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        investments={investments}
      />
    </div>
  );
};

export default FinancialPerformancePage;
