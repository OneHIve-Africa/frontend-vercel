/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  X,
  UserPlus,
  Loader2,
  Check,
} from "lucide-react";
import UserAccessApi, { UserDetails } from "../api/UserAccessApi";
import toast from "react-hot-toast";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: UserDetails) => void;
}

const GHANA_REGIONS = [
  "Ashanti",
  "Volta",
  "Eastern",
  "Northern",
  "Central",
  "Greater Accra",
  "Western",
  "Bono",
  "Bono East",
  "Ahafo",
  "Upper East",
  "Upper West",
  "Savannah",
  "North East",
  "Oti",
  "Western North",
];

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "password123",
    role: "field_agent" as "admin" | "field_agent",
    assigned_region: "Ashanti",
    department: "Field Operations",
  });

  const [permissions, setPermissions] = useState({
    manage_fulfillment_hubs: true,
    record_honey_intake: true,
    record_honey_sales: false,
    manage_farmers: true,
    manage_beehives: true,
    view_financials: false,
    manage_users: false,
    view_audit_logs: true,
  });

  const handleRoleChange = (role: "admin" | "field_agent") => {
    setFormData((prev) => ({
      ...prev,
      role,
      department: role === "admin" ? "Administration" : "Field Operations",
    }));

    if (role === "admin") {
      setPermissions({
        manage_fulfillment_hubs: true,
        record_honey_intake: true,
        record_honey_sales: true,
        manage_farmers: true,
        manage_beehives: true,
        view_financials: true,
        manage_users: true,
        view_audit_logs: true,
      });
    } else {
      setPermissions({
        manage_fulfillment_hubs: true,
        record_honey_intake: true,
        record_honey_sales: false,
        manage_farmers: true,
        manage_beehives: true,
        view_financials: false,
        manage_users: false,
        view_audit_logs: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await UserAccessApi.getInstance().createUser({
        ...formData,
        permissions,
      });

      if (res.data) {
        toast.success(
          `Created ${formData.role === "admin" ? "Admin" : "Field Agent"} account for ${formData.email}`
        );
        onSuccess(res.data);
        onClose();
      } else {
        toast.error("Failed to create user account");
      }
    } catch (err: any) {
      toast.error(err?.error || err?.detail || "Error creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-stone-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-oha_primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Add Team Member
              </h3>
              <p className="text-xs text-gray-500">
                Onboard an Administrator or Regional Field Agent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 text-xs text-gray-700 overflow-y-auto flex-1"
        >
          {/* Role Selection Tabs */}
          <div>
            <label className="block font-medium text-gray-700 mb-1.5">
              Account Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange("field_agent")}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  formData.role === "field_agent"
                    ? "border-oha_primary bg-orange-50/50 ring-1 ring-oha_primary"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-xs">
                    Field Agent / Officer
                  </span>
                  {formData.role === "field_agent" && (
                    <Check className="w-4 h-4 text-oha_primary" />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Operates fulfillment hubs, intakes honey & registers local farmers
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  formData.role === "admin"
                    ? "border-oha_primary bg-orange-50/50 ring-1 ring-oha_primary"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-xs">
                    System Administrator
                  </span>
                  {formData.role === "admin" && (
                    <Check className="w-4 h-4 text-oha_primary" />
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Full administrative permissions across platform operations
                </p>
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kwabena"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Owusu"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Email & Initial Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. k.owusu@onehive.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Initial Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Region & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Assigned Region
              </label>
              <select
                value={formData.assigned_region}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_region: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs text-gray-900"
              >
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r} Region
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Permissions preview info */}
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-[11px] text-gray-600">
            <span className="font-semibold text-gray-800 block mb-1">
              {formData.role === "field_agent"
                ? "Field Agent Permissions Included:"
                : "Full Administrator Access Included:"}
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              <li>Manage assigned Fulfillment Centers</li>
              <li>Record honey intake & quality tests with QR passports</li>
              <li>Onboard and link beekeepers</li>
              {formData.role === "admin" && (
                <>
                  <li>Execute offtake sales & commercial distribution</li>
                  <li>Access financial reporting and payouts</li>
                  <li>Manage system users and access controls</li>
                </>
              )}
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-oha_primary hover:bg-orange-500 text-white text-xs font-medium rounded-full px-6 py-2 transition disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>
                {isSubmitting
                  ? "Creating..."
                  : `Create ${formData.role === "admin" ? "Admin" : "Field Agent"}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
