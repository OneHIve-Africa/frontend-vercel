import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Search, Check, MapPin, CheckCircle2 } from "lucide-react";
import FulfillmentApi from "@/v1/api/FulfillmentApi";
import toast from "react-hot-toast";

interface AttachFarmersModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerId: number;
  centerName: string;
  centerRegion: string;
  onSuccess: () => void;
}

interface AvailableFarmer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  region: string;
  district: string;
  town: string;
  farm_name: string;
  farm_size: number;
  is_attached_to_any_hub: boolean;
  is_attached_to_current_hub: boolean;
}

const AttachFarmersModal: React.FC<AttachFarmersModalProps> = ({
  isOpen,
  onClose,
  centerId,
  centerName,
  centerRegion,
  onSuccess,
}) => {
  const [farmers, setFarmers] = useState<AvailableFarmer[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [filterRegionOnly, setFilterRegionOnly] = useState(false);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFarmers();
      setSelectedIds([]);
      setSearch("");
      setNotes("");
    }
  }, [isOpen, centerId]);

  const loadFarmers = async () => {
    try {
      setIsLoading(true);
      const res = await FulfillmentApi.getInstance().getAvailableFarmers(centerId);
      if (res.data) {
        setFarmers(res.data);
      }
    } catch (err) {
      console.error("Failed to load available farmers", err);
      toast.error("Failed to load farmers list");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = (filteredList: AvailableFarmer[]) => {
    const unattachedFiltered = filteredList.filter((f) => !f.is_attached_to_current_hub);
    const allSelected = unattachedFiltered.every((f) => selectedIds.includes(f.id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !unattachedFiltered.some((f) => f.id === id)));
    } else {
      const newIds = new Set([...selectedIds, ...unattachedFiltered.map((f) => f.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.region.toLowerCase().includes(search.toLowerCase()) ||
      f.district.toLowerCase().includes(search.toLowerCase()) ||
      f.farm_name.toLowerCase().includes(search.toLowerCase());

    const matchesRegion = filterRegionOnly
      ? f.region.toLowerCase() === centerRegion.toLowerCase()
      : true;

    return matchesSearch && matchesRegion;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Please select at least one farmer to attach");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await FulfillmentApi.getInstance().attachFarmers(centerId, {
        farmer_ids: selectedIds,
        notes,
      });

      if (res.data) {
        toast.success(res.data.message || `Attached ${selectedIds.length} farmer(s) to ${centerName}`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.error || "Failed to attach farmers to center");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Attach Farmers to Center</h3>
                  <p className="text-xs text-amber-100">
                    Assigning beekeepers to <span className="font-semibold">{centerName}</span> ({centerRegion})
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search farmer by name, village, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-oha_primary"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFilterRegionOnly(!filterRegionOnly)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    filterRegionOnly
                      ? "bg-amber-100 border-amber-300 text-amber-900 font-semibold"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  📍 {centerRegion} Region Only
                </button>

                <button
                  type="button"
                  onClick={() => selectAllFiltered(filteredFarmers)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer font-medium"
                >
                  Select All ({filteredFarmers.filter((f) => !f.is_attached_to_current_hub).length})
                </button>
              </div>
            </div>

            {/* Farmer Selection List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {isLoading ? (
                <div className="text-center py-10 text-gray-400">Loading available farmers...</div>
              ) : filteredFarmers.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No farmers found matching your criteria.
                </div>
              ) : (
                filteredFarmers.map((f) => {
                  const isCurrent = f.is_attached_to_current_hub;
                  const isSelected = selectedIds.includes(f.id);

                  return (
                    <div
                      key={f.id}
                      onClick={() => !isCurrent && toggleSelect(f.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-amber-50 border-oha_primary shadow-xs cursor-pointer"
                          : "bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isCurrent
                              ? "bg-gray-300 border-gray-300 text-white"
                              : isSelected
                              ? "bg-oha_primary border-oha_primary text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {(isCurrent || isSelected) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">{f.full_name}</span>
                            {f.farm_name && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                {f.farm_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{f.town || f.district || f.region}</span>
                            </span>
                            <span>•</span>
                            <span>{f.email}</span>
                            {f.farm_size > 0 && (
                              <>
                                <span>•</span>
                                <span>{f.farm_size} ha</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isCurrent ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Already Attached</span>
                          </span>
                        ) : f.is_attached_to_any_hub ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            Attached to other hub
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Optional Notes & Action Footer */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Optional assignment note (e.g. 2026 cooperative contract)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-oha_primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  <span className="font-bold text-gray-900">{selectedIds.length}</span> farmer(s) selected
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedIds.length === 0 || isSubmitting}
                    className="px-5 py-2 bg-oha_primary hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Attaching..." : `Attach to ${centerName}`}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AttachFarmersModal;
