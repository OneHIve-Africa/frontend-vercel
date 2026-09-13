import React, { useState, useEffect } from "react";
import { Calendar, Sparkles, Droplets, ChevronRight } from "lucide-react";
import { Investment } from "@/v1/api/types";
import { DashboardStats } from "@/v1/api/InvestorDashboardApi";

interface HarvestCountdownWidgetProps {
  investments?: Investment[];
  dashboardStats?: DashboardStats | null;
  onViewTelemetry?: () => void;
}

export const HarvestCountdownWidget: React.FC<HarvestCountdownWidgetProps> = ({
  investments = [],
  dashboardStats,
  onViewTelemetry,
}) => {
  // Target next harvest date: next quarterly extraction date (e.g., 42 days ahead)
  const [timeLeft, setTimeLeft] = useState({
    days: 42,
    hours: 14,
    minutes: 28,
    seconds: 50,
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 42);
    targetDate.setHours(targetDate.getHours() + 14);

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalHives = dashboardStats?.total_hives || (investments.length > 0 ? investments.length : 1);
  const estimatedLiters = totalHives * 28; // ~28L average yield per mature Langstroth hive cycle
  const estimatedPayoutGHS = dashboardStats?.expected_returns
    ? parseFloat(dashboardStats.expected_returns)
    : totalHives * 1450;

  // 4 Cycle Stages
  const stages = [
    { label: "Brood Expansion", status: "completed" },
    { label: "Nectar Foraging", status: "active" },
    { label: "Super Capping", status: "upcoming" },
    { label: "Harvest & Payout", status: "upcoming" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-5 sm:p-6 text-white shadow-xl shadow-amber-500/15">
      {/* Decorative background glow */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-black/10 blur-xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/20">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
            <span className="text-xl">🍯</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg tracking-tight">Next Honey Harvest & Payout Cycle</h3>
              <span className="text-[10px] uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                Q3 Extraction
              </span>
            </div>
            <p className="text-xs text-white/85">
              Live hive cycle tracking across your active apiaries
            </p>
          </div>
        </div>

        {onViewTelemetry && (
          <button
            type="button"
            onClick={onViewTelemetry}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-stone-900 hover:bg-amber-50 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Hive Telemetry</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Countdown Clock Grid */}
      <div className="relative z-10 py-5 grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-black/15 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/15"
          >
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] sm:text-xs text-white/80 font-medium uppercase tracking-wider mt-0.5">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Cycle Stage Progress Bar */}
      <div className="relative z-10 pt-1 pb-3">
        <div className="flex items-center justify-between text-xs font-semibold text-white/90 mb-2">
          <span>Apiary Development Stage</span>
          <span className="text-amber-100 flex items-center gap-1 font-bold">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            Stage 2 of 4: Peak Honey Flow
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {stages.map((stg, i) => {
            const isDone = stg.status === "completed";
            const isActive = stg.status === "active";
            return (
              <div key={i} className="flex flex-col gap-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isDone
                      ? "bg-white"
                      : isActive
                      ? "bg-white shadow-sm ring-2 ring-white/50 animate-pulse"
                      : "bg-white/25"
                  }`}
                />
                <span className="text-[10px] font-semibold text-white/90 truncate">
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Pill Badges */}
      <div className="relative z-10 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-lg">
            <Droplets className="w-3.5 h-3.5 text-amber-200" />
            <span className="font-bold">~{estimatedLiters} L</span>
            <span className="text-white/80">projected yield</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span className="font-bold">GHS {estimatedPayoutGHS.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-white/80">target dividend</span>
          </div>
        </div>

        <div className="text-[11px] text-white/80 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Scheduled window: <strong>Mid Oct 2026</strong></span>
        </div>
      </div>
    </div>
  );
};

export default HarvestCountdownWidget;
