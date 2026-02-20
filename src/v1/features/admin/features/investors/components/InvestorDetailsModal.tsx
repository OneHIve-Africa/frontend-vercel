/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import { InvestorDetails, InvestmentDetails } from "@/v1/api/InvestorsApi";

interface InvestorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: InvestorDetails | null;
  investments: InvestmentDetails[];
}

const InvestorDetailsModal: React.FC<InvestorDetailsModalProps> = ({
  isOpen,
  onClose,
  investor,
  investments,
}) => {
  if (!investor) return null;

  // Get investor's investments
  const investorInvestments = investments.filter(
    (inv) => inv.user_profile === investor.id
  );

  // Calculate totals
  const totalActiveInvestments = investorInvestments.filter(
    (inv) => inv.investment_status === "active"
  ).length;
  const totalInterestEarned = investorInvestments.reduce(
    (sum, inv) => sum + inv.interest_earned,
    0
  );
  // const totalInterestToBePaid = investorInvestments.reduce(
  //   (sum, inv) => sum + inv.interest_to_be_earned,
  //   0
  // );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toLocaleString()}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Investor Details - {investor.first_name} {investor.last_name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* Personal Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">
                        {investor.first_name} {investor.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">
                        {investor.user_email}
                      </p>
                      {investor.profile_email &&
                        investor.profile_email !== investor.user_email && (
                          <p className="text-sm text-gray-500">
                            Profile: {investor.profile_email}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Numbers</p>
                      <p className="font-semibold text-gray-900">
                        {investor.primary_phone || "Not provided"}
                      </p>
                      {investor.other_phone && (
                        <p className="text-sm text-gray-500">
                          Alt: {investor.other_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">
                        {investor.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Investment Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Investment Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-600 mb-1">
                        Total Investment
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatCurrency(investor.total_investment)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-600 mb-1">Total Hives</p>
                      <p className="text-lg font-bold text-green-900">
                        {investor.total_hives}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-purple-600 mb-1">
                        Interest Earned
                      </p>
                      <p className="text-lg font-bold text-purple-900">
                        {formatCurrency(totalInterestEarned)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-orange-600 mb-1">
                        Active Investments
                      </p>
                      <p className="text-lg font-bold text-orange-900">
                        {totalActiveInvestments}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment History */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Investment History
                </h3>

                {investorInvestments.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {investorInvestments.map((investment) => (
                      <div
                        key={investment.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              Investment #{investment.id}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                                investment.investment_status
                              )} capitalize`}
                            >
                              {investment.investment_status}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(investment.amount)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Investment Date</p>
                            <p className="font-medium">
                              {formatDate(investment.investment_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Maturity Date</p>
                            <p className="font-medium">
                              {formatDate(investment.maturity_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">ROI</p>
                            <p className="font-medium">{investment.roi}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Hives</p>
                            <p className="font-medium">
                              {investment.number_of_hives}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No investments found for this investor</p>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Joined Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(investor.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-semibold text-gray-900">
                        {investor.user_username || "Not set"}
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

export default InvestorDetailsModal;
