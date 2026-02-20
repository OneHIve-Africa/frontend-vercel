import { bee } from "@/assets";
import FinancialApi, { FarmerPayout } from "@/v1/api/Financial";
import { LoadingAnimation, PaginationTable } from "@/v1/components";
import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const FarmerPayouts = () => {
  const columnHelper = createColumnHelper<FarmerPayout>();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FarmerPayout[]>([]);

  const columns = [
    columnHelper.accessor("farmer_name", {
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue()}
          </p>
        </div>
      ),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor("hives_managed", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue()}
        </p>
      ),
      header: () => <span>Hives</span>,
    }),
    columnHelper.accessor("honey_produced", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue()}
        </p>
      ),
      header: () => <span>Honey Produced</span>,
    }),
    columnHelper.accessor("earnings", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm font-medium">
          GHS {info.getValue()}
        </p>
      ),
      header: () => <span>Earnings</span>,
    }),
    columnHelper.accessor("payout_status", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm flex items-center gap-2 capitalize">
          <div className={`relative w-[7px] h-[7px] flex justify-center items-center`}>
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
    columnHelper.accessor("date", {
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue()}
          </p>
        ),
        header: () => <span>Date</span>,
      }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (info) => {
        const row = info.row.original;
        const status = row.payout_status.toLowerCase();
        
        return (
          <div className="flex justify-end gap-2">
            {status === 'pending' && (
              <button
                onClick={() => handleApprove(row)}
                className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 transition"
              >
                Approve
              </button>
            )}
            {status === 'approved' && (
              <button
                onClick={() => handlePay(row)}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition"
              >
                Pay
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  const handleApprove = async (row: FarmerPayout) => {
    if (!confirm(`Approve payout of GHS ${row.earnings} for ${row.farmer_name}?`)) return;
    setIsLoading(true);
    try {
        await FinancialApi.getInstance().approveFarmerPayout(row.id);
        setUp(); // Refresh
    } catch (e) {
        console.error(e);
        alert("Failed to approve");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePay = async (row: FarmerPayout) => {
    const ref = prompt("Enter Transaction Reference:");
    if (!ref) return;
    
    setIsLoading(true);
    try {
        await FinancialApi.getInstance().processFarmerPayment(row.id, ref);
        setUp(); // Refresh
    } catch (e) {
        console.error(e);
        alert("Failed to process payment");
    } finally {
        setIsLoading(false);
    }
  };

  const setUp = async () => {
    try {
      setIsLoading(true);
      const api = FinancialApi.getInstance();
      const response = await api.getFarmerPayouts();

      if (response.data) {
        setData(response.data);
      } else {
        console.warn("Failed to fetch farmer profile:", response.message);
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
          title="Farmer Payouts"
        />
      ) : (
        <div className="mt-[4rem] items-center flex flex-col gap-8 h-[50dvh] justify-center capitalize">
          <img src={bee} alt="" className="h-[80px]" />
          No farmer payouts yet...
        </div>
      )}
    </div>
  );
};

export default FarmerPayouts;
