import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  Edit,
  MapPin,
  User,
  Package,
  Calendar,
  Droplets,
} from "lucide-react";
import { HiveItem } from "@/v1/api/Beehives";

interface HiveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hive: HiveItem | null;
  onEdit: (hive: HiveItem) => void;
}

const HiveDetailsModal: React.FC<HiveDetailsModalProps> = ({
  isOpen,
  onClose,
  hive,
  onEdit,
}) => {
  if (!hive) return null;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Hive Details - {hive.hive_id}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(hive)}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600"
                  title="Edit Hive"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hive ID</p>
                      <p className="font-semibold text-gray-900">
                        {hive.hive_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">
                        {hive.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hive Type</p>
                      <p className="font-semibold text-gray-900">
                        {getHiveTypeDisplay(hive.hive_type)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Assigned Farmer</p>
                      <p className="font-semibold text-gray-900">
                        {hive.assigned_farmer_name || (
                          <span className="text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-lg">📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Investor Email</p>
                      <p className="font-semibold text-gray-900">
                        {hive.investor_email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Droplets className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Honey Produced</p>
                      <p className="font-semibold text-gray-900">
                        {hive.honey_produced} L
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Conditions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status & Conditions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                        hive.status
                      )} capitalize`}
                    >
                      {hive.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Colonization</p>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          hive.is_colonized ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          hive.is_colonized ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {hive.is_colonized ? "Colonized" : "Uncolonized"}
                      </span>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Maintenance</p>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          hive.needs_maintenance
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${
                          hive.needs_maintenance
                            ? "text-yellow-700"
                            : "text-green-700"
                        }`}
                      >
                        {hive.needs_maintenance
                          ? "Needs Maintenance"
                          : "Good Condition"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Information */}
              {hive.investment_id && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Investment Information
                  </h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600">Investment ID</p>
                        <p className="font-semibold text-blue-900">
                          #{hive.investment_id}
                        </p>
                      </div>
                      {hive.investment_amount && (
                        <div>
                          <p className="text-sm text-blue-600">
                            Investment Amount
                          </p>
                          <p className="font-semibold text-blue-900">
                            GHS{" "}
                            {parseFloat(
                              hive.investment_amount
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDate(hive.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDate(hive.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HiveDetailsModal;
