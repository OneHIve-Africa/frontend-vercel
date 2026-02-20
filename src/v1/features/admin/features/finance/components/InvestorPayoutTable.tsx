import { bee } from "@/assets";
import FinancialApi, { InvestorPayout } from "@/v1/api/Financial";
import { LoadingAnimation, PaginationTable } from "@/v1/components";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const InvestorPayoutTable = () => {
  const columnHelper = createColumnHelper<InvestorPayout>();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<InvestorPayout[]>([]);

  const columns = [
    columnHelper.accessor("investor_name", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue()}
          </p>
        </div>
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("amount_invested", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          GHS {info.getValue()}
        </p>
      ),
      header: () => <span>Invested</span>,
    }),
    columnHelper.accessor("earnings_to_date", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
           GHS {info.getValue()}
        </p>
      ),
      header: () => <span>Earnings</span>,
    }),
    columnHelper.accessor("roi_percentage", {
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm text-green-600">
             {info.getValue()}
          </p>
        ),
        header: () => <span>ROI</span>,
      }),
    columnHelper.accessor("payout_status", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm flex items-center gap-2 capitalize">
          <div className="relative w-[7px] h-[7px] flex justify-center items-center">
             {info.getValue().toLowerCase() === 'paid' ? (
                <span className="relative inline-flex rounded-full h-full w-full bg-green-600"></span>
            ) : (
                <span className="relative inline-flex rounded-full h-full w-full bg-yellow-500"></span>
            )}
          </div>
          {info.getValue()}
        </p>
      ),
      header: () => <span>Status</span>,
    }),
    columnHelper.accessor("payout_option", {
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm capitalize">
            {info.getValue()}
          </p>
        ),
        header: () => <span>Type</span>,
      }),
    columnHelper.accessor("next_payout", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue()}
        </p>
      ),
      header: () => <span>Next Payout</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (info) => {
        const row = info.row.original;
        const status = row.payout_status.toLowerCase();
        
        return (
          <div className="flex justify-end gap-2 text-right">
             {status === 'pending' && (
              <button
                onClick={() => handleApprove(row)}
                className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 transition"
              >
                Approve
              </button>
            )}
            {status === 'approved' && (
                <>
                 <button
                    onClick={() => handleProcess(row, 'withdraw')}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                  >
                    Withdraw
                  </button>
                   <button
                    onClick={() => handleProcess(row, 'reinvest')}
                    className="px-3 py-1 text-xs font-medium text-white bg-purple-500 rounded hover:bg-purple-600 transition"
                  >
                    Reinvest
                  </button>
                </>
            )}
          </div>
        );
      },
    }),
  ];

  const handleApprove = async (row: InvestorPayout) => {
    if (!confirm(`Approve payout for ${row.investor_name}?`)) return;
    try {
        await FinancialApi.getInstance().approveInvestorPayout(row.id);
        setUp();
    } catch (e) {
        alert("Failed to approve");
    }
  };

  const handleProcess = async (row: InvestorPayout, type: 'withdraw' | 'reinvest') => {
      try {
        if (type === 'withdraw') {
             const ref = prompt("Enter Transaction Reference:");
             if (!ref) return;
             await FinancialApi.getInstance().processInvestorWithdrawal(row.id, ref);
        } else {
             if (!confirm("Confirm reinvestment?")) return;
             await FinancialApi.getInstance().processInvestorReinvestment(row.id);
        }
        setUp();
      } catch (e) {
          alert("Failed to process transaction");
      }
  };

  const setUp = async () => {
    try {
      setIsLoading(true);
      const api = FinancialApi.getInstance();
      const response = await api.getInvestorPayouts();

      if (response.data) {
        setData(response.data);
      } else {
        console.warn("Failed to fetch investor payouts:", response.message);
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
    <div className="w-full">
      {isLoading ? (
        <LoadingAnimation />
      ) : data.length > 0 ? (
        <PaginationTable
          TableData={data}
          columns={columns}
          title="Investor Payouts"
        />
      ) : (
        <div className="mt-[4rem] items-center flex flex-col gap-8 h-[50dvh] justify-center capitalize">
          <img src={bee} alt="" className="h-[80px]" />
          No investor payouts yet...
        </div>
      )}
    </div>
  );
};

export default InvestorPayoutTable;
