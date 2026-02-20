import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FinanceLineChart from "../components/FinanceLineChart";
import FinanceBarChart from "../components/FinanceBarChart";
import FinanceKPICards from "../components/FinanceKPICards";
import FinanceComparisonChart from "../components/FinanceComparisonChart";
import FinancialApi, { FinancialOverview } from "@/v1/api/Financial";
import { LoadingAnimation } from "@/v1/components";
import InvestorPayoutTable from "../components/InvestorPayoutTable";
import FarmerPayouts from "../components/FarmerPayouts";

interface CardItem {
  id: number;
  label: string;
  value: string | number;
  color: string;
}

interface TabItem {
  name: string;
  id: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
    },
  }),
};

const Finance: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<number>(0);
  const [data, setData] = useState<FinancialOverview | null>(null);
  const [cardData, setCardData] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabData: TabItem[] = [
    { name: "Earnings Overview", id: 0 },
    { name: "Farmer Payouts", id: 1 },
    { name: "Investor Payouts", id: 2 },
  ];

  const setUp = async () => {
    try {
      setIsLoading(true);
      const api = FinancialApi.getInstance();
      const response = await api.getFinancialDashboard();

      if (response.data) {
        setData(response.data);

        const newCardData: CardItem[] = [
          {
            id: 1,
            label: "Total Revenue",
            value: response.data.total_revenue,
            color: "bg-oha_secondary",
          },
          {
            id: 2,
            label: "Investor Contributions",
            value: response.data.investor_contributions,
            color: "bg-oha_primary",
          },
          {
            id: 3,
            label: "Farmer Payouts",
            value: response.data.farmer_payouts,
            color: "bg-yellow-500",
          },
          {
            id: 4,
            label: "Pending Payouts",
            value: response.data.pending_payout_requests,
            color: "bg-red-500",
          },
        ];
        setCardData(newCardData);
      } else {
        console.warn(
          "Failed to fetch financial data:",
          response?.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setUp();
  }, []);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <>
          {/* Card Summary Section */}
          <motion.div
            className="bg-white overflow-hidden rounded-md p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cardData.map(({ label, value, color }, i) => (
                <motion.div
                  key={label}
                  className="flex space-x-4"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeInUp}
                >
                  <motion.span
                    className={`w-2 h-2 rounded-full ${color}`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {label}
                    </dt>
                    <motion.dd
                      className="text-xl font-semibold text-gray-900"
                      custom={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 + 0.2, duration: 0.5 }}
                    >
                      {value}
                    </motion.dd>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* New Advanced Metrics KPI Cards */}
          {data && (
            <motion.div
              className="bg-white overflow-hidden rounded-md p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FinanceKPICards
                data={{
                  net_profit: data.net_profit,
                  profit_margin: data.profit_margin,
                  active_investment_value: data.active_investment_value,
                  investment_growth_rate: data.investment_growth_rate,
                }}
              />
            </motion.div>
          )}

          {/* Tabs Section */}
          <motion.div
            className="w-full bg-white rounded-[10px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Tab Menu */}
            <div className="flex">
              {tabData.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  className={`cursor-pointer px-8 py-6 transition-all duration-300 ${
                    activeMenu === item.id
                      ? "border-b-2 border-oha_primary text-oha_primary font-semibold"
                      : "text-gray-600"
                  }`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  {item.name}
                </motion.div>
              ))}
            </div>

            {/* Tab Content */}
            <div className="border-t-[0.2px] border-[rgba(0,0,0,0.07)] p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMenu}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeMenu == 0 &&
                    (data ? (
                      <div className="space-y-6 pt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend</h4>
                            <FinanceLineChart data={data} />
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Payouts</h4>
                            <FinanceComparisonChart data={data} />
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4">Investment Distribution</h4>
                          <FinanceBarChart data={data} />
                        </div>
                      </div>
                    ) : (
                      <LoadingAnimation />
                    ))}
                  {activeMenu == 1 && (
                    <>
                      <FarmerPayouts />
                    </>
                  )}
                  {activeMenu == 2 && (
                    <>
                      <InvestorPayoutTable />
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Finance;
