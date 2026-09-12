import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Sprout,
  ArrowRight,
  ShieldCheck,
  Users,
  ChevronRight,
  Info,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

interface HiveConfig {
  id: "ktbh" | "langstroth" | "saltpond";
  name: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  pricePerHive: number;
  annualYieldPerHiveMin: number;
  annualYieldPerHiveMax: number;
  roiMinPercent: number;
  roiMaxPercent: number;
  honeyPricePerLiter: number; // GHS/L
}

const HIVE_CONFIGS: Record<string, HiveConfig> = {
  ktbh: {
    id: "ktbh",
    name: "Kenya Top Bar (KTBH)",
    shortName: "KTBH",
    badge: "Popular",
    badgeColor: "#1b9d3c",
    pricePerHive: 1000,
    annualYieldPerHiveMin: 40,
    annualYieldPerHiveMax: 60,
    roiMinPercent: 20,
    roiMaxPercent: 24,
    honeyPricePerLiter: 55,
  },
  langstroth: {
    id: "langstroth",
    name: "Langstroth",
    shortName: "Langstroth",
    badge: "High Yield",
    badgeColor: "#f09443",
    pricePerHive: 1500,
    annualYieldPerHiveMin: 60,
    annualYieldPerHiveMax: 100,
    roiMinPercent: 22,
    roiMaxPercent: 26,
    honeyPricePerLiter: 55,
  },
  saltpond: {
    id: "saltpond",
    name: "Saltpond",
    shortName: "Saltpond",
    badge: "Heritage",
    badgeColor: "#7c6e3f",
    pricePerHive: 1000,
    annualYieldPerHiveMin: 30,
    annualYieldPerHiveMax: 50,
    roiMinPercent: 18,
    roiMaxPercent: 22,
    honeyPricePerLiter: 55,
  },
};

const TIERS = [
  { hives: 5, label: "5", tier: "Starter" },
  { hives: 20, label: "20", tier: "Growth" },
  { hives: 50, label: "50", tier: "Enterprise" },
  { hives: 100, label: "100", tier: "Legacy" },
];

const fmt = (n: number) =>
  n.toLocaleString("en-GH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ─── Subcomponents ───────────────────────────────────────────────────────────

const MetricRow = ({
  label,
  value,
  sub,
  accent,
  bold,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  bold?: boolean;
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500 leading-tight">{label}</span>
    <div className="text-right">
      <span
        className={`block text-sm ${bold ? "font-bold" : "font-semibold"} ${
          accent ? "text-oha_secondary" : "text-gray-900"
        }`}
      >
        {value}
      </span>
      {sub && <span className="block text-[10px] text-gray-400 mt-0.5">{sub}</span>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface HiveRoiCalculatorProps {
  compact?: boolean;
}

export const HiveRoiCalculator: React.FC<HiveRoiCalculatorProps> = () => {
  const navigate = useNavigate();
  const [selectedHive, setSelectedHive] = useState<"ktbh" | "langstroth" | "saltpond">("ktbh");
  const [hiveCount, setHiveCount] = useState<number>(20);

  const config = HIVE_CONFIGS[selectedHive];

  const calc = useMemo(() => {
    const capital = hiveCount * config.pricePerHive;
    const honeyMin = hiveCount * config.annualYieldPerHiveMin;
    const honeyMax = hiveCount * config.annualYieldPerHiveMax;
    const honeyRevenueMin = honeyMin * config.honeyPricePerLiter;
    const honeyRevenueMax = honeyMax * config.honeyPricePerLiter;
    const returnMin = (capital * config.roiMinPercent) / 100;
    const returnMax = (capital * config.roiMaxPercent) / 100;
    const biAnnualMin = returnMin / 2;
    const biAnnualMax = returnMax / 2;
    const year3Min = capital + returnMin * 3;
    const year3Max = capital + returnMax * 3;
    const trees = hiveCount;
    const carbon = hiveCount * 45;
    const families = Math.max(1, Math.ceil(hiveCount / 5));

    // Bar chart segments: capital, return yr1, return yr2, return yr3
    const maxVal = year3Max;
    const bars = [
      { label: "Capital", value: capital, color: "#e5e7eb" },
      { label: "Yr 1 Est.", value: capital + returnMax, color: "#86efac" },
      { label: "Yr 2 Est.", value: capital + returnMax * 2, color: "#4ade80" },
      { label: "Yr 3 Est.", value: year3Max, color: "#1b9d3c" },
    ];

    return {
      capital,
      honeyMin,
      honeyMax,
      honeyRevenueMin,
      honeyRevenueMax,
      returnMin,
      returnMax,
      biAnnualMin,
      biAnnualMax,
      year3Min,
      year3Max,
      trees,
      carbon,
      families,
      bars,
      maxVal,
    };
  }, [hiveCount, config]);

  const sliderPct = ((hiveCount - 1) / 99) * 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-oha_secondary animate-pulse" />
          <span className="text-xs font-semibold text-gray-700 tracking-wide uppercase">
            Return Simulator
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
          <Info className="w-3 h-3" />
          Projections based on historical apiary data
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* ── LEFT PANEL: Controls ── */}
        <div className="lg:col-span-3 p-5 space-y-5 border-r border-gray-100">

          {/* Hive Type Selector */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Hive System
            </p>
            <div className="flex items-stretch gap-1.5 rounded-lg bg-gray-100 p-1">
              {Object.values(HIVE_CONFIGS).map((h) => {
                const active = selectedHive === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHive(h.id)}
                    className={`flex-1 relative rounded-md px-3 py-2 text-xs font-semibold transition-all cursor-pointer focus:outline-none ${
                      active
                        ? "bg-white shadow-sm text-gray-900 ring-1 ring-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="block">{h.shortName}</span>
                    {active && (
                      <span
                        className="absolute -top-0.5 -right-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: h.badgeColor }}
                      >
                        {h.badge}
                      </span>
                    )}
                    <span
                      className={`block text-[10px] mt-0.5 font-normal ${
                        active ? "text-oha_secondary" : "text-gray-400"
                      }`}
                    >
                      GHS {h.pricePerHive.toLocaleString()} / hive
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hive Count Slider */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Hive Count
              </p>
              <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={hiveCount}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="text-2xl font-bold text-gray-900 tabular-nums"
                  >
                    {hiveCount}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-gray-400 font-medium">hives</span>
              </div>
            </div>

            {/* Slider */}
            <div className="relative mb-3">
              <div className="relative h-1.5 bg-gray-200 rounded-full">
                <div
                  className="absolute left-0 top-0 h-full bg-oha_secondary rounded-full transition-all duration-100"
                  style={{ width: `${sliderPct}%` }}
                />
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={hiveCount}
                onChange={(e) => setHiveCount(parseInt(e.target.value, 10))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {/* Thumb dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-oha_secondary rounded-full shadow-sm pointer-events-none transition-all duration-100"
                style={{ left: `calc(${sliderPct}% - 8px)` }}
              />
            </div>

            {/* Tier presets */}
            <div className="flex gap-1.5 flex-wrap">
              {TIERS.map((t) => (
                <button
                  key={t.hives}
                  type="button"
                  onClick={() => setHiveCount(t.hives)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                    hiveCount === t.hives
                      ? "border-oha_secondary bg-oha_secondary/5 text-oha_secondary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                  <span className="ml-1 text-[9px] font-normal text-gray-400">{t.tier}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Growth Bar Chart ── */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Projected Portfolio Value
            </p>
            <div className="flex items-end gap-2 h-24">
              {calc.bars.map((bar, i) => {
                const heightPct = (bar.value / calc.maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${bar.label}-${bar.value}`}
                        className="w-full rounded-t relative group"
                        style={{ backgroundColor: bar.color, height: `${heightPct}%` }}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1, originY: 1 }}
                        transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded pointer-events-none z-10">
                          GHS {fmt(bar.value)}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <span className="text-[9px] text-gray-400 font-medium text-center leading-tight">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Assumes {config.roiMinPercent}–{config.roiMaxPercent}% annual return, capital preserved
            </p>
          </div>

          {/* ── Impact strip ── */}
          <div className="flex items-center gap-0 rounded-lg border border-gray-100 divide-x divide-gray-100 overflow-hidden">
            {[
              { icon: <Sprout className="w-3.5 h-3.5 text-oha_secondary" />, value: `+${calc.trees}`, label: "Trees" },
              { icon: <Users className="w-3.5 h-3.5 text-oha_secondary" />, value: `+${calc.families}`, label: "Families" },
              { icon: <ShieldCheck className="w-3.5 h-3.5 text-oha_secondary" />, value: `${fmt(calc.carbon)} kg`, label: "CO₂ offset" },
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center py-3 bg-gray-50/50 hover:bg-green-50/30 transition-colors">
                {item.icon}
                <span className="text-sm font-bold text-gray-800 mt-1">{item.value}</span>
                <span className="text-[10px] text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL: Order Summary ── */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex-1 p-5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Projection Summary
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {hiveCount} × {config.name}
            </p>

            <div className="space-y-0">
              <MetricRow
                label="Capital Required"
                value={`GHS ${fmt(calc.capital)}`}
                sub="One-off, no fees"
                bold
              />
              <MetricRow
                label="Honey Est. (Annual)"
                value={`${fmt(calc.honeyMin)} – ${fmt(calc.honeyMax)} L`}
                sub={`GHS ${fmt(calc.honeyRevenueMin)} – ${fmt(calc.honeyRevenueMax)} revenue`}
              />
              <MetricRow
                label="Net Return (Annual)"
                value={`GHS ${fmt(calc.returnMin)} – ${fmt(calc.returnMax)}`}
                sub={`${config.roiMinPercent}% – ${config.roiMaxPercent}% APR`}
                accent
              />
              <MetricRow
                label="Bi-Annual Payout"
                value={`GHS ${fmt(calc.biAnnualMin)} – ${fmt(calc.biAnnualMax)}`}
                sub="May–Jul & Nov–Jan"
              />
              <MetricRow
                label="3-Year Portfolio Value"
                value={`GHS ${fmt(calc.year3Min)} – ${fmt(calc.year3Max)}`}
                sub="Capital + 3 years returns"
                bold
                accent
              />
            </div>

            {/* APR Badge */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 border border-green-100 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-oha_secondary" />
                <span className="text-xs font-semibold text-gray-700">Target APR</span>
              </div>
              <span className="text-sm font-bold text-oha_secondary">
                {config.roiMinPercent}% – {config.roiMaxPercent}%
              </span>
            </div>

            {/* Guarantee strip */}
            <div className="mt-3 flex items-start gap-2 text-[10px] text-gray-500 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-oha_secondary flex-shrink-0 mt-0.5" />
              <span>
                Guaranteed off-take contract. Hive insurance &amp; agronomy support included. Capital managed by certified Ghanaian beekeepers.
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="p-4 border-t border-gray-100">
            <motion.button
              type="button"
              onClick={() => navigate("/new-investment")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-between bg-oha_secondary text-white px-5 py-3.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-shadsd transition-colors cursor-pointer"
            >
              <span>
                Fund {hiveCount} Hive{hiveCount > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-green-200 text-xs font-normal">
                  GHS {fmt(calc.capital)}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>

            <p className="text-[10px] text-gray-400 text-center mt-2.5 leading-relaxed">
              *Illustrative only. Past performance does not guarantee future results.
            </p>

            {/* Compare link */}
            <button
              type="button"
              onClick={() => navigate("/new-investment")}
              className="w-full flex items-center justify-center gap-1 text-[11px] text-gray-500 hover:text-oha_secondary transition-colors mt-1.5 cursor-pointer"
            >
              <ArrowRight className="w-3 h-3" />
              Compare all investment tiers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiveRoiCalculator;
