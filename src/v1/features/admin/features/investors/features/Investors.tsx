/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { manWithApples } from "@/assets";
import Modal from "@/components/Modal";
import AddInvestor from "../components/AddInvestor";
import InvestorDetailsModal from "../components/InvestorDetailsModal";
import InvestorsApi, { InvestorDetails, InvestmentDetails } from "@/v1/api/InvestorsApi";
import { LoadingAnimation, PaginationTable } from "@/v1/components";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";

const Investors: React.FC = () => {
  const [isAddModal, setIsAddModal] = useState(false);
  const [data, setData] = useState<InvestorDetails[]>([]);
  const [investments, setInvestments] = useState<InvestmentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const columnHelper = createColumnHelper<InvestorDetails>();

  // Helper function to get investment data for an investor
  const getInvestorInvestmentData = (investorId: number) => {
    const investorInvestments = investments.filter(inv => inv.user_profile === investorId);
    
    if (investorInvestments.length === 0) {
      return { 
        lastInvestmentDate: null, 
        nextPayoutDate: null,
        averageROI: null,
        investmentStatus: 'No investments'
      };
    }

    // Get most recent investment date
    const lastInvestment = investorInvestments.reduce((latest, current) => 
      new Date(current.investment_date) > new Date(latest.investment_date) ? current : latest
    );

    // Get earliest maturity date (next payout)
    const nextPayout = investorInvestments
      .filter(inv => inv.investment_status === 'active')
      .reduce((earliest, current) => 
        new Date(current.maturity_date) < new Date(earliest.maturity_date) ? current : earliest
      );

    // Calculate average ROI
    const totalROI = investorInvestments.reduce((sum, inv) => sum + inv.roi, 0);
    const averageROI = totalROI / investorInvestments.length;

    // Determine overall investment status
    const activeInvestments = investorInvestments.filter(inv => inv.investment_status === 'active');
    const completedInvestments = investorInvestments.filter(inv => inv.investment_status === 'completed');
    
    let investmentStatus = 'inactive';
    if (activeInvestments.length > 0) {
      investmentStatus = 'active';
    } else if (completedInvestments.length > 0 && activeInvestments.length === 0) {
      investmentStatus = 'completed';
    }

    return {
      lastInvestmentDate: lastInvestment.investment_date,
      nextPayoutDate: nextPayout ? nextPayout.maturity_date : null,
      averageROI: averageROI,
      investmentStatus: investmentStatus
    };
  };

  const columns = [
    columnHelper.display({
      id: "investor_name",
      cell: (info) => (
        <div className="flex gap-3 items-center">
          <div>
            <p className="text-darklink dark:text-bodytext text-sm font-medium">
              {info.row.original.first_name} {info.row.original.last_name}
            </p>
            <p className="text-gray-500 text-xs">
              {info.row.original.user_email}
            </p>
          </div>
        </div>
      ),
      header: () => <span>Investor Name</span>,
    }),
    columnHelper.accessor("total_investment", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm font-medium">
          GHS {info.getValue()?.toLocaleString() || "0"}
        </p>
      ),
      header: () => <span>Total Investment</span>,
    }),
    columnHelper.accessor("total_hives", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() || 0} hives
        </p>
      ),
      header: () => <span>Total Hives</span>,
    }),
    columnHelper.display({
      id: "roi",
      cell: (info) => {
        const { averageROI } = getInvestorInvestmentData(info.row.original.id);
        return (
          <p className="text-darklink dark:text-bodytext text-sm font-medium">
            {averageROI ? `${averageROI.toFixed(1)}%` : "N/A"}
          </p>
        );
      },
      header: () => <span>Avg ROI</span>,
    }),
    columnHelper.display({
      id: "investment_status",
      cell: (info) => {
        const { investmentStatus } = getInvestorInvestmentData(info.row.original.id);
        
        const getStatusStyle = (status: string) => {
          switch (status) {
            case "active":
              return "bg-green-100 text-green-800 border-green-200";
            case "completed":
              return "bg-blue-100 text-blue-800 border-blue-200";
            case "inactive":
              return "bg-gray-100 text-gray-800 border-gray-200";
            default:
              return "bg-yellow-100 text-yellow-800 border-yellow-200";
          }
        };

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(investmentStatus)} capitalize`}>
            {investmentStatus}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),
    columnHelper.display({
      id: "last_investment",
      cell: (info) => {
        const { lastInvestmentDate } = getInvestorInvestmentData(info.row.original.id);
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {lastInvestmentDate 
              ? new Date(lastInvestmentDate).toLocaleDateString()
              : "No investments"
            }
          </p>
        );
      },
      header: () => <span>Last Investment</span>,
    }),
    columnHelper.display({
      id: "next_payout",
      cell: (info) => {
        const { nextPayoutDate } = getInvestorInvestmentData(info.row.original.id);
        return (
          <p className="text-darklink dark:text-bodytext text-sm">
            {nextPayoutDate 
              ? new Date(nextPayoutDate).toLocaleDateString()
              : "N/A"
            }
          </p>
        );
      },
      header: () => <span>Next Payout</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInvestor(info.row.original);
              setIsDetailsModalOpen(true);
            }}
            className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-600 cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const fetchInvestors = async () => {
    try {
      setIsLoading(true);
      const api = InvestorsApi.getInstance();
      
      // Fetch both investors and investments data
      const [investorsResponse, investmentsResponse] = await Promise.all([
        api.getInvestors(),
        api.getInvestments()
      ]);

      if (investorsResponse.data) {
        setData(investorsResponse.data);
      } else {
        toast.error(investorsResponse.message || "Failed to fetch investors");
        console.warn("Failed to fetch investors:", investorsResponse.message);
      }

      if (investmentsResponse.data) {
        setInvestments(investmentsResponse.data);
      } else {
        console.warn("Failed to fetch investments:", investmentsResponse.message);
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pt-4 w-full">
      <div className="w-full">
        {isLoading ? (
          <LoadingAnimation />
        ) : data.length > 0 ? (
          <PaginationTable
            title={"Investors"}
            TableData={data}
            columns={columns as any}
          />
        ) : (
          <div className="mt-16 items-center flex flex-col">
            <img
              src={manWithApples}
              alt="No Investors"
              className="object-contain h-[290px] mb-6"
            />
            <p className="text-gray-700 text-lg font-medium mb-4">
              No investors available now
            </p>
          </div>
        )}
      </div>

      <Modal
        popupModal={isAddModal}
        setPopupModal={setIsAddModal}
        outClickCancel
      >
        <AddInvestor 
          onSuccess={() => {
            setIsAddModal(false);
            fetchInvestors();
          }}
        />
      </Modal>

      {/* Investor Details Modal */}
      <InvestorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedInvestor(null);
        }}
        investor={selectedInvestor}
        investments={investments}
      />
    </div>
  );
};

export default Investors;
