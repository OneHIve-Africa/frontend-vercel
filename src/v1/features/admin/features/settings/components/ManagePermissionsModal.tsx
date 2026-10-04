/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Building2,
  Wheat,
  Sliders,
  Save,
  Loader2,
} from "lucide-react";
import UserAccessApi, {
  UserDetails,
  UserPermissions,
} from "../api/UserAccessApi";
import toast from "react-hot-toast";

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetails | null;
  onSuccess: (updatedUser: UserDetails) => void;
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

const ManagePermissionsModal: React.FC<ManagePermissionsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<string>("investor");
  const [assignedRegion, setAssignedRegion] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [permissions, setPermissions] = useState<UserPermissions>({
    manage_fulfillment_hubs: false,
    record_honey_intake: false,
    record_honey_sales: false,
    manage_farmers: false,
    manage_beehives: false,
    view_financials: false,
    manage_users: false,
    view_audit_logs: false,
  });

  useEffect(() => {
    if (user) {
      setRole(user.role || "investor");
      setAssignedRegion(user.assigned_region || "Ashanti");
      setDepartment(user.department || "");
      if (user.permissions) {
        setPermissions({
          manage_fulfillment_hubs: !!user.permissions.manage_fulfillment_hubs,
          record_honey_intake: !!user.permissions.record_honey_intake,
          record_honey_sales: !!user.permissions.record_honey_sales,
          manage_farmers: !!user.permissions.manage_farmers,
          manage_beehives: !!user.permissions.manage_beehives,
          view_financials: !!user.permissions.view_financials,
          manage_users: !!user.permissions.manage_users,
          view_audit_logs: !!user.permissions.view_audit_logs,
        });
      }
    }
  }, [user]);

  // Apply Role Presets
  const applyPreset = (presetType: "admin" | "field_agent" | "read_only") => {
    if (presetType === "admin") {
      setRole("admin");
      setDepartment("Administration");
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
      toast.success("Applied Administrator preset");
    } else if (presetType === "field_agent") {
      setRole("field_agent");
      setDepartment("Field Operations");
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
      toast.success("Applied Field Agent preset");
    } else {
      setPermissions({
        manage_fulfillment_hubs: false,
        record_honey_intake: false,
        record_honey_sales: false,
        manage_farmers: false,
        manage_beehives: false,
        view_financials: false,
        manage_users: false,
        view_audit_logs: true,
      });
      toast.success("Applied Read-Only preset");
    }
  };

  const handleToggle = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      const res = await UserAccessApi.getInstance().updatePermissions(user.id, {
        role,
        permissions,
        assigned_region: assignedRegion,
        department,
        notes,
      });

      if (res.data) {
        toast.success(`Access permissions updated for ${user.email}`);
        onSuccess(res.data);
        onClose();
      } else {
        toast.error("Failed to update user permissions");
      }
    } catch (err: any) {
      toast.error(err?.error || err?.detail || "Error updating permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-stone-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-oha_primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Manage Access & Permissions
              </h3>
              <p className="text-xs text-gray-500">
                Configure role, operational region, and feature permissions for{" "}
                <span className="font-semibold text-gray-700">{user.email}</span>
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

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-5 text-xs text-gray-700 overflow-y-auto flex-1"
        >
          {/* User Summary & Quick Presets */}
          <div className="p-3 bg-white rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-gray-400 uppercase font-semibold">
                User Account
              </span>
              <p className="text-sm font-bold text-gray-900">
                {user.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-gray-500 font-medium">
                Presets:
              </span>
              <button
                type="button"
                onClick={() => applyPreset("admin")}
                className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium transition cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => applyPreset("field_agent")}
                className="px-2.5 py-1 rounded bg-orange-100 hover:bg-orange-200 text-orange-900 text-[11px] font-medium transition cursor-pointer"
              >
                Field Agent
              </button>
              <button
                type="button"
                onClick={() => applyPreset("read_only")}
                className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium transition cursor-pointer"
              >
                Read Only
              </button>
            </div>
          </div>

          {/* Role & Region Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs text-gray-900 capitalize"
              >
                <option value="admin">Administrator</option>
                <option value="field_agent">Field Agent / Officer</option>
                <option value="farmer">Farmer</option>
                <option value="investor">Investor</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Operational Region
              </label>
              <select
                value={assignedRegion}
                onChange={(e) => setAssignedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary bg-white text-xs text-gray-900"
              >
                <option value="">National / All Regions</option>
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
                placeholder="e.g. Field Operations"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Granular Permission Toggles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-oha_primary" />
              <span>Granular Permissions Matrix</span>
            </h4>

            {/* Group 1: Fulfillment & Traceability */}
            <div className="bg-stone-50/70 border border-stone-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-stone-800 font-semibold text-xs border-b border-stone-200 pb-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-600" />
                <span>Fulfillment Centers & Honey Traceability</span>
              </div>

              <div className="space-y-2 pl-1">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.manage_fulfillment_hubs}
                    onChange={() => handleToggle("manage_fulfillment_hubs")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Manage Fulfillment Hubs
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Create, update, and configure regional honey collection and processing hubs.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.record_honey_intake}
                    onChange={() => handleToggle("record_honey_intake")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Record Honey Intake & Traceability
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Accept raw honey deliveries from beekeepers, log refractometer moisture tests, and issue scannable QR passports.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.record_honey_sales}
                    onChange={() => handleToggle("record_honey_sales")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Record Offtake Honey Sales
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Execute commercial batch distribution to buyers (e.g. food processors, retailers).
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Group 2: Agricultural Operations */}
            <div className="bg-stone-50/70 border border-stone-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-stone-800 font-semibold text-xs border-b border-stone-200 pb-1.5">
                <Wheat className="w-3.5 h-3.5 text-green-600" />
                <span>Agricultural Field Operations</span>
              </div>

              <div className="space-y-2 pl-1">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.manage_farmers}
                    onChange={() => handleToggle("manage_farmers")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Manage & Onboard Farmers
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Register beekeepers, inspect apiaries, and link farmers to regional fulfillment hubs.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.manage_beehives}
                    onChange={() => handleToggle("manage_beehives")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Manage Beehives & Apiaries
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Track beehive installation, colonization milestones, and periodic health audits.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Group 3: Financial & Governance */}
            <div className="bg-stone-50/70 border border-stone-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-stone-800 font-semibold text-xs border-b border-stone-200 pb-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Governance, Financials & Audit</span>
              </div>

              <div className="space-y-2 pl-1">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.view_financials}
                    onChange={() => handleToggle("view_financials")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      View Financial Performance
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Access financial ledgers, revenue numbers, and farmer payout aggregations.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.manage_users}
                    onChange={() => handleToggle("manage_users")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      Manage Users & Access Controls
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Assign roles, activate/suspend accounts, and configure operational permissions.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.view_audit_logs}
                    onChange={() => handleToggle("view_audit_logs")}
                    className="mt-0.5 rounded text-oha_primary focus:ring-oha_primary cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      View System Audit Logs
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Inspect compliance audit trail, login security events, and operator activity records.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Operational Notes */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Internal Notes / Operational Assignment
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Assigned to Ejura & Mampong districts for 2026 harvest season..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-oha_primary text-xs text-gray-900 resize-none"
            />
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
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? "Saving..." : "Save permissions"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagePermissionsModal;
