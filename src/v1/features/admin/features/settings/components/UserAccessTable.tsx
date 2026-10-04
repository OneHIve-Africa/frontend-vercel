/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  RefreshCw,
  Sliders,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  UserX,
} from "lucide-react";
import UserAccessApi, {
  UserDetails,
  RoleCounts,
} from "../api/UserAccessApi";
import { toast } from "react-hot-toast";
import { LoadingAnimation, PaginationTable } from "@/v1/components";
import { createColumnHelper } from "@tanstack/react-table";
import ManagePermissionsModal from "./ManagePermissionsModal";
import CreateUserModal from "./CreateUserModal";

const ROLE_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  admin: {
    label: "Administrator",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  field_agent: {
    label: "Field Agent",
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  farmer: {
    label: "Farmer",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  investor: {
    label: "Investor",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
};

const UserAccessTable: React.FC = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [counts, setCounts] = useState<RoleCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<UserDetails | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [usersRes, countsRes] = await Promise.all([
        UserAccessApi.getInstance().listUsers({
          role: roleFilter,
          status: statusFilter,
          search: searchQuery.trim() || undefined,
        }),
        UserAccessApi.getInstance().getRoleCounts(),
      ]);

      if (usersRes.data) {
        setUsers(usersRes.data.results || []);
      }
      if (countsRes.data) {
        setCounts(countsRes.data);
      }
    } catch (error) {
      console.error("Failed to load users", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleStatusToggle = async (user: UserDetails) => {
    const actionName = user.is_active ? "suspend" : "activate";
    if (!window.confirm(`Are you sure you want to ${actionName} account ${user.email}?`)) {
      return;
    }

    try {
      const response = await UserAccessApi.getInstance().toggleStatus(user.id);
      if (response.data) {
        const newStatus = response.data.is_active;
        toast.success(`User ${user.email} ${newStatus ? "activated" : "suspended"}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
        );
        fetchUsers();
      } else {
        toast.error(response.error as string);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Filter users by client search if typed
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.assigned_region && u.assigned_region.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
    );
  }, [users, searchQuery]);

  const fallbackCounts = useMemo(() => {
    const map = {
      all: users.length,
      admin: 0,
      field_agent: 0,
      farmer: 0,
      investor: 0,
    };
    users.forEach((u) => {
      const r = u.role?.toLowerCase() || "";
      if (r === "admin" || u.is_superuser) {
        map.admin++;
      } else if (r === "field_agent") {
        map.field_agent++;
      } else if (r === "farmer") {
        map.farmer++;
      } else {
        map.investor++;
      }
    });
    return map;
  }, [users]);

  const columnHelper = createColumnHelper<UserDetails>();

  const columns = [
    columnHelper.accessor("full_name", {
      id: "user",
      header: () => <span>User Details</span>,
      cell: (info) => {
        const user = info.row.original;
        const initials =
          (user.first_name?.[0] || "") + (user.last_name?.[0] || "") ||
          user.email.substring(0, 2).toUpperCase();

        return (
          <div className="flex items-center space-x-3 py-1">
            <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-xs text-stone-700 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-gray-900 truncate">
                {user.full_name || user.email}
              </span>
              <span className="text-[11px] text-gray-500 truncate flex items-center space-x-1">
                <Mail className="w-3 h-3 text-gray-400 shrink-0 inline mr-0.5" />
                <span>{user.email}</span>
              </span>
              {user.phone && (
                <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <Phone className="w-2.5 h-2.5 text-gray-400 shrink-0 inline mr-0.5" />
                  <span>{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      id: "role",
      header: () => <span>System Role</span>,
      cell: (info) => {
        const user = info.row.original;
        const roleKey = user.role || (user.is_superuser ? "admin" : "investor");
        const badge = ROLE_BADGES[roleKey] || {
          label: roleKey,
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };

        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        );
      },
    }),
    columnHelper.accessor("assigned_region", {
      id: "region",
      header: () => <span>Region & Dept</span>,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="text-xs">
            {user.assigned_region ? (
              <span className="flex items-center text-gray-800 font-medium space-x-1">
                <MapPin className="w-3 h-3 text-oha_primary shrink-0" />
                <span>{user.assigned_region}</span>
              </span>
            ) : (
              <span className="text-gray-400 text-[11px]">All Regions</span>
            )}
            {user.department && (
              <span className="block text-[11px] text-gray-500">
                {user.department}
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("permissions", {
      id: "permissions",
      header: () => <span>Permissions</span>,
      cell: (info) => {
        const user = info.row.original;
        if (user.is_superuser || user.role === "admin") {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              Full Administrative Access
            </span>
          );
        }

        const perms = user.permissions || {};
        const activePermsCount = Object.values(perms).filter(Boolean).length;

        if (activePermsCount === 0) {
          return (
            <span className="text-[11px] text-gray-400">
              Standard {user.role || "User"}
            </span>
          );
        }

        return (
          <div className="flex items-center space-x-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
              {activePermsCount} permissions active
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("is_active", {
      id: "status",
      header: () => <span>Status</span>,
      cell: (info) => {
        const isActive = info.getValue();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isActive ? "Active" : "Suspended"}
          </span>
        );
      },
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: () => <span>Actions</span>,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSelectedUserForPerms(user)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium transition cursor-pointer"
              title="Configure permissions"
            >
              <Sliders className="w-3 h-3 text-oha_primary" />
              <span>Permissions</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusToggle(user)}
              className={`p-1 rounded text-xs transition cursor-pointer ${
                user.is_active
                  ? "text-red-600 hover:bg-red-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
              title={user.is_active ? "Suspend account" : "Activate account"}
            >
              {user.is_active ? (
                <UserX className="w-3.5 h-3.5" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      },
    }),
  ];

  const rolePills = [
    { label: "All Users", value: "all", count: counts?.all ?? (roleFilter === "all" ? fallbackCounts.all : users.length) },
    { label: "Administrators", value: "admin", count: counts?.admin ?? fallbackCounts.admin },
    { label: "Field Agents", value: "field_agent", count: counts?.field_agent ?? fallbackCounts.field_agent },
    { label: "Farmers", value: "farmer", count: counts?.farmer ?? fallbackCounts.farmer },
    { label: "Investors", value: "investor", count: counts?.investor ?? fallbackCounts.investor },
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
        {/* Role Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar bg-stone-100/80 p-1 rounded-xl">
          {rolePills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setRoleFilter(pill.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                roleFilter === pill.value
                  ? "bg-white text-gray-900 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  roleFilter === pill.value
                    ? "bg-orange-100 text-oha_primary font-bold"
                    : "bg-gray-200/80 text-gray-600"
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right side: Search, Status filter, Add User */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-oha_primary"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-700 bg-white focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Suspended</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchUsers}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
            title="Refresh user list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Add Team Member */}
          <button
            onClick={() => setIsCreateUserOpen(true)}
            className="bg-oha_primary hover:bg-orange-500 text-white text-xs font-medium rounded-full px-4 py-2 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add team member</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <PaginationTable
          TableData={filteredUsers}
          columns={columns as any}
          title="User Access Controls"
        />
      )}

      {/* Modals */}
      {selectedUserForPerms && (
        <ManagePermissionsModal
          isOpen={!!selectedUserForPerms}
          onClose={() => setSelectedUserForPerms(null)}
          user={selectedUserForPerms}
          onSuccess={(updated) => {
            setUsers((prev) =>
              prev.map((u) => (u.id === updated.id ? updated : u))
            );
            fetchUsers();
          }}
        />
      )}

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </div>
  );
};

export default UserAccessTable;
