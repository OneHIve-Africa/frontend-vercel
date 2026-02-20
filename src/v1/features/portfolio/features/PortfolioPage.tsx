import { useEffect, useState } from "react";
import useInvestmentStore from "../store/InvestmentStore";
import InvestmentCard from "../components/InvestmentCard";
import TableComponent from "../components/TableComponent";
import InvestorDashboardApi, { DashboardStats } from "@/v1/api/InvestorDashboardApi";

const PortfolioPage = () => {
  const { investments, isLoading, error, fetchInvestments } =
    useInvestmentStore();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments();
    
    // Fetch dashboard stats
    const loadDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const response = await InvestorDashboardApi.getInstance().getDashboardStats();
        if (response.data) {
          setDashboardStats(response.data);
        }
        setStatsError(null);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        setStatsError("Failed to load dashboard statistics");
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadDashboardStats();
  }, [fetchInvestments]);

  return (
    <div className="w-full h-full grid">
      <div className="max-w-full px-5">
        {/* Header */}
        <div className=" py-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Investment Portfolio
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            At a glance, view the key metrics of your investment in One Hive
            Africa:
          </p>
        </div>

        {(isLoading || statsLoading) && <p>Loading investments...</p>}
        {(error || statsError) && <p className="text-red-500">{error || statsError}</p>}
        {!isLoading && !error && !statsLoading && !statsError && (
          <>
            <section>
              <InvestmentCard 
                investments={investments}
                dashboardStats={dashboardStats}
              />
            </section>

            <section className="mt-20 my-10">
              <TableComponent investments={investments} />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
