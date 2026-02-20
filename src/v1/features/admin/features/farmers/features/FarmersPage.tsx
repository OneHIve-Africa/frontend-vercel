import { useEffect, useState } from "react";
import { manWithApples } from "@/assets";
import Modal from "@/components/Modal";
import AddFarmer from "../components/AddFarmer";
import BulkUploadModal from "../components/BulkUploadModal";
import FarmersApi, { FarmerDetails } from "@/v1/api/FarmerApi";
import { LoadingAnimation, PaginationTable } from "@/v1/components";
import { createColumnHelper } from "@tanstack/react-table";

const FarmersPage: React.FC = () => {
  const [isAddModal, setIsAddModal] = useState(false);
  const [isBulkModal, setIsBulkModal] = useState(false);
  const [data, setData] = useState<FarmerDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const columnHelper = createColumnHelper<FarmerDetails>();

  const formatNumber = (n?: number | string) => {
    if (n === undefined || n === null) return "-";
    const num = Number(n);
    return isNaN(num) ? "-" : num.toLocaleString();
  };

  const handleDelete = async (row: FarmerDetails) => {
    if (!row.id) return;
    const ok = window.confirm(
      "Remove this farmer? This action cannot be undone."
    );
    if (!ok) return;
    const api = FarmersApi.getInstance();
    const res = await api.deleteFarmer(row.id);
    if ((res as any).error) {
      console.error("Failed to delete farmer:", (res as any).message);
      return;
    }
    fetchFarmers();
  };

  const columns = [
    columnHelper.accessor(
      (row: FarmerDetails) =>
        `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() ||
        row.user_email ||
        row.profile_email ||
        "-",
      {
        id: "name",
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {info.getValue() as string}
          </p>
        ),
        header: () => <span>Name</span>,
      }
    ),
    columnHelper.accessor((row: FarmerDetails) => {
      const loc = (row.location || "").trim();
      if (loc) return loc;
      const fallback = [row.region, row.district, row.town]
        .filter((v) => !!v && String(v).trim().length > 0)
        .join(", ");
      return fallback || "-";
    }, {
      id: "location",
      cell: (info) => (
        <p className="text-darklink dark:text-bodytext text-sm">
          {info.getValue() as string}
        </p>
      ),
      header: () => <span>Location</span>,
    }),
    columnHelper.accessor(
      (row: FarmerDetails) => row.hives_assigned ?? row.total_hives ?? 0,
      {
        id: "hives_assigned",
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">
            {formatNumber(info.getValue() as number)}
          </p>
        ),
        header: () => <span>Hives Assigned</span>,
      }
    ),
    columnHelper.accessor(
      (row: FarmerDetails) => row.honey_production ?? row.honey_produced ?? 0,
      {
        id: "honey_production",
        cell: (info) => (
          <p className="text-darklink dark:text-bodytext text-sm">{`${formatNumber(
            info.getValue() as number
          )} L`}</p>
        ),
        header: () => <span>Honey Production</span>,
      }
    ),
    columnHelper.display({
      id: "actions",
      header: () => <span></span>,
      cell: (info) => {
        const row = info.row.original as FarmerDetails;
        return (
          <div className="flex items-center gap-3 justify-end">
            <button
              title="More"
              className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300"
              onClick={() => {}}
            >
              <span className="text-lg leading-none">+</span>
            </button>
            <button
              className="px-3 py-1 rounded-md bg-green-200 text-green-900 text-sm"
              onClick={() => {
                /* open edit modal in future */
              }}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 rounded-md bg-orange-200 text-orange-900 text-sm"
              onClick={() => handleDelete(row)}
            >
              Remove
            </button>
          </div>
        );
      },
    }),
  ];

  const fetchFarmers = async () => {
    try {
      setIsLoading(true);
      const api = FarmersApi.getInstance();
      const response = await api.listFarmers();

      if (response.data) {
        setData(response.data as FarmerDetails[]);
      } else {
        console.warn("Failed to fetch farmer profile:", response.message);
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // console.log(data)

  useEffect(() => {
    fetchFarmers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pt-4 w-full">
      {/* Top toolbar removed; using table's built-in search and actions */}

      <div className="w-full">
        {isLoading ? (
          <LoadingAnimation />
        ) : data.length > 0 ? (
          <PaginationTable
            TableData={data}
            columns={columns as any}
            title="Farmers"
            rightActions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkModal(true)}
                  className="bg-gray-200 text-gray-800 text-sm font-medium rounded-full px-5 py-2 transition cursor-pointer"
                >
                  Bulk upload
                </button>
                <button
                  onClick={() => setIsAddModal(true)}
                  className="bg-oha_primary text-white text-sm font-medium rounded-full px-5 py-2 transition cursor-pointer"
                >
                  Add farmer
                </button>
              </div>
            }
          />
        ) : (
          <div className="mt-[4rem] items-center flex flex-col">
            <img
              src={manWithApples}
              alt="No farmers"
              className="object-contain h-[290px] mb-6"
            />
            <p className="text-gray-700 text-lg font-medium mb-4">
              No farmers available now
            </p>
            <button
              onClick={() => setIsAddModal(true)}
              className="bg-oha_primary text-white px-6 py-2 rounded-[6px] cursor-pointer transition"
            >
              Add farmer
            </button>
          </div>
        )}
      </div>

      <Modal
        popupModal={isAddModal}
        setPopupModal={setIsAddModal}
        outClickCancel
      >
        <AddFarmer setIsAddModal={setIsAddModal} setUp={fetchFarmers} />
      </Modal>

      <Modal
        popupModal={isBulkModal}
        setPopupModal={setIsBulkModal}
        outClickCancel
      >
        <BulkUploadModal
          onClose={() => setIsBulkModal(false)}
          onSuccess={fetchFarmers}
        />
      </Modal>
    </div>
  );
};

export default FarmersPage;
