/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  QrCode,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createColumnHelper } from "@tanstack/react-table";
import { PaginationTable, LoadingAnimation } from "@/v1/components";
import FulfillmentApi, {
  FulfillmentCenter,
  GlobalImpactData,
} from "@/v1/api/FulfillmentApi";
import CreateCenterModal from "../components/CreateCenterModal";
import QuickTraceLookupModal from "../components/QuickTraceLookupModal";
import TraceabilityModal from "../components/TraceabilityModal";
import FulfillmentMapView from "../components/FulfillmentMapView";
import toast from "react-hot-toast";

type ViewMode = "cards" | "table" | "map";

interface CardItem {
  label: string;
  value: string | number;
  color: string;
}

const FulfillmentHubsPage: React.FC = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState<FulfillmentCenter[]>([]);
  const [impactData, setImpactData] = useState<GlobalImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activePassportCode, setActivePassportCode] = useState<string | null>(null);

  const columnHelper = createColumnHelper<FulfillmentCenter>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [centersRes, impactRes] = await Promise.all([
        FulfillmentApi.getInstance().listCenters(),
        FulfillmentApi.getInstance().getGlobalImpact(),
      ]);

      if (centersRes.data) {
        setCenters(centersRes.data);
      }
      if (impactRes.data) {
        setImpactData(impactRes.data);
      }
    } catch (err) {
      console.error("Error loading fulfillment centers", err);
      toast.error("Failed to load fulfillment centers data");
    } finally {
      setIsLoading(false);
    }
  };

  const overview = impactData?.overview || {
    total_centers: centers.length,
    active_centers: centers.filter((c) => c.status === "active").length,
    total_attached_farmers: 0,
    total_gallons_received: 0,
    total_liters_received: 0,
    total_farmer_payouts: 0,
    total_sales_revenue: 0,
    net_margin: 0,
  };

  const cardData: CardItem[] = [
    {
      label: "Fulfillment Centers",
      value: overview.total_centers,
      color: "bg-oha_secondary",
    },
    {
      label: "Attached Farmers",
      value: overview.total_attached_farmers,
      color: "bg-oha_primary",
    },
    {
      label: "Honey Received (Gal)",
      value: Number(overview.total_gallons_received).toLocaleString(),
      color: "bg-yellow-500",
    },
    {
      label: "Farmer Economic Value (GHS)",
      value: Number(overview.total_farmer_payouts).toLocaleString(),
      color: "bg-green-500",
    },
  ];

  // Table columns for Tabular View
  const columns = [
    columnHelper.accessor("code", {
      id: "code",
      header: () => <span>Code</span>,
      cell: (info) => (
        <span className="font-mono text-sm font-semibold text-gray-900">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: () => <span>Center Name</span>,
      cell: (info) => (
        <p className="text-darklink text-sm font-medium">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("region", {
      id: "region",
      header: () => <span>Region</span>,
      cell: (info) => (
        <p className="text-darklink text-sm">{info.getValue()}</p>
      ),
    }),
    columnHelper.accessor("district", {
      id: "district",
      header: () => <span>District</span>,
      cell: (info) => (
        <p className="text-darklink text-sm">{info.getValue() || "-"}</p>
      ),
    }),
    columnHelper.accessor("attached_farmers_count", {
      id: "attached_farmers",
      header: () => <span>Farmers</span>,
      cell: (info) => (
        <p className="text-darklink text-sm font-medium">{info.getValue()}</p>
      ),
    }),
    columnHelper.accessor("total_gallons_received", {
      id: "total_gallons",
      header: () => <span>Honey (Gal)</span>,
      cell: (info) => (
        <p className="text-darklink text-sm">
          {Number(info.getValue()).toLocaleString()} Gal
        </p>
      ),
    }),
    columnHelper.accessor("total_farmer_payouts", {
      id: "farmer_payouts",
      header: () => <span>Farmer Payouts</span>,
      cell: (info) => (
        <p className="text-darklink text-sm font-semibold text-green-700">
          GHS {Number(info.getValue()).toLocaleString()}
        </p>
      ),
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => <span>Status</span>,
      cell: (info) => {
        const status = info.getValue();
        const isAct = status === "active";
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              isAct
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            } capitalize`}
          >
            {status}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const row = info.row.original;
        return (
          <button
            onClick={() => navigate(`/fulfillment/${row.id}`)}
            className="px-3 py-1 rounded-md bg-orange-100 text-orange-900 hover:bg-orange-200 text-xs font-medium cursor-pointer transition"
          >
            Manage
          </button>
        );
      },
    }),
  ];

  return (
    <div className="w-full">
      {/* Top Statistics Cards (Native Platform Pattern) */}
      <div className="bg-white overflow-hidden rounded-md my-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map(({ label, value, color }) => (
            <div key={label} className="flex space-x-4 items-center">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <div>
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="text-xl font-semibold text-gray-900 mt-0.5">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Year Chart (Simple & Clean) */}
      {impactData?.yearly_impact && impactData.yearly_impact.length > 0 && (
        <div className="bg-white rounded-md p-6 mb-6 border border-gray-100 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Annual Farmer Payouts
              </h3>
              <p className="text-xs text-gray-500">
                Total earnings gained by farmers across years (2024 - 2026)
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Farmer Payouts (GHS)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span>Honey Sales (GHS)</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={impactData.yearly_impact}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(((val: any, name: string) => {
                    if (name === "total_farmer_payouts")
                      return [`GHS ${Number(val).toLocaleString()}`, "Farmer Payouts"];
                    if (name === "total_sales_revenue")
                      return [`GHS ${Number(val).toLocaleString()}`, "Sales Revenue"];
                    return [val, name];
                  }) as any)}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    border: "none",
                  }}
                />
                <Bar
                  dataKey="total_farmer_payouts"
                  name="Farmer Payouts"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="total_sales_revenue"
                  name="Sales Revenue"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* View Switcher & Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        {/* Three View Switchers: Cards, Table, Map */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === "cards"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>

          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
              viewMode === "map"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-full px-5 py-2 transition cursor-pointer flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4 text-oha_primary" />
            <span>Scan batch</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-oha_primary hover:bg-orange-500 text-white text-sm font-medium rounded-full px-5 py-2 transition cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add fulfillment center</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on ViewMode */}
      {isLoading ? (
        <LoadingAnimation />
      ) : viewMode === "table" ? (
        /* Tabular View via PaginationTable */
        <PaginationTable
          TableData={centers}
          columns={columns as any}
          title="Fulfillment Centers"
        />
      ) : viewMode === "map" ? (
        /* Map View via Leaflet CDN */
        <FulfillmentMapView centers={centers} />
      ) : (
        /* Simple Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {centers.map((center) => (
            <div
              key={center.id}
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-2xs hover:border-oha_primary transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-gray-500 font-semibold">
                      {center.code}
                    </span>
                    <h4 className="text-base font-bold text-gray-900 mt-0.5">
                      {center.name}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      center.status === "active"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    } capitalize`}
                  >
                    {center.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 mt-3 space-y-1">
                  <p>
                    Location: <strong>{center.town || center.district}, {center.region}</strong>
                  </p>
                  {center.manager_name && (
                    <p>
                      Manager: <strong>{center.manager_name}</strong>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Farmers</span>
                    <span className="text-sm font-bold text-gray-900">
                      {center.attached_farmers_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Honey (Gal)</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Number(center.total_gallons_received).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Farmer Gains</span>
                    <span className="text-sm font-bold text-green-700">
                      GHS {Number(center.total_farmer_payouts).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Capacity</span>
                    <span className="text-sm font-medium text-gray-800">
                      {Number(center.capacity_gallons).toLocaleString()} Gal
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => navigate(`/fulfillment/${center.id}`)}
                  className="px-4 py-1.5 rounded-md bg-oha_primary text-white text-xs font-medium hover:bg-orange-500 transition cursor-pointer"
                >
                  Manage Center
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateCenterModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => loadData()}
      />

      <QuickTraceLookupModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectCode={(code) => setActivePassportCode(code)}
      />

      {activePassportCode && (
        <TraceabilityModal
          isOpen={!!activePassportCode}
          onClose={() => setActivePassportCode(null)}
          batchCode={activePassportCode}
        />
      )}
    </div>
  );
};

export default FulfillmentHubsPage;
