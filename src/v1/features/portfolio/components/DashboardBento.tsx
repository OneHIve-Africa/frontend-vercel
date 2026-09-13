import { useState } from "react";
import { Investment } from "@/v1/api/types";
import { DashboardStats } from "@/v1/api/InvestorDashboardApi";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { dateUtils } from "@/v1/utils/dateutils";
import { abstract } from "@/assets";
import HarvestCountdownWidget from "./HarvestCountdownWidget";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import React, { useId } from "react";

// ─────────────────────────────────────────────────────────────
// Mini Sparkline
// ─────────────────────────────────────────────────────────────
const MiniSparkline: React.FC<{
  data: number[];
  color: string;
  gradId: string;
}> = ({ data, color, gradId }) => {
  const chartData = data.map((v) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─────────────────────────────────────────────────────────────
// ROI Gauge — SVG arc
// ─────────────────────────────────────────────────────────────
const ROIGauge: React.FC<{ value: number }> = ({ value }) => {
  const r = 52;
  const cx = 70;
  const cy = 68;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startDeg = 210;
  const sweepDeg = 270;
  const fillDeg = startDeg + sweepDeg * Math.min(Math.max(value, 0), 100) / 100;
  const endDeg = startDeg + sweepDeg;

  const arc = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const s = arc(startDeg);
  const e = arc(endDeg);
  const f = arc(fillDeg);
  const fLarge = fillDeg - startDeg > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 140 105" className="w-full max-w-[170px] mx-auto">
      <path
        d={`M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`}
        fill="none"
        stroke="#e7e5e4"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {value > 0 && (
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${fLarge} 1 ${f.x} ${f.y}`}
          fill="none"
          stroke="#1b9d3c"
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#1c1917" fontSize="20" fontWeight="700" fontFamily="inherit">
        {value.toFixed(0)}%
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="#a8a29e" fontSize="8" fontFamily="inherit">
        Avg. Portfolio APR
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Investment Table — search + filter + pagination on real data
// ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 5;

type InvStatus = Investment["investment_status"] | "all";

const STATUS_LABELS: Record<InvStatus, string> = {
  all: "All",
  active: "Active",
  matured: "Matured",
  cancelled: "Cancelled",
};

const STATUS_COLOURS: Record<string, string> = {
  active:    "bg-emerald-100 text-emerald-700",
  matured:   "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-600",
};

const HIVE_COLOURS: Record<string, string> = {
  active:  "text-emerald-600",
  pending: "text-amber-600",
  lost:    "text-rose-600",
};

const InvestmentTable: React.FC<{
  investments: Investment[];
  onViewTelemetry?: (inv: Investment) => void;
}> = ({ investments, onViewTelemetry }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvStatus>("all");
  const [page, setPage] = useState(1);

  // ─── Filter ───────────────────────────────────
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return investments.filter((inv) => {
      const matchesQuery =
        !q ||
        String(inv.id).includes(q) ||
        inv.amount.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || inv.investment_status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [investments, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  if (!investments || investments.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-sm text-stone-400">No investments found.</p>
        <button
          type="button"
          onClick={() => navigate("/new-investment")}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-[#1b9d3c] text-white px-4 py-2 rounded-xl hover:bg-[#157a2e] transition"
        >
          Explore Investment Tiers
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-stone-100">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); resetPage(); }}
            placeholder="Search by ID or amount…"
            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b9d3c]/30 focus:border-[#1b9d3c] text-stone-800 placeholder:text-stone-400 transition"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.keys(STATUS_LABELS) as InvStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s); resetPage(); }}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                statusFilter === s
                  ? "bg-[#1b9d3c] text-white shadow-sm"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Row count */}
        <span className="text-[11px] text-stone-400 ml-auto shrink-0">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {["ID", "Amount (GHS)", "Date", "Interest Earned", "Maturity", "Inv. Status", "Hive Status", "Telemetry"].map((h) => (
                <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap ${h === "Telemetry" ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-xs text-stone-400">
                  No investments match your search or filter.
                </td>
              </tr>
            ) : (
              pageSlice.map((inv) => (
                <tr key={inv.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-stone-600 font-medium">#{inv.id}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-stone-900">
                    {parseFloat(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                    {dateUtils.formatDate(inv.investment_date)}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-600">
                    {parseFloat(inv.interest_earned).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                    {dateUtils.formatDate(inv.maturity_date)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${STATUS_COLOURS[inv.investment_status] ?? "bg-stone-100 text-stone-600"}`}>
                      {inv.investment_status}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-xs font-medium ${HIVE_COLOURS[inv.hive_status] ?? "text-stone-500"}`}>
                    {inv.hive_status_summary}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewTelemetry && onViewTelemetry(inv)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
                      title="View live sensor telemetry"
                    >
                      <span>🐝 Telemetry</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden divide-y divide-stone-100">
        {pageSlice.length === 0 ? (
          <p className="py-10 text-center text-xs text-stone-400">No records match your search.</p>
        ) : (
          pageSlice.map((inv) => (
            <div key={inv.id} className="px-4 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-stone-500">#{inv.id}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold capitalize ${STATUS_COLOURS[inv.investment_status] ?? "bg-stone-100 text-stone-600"}`}>
                  {inv.investment_status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Amount</span>
                <span className="text-xs font-semibold text-stone-900">GHS {parseFloat(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Date</span>
                <span className="text-xs text-stone-600">{dateUtils.formatDate(inv.investment_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Interest Earned</span>
                <span className="text-xs text-stone-600">{parseFloat(inv.interest_earned).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Maturity</span>
                <span className="text-xs text-stone-600">{dateUtils.formatDate(inv.maturity_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Hive Status</span>
                <span className={`text-xs font-medium ${HIVE_COLOURS[inv.hive_status] ?? "text-stone-500"}`}>{inv.hive_status_summary}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-500">Live Sensors</span>
                <button
                  type="button"
                  onClick={() => onViewTelemetry && onViewTelemetry(inv)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
                >
                  <span>🐝 View Telemetry</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-stone-100 bg-stone-50/60">
          <span className="text-[11px] text-stone-400">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="w-7 text-center text-xs text-stone-400">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n as number)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                      safePage === n
                        ? "bg-[#1b9d3c] text-white shadow-sm"
                        : "text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sparkData: number[];
  sparkColor: string;
  gradId: string;
  /** 'white' = plain card, 'green' = brand green with texture, 'orange' = honey orange with texture */
  variant?: "white" | "green" | "orange";
  trend?: string;
  trendUp?: boolean;
}

const VARIANT_STYLES = {
  white:  { card: "bg-white border border-stone-200/80 shadow-xs", label: "text-stone-500", value: "text-stone-900" },
  green:  { card: "bg-[#1b9d3c] text-white overflow-hidden",        label: "text-green-100",  value: "text-white" },
  orange: { card: "bg-[#f09443] text-white overflow-hidden",        label: "text-orange-100", value: "text-white" },
};

const StatCard: React.FC<StatCardProps> = ({
  label, value, sparkData, sparkColor, gradId, variant = "white", trend, trendUp,
}) => {
  const v = VARIANT_STYLES[variant];
  const coloured = variant !== "white";
  return (
    <div className={`relative rounded-2xl p-4 flex flex-col gap-1.5 min-h-[130px] ${v.card}`}>
      {/* Abstract texture for coloured variants */}
      {coloured && (
        <img
          src={abstract}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.22] mix-blend-soft-light pointer-events-none select-none rounded-2xl"
        />
      )}
      <p className={`relative text-[11px] font-medium ${v.label}`}>{label}</p>
      <p className={`relative text-lg font-bold tracking-tight leading-tight ${v.value}`}>{value}</p>
      {trend !== undefined && (
        <span className={`relative inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit ${
          coloured
            ? "bg-white/20 text-white"
            : trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
        }`}>
          {trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {trend}
        </span>
      )}
      <div className="relative mt-auto pt-1">
        <MiniSparkline
          data={sparkData}
          color={coloured ? "rgba(255,255,255,0.6)" : sparkColor}
          gradId={gradId}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Hive brand colours
// ─────────────────────────────────────────────────────────────
const HIVE_COLORS = {
  ktbh: "#f09443",       // Kenya Top Bar Hive — honey amber
  langstroth: "#1b9d3c", // Langstroth — OneHive green
  saltpond: "#3b82f6",   // Saltpond log-hive — blue
};

const HIVE_LABELS: Record<string, string> = {
  ktbh: "KTBH",
  langstroth: "Langstroth",
  saltpond: "Saltpond",
};

// ─────────────────────────────────────────────────────────────
// DashboardBento
// ─────────────────────────────────────────────────────────────
interface DashboardBentoProps {
  investments: Investment[];
  dashboardStats: DashboardStats;
  onViewTelemetry?: (inv?: Investment) => void;
}

export const DashboardBento: React.FC<DashboardBentoProps> = ({
  investments,
  dashboardStats,
  onViewTelemetry,
}) => {
  const navigate = useNavigate();
  const { profile } = useUserProfileStore();
  const uid = useId().replace(/:/g, "");

  const fullName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : "Investor";

  const initials = `${(profile?.first_name ?? "I").charAt(0)}${(profile?.last_name ?? "P").charAt(0)}`.toUpperCase();

  const timelineAmounts = (dashboardStats.investment_timeline ?? []).map((t) => parseFloat(t.amount) || 0);
  const earningsTrend = (dashboardStats.earnings_trend ?? []).map((t) => parseFloat(t.earnings) || 0);

  const investedSpark = timelineAmounts.length > 1 ? timelineAmounts : [1, 2, 1.5, 3, 2.5, 4, 3.5];
  const earningsSpark = earningsTrend.length > 1 ? earningsTrend : [0, 0.5, 1, 1.5, 2, 1.8, 2.5];
  const hivesSpark = [1, 2, 2, 3, 3, 4, Math.max(dashboardStats.total_hives ?? 1, 1)];
  const returnsSpark = investedSpark.map((v) => v * 0.22);

  const fmt = (s: string) => `GHS ${parseFloat(s || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const avgROI = parseFloat(dashboardStats.average_roi || "0");

  // Build timeline from API data; if absent, derive from the real investments array
  const timelineData = React.useMemo(() => {
    const apiTimeline = (dashboardStats.investment_timeline ?? []).filter(
      (t) => parseFloat(t.amount) > 0
    );
    if (apiTimeline.length > 0) {
      return apiTimeline.map((t) => ({ name: t.month, amount: parseFloat(t.amount) }));
    }
    // Fallback: group investments by month and accumulate amounts
    const byMonth: Record<string, number> = {};
    investments.forEach((inv) => {
      const d = new Date(inv.investment_date);
      const key = `${d.toLocaleString("default", { month: "short" })} '${String(d.getFullYear()).slice(2)}`;
      byMonth[key] = (byMonth[key] ?? 0) + parseFloat(inv.amount || "0");
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, amount]) => ({ name, amount }));
  }, [dashboardStats.investment_timeline, investments]);

  // All 3 hive types — filter zero-value slices from the donut but keep them in the legend
  const hiveBreakdownAll = [
    { key: "ktbh",       name: HIVE_LABELS.ktbh,        value: dashboardStats.hive_breakdown?.ktbh ?? 0,       color: HIVE_COLORS.ktbh },
    { key: "langstroth", name: HIVE_LABELS.langstroth,  value: dashboardStats.hive_breakdown?.langstroth ?? 0, color: HIVE_COLORS.langstroth },
    { key: "saltpond",   name: HIVE_LABELS.saltpond,    value: dashboardStats.hive_breakdown?.saltpond ?? 0,   color: HIVE_COLORS.saltpond },
  ];
  const hivePieData = hiveBreakdownAll.filter((d) => d.value > 0);

  const activities = (dashboardStats.recent_activities ?? []).slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Row 1 — 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Invested" value={fmt(dashboardStats.total_invested)} sparkData={investedSpark} sparkColor="#1b9d3c" gradId={`${uid}a`} />
        <StatCard label="Active Hives" value={`${dashboardStats.total_hives ?? 0} hives`} sparkData={hivesSpark} sparkColor="#f09443" gradId={`${uid}b`} trend={`${dashboardStats.active_investments ?? 0} active`} trendUp />
        <StatCard label="Total Earnings" value={fmt(dashboardStats.total_earnings)} sparkData={earningsSpark} sparkColor="#1b9d3c" gradId={`${uid}c`} />
        <StatCard label="Expected Returns" value={fmt(dashboardStats.expected_returns)} sparkData={returnsSpark} sparkColor="#4ade80" gradId={`${uid}d`} variant="green" />
      </div>

      {/* Row 2 — Area Chart + ROI Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-stone-900">Investment Activity</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" />On track
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">Capital deployed over time</p>
            </div>
            {avgROI > 0 && (
              <div className="text-right shrink-0">
                <p className="text-[11px] text-stone-400">Avg. ROI</p>
                <p className="text-sm font-bold text-[#1b9d3c]">{avgROI.toFixed(1)}% APR</p>
              </div>
            )}
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id={`${uid}area`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1b9d3c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1b9d3c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a8a29e" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a8a29e" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: "12px" }}
                  formatter={(val: unknown) => [`GHS ${Number(val).toLocaleString()}`, "Investment"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#1b9d3c" strokeWidth={2} fill={`url(#${uid}area)`} dot={{ fill: "#1b9d3c", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="text-center">
            <p className="text-[11px] font-medium text-stone-500">Portfolio Returns</p>
            <p className="text-sm font-bold text-stone-900 mt-0.5">Average APR</p>
          </div>
          <ROIGauge value={avgROI} />
          <p className="text-[11px] text-stone-400 text-center leading-relaxed px-2">
            {avgROI >= 20 ? `${(avgROI - 20).toFixed(1)}% above industry baseline` : "Building towards 20% APR baseline"}
          </p>
        </div>
      </div>

      {/* Harvest & Payout Countdown Banner */}
      <HarvestCountdownWidget
        investments={investments}
        dashboardStats={dashboardStats}
        onViewTelemetry={() => onViewTelemetry && onViewTelemetry(investments[0])}
      />

      {/* Row 3 — Pie + Activities + Profile + Payout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Hive Pie */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-stone-900">Hive Portfolio</h3>
          <p className="text-xs text-stone-400 mt-0.5 mb-4">Distribution of your 3 hive systems</p>

          {hivePieData.length > 0 ? (
            <>
              {/* Donut — full width, tall enough to breathe */}
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hivePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {hivePieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: unknown) => [`${v} hives`, "Quantity"]}
                      contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Centre label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-stone-900 block leading-none">
                      {dashboardStats.total_hives ?? 0}
                    </span>
                    <span className="text-[11px] text-stone-400 uppercase tracking-widest mt-1 block">hives</span>
                  </div>
                </div>
              </div>

              {/* Custom legend — all 3 types, greyed if zero */}
              <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                {hiveBreakdownAll.map((h) => (
                  <div key={h.key} className={`flex items-center gap-1.5 ${h.value === 0 ? "opacity-35" : ""}`}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                    <span className="text-xs font-medium text-stone-700">{h.name}</span>
                    {h.value > 0 && (
                      <span className="text-[10px] text-stone-400">({h.value})</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-[260px] flex flex-col items-center justify-center text-stone-300 gap-2">
              <Layers className="w-8 h-8" />
              <p className="text-xs text-stone-400 text-center">Hive allocation will appear after deployment.</p>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900">Recent Activity</h3>
          <p className="text-xs text-stone-400 mt-0.5 mb-4">Portfolio milestones &amp; payouts</p>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((act, i) => {
                const isInv = act.type === "investment";
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isInv ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {isInv ? <TrendingUp className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-800 leading-tight truncate">{act.description}</p>
                        <p className="text-[10px] text-stone-400">{dateUtils.formatDate(act.date)}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isInv ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {isInv ? "+" : "−"}GHS {parseFloat(act.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-stone-300 gap-2">
              <Clock className="w-8 h-8" />
              <p className="text-xs text-stone-400 text-center">Activity will appear as your portfolio grows.</p>
            </div>
          )}
        </div>

        {/* Profile + Payout column */}
        <div className="flex flex-col gap-3">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center gap-3">
            {profile?.profile_image_url ? (
              <img src={profile.profile_image_url} alt={fullName} className="w-14 h-14 rounded-2xl object-cover border border-stone-200" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#1b9d3c] text-white flex items-center justify-center text-lg font-bold">{initials}</div>
            )}
            <div>
              <p className="text-sm font-bold text-stone-900">{fullName}</p>
              <p className="text-xs text-stone-400 truncate max-w-[180px]">{profile?.email ?? "investor@onehive.africa"}</p>
            </div>
            <div className="flex items-center gap-4 border-t border-stone-100 pt-3 w-full justify-center">
              <div className="text-center">
                <p className="text-base font-bold text-stone-900">{dashboardStats.total_hives ?? 0}</p>
                <p className="text-[10px] text-stone-400">Hives</p>
              </div>
              <div className="w-px h-6 bg-stone-200" />
              <div className="text-center">
                <p className="text-base font-bold text-stone-900">{dashboardStats.active_investments ?? 0}</p>
                <p className="text-[10px] text-stone-400">Active</p>
              </div>
              <div className="w-px h-6 bg-stone-200" />
              <div className="text-center">
                <p className="text-base font-bold text-stone-900">{dashboardStats.completed_investments ?? 0}</p>
                <p className="text-[10px] text-stone-400">Done</p>
              </div>
            </div>
          </div>

          <div className="relative flex-1 bg-[#f09443] rounded-2xl p-5 flex flex-col gap-3 overflow-hidden">
            {/* Abstract texture */}
            <img
              src={abstract}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-soft-light pointer-events-none select-none rounded-2xl"
            />
            <div className="relative w-9 h-9 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="relative">
              <p className="text-sm font-bold text-white">Next Payout</p>
              <p className="text-xs text-orange-100 mt-0.5 leading-relaxed">
                {dashboardStats.next_payout_date ? `Scheduled ${dateUtils.formatDate(dashboardStats.next_payout_date)}` : "No upcoming payout scheduled yet."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/financial-performance")}
              className="relative inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3 py-2 rounded-xl transition-colors mt-auto"
            >
              View Performance
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 4 — Investment Table with search, filter, pagination */}
      <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900">Active Hive Deployments</h2>
          <p className="text-xs text-stone-400 mt-0.5">Search, filter and browse all your investments</p>
        </div>
        <InvestmentTable investments={investments} onViewTelemetry={onViewTelemetry} />
      </div>
    </div>
  );
};

export default DashboardBento;
