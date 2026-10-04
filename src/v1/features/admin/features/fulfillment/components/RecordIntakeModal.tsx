/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import FulfillmentApi, { AttachedFarmer } from "@/v1/api/FulfillmentApi";
import toast from "react-hot-toast";

interface RecordIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerId: number;
  centerName: string;
  onSuccess: () => void;
}

const FLORAL_SOURCES = [
  "Wildflower", "Acacia Blossom", "Citrus Blossom", "Neem Forest",
  "Multifloral Forest", "Shea Tree Blossom", "Mangrove Blossom"
];

const RecordIntakeModal: React.FC<RecordIntakeModalProps> = ({
  isOpen,
  onClose,
  centerId,
  centerName,
  onSuccess,
}) => {
  const [farmers, setFarmers] = useState<AttachedFarmer[]>([]);
  const [allFarmers, setAllFarmers] = useState<any[]>([]);
  const [useAllFarmers, setUseAllFarmers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    farmer: "" as number | "",
    intake_date: new Date().toISOString().split("T")[0],
    harvest_date: "",
    quantity_gallons: 25,
    quantity_liters: (25 * 3.78541).toFixed(2),
    moisture_content_percentage: 17.2,
    floral_source: "Wildflower",
    quality_grade: "grade_a" as "grade_a" | "grade_b" | "raw" | "processing_required",
    container_seal_number: `SEAL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    farmer_rate_per_gallon: 140,
    farmer_payout_amount: (25 * 140).toFixed(2),
    farmer_payout_status: "paid" as "pending" | "approved" | "paid",
    payout_reference: `MM-${Math.floor(10000000 + Math.random() * 90000000)}`,
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadCenterFarmers();
    }
  }, [isOpen, centerId]);

  const loadCenterFarmers = async () => {
    try {
      const res = await FulfillmentApi.getInstance().getCenterFarmers(centerId);
      if (res.data) {
        setFarmers(res.data);
        if (res.data.length > 0 && res.data[0]) {
          setFormData((prev) => ({ ...prev, farmer: res.data![0].farmer }));
        }
      }
      const allRes = await FulfillmentApi.getInstance().getAvailableFarmers();
      if (allRes.data) {
        setAllFarmers(allRes.data);
      }
    } catch (err) {
      console.error("Failed to load farmers", err);
    }
  };

  const handleGallonsChange = (val: number) => {
    const gal = Number(val) || 0;
    const lit = (gal * 3.78541).toFixed(2);
    const rate = Number(formData.farmer_rate_per_gallon) || 0;
    const payout = (gal * rate).toFixed(2);
    setFormData((prev) => ({
      ...prev,
      quantity_gallons: gal,
      quantity_liters: lit,
      farmer_payout_amount: payout,
    }));
  };

  const handleRateChange = (rateVal: number) => {
    const rate = Number(rateVal) || 0;
    const gal = Number(formData.quantity_gallons) || 0;
    const payout = (gal * rate).toFixed(2);
    setFormData((prev) => ({
      ...prev,
      farmer_rate_per_gallon: rate,
      farmer_payout_amount: payout,
    }));
  };

  const handleMoistureChange = (val: number) => {
    const m = Number(val) || 0;
    let grade: "grade_a" | "grade_b" | "raw" | "processing_required" = "grade_a";
    if (m <= 18.5) {
      grade = "grade_a";
    } else if (m <= 20.0) {
      grade = "grade_b";
    } else {
      grade = "processing_required";
    }
    setFormData((prev) => ({
      ...prev,
      moisture_content_percentage: m,
      quality_grade: grade,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmer) {
      toast.error("Please select a farmer");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await FulfillmentApi.getInstance().createIntake({
        fulfillment_center: centerId,
        farmer: Number(formData.farmer),
        intake_date: formData.intake_date,
        harvest_date: formData.harvest_date || undefined,
        quantity_gallons: Number(formData.quantity_gallons),
        quantity_liters: Number(formData.quantity_liters),
        moisture_content_percentage: Number(formData.moisture_content_percentage),
        floral_source: formData.floral_source,
        quality_grade: formData.quality_grade,
        container_seal_number: formData.container_seal_number,
        farmer_rate_per_gallon: Number(formData.farmer_rate_per_gallon),
        farmer_payout_amount: Number(formData.farmer_payout_amount),
        farmer_payout_status: formData.farmer_payout_status,
        farmer_payout_date: formData.farmer_payout_status === "paid" ? formData.intake_date : undefined,
        payout_reference: formData.payout_reference,
        notes: formData.notes,
      });

      if (res.data) {
        toast.success(`Batch ${res.data.traceability_code} recorded successfully`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.error || "Failed to record honey intake");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayedFarmers = useAllFarmers
    ? allFarmers.map((f) => ({ id: f.id, label: `${f.full_name} (${f.region})` }))
    : farmers.map((f) => ({
        id: f.farmer,
        label: `${f.farmer_details.full_name} (${f.farmer_details.region || centerName})`,
      }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Record Honey Intake</h3>
            <p className="text-xs text-gray-500">Log harvest reception at {centerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-gray-700 max-h-[80vh] overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-gray-700">Delivering Farmer</label>
              <button
                type="button"
                onClick={() => setUseAllFarmers(!useAllFarmers)}
                className="text-[11px] text-oha_primary hover:underline cursor-pointer"
              >
                {useAllFarmers ? "Show attached farmers" : "Show all farmers"}
              </button>
            </div>
            <select
              required
              value={formData.farmer}
              onChange={(e) => setFormData({ ...formData, farmer: Number(e.target.value) })}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs"
            >
              <option value="">-- Select Farmer --</option>
              {displayedFarmers.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Volume (Gallons)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                required
                value={formData.quantity_gallons}
                onChange={(e) => handleGallonsChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Equivalent (L)</label>
              <input
                type="number"
                readOnly
                value={formData.quantity_liters}
                className="w-full px-3 py-1.5 border border-gray-200 bg-gray-50 rounded text-gray-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Moisture %</label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="30"
                value={formData.moisture_content_percentage}
                onChange={(e) => handleMoistureChange(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Floral Source</label>
              <select
                value={formData.floral_source}
                onChange={(e) => setFormData({ ...formData, floral_source: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs"
              >
                {FLORAL_SOURCES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Seal Number</label>
              <input
                type="text"
                value={formData.container_seal_number}
                onChange={(e) => setFormData({ ...formData, container_seal_number: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Intake Date</label>
              <input
                type="date"
                required
                value={formData.intake_date}
                onChange={(e) => setFormData({ ...formData, intake_date: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Harvest Date (Optional)</label>
              <input
                type="date"
                value={formData.harvest_date}
                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-3">
            <h4 className="font-semibold text-gray-800">Farmer Compensation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Rate / Gal (GHS)</label>
                <input
                  type="number"
                  step="5"
                  value={formData.farmer_rate_per_gallon}
                  onChange={(e) => handleRateChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Total Due (GHS)</label>
                <input
                  type="text"
                  readOnly
                  value={`GHS ${formData.farmer_payout_amount}`}
                  className="w-full px-3 py-1.5 border border-gray-200 bg-white rounded font-bold text-green-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Payout Status</label>
                <select
                  value={formData.farmer_payout_status}
                  onChange={(e) => setFormData({ ...formData, farmer_payout_status: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs"
                >
                  <option value="paid">Paid</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-oha_primary hover:bg-orange-500 text-white text-xs font-medium rounded-full px-5 py-2 transition cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Record intake"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordIntakeModal;
