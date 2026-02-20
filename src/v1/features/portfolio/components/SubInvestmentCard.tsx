import React from "react";

interface SubInvestmentCardProps {
  totalInvestments: string;
  expectedReturns: string;
  maturityDate: string;
}

const SubInvestmentCard: React.FC<SubInvestmentCardProps> = ({
  totalInvestments,
  expectedReturns,
  maturityDate,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between md:space-x-6 w-full h-full">
      <div className="text-center">
        <p className="text-gray-500 text-sm">Total Investments</p>
        <p className="text-lg font-semibold">{totalInvestments}</p>
      </div>

      {/* Divider: horizontal on mobile, vertical on md+ */}
      <div className="my-4 h-px w-full bg-gray-300 md:hidden"></div>
      <div className="hidden md:block h-10 w-px bg-gray-300"></div>

      <div className="text-center">
        <p className="text-gray-500 text-sm">Expected Returns</p>
        <p className="text-lg font-semibold">{expectedReturns}</p>
      </div>

      {/* Divider: horizontal on mobile, vertical on md+ */}
      <div className="my-4 h-px w-full bg-gray-300 md:hidden"></div>
      <div className="hidden md:block h-10 w-px bg-gray-300"></div>

      <div className="text-center">
        <p className="text-gray-500 text-sm">Maturity Date</p>
        <p className="text-lg font-semibold">{maturityDate}</p>
      </div>
    </div>
  );
};

export default SubInvestmentCard;
