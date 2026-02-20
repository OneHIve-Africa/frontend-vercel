import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Edit } from "lucide-react";
import { HiveItem } from "@/v1/api/Beehives";
import BeehivesApi from "@/v1/api/Beehives";
import toast from "react-hot-toast";

interface HiveEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  hive: HiveItem | null;
  onSave: () => void;
}

const HiveEditModal: React.FC<HiveEditModalProps> = ({
  isOpen,
  onClose,
  hive,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    status: "inactive" as "completed" | "in_progress" | "inactive",
    needs_maintenance: false,
    is_colonized: false,
    honey_produced: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when hive changes
  useEffect(() => {
    if (hive) {
      setFormData({
        status: hive.status,
        needs_maintenance: hive.needs_maintenance,
        is_colonized: hive.is_colonized,
        honey_produced: hive.honey_produced,
      });
    }
  }, [hive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hive) return;

    try {
      setIsLoading(true);
      const api = BeehivesApi.getInstance();
      
      // Include required fields from original hive data
      const updateData = {
        ...formData,
        location: hive.location, // Include original location
        hive_type: hive.hive_type, // Include original hive_type
      };
      
      const response = await api.updateHive(hive.id, updateData);

      if (response.data) {
        toast.success("Hive updated successfully!");
        onSave();
        onClose();
      } else {
        toast.error(response.message || "Failed to update hive");
      }
    } catch (error) {
      console.error("Error updating hive:", error);
      toast.error("Failed to update hive. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  if (!hive) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white">
              <div className="flex items-center gap-3">
                <Edit className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Hive - {hive.hive_id}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Read-only fields */}
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Location
                      </label>
                      <p className="text-sm text-gray-900">{hive.location}</p>
                    </div>

                    <div className="p-3 bg-gray-100 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Hive Type
                      </label>
                      <p className="text-sm text-gray-900">
                        {hive.hive_type === "ktbh" && "Kenya Top Bar"}
                        {hive.hive_type === "langstroth" && "Langstroth"}
                        {hive.hive_type === "saltpond" && "Saltpond"}
                      </p>
                    </div>

                    {/* Editable fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-oha_primary focus:ring-2 focus:ring-oha_primary/20 outline-none"
                      >
                        <option value="inactive">Inactive</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Honey Produced (Litres)
                      </label>
                      <input
                        type="number"
                        name="honey_produced"
                        value={formData.honey_produced}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-oha_primary focus:ring-2 focus:ring-oha_primary/20 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Conditions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="is_colonized"
                        name="is_colonized"
                        checked={formData.is_colonized}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-oha_primary bg-gray-100 border-gray-300 rounded focus:ring-oha_primary focus:ring-2"
                      />
                      <label
                        htmlFor="is_colonized"
                        className="text-sm font-medium text-gray-900"
                      >
                        Hive is colonized
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="needs_maintenance"
                        name="needs_maintenance"
                        checked={formData.needs_maintenance}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                      />
                      <label
                        htmlFor="needs_maintenance"
                        className="text-sm font-medium text-gray-900"
                      >
                        Needs maintenance
                      </label>
                    </div>
                  </div>
                </div>

                {/* Read-only Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Read-only Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Hive ID
                      </label>
                      <p className="text-sm text-gray-900">{hive.hive_id}</p>
                    </div>

                    <div className="p-3 bg-gray-100 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Assigned Farmer
                      </label>
                      <p className="text-sm text-gray-900">
                        {hive.assigned_farmer_name || "Unassigned"}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-100 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Investor Email
                      </label>
                      <p className="text-sm text-gray-900">
                        {hive.investor_email || "N/A"}
                      </p>
                    </div>

                    {hive.investment_id && (
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Investment ID
                        </label>
                        <p className="text-sm text-gray-900">
                          #{hive.investment_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 bg-white">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-oha_primary text-white rounded-lg hover:bg-oha_primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HiveEditModal;
