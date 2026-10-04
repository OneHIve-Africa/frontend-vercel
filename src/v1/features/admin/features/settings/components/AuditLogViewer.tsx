/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Clock,
  FileText,
} from "lucide-react";
import AuditLogApi, {
  AuditLog,
  AuditLogStats,
} from "../api/AuditLogApi";
import { LoadingAnimation, PaginationTable } from "@/v1/components";
import { createColumnHelper } from "@tanstack/react-table";
import toast from "react-hot-toast";

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LOGIN: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  LOGOUT: { bg: "bg-stone-50", text: "text-stone-700", border: "border-stone-200" },
  FAILED_LOGIN: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  USER_CREATE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  USER_UPDATE: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  USER_STATUS_CHANGE: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  PERMISSION_CHANGE: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  CENTER_CREATE: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  CENTER_UPDATE: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  INTAKE_RECORDED: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  SALE_RECORDED: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  PAYOUT_UPDATED: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  FARMER_ATTACHED: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  SYSTEM_CONFIG: { bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-300" },
  SECURITY_ALERT: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
};

const CATEGORIES = [
  { label: "All Events", value: "all" },
  { label: "Authentication & Logins", value: "auth" },
  { label: "User Access & Permissions", value: "users" },
  { label: "Fulfillment & Traceability", value: "fulfillment" },
  { label: "Security & Config", value: "security" },
];

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        AuditLogApi.getInstance().listLogs({
          category,
          search: searchQuery.trim() || undefined,
        }),
        AuditLogApi.getInstance().getStats(),
      ]);

      if (logsRes.data) {
        setLogs(logsRes.data.results || []);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [category]);

  const columnHelper = createColumnHelper<AuditLog>();

  const columns = [
    columnHelper.accessor("formatted_date", {
      id: "timestamp",
      header: () => <span>Timestamp</span>,
      cell: (info) => (
        <div className="flex items-center space-x-1.5 text-xs text-gray-700 font-mono whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{info.getValue() || info.row.original.timestamp}</span>
        </div>
      ),
    }),
    columnHelper.accessor("actor_name", {
      id: "actor",
      header: () => <span>Actor</span>,
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-gray-900">
              {item.actor_name || item.actor_email}
            </span>
            <span className="text-[11px] text-gray-500 font-mono truncate max-w-[170px]">
              {item.actor_email}
            </span>
            {item.actor_role && (
              <span className="text-[10px] text-stone-600 capitalize">
                Role: {item.actor_role}
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("action", {
      id: "action",
      header: () => <span>Action Type</span>,
      cell: (info) => {
        const action = info.getValue();
        const style = ACTION_COLORS[action] || {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono border ${style.bg} ${style.text} ${style.border}`}
          >
            {action.replace(/_/g, " ")}
          </span>
        );
      },
    }),
    columnHelper.accessor("resource_type", {
      id: "resource",
      header: () => <span>Resource</span>,
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="text-xs">
            <span className="font-medium text-gray-800">
              {item.resource_type}
            </span>
            {item.resource_id && (
              <span className="block text-[11px] font-mono text-gray-500">
                ID: {item.resource_id}
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("description", {
      id: "description",
      header: () => <span>Event Description</span>,
      cell: (info) => (
        <p className="text-xs text-gray-700 max-w-sm line-clamp-2 leading-relaxed">
          {info.getValue()}
        </p>
      ),
    }),
    columnHelper.accessor("ip_address", {
      id: "ip_address",
      header: () => <span>IP Address</span>,
      cell: (info) => (
        <span className="font-mono text-[11px] text-gray-500">
          {info.getValue() || "Internal"}
        </span>
      ),
    }),
    columnHelper.accessor("id", {
      id: "details",
      header: () => <span>Details</span>,
      cell: (info) => (
        <button
          type="button"
          onClick={() => setSelectedLog(info.row.original)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-oha_primary transition cursor-pointer"
          title="Inspect log details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    }),
  ];

  const statCards = [
    {
      label: "Total Audit Events",
      value: stats?.total_events || logs.length,
      color: "bg-oha_secondary",
    },
    {
      label: "Security & Auth Events",
      value: stats?.security_events || 0,
      color: "bg-oha_primary",
    },
    {
      label: "Operations & Intakes",
      value: stats?.operational_events || 0,
      color: "bg-yellow-500",
    },
    {
      label: "System Actors",
      value: stats?.unique_actors || 0,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards matching native OneHive aesthetic */}
      <div className="bg-white rounded-md p-6 border border-gray-100 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ label, value, color }) => (
            <div key={label} className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${color} shrink-0`} />
              <div>
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="text-2xl font-bold text-gray-900 mt-0.5 font-sans">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1 bg-stone-100/80 p-1 rounded-lg overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                category === cat.value
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchLogs();
              }}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-oha_primary"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <PaginationTable
          TableData={logs}
          columns={columns as any}
          title="System Audit Trail"
        />
      )}

      {/* Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden my-6">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-oha_primary" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Audit Event Details
                  </h3>
                  <span className="text-xs font-mono text-gray-500">
                    ID #{selectedLog.id} • {selectedLog.action}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-gray-700 max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-stone-50 rounded-lg space-y-1.5 border border-stone-200">
                <p>
                  <strong>Actor:</strong> {selectedLog.actor_name} ({selectedLog.actor_email})
                </p>
                <p>
                  <strong>Role:</strong> <span className="capitalize">{selectedLog.actor_role || "User"}</span>
                </p>
                <p>
                  <strong>Timestamp:</strong> {selectedLog.formatted_date || selectedLog.timestamp}
                </p>
                <p>
                  <strong>IP Address:</strong> {selectedLog.ip_address || "Internal System"}
                </p>
                {selectedLog.user_agent && (
                  <p className="text-[11px] text-gray-500 truncate">
                    <strong>User Agent:</strong> {selectedLog.user_agent}
                  </p>
                )}
              </div>

              <div>
                <span className="font-semibold text-gray-800 block mb-1">
                  Description
                </span>
                <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200">
                  {selectedLog.description}
                </p>
              </div>

              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <span className="font-semibold text-gray-800 block mb-1">
                    Recorded Changes / Metadata Diff
                  </span>
                  <pre className="bg-stone-900 text-stone-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-52">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
