import { Investment } from "@/v1/api/types";
import BeeInvestmentCard from "@/v1/components/common/BeeInvestmentCard";
import SubInvestmentCard from "./SubInvestmentCard";
import { dateUtils } from "@/v1/utils/dateutils";
import { DashboardStats } from "@/v1/api/InvestorDashboardApi";

interface InvestmentCardProps {
  investments: Investment[];
  dashboardStats: DashboardStats | null;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investments, dashboardStats }) => {
  // Use dashboard stats if available, otherwise calculate from investments
  const totalInvestments = dashboardStats 
    ? `GHS ${parseFloat(dashboardStats.total_invested).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `GHS ${investments.reduce((acc, inv) => acc + parseFloat(inv.amount), 0).toFixed(2)}`;

  const expectedReturns = dashboardStats
    ? `GHS ${parseFloat(dashboardStats.expected_returns).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `GHS ${investments.reduce((acc, inv) => acc + parseFloat(inv.interest_to_be_earned), 0).toFixed(2)}`;

  const nextPayoutDate = dashboardStats?.next_payout_date
    ? dateUtils.formatDate(dashboardStats.next_payout_date)
    : investments.length
      ? (() => {
          const nextMaturity = investments.reduce((earliest, current) => {
            const earliestDate = new Date(earliest.maturity_date);
            const currentDate = new Date(current.maturity_date);
            return currentDate < earliestDate ? current : earliest;
          }).maturity_date;
          return dateUtils.formatDate(nextMaturity);
        })()
      : "N/A";

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Left Side: SubInvestment Cards */}
      <div className="lg:w-4/6 flex-3 flex flex-col gap-10">
        <SubInvestmentCard
          totalInvestments={totalInvestments}
          expectedReturns={expectedReturns}
          maturityDate={nextPayoutDate}
        />
      </div>

      {/* Right Side: Bee Investment Card */}
      <div className="lg:w-2/6 flex-2">
        <BeeInvestmentCard />
      </div>
    </div>
  );
};

export default InvestmentCard;

