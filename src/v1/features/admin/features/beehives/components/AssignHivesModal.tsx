import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Package, Check, ChevronDown } from "lucide-react";
import { HiveItem } from "@/v1/api/Beehives";
import { FarmerDetails } from "@/v1/api/FarmerApi";
import FarmersApi from "@/v1/api/FarmerApi";
import BeehivesApi from "@/v1/api/Beehives";
import toast from "react-hot-toast";

interface AssignHivesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hives: HiveItem[];
  onAssignmentComplete: () => void;
}

type AssignmentMode = "investment" | "individual";

interface InvestmentGroup {
  investmentId: number;
  investmentAmount: string;
  hiveCount: number;
  hives: HiveItem[];
  investorEmail: string;
}

const AssignHivesModal: React.FC<AssignHivesModalProps> = ({
  isOpen,
  onClose,
  hives,
  onAssignmentComplete,
}) => {
  const [farmers, setFarmers] = useState<FarmerDetails[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerDetails | null>(
    null
  );
  const [assignmentMode, setAssignmentMode] =
    useState<AssignmentMode>("investment");
  const [selectedHives, setSelectedHives] = useState<number[]>([]);
  const [selectedInvestments, setSelectedInvestments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Group hives by investment
  const investmentGroups: InvestmentGroup[] = React.useMemo(() => {
    const groups: { [key: number]: InvestmentGroup } = {};

    hives.forEach((hive) => {
      if (hive.investment_id) {
        if (!groups[hive.investment_id]) {
          groups[hive.investment_id] = {
            investmentId: hive.investment_id,
            investmentAmount: hive.investment_amount || "0",
            hiveCount: 0,
            hives: [],
            investorEmail: hive.investor_email || "Unknown",
          };
        }
        groups[hive.investment_id].hives.push(hive);
        groups[hive.investment_id].hiveCount++;
      }
    });

    return Object.values(groups);
  }, [hives]);

  // Fetch farmers on modal open
  useEffect(() => {
    if (isOpen) {
      fetchFarmers();
    }
  }, [isOpen]);

  const fetchFarmers = async () => {
    try {
      setIsLoading(true);
      const api = FarmersApi.getInstance();
      const response = await api.listFarmers();

      if (response.data) {
        setFarmers(response.data);
      } else {
        toast.error("Failed to fetch farmers");
      }
    } catch (error) {
      console.error("Error fetching farmers:", error);
      toast.error("Failed to load farmers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignment = async () => {
    if (!selectedFarmer) {
      toast.error("Please select a farmer");
      return;
    }

    if (assignmentMode === "investment" && selectedInvestments.length === 0) {
      toast.error("Please select at least one investment");
      return;
    }

    if (assignmentMode === "individual" && selectedHives.length === 0) {
      toast.error("Please select at least one hive");
      return;
    }

    try {
      setIsAssigning(true);
      const api = BeehivesApi.getInstance();

      if (assignmentMode === "investment") {
        // Assign by investment
        for (const investmentId of selectedInvestments) {
          const response = await api.assignInvestmentHives(
            selectedFarmer.id!,
            investmentId
          );
          if (!response.data) {
            throw new Error(`Failed to assign investment ${investmentId}`);
          }
        }
        toast.success(
          `Successfully assigned ${selectedInvestments.length} investment(s) to ${selectedFarmer.first_name} ${selectedFarmer.last_name}`
        );
      } else {
        // Assign individual hives
        const response = await api.bulkAssignHives(
          selectedFarmer.id!,
          selectedHives
        );
        if (!response.data) {
          throw new Error("Failed to assign hives");
        }
        toast.success(
          `Successfully assigned ${selectedHives.length} hive(s) to ${selectedFarmer.first_name} ${selectedFarmer.last_name}`
        );
      }

      onAssignmentComplete();
      onClose();
      resetModal();
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign hives. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const resetModal = () => {
    setSelectedFarmer(null);
    setAssignmentMode("investment");
    setSelectedHives([]);
    setSelectedInvestments([]);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const toggleHiveSelection = (hiveId: number) => {
    setSelectedHives((prev) =>
      prev.includes(hiveId)
        ? prev.filter((id) => id !== hiveId)
        : [...prev, hiveId]
    );
  };

  const toggleInvestmentSelection = (investmentId: number) => {
    setSelectedInvestments((prev) =>
      prev.includes(investmentId)
        ? prev.filter((id) => id !== investmentId)
        : [...prev, investmentId]
    );
  };

  const unassignedHives = hives.filter((hive) => !hive.assigned_farmer);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Assign Hives to Farmer
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Farmer Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Select Farmer</h3>
                {isLoading ? (
                  <div className="text-center py-4">Loading farmers...</div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedFarmer?.id || ""}
                      onChange={(e) => {
                        const farmerId = parseInt(e.target.value);
                        const farmer = farmers.find((f) => f.id === farmerId);
                        setSelectedFarmer(farmer || null);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-oha_primary focus:ring-2 focus:ring-oha_primary/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select a farmer...</option>
                      {farmers.map((farmer) => (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.first_name} {farmer.last_name} -{" "}
                          {farmer.user_email} ({farmer.location})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                )}

                {/* Selected Farmer Display */}
                {selectedFarmer && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm text-blue-900">
                          {selectedFarmer.first_name} {selectedFarmer.last_name}
                        </p>
                        <p className="text-xs text-blue-700">
                          {selectedFarmer.user_email}
                        </p>
                        <p className="text-xs text-blue-600">
                          {selectedFarmer.location}
                        </p>
                        {selectedFarmer.total_hives !== undefined && (
                          <p className="text-xs text-blue-600">
                            Current hives: {selectedFarmer.total_hives}
                          </p>
                        )}
                      </div>
                      <Check className="w-4 h-4 text-blue-600 ml-auto" />
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Mode Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Assignment Method</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAssignmentMode("investment")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      assignmentMode === "investment"
                        ? "border-oha_primary bg-blue-50 text-oha_primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    By Investment
                  </button>
                  <button
                    onClick={() => setAssignmentMode("individual")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      assignmentMode === "individual"
                        ? "border-oha_primary bg-blue-50 text-oha_primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Individual Hives
                  </button>
                </div>
              </div>

              {/* Investment-based Assignment */}
              {assignmentMode === "investment" && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">
                    Select Investments
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {investmentGroups.map((group) => (
                      <div
                        key={group.investmentId}
                        onClick={() =>
                          toggleInvestmentSelection(group.investmentId)
                        }
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedInvestments.includes(group.investmentId)
                            ? "border-oha_primary bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                Investment #{group.investmentId}
                              </span>
                              {selectedInvestments.includes(
                                group.investmentId
                              ) && (
                                <Check className="w-4 h-4 text-oha_primary" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Investor: {group.investorEmail}
                            </p>
                            <p className="text-sm text-gray-600">
                              Amount: GHS{" "}
                              {parseFloat(
                                group.investmentAmount
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                              {group.hiveCount} hives
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Hive Selection */}
              {assignmentMode === "individual" && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">
                    Select Individual Hives
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {unassignedHives.map((hive) => (
                      <div
                        key={hive.id}
                        onClick={() => toggleHiveSelection(hive.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedHives.includes(hive.id)
                            ? "border-oha_primary bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {hive.hive_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {hive.location}
                            </p>
                            <p className="text-xs text-gray-400">
                              {hive.hive_type}
                            </p>
                          </div>
                          {selectedHives.includes(hive.id) && (
                            <Check className="w-4 h-4 text-oha_primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {assignmentMode === "investment"
                  ? `${selectedInvestments.length} investment(s) selected`
                  : `${selectedHives.length} hive(s) selected`}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignment}
                  disabled={
                    !selectedFarmer ||
                    isAssigning ||
                    (assignmentMode === "investment"
                      ? selectedInvestments.length === 0
                      : selectedHives.length === 0)
                  }
                  className="px-6 py-2 bg-oha_primary text-white rounded-lg hover:bg-oha_primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAssigning ? "Assigning..." : "Assign Hives"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssignHivesModal;
