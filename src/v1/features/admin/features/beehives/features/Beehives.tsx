/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BeehivesApi, { HiveItem, HiveStatistics } from "@/v1/api/Beehives";
import { LoadingAnimation, PaginationTable } from "@/v1/components";
import { bee } from "@/assets";
import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { Eye, Edit } from "lucide-react";
import AssignHivesModal from "../components/AssignHivesModal";
import HiveDetailsModal from "../components/HiveDetailsModal";
import HiveEditModal from "../components/HiveEditModal";

interface CardItem {
  label: string;
  value: string | number;
  color: string;
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

const Beehives: React.FC = () => {
  const columnHelper = createColumnHelper<HiveItem>();
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [data, setData] = useState<HiveItem[]>([]);
  const [statistics, setStatistics] = useState<HiveStatistics | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHive, setSelectedHive] = useState<HiveItem | null>(null);

  // Dynamic card data based on real statistics
  const getCardData = (): CardItem[] => {
    if (!statistics) {
      return [
        {
          label: "Total Active Hives",
          value: "Loading...",
          color: "bg-oha_secondary",
        },
        {
          label: "Uncolonized Hives",
          value: "Loading...",
          color: "bg-oha_primary",
        },
        {
          label: "Hives Needing Maintenance",
          value: "Loading...",
          color: "bg-yellow-500",
        },
        {
          label: "Total Honey Produced",
          value: "Loading...",
          color: "bg-yellow-500",
        },
      ];
    }

    return [
      {
        label: "Total Active Hives",
        value: statistics.total_active_hives.toLocaleString(),
        color: "bg-oha_secondary",
      },
      {
        label: "Uncolonized Hives",
        value: statistics.uncolonized_hives.toLocaleString(),
        color: "bg-oha_primary",
      },
      {
        label: "Hives Needing Maintenance",
        value: statistics.hives_needing_maintenance.toLocaleString(),
        color: "bg-yellow-500",
      },
      {
        label: "Total Honey Produced",
        value: statistics.total_honey_produced.toLocaleString(),
        color: "bg-yellow-500",
      },
    ];
  };

  const columns = [
    columnHelper.accessor("hive_id", {
      cell: (info) => {
        const needsMaintenance = info.row.original.needs_maintenance;
        return (
          <div className="flex gap-3 items-center">
            <p className="text-darklink dark:text-bodytext text-sm font-medium">
              {info.getValue()}
            </p>
            {needsMaintenance && (
              <span
                className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs font-medium"
                title="Needs Maintenance"
              >
                ⚠️
              </span>
            )}
          </div>
        );
      },
      header: () => <span>Hive ID</span>,
    }),
    columnHelper.accessor("location", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue()}
        </p>
      ),
      header: () => <span>Location</span>,
    }),
    columnHelper.accessor("assigned_farmer_name", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() || (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </p>
      ),
      header: () => <span>Assigned Farmer</span>,
    }),
    columnHelper.accessor("hive_type", {
      cell: (info) => {
        const hiveType = info.getValue();
        const getHiveTypeDisplay = (type: string) => {
          switch (type) {
            case "ktbh":
              return "Kenya Top Bar";
            case "langstroth":
              return "Langstroth";
            case "saltpond":
              return "Saltpond";
            default:
              return type;
          }
        };

        return (
          <span className="text-darklink dark:text-bodytext text-sm capitalize">
            {getHiveTypeDisplay(hiveType)}
          </span>
        );
      },
      header: () => <span>Hive Type</span>,
    }),
    columnHelper.accessor("is_colonized", {
      cell: (info) => {
        const isColonized = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isColonized ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span
              className={`text-xs font-medium ${
                isColonized ? "text-green-700" : "text-red-700"
              }`}
            >
              {isColonized ? "Colonized" : "Uncolonized"}
            </span>
          </div>
        );
      },
      header: () => <span>Colonization</span>,
    }),
    columnHelper.accessor("honey_produced", {
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue()} L
        </p>
      ),
      header: () => <span>Honey Produced</span>,
    }),
    columnHelper.accessor("investment_id", {
      cell: (info) => {
        const investmentId = info.getValue();
        // const investmentAmount = info.row.original.investment_amount;
        return (
          <div className="text-darklink dark:text-bodytext text-sm">
            {investmentId ? (
              <div className="flex flex-col gap-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  Investment #{investmentId}
                </span>
                {/* {investmentAmount && (
                  <span className="text-xs text-gray-600">
                    GHS {parseFloat(investmentAmount).toLocaleString()}
                  </span>
                )} */}
              </div>
            ) : (
              <span className="text-gray-400 italic text-xs">
                No Investment
              </span>
            )}
          </div>
        );
      },
      header: () => <span>Investment</span>,
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        const getStatusStyle = (status: string) => {
          switch (status) {
            case "completed":
              return "bg-green-100 text-green-800 border-green-200";
            case "in_progress":
              return "bg-orange-100 text-orange-800 border-orange-200";
            case "inactive":
              return "bg-gray-100 text-gray-800 border-gray-200";
            default:
              return "bg-gray-100 text-gray-800 border-gray-200";
          }
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
              status
            )} capitalize`}
          >
            {status.replace("_", " ")}
          </span>
        );
      },
      header: () => <span>Status</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedHive(info.row.original);
              setIsDetailsModalOpen(true);
            }}
            className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-600 cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedHive(info.row.original);
              setIsEditModalOpen(true);
            }}
            className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600 cursor-pointer"
            title="Edit Hive"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const fetchHives = async () => {
    try {
      setIsLoading(true);
      const api = BeehivesApi.getInstance();
      const response = await api.getHives();

      if (response.data) {
        setData(response.data);
      } else {
        toast.error(response.message || "Failed to fetch hives");
        console.warn("Failed to fetch hives:", response.message);
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error("Failed to load hives. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setIsStatsLoading(true);
      const api = BeehivesApi.getInstance();
      const response = await api.getStatistics();

      if (response.data) {
        setStatistics(response.data);
      } else {
        console.warn("Failed to fetch statistics:", response.message);
        toast.error("Failed to load statistics");
      }
    } catch (error) {
      console.error("Statistics API error:", error);
      toast.error("Failed to load statistics");
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchHives();
    fetchStatistics();
  }, []);

  const cardData = getCardData();

  return (
    <div>
      {/* Statistics Cards */}
      <div className="bg-white overflow-hidden rounded-md my-6 p-6">
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
                className={`w-2 h-2 rounded-full ${color} ${
                  isStatsLoading ? "animate-pulse" : ""
                }`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
              <div>
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <motion.dd
                  className={`text-xl font-semibold text-gray-900 ${
                    isStatsLoading ? "animate-pulse" : ""
                  }`}
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
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center mb-4 gap-5">
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="bg-oha_primary hover:bg-oha_primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
        >
          Assign Hives
        </button>

        {/* <button
          onClick={() => {
            // TODO: Implement filter functionality
            toast.success("Filter feature coming soon!");
          }}
          className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Filter ▼
        </button> */}
      </div>

      {/* Hives Table */}
      <div className="w-full ">
        {isLoading ? (
          <div className="p-8">
            <LoadingAnimation />
          </div>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto">
            <PaginationTable
              TableData={data}
              columns={columns as any}
              title="Hives Management"
            />
          </div>
        ) : (
          <div className="mt-[4rem] items-center flex flex-col gap-8 h-[50dvh] justify-center capitalize">
            <img src={bee} alt="" className="h-[80px]" />
            <div className="text-center">
              <p className="text-gray-500 mb-2">No hives found...</p>
              <button
                onClick={fetchHives}
                className="text-oha_primary hover:text-oha_primary/80 text-sm underline cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Hives Modal */}
      <AssignHivesModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        hives={data}
        onAssignmentComplete={() => {
          fetchHives(); // Refresh hives data after assignment
          fetchStatistics(); // Refresh statistics
        }}
      />

      {/* Hive Details Modal */}
      <HiveDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedHive(null);
        }}
        hive={selectedHive}
        onEdit={(hive) => {
          setSelectedHive(hive);
          setIsDetailsModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      {/* Hive Edit Modal */}
      <HiveEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHive(null);
        }}
        hive={selectedHive}
        onSave={() => {
          fetchHives(); // Refresh hives data after edit
          fetchStatistics(); // Refresh statistics
        }}
      />
    </div>
  );
};

export default Beehives;
