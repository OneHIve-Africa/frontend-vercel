import React, { useState, useEffect } from "react";
import { X, Copy, Printer } from "lucide-react";
import FulfillmentApi, { TraceabilityPassport } from "@/v1/api/FulfillmentApi";
import toast from "react-hot-toast";

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchCode: string;
}

const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  batchCode,
}) => {
  const [passport, setPassport] = useState<TraceabilityPassport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && batchCode) {
      loadPassport(batchCode);
    }
  }, [isOpen, batchCode]);

  const loadPassport = async (code: string) => {
    try {
      setIsLoading(true);
      const res = await FulfillmentApi.getInstance().lookupTraceability(code);
      if (res.data) {
        setPassport(res.data);
      }
    } catch (err: any) {
      toast.error(err?.error || "Could not retrieve batch traceability");
    } finally {
      setIsLoading(false);
    }
  };

  const copyBatchCode = () => {
    if (passport?.batch_id) {
      navigator.clipboard.writeText(passport.batch_id);
      setCopied(true);
      toast.success("Batch code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Traceability Details
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Batch: {batchCode}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              title="Print"
              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading batch details...</div>
        ) : !passport ? (
          <div className="p-12 text-center text-gray-500">Record not found.</div>
        ) : (
          <div className="p-6 space-y-5 text-xs text-gray-700 max-h-[75vh] overflow-y-auto">
            {/* Top QR & Summary Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="p-2 bg-white rounded border border-gray-200 shrink-0 text-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&margin=0&data=${encodeURIComponent(
                    passport.batch_id
                  )}`}
                  alt="Batch QR"
                  className="w-20 h-20 mx-auto"
                />
                <button
                  onClick={copyBatchCode}
                  className="mt-1 text-[10px] text-oha_primary hover:underline flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 w-full">
                <div>
                  <span className="text-[11px] text-gray-500 block">Volume</span>
                  <span className="text-sm font-bold text-gray-900">
                    {passport.lab_metrics.quantity_gallons} Gal
                  </span>
                  <span className="text-[11px] text-gray-400 block">
                    ({passport.lab_metrics.quantity_liters} L)
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 block">Quality Grade</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {passport.lab_metrics.quality_grade}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 block">Moisture %</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {passport.lab_metrics.moisture_percentage}%
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 block">Flora</span>
                  <span className="text-sm font-medium text-gray-900">
                    {passport.lab_metrics.floral_source}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 block">Container Seal</span>
                  <span className="text-sm font-mono text-gray-900">
                    {passport.hub_processing.container_seal || "-"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 block">Intake Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {passport.hub_processing.intake_date}
                  </span>
                </div>
              </div>
            </div>

            {/* Farmer Origin */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase">
                Farmer & Origin
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  Farmer: <strong>{passport.origin_chain.farmer_name}</strong>
                </p>
                <p>
                  Farm: <strong>{passport.origin_chain.farm_name || "Apiary Farm"}</strong>
                </p>
                <p>
                  Location: {passport.origin_chain.farmer_town}, {passport.origin_chain.farmer_district}, {passport.origin_chain.farmer_region} Region
                </p>
                <p>
                  Harvest Date: {passport.origin_chain.harvest_date || "Recorded at Intake"}
                </p>
              </div>
            </div>

            {/* Fulfillment Center */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase">
                Fulfillment Center
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  Center: <strong>{passport.hub_processing.center_name}</strong> ({passport.hub_processing.center_code})
                </p>
                <p>
                  Manager: <strong>{passport.hub_processing.manager_name || "Manager"}</strong>
                </p>
                <p>
                  Region: {passport.hub_processing.center_region}
                </p>
              </div>
            </div>

            {/* Economics & Payout */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-green-50/40">
              <h4 className="text-xs font-bold text-green-900 uppercase">
                Farmer Compensation
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  Payout Amount: <strong className="text-green-800 text-sm">GHS {Number(passport.economic_impact.farmer_payout_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </p>
                <p>
                  Rate: GHS {passport.economic_impact.farmer_rate_per_gallon} / Gallon
                </p>
                <p>
                  Status: <strong>{passport.economic_impact.payout_status}</strong>
                </p>
                {passport.economic_impact.payout_date && (
                  <p>Settled: {passport.economic_impact.payout_date}</p>
                )}
              </div>
            </div>

            {/* Sale Status */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase">
                Offtake Sale
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  Status: <strong>{passport.market_distribution.sale_status}</strong>
                </p>
                {passport.market_distribution.sale_status === "Sold to Offtaker" && (
                  <>
                    <p>Buyer: <strong>{passport.market_distribution.buyer_name || "Buyer"}</strong></p>
                    <p>Sale Price: GHS {passport.market_distribution.sale_price_per_gallon} / Gal</p>
                    <p>Total Revenue: <strong>GHS {Number(passport.market_distribution.total_sale_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraceabilityModal;
