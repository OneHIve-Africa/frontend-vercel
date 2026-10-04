/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  QrCode,
  Plus,
  X,
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
import FulfillmentApi, {
  FulfillmentCenter,
  CenterImpactData,
  AttachedFarmer,
  HoneyIntake,
} from "@/v1/api/FulfillmentApi";
import RecordIntakeModal from "../components/RecordIntakeModal";
import AttachFarmersModal from "../components/AttachFarmersModal";
import TraceabilityModal from "../components/TraceabilityModal";
import QuickTraceLookupModal from "../components/QuickTraceLookupModal";
import toast from "react-hot-toast";

interface CardItem {
  label: string;
  value: string | number;
  color: string;
}

const tabItems = [
  { id: 0, label: "Farmer Economic Impact" },
  { id: 1, label: "Attached Farmers" },
  { id: 2, label: "Honey Intake Ledger" },
  { id: 3, label: "Offtake Sales" },
];

const FulfillmentCenterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const centerId = Number(id);

  const [activeTab, setActiveTab] = useState(0);
  const [center, setCenter] = useState<FulfillmentCenter | null>(null);
  const [impactData, setImpactData] = useState<CenterImpactData | null>(null);
  const [attachedFarmers, setAttachedFarmers] = useState<AttachedFarmer[]>([]);
  const [intakes, setIntakes] = useState<HoneyIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for intake ledger
  const [intakeSearch, setIntakeSearch] = useState("");

  // Modals
  const [isRecordIntakeOpen, setIsRecordIntakeOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activePassportCode, setActivePassportCode] = useState<string | null>(null);

  // Sale Recording State
  const [recordingSaleBatch, setRecordingSaleBatch] = useState<HoneyIntake | null>(null);
  const [salePriceInput, setSalePriceInput] = useState(220);
  const [buyerNameInput, setBuyerNameInput] = useState("");
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  useEffect(() => {
    if (centerId) {
      loadAllCenterData();
    }
  }, [centerId]);

  const loadAllCenterData = async () => {
    try {
      setIsLoading(true);
      const [centerRes, impactRes, farmersRes, intakesRes] = await Promise.all([
        FulfillmentApi.getInstance().getCenter(centerId),
        FulfillmentApi.getInstance().getCenterImpact(centerId),
        FulfillmentApi.getInstance().getCenterFarmers(centerId),
        FulfillmentApi.getInstance().listIntakes({ fulfillment_center: centerId }),
      ]);

      if (centerRes.data) setCenter(centerRes.data);
      if (impactRes.data) setImpactData(impactRes.data);
      if (farmersRes.data) setAttachedFarmers(farmersRes.data);
      if (intakesRes.data) setIntakes(intakesRes.data);
    } catch (err) {
      console.error("Error loading center details", err);
      toast.error("Failed to load fulfillment center details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetachFarmer = async (farmerId: number, farmerName: string) => {
    if (!window.confirm(`Detach farmer "${farmerName}" from this center?`)) {
      return;
    }

    try {
      const res = await FulfillmentApi.getInstance().detachFarmer(centerId, farmerId);
      if (res.data) {
        toast.success(`Detached ${farmerName}`);
        loadAllCenterData();
      }
    } catch (err: any) {
      toast.error(err?.error || "Failed to detach farmer");
    }
  };

  const handleUpdatePayoutStatus = async (intakeId: number, newStatus: "paid" | "approved" | "pending") => {
    try {
      const res = await FulfillmentApi.getInstance().updatePayout(intakeId, {
        farmer_payout_status: newStatus,
        payout_reference: `MM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      });
      if (res.data) {
        toast.success(`Payout status updated to ${newStatus}`);
        loadAllCenterData();
      }
    } catch (err) {
      toast.error("Failed to update payout status");
    }
  };

  const handleRecordSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingSaleBatch) return;

    try {
      setIsSubmittingSale(true);
      const res = await FulfillmentApi.getInstance().recordSale(recordingSaleBatch.id, {
        sale_price_per_gallon: Number(salePriceInput),
        buyer_name: buyerNameInput || "Commercial Offtaker",
      });
      if (res.data) {
        toast.success("Honey sale recorded successfully!");
        setRecordingSaleBatch(null);
        loadAllCenterData();
      }
    } catch (err) {
      toast.error("Failed to record honey sale");
    } finally {
      setIsSubmittingSale(false);
    }
  };

  if (isLoading && !center) {
    return (
      <div className="py-20 text-center text-gray-400">
        Loading fulfillment center information...
      </div>
    );
  }

  if (!center) {
    return (
      <div className="py-20 text-center text-gray-500">
        Fulfillment center not found.
      </div>
    );
  }

  const metrics = impactData?.overall_metrics || {
    total_honey_gallons: Number(center.total_gallons_received) || 0,
    total_honey_liters: Number(center.total_liters_received) || 0,
    total_farmer_payouts: Number(center.total_farmer_payouts) || 0,
    total_sales_revenue: Number(center.total_sales_revenue) || 0,
    net_margin: 0,
    attached_farmers_count: center.attached_farmers_count,
    contributing_farmers_count: 0,
    avg_earnings_per_farmer: 0,
  };

  const cardData: CardItem[] = [
    {
      label: "Honey Received (Gal)",
      value: Number(metrics.total_honey_gallons).toLocaleString(),
      color: "bg-oha_secondary",
    },
    {
      label: "Attached Farmers",
      value: attachedFarmers.length,
      color: "bg-oha_primary",
    },
    {
      label: "Farmer Earnings (GHS)",
      value: Number(metrics.total_farmer_payouts).toLocaleString(),
      color: "bg-green-500",
    },
    {
      label: "Total Sales (GHS)",
      value: Number(metrics.total_sales_revenue).toLocaleString(),
      color: "bg-yellow-500",
    },
  ];

  const filteredIntakes = intakes.filter((i) => {
    const s = intakeSearch.toLowerCase();
    return (
      i.traceability_code.toLowerCase().includes(s) ||
      (i.farmer_details?.full_name &&
        i.farmer_details.full_name.toLowerCase().includes(s)) ||
      (i.buyer_name && i.buyer_name.toLowerCase().includes(s)) ||
      i.floral_source.toLowerCase().includes(s)
    );
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Header: Back + Title + Action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/fulfillment")}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-gray-500">
                {center.code}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{center.region} Region</span>
              {center.district && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{center.district}</span>
                </>
              )}
              {center.landmark && (
                <span className="inline-flex items-center text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  📍 {center.landmark}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              {center.name}
            </h2>
            {center.address && (
              <p className="text-xs text-gray-500 mt-0.5">
                {center.address}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-full px-4 py-2 transition cursor-pointer flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4 text-oha_primary" />
            <span>Scan batch</span>
          </button>

          <button
            onClick={() => setIsAttachOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-full px-4 py-2 transition cursor-pointer"
          >
            Attach farmers
          </button>

          <button
            onClick={() => setIsRecordIntakeOpen(true)}
            className="bg-oha_primary hover:bg-orange-500 text-white text-sm font-medium rounded-full px-5 py-2 transition cursor-pointer flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Record intake</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards (Standard Native Pattern) */}
      <div className="bg-white overflow-hidden rounded-md p-6">
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

      {/* Tab Menu */}
      <div className="bg-white rounded-md border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-6 py-4 text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === item.id
                  ? "border-b-2 border-oha_primary text-oha_primary font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
              {item.id === 1 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                  {attachedFarmers.length}
                </span>
              )}
              {item.id === 2 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs">
                  {intakes.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 0: Farmer Economic Impact */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Multi-Year Chart */}
          {impactData?.multi_year_impact && impactData.multi_year_impact.length > 0 && (
            <div className="bg-white rounded-md p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Farmer Gains Across Years (2024 - 2026)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Monetary payouts distributed to local beekeepers
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
                    data={impactData.multi_year_impact}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      formatter={(((val: any, name: string) => {
                        if (name === "farmer_payout_total")
                          return [`GHS ${Number(val).toLocaleString()}`, "Farmer Payouts"];
                        if (name === "sales_revenue_total")
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
                      dataKey="farmer_payout_total"
                      name="Farmer Payouts"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                    />
                    <Bar
                      dataKey="sales_revenue_total"
                      name="Sales Revenue"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Contributing Farmers Table */}
          <div className="bg-white rounded-md p-6 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Top Benefiting Farmers
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Local farmers earning from honey intake at this center
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                    <th className="py-2.5 px-3">Farmer</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Batches</th>
                    <th className="py-2.5 px-3">Volume (Gal)</th>
                    <th className="py-2.5 px-3 text-right">Total Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {impactData?.top_farmers && impactData.top_farmers.length > 0 ? (
                    impactData.top_farmers.map((tf) => (
                      <tr key={tf.farmer_id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-medium text-gray-900">
                          {tf.farmer_name}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {tf.location || center.region}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700">{tf.batches_count}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">
                          {tf.total_gallons} Gal
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-green-700">
                          GHS {tf.total_payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        No farmer deliveries recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Attached Farmers */}
      {activeTab === 1 && (
        <div className="bg-white rounded-md p-6 border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Attached Farmers</h3>
              <p className="text-xs text-gray-500">
                Beekeepers linked to {center.name}
              </p>
            </div>
            <button
              onClick={() => setIsAttachOpen(true)}
              className="bg-oha_primary text-white text-sm font-medium rounded-full px-4 py-2 hover:bg-orange-500 transition cursor-pointer"
            >
              Attach farmers
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Honey Delivered</th>
                  <th className="py-2.5 px-3">Cumulative Payout</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {attachedFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No farmers attached yet.
                    </td>
                  </tr>
                ) : (
                  attachedFarmers.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {f.farmer_details.full_name}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{f.farmer_details.email}</td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {f.farmer_details.town || f.farmer_details.district}, {f.farmer_details.region}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        {f.farmer_details.total_honey_delivered_gallons} Gal
                      </td>
                      <td className="py-2.5 px-3 font-bold text-green-700">
                        GHS {f.farmer_details.total_payout_earned.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDetachFarmer(f.farmer, f.farmer_details.full_name)}
                          className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                        >
                          Detach
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Honey Intake Ledger */}
      {activeTab === 2 && (
        <div className="bg-white rounded-md p-6 border border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Honey Intake Ledger</h3>
              <p className="text-xs text-gray-500">
                All honey gallons received with batch traceability
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search batch code, farmer..."
                value={intakeSearch}
                onChange={(e) => setIntakeSearch(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-oha_primary"
              />
              <button
                onClick={() => setIsRecordIntakeOpen(true)}
                className="bg-oha_primary text-white text-xs font-medium rounded-full px-4 py-2 hover:bg-orange-500 transition cursor-pointer whitespace-nowrap"
              >
                + Record intake
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                  <th className="py-2.5 px-3">Batch Code</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Farmer</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Moisture</th>
                  <th className="py-2.5 px-3">Farmer Payout</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Passport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredIntakes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No honey intake records found.
                    </td>
                  </tr>
                ) : (
                  filteredIntakes.map((intake) => (
                    <tr key={intake.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-gray-900">
                        {intake.traceability_code}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{intake.intake_date}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {intake.farmer_details?.full_name || "Farmer"}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        {intake.quantity_gallons} Gal
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {intake.moisture_content_percentage}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-green-700 block">
                          GHS {Number(intake.farmer_payout_amount).toLocaleString()}
                        </span>
                        <span
                          onClick={() =>
                            intake.farmer_payout_status !== "paid" &&
                            handleUpdatePayoutStatus(intake.id, "paid")
                          }
                          className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                            intake.farmer_payout_status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800 hover:bg-green-200"
                          }`}
                        >
                          {intake.farmer_payout_status === "paid" ? "Paid" : "Mark paid"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {intake.sale_status === "sold" ? (
                          <span className="text-gray-700">Sold</span>
                        ) : (
                          <button
                            onClick={() => {
                              setRecordingSaleBatch(intake);
                              setSalePriceInput(220);
                              setBuyerNameInput("");
                            }}
                            className="text-oha_primary hover:underline text-xs"
                          >
                            Record sale
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setActivePassportCode(intake.traceability_code)}
                          className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium cursor-pointer transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Offtake Sales */}
      {activeTab === 3 && (
        <div className="bg-white rounded-md p-6 border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Offtake Sales</h3>
              <p className="text-xs text-gray-500">
                Honey sold from this center to external buyers
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="text-gray-500 block">Total Sales Revenue</span>
              <span className="text-base font-bold text-gray-900">
                GHS {Number(metrics.total_sales_revenue).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Sale Date</th>
                  <th className="py-2.5 px-3">Buyer</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Price / Gal</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {intakes.filter((i) => i.sale_status === "sold").length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No offtake sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  intakes
                    .filter((i) => i.sale_status === "sold")
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-800">
                          {item.traceability_code}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{item.sale_date || "-"}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">
                          {item.buyer_name || "Offtaker"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700">{item.quantity_gallons} Gal</td>
                        <td className="py-2.5 px-3 text-gray-700">
                          GHS {item.sale_price_per_gallon}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          GHS {Number(item.total_sale_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {recordingSaleBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900">Record Honey Sale</h4>
              <button
                onClick={() => setRecordingSaleBatch(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSaleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Buyer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accra Premium Organics"
                  value={buyerNameInput}
                  onChange={(e) => setBuyerNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Sale Price / Gallon (GHS)
                </label>
                <input
                  type="number"
                  step="5"
                  required
                  value={salePriceInput}
                  onChange={(e) => setSalePriceInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordingSaleBatch(null)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSale}
                  className="px-4 py-1.5 bg-oha_primary text-white font-medium rounded hover:bg-orange-500 cursor-pointer"
                >
                  {isSubmittingSale ? "Saving..." : "Save Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Intake Modal */}
      <RecordIntakeModal
        isOpen={isRecordIntakeOpen}
        onClose={() => setIsRecordIntakeOpen(false)}
        centerId={center.id}
        centerName={center.name}
        onSuccess={() => loadAllCenterData()}
      />

      {/* Attach Farmers Modal */}
      <AttachFarmersModal
        isOpen={isAttachOpen}
        onClose={() => setIsAttachOpen(false)}
        centerId={center.id}
        centerName={center.name}
        centerRegion={center.region}
        onSuccess={() => loadAllCenterData()}
      />

      {/* Quick Scanner Modal */}
      <QuickTraceLookupModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectCode={(code) => setActivePassportCode(code)}
      />

      {/* Traceability Passport Modal */}
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

export default FulfillmentCenterDetail;
