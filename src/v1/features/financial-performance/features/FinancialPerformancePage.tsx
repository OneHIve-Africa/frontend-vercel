import { useEffect, useMemo, useState } from "react";
import { abso, bee } from "@/assets";
import { LoadingAnimation } from "@/v1/components";
import { useNavigate } from "react-router-dom";
import useInvestmentStore from "../../portfolio/store/InvestmentStore";
import PayoutRequestModal from "@/v1/features/financial-performance/components/PayoutRequestModal";
import { HiveRoiCalculator } from "../../portfolio/components/HiveRoiCalculator";
import { 
  Calendar, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

const HARVEST_CALENDAR = [
  {
    season: "Minor Honey Flow & Payout",
    months: "May – July",
    activity: "Brood expansion & first extraction",
    payoutWindow: "July 15 – July 31",
    status: "Upcoming Cycle",
  },
  {
    season: "Major Nectar Flow & Peak Harvest",
    months: "November – January",
    activity: "Peak floral bloom (Shea, Acacia), full extraction",
    payoutWindow: "January 15 – January 31",
    status: "Primary Harvest",
  },
];

const FinancialPerformancePage = () => {
  const navigate = useNavigate();
  const { investments, isLoading, fetchInvestments } = useInvestmentStore();
  const [payoutOpen, setPayoutOpen] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const hasInvestments = investments && investments.length > 0;

  const performanceData = useMemo(() => {
    if (!hasInvestments) {
      return {
        totalInvested: 0,
        projectedEarningsNum: 0,
        projected_earnings: "GHS 0.00",
        earningsThisPeriodNum: 0,
        earnings_this_period: "GHS 0.00",
        next_payout_date: "Scheduled upon hive setup",
      };
    }

    const totalInvested = investments.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    );

    const projectedEarningsNum = investments.reduce(
      (sum, inv) => sum + Number(inv.interest_to_be_earned),
      0
    );
    const earningsThisPeriodNum = investments.reduce(
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
      : "Pending Allocation";

    return {
      totalInvested,
      projectedEarningsNum,
      projected_earnings: `GHS ${projectedEarningsNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      earningsThisPeriodNum,
      earnings_this_period: `GHS ${earningsThisPeriodNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      next_payout_date,
    };
  }, [investments, hasInvestments]);

  // Projected projection data for chart
  const projectionChartData = useMemo(() => {
    const base = hasInvestments ? performanceData.totalInvested : 5000;
    const estRate = 0.22; // 22% annual
    return [
      { name: "Month 1", capital: base, earnings: 0 },
      { name: "Month 3", capital: base, earnings: Math.round(base * 0.05) },
      { name: "Month 6 (Harvest 1)", capital: base, earnings: Math.round((base * estRate) / 2) },
      { name: "Month 9", capital: base, earnings: Math.round(base * (estRate * 0.75)) },
      { name: "Month 12 (Harvest 2)", capital: base, earnings: Math.round(base * estRate) },
    ];
  }, [hasInvestments, performanceData.totalInvested]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200/80 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Financial Performance & Payouts
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasInvestments
              ? "Track your dividend disbursements, projected returns, and harvest distributions."
              : "Explore honey harvest cycles, model earnings, and schedule your bi-annual returns."}
          </p>
        </div>

        {hasInvestments && (
          <button
            type="button"
            className="bg-oha_secondary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-shadsd transition shadow-sm text-xs sm:text-sm cursor-pointer"
            onClick={() => setPayoutOpen(true)}
          >
            Request Payout
          </button>
        )}
      </header>

      {/* 1. Key Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Projected Earnings</span>
            <TrendingUp className="w-4 h-4 text-oha_secondary" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {hasInvestments ? performanceData.projected_earnings : "Est. 20% – 25% APR"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {hasInvestments ? "Contracted honey off-take yield" : "Based on selected hive tier"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Earnings This Period</span>
            <Wallet className="w-4 h-4 text-oha_primary" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {performanceData.earnings_this_period}
          </p>
          <p className="text-xs text-gray-500 mt-1">Available for withdrawal or reinvestment</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Next Payout Window</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {performanceData.next_payout_date}
          </p>
          <p className="text-xs text-gray-500 mt-1">Aligned with bi-annual harvest windows</p>
        </div>
      </div>

      {/* 2. Zero-Investment Experience: Embed ROI Simulator & Payout Guide */}
      {!hasInvestments && (
        <div className="space-y-8">
          {/* Interactive Calculator */}
          <HiveRoiCalculator />

          {/* Harvest & Distribution Calendar */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-oha_primary" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Ghana Honey Harvest & Payout Calendar
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Our honey harvest cycles correspond directly with ecological nectar flows in the Volta, Eastern, and Ashanti regions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HARVEST_CALENDAR.map((cal) => (
                <div 
                  key={cal.season}
                  className="bg-gray-50/80 p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-oha_secondary font-mono">
                        {cal.months}
                      </span>
                      <span className="text-xs font-bold text-gray-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                        {cal.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mt-1">{cal.season}</h3>
                    <p className="text-xs text-gray-600 mt-1">{cal.activity}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Distribution Window:</span>
                    <span className="font-semibold text-gray-900">{cal.payoutWindow}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Payout Security Note */}
            <div className="mt-6 p-4 rounded-xl bg-green-50/70 border border-green-200/70 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-oha_secondary flex-shrink-0" />
              <p className="text-xs text-green-900">
                <strong>Direct Mobile Money & Bank Payouts:</strong> Disbursements are sent directly to your verified Ghana Mobile Money wallet or commercial bank account without hidden withdrawal fees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Active-Investment Experience: Charts & Reinvestment Spotlight */}
      {hasInvestments && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Projection Area Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Earnings & Harvest Trajectory</h3>
                <p className="text-xs text-gray-500">Cumulative estimated honey returns over a 12-month horizon</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-green-50 text-oha_secondary text-xs font-semibold border border-green-200">
                Target ~22% APR
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionChartData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f09443" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f09443" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(val: any) => [`GHS ${Number(val).toLocaleString()}`, "Yield Return"]}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#f09443" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reinvestment / Maximize Impact Card */}
          <div 
            className="bg-oha_secondary rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between relative overflow-hidden bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: `url(${abso})` }}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compound Growth</span>
              </div>
              <h3 className="text-xl font-bold leading-tight">Reinvest Your Honey Yield</h3>
              <p className="text-xs text-white/90 mt-2 leading-relaxed">
                Compound your returns by rolling bi-annual distributions into new hives. Each reinvestment plants another tree and empowers another family.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Zero rollover management fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Priority access to newly sited apiaries</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate("/new-investment")}
                className="px-5 py-2.5 rounded-xl bg-white text-oha_secondary font-bold text-xs hover:bg-green-50 transition shadow-sm cursor-pointer"
              >
                Add More Hives
              </button>
              <img src={bee} alt="Bee" className="w-16 h-16 object-contain opacity-90" />
            </div>
          </div>
        </div>
      )}

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
