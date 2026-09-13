import { useEffect, useState } from "react";
import useInvestmentStore from "../store/InvestmentStore";
import InvestorDashboardApi, { DashboardStats } from "@/v1/api/InvestorDashboardApi";
import { InvestorLaunchpad } from "../components/InvestorLaunchpad";
import { DashboardBento } from "../components/DashboardBento";
import { HiveTelemetryModal } from "../components/HiveTelemetryModal";
import { exportToCSV, printStatement } from "../utils/statementExport";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { Sparkles, LayoutDashboard, PlusCircle, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Investment } from "@/v1/api/types";

const PortfolioPage = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfileStore();
  const { investments, isLoading, error, fetchInvestments } = useInvestmentStore();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "launchpad">("portfolio");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [selectedHive, setSelectedHive] = useState<Investment | null>(null);

  useEffect(() => {
    fetchInvestments();

    const loadDashboardStats = async () => {
      try {
        setStatsLoading(true);
        const response = await InvestorDashboardApi.getInstance().getDashboardStats();
        if (response.data) {
          setDashboardStats(response.data);
        }
        setStatsError(null);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        setStatsError("Failed to load dashboard statistics");
      } finally {
        setStatsLoading(false);
      }
    };

    loadDashboardStats();
  }, [fetchInvestments]);

  const hasInvestments = investments && investments.length > 0;

  return (
    <div className="w-full min-h-full py-1 sm:py-4 px-3 sm:px-5 lg:px-8">
      {/* ── Page header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 gap-4 border-b border-stone-200/80 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {hasInvestments ? "Investment Portfolio" : "Investor Onboarding Hub"}
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {hasInvestments
              ? "Monitor the health, yields, and returns of your OneHive hives."
              : "Welcome to OneHive Africa. Explore returns, simulate yield, and launch your first hive."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasInvestments && (
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab("portfolio")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "portfolio"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Hives</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("launchpad")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "launchpad"
                    ? "bg-white text-oha_primary shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-oha_primary" />
                <span>Simulator</span>
              </button>
            </div>
          )}

          {hasInvestments && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition shadow-xs cursor-pointer"
                title="Download or Print Portfolio Statement"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Statement</span>
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-stone-200 p-1.5 z-30"
                  onClick={() => setShowExportMenu(false)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      exportToCSV(
                        investments,
                        dashboardStats,
                        profile
                          ? {
                              user: {
                                first_name: profile.first_name,
                                last_name: profile.last_name,
                                email: profile.email,
                              },
                            }
                          : undefined
                      )
                    }
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-lg transition text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      printStatement(
                        investments,
                        dashboardStats,
                        profile
                          ? {
                              user: {
                                first_name: profile.first_name,
                                last_name: profile.last_name,
                                email: profile.email,
                              },
                            }
                          : undefined
                      )
                    }
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-lg transition text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Printable / PDF Statement</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/new-investment")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-oha_secondary text-white text-xs sm:text-sm font-semibold hover:bg-shadsd transition shadow-sm cursor-pointer ml-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Fund More Hives</span>
          </button>
        </div>
      </div>

      {/* ── Loading state ──────────────────────────── */}
      {(isLoading || statsLoading) && (
        <div className="py-20 text-center text-stone-400 text-sm">
          <div className="w-8 h-8 border-2 border-oha_secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading your hive portfolio…</span>
        </div>
      )}

      {/* ── Error state ────────────────────────────── */}
      {(error || statsError) && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm mb-6 border border-red-200">
          {error || statsError}
        </div>
      )}

      {/* ── Content ───────────────────────────────── */}
      {!isLoading && !statsLoading && (
        <>
          {!hasInvestments || activeTab === "launchpad" ? (
            <InvestorLaunchpad />
          ) : dashboardStats ? (
            <DashboardBento
              investments={investments}
              dashboardStats={dashboardStats}
              onViewTelemetry={(hive) => {
                setSelectedHive(hive || investments[0] || null);
                setIsTelemetryOpen(true);
              }}
            />
          ) : (
            /* dashboardStats failed but investments loaded — show bare table fallback */
            <div className="py-12 text-center text-stone-400 text-sm">
              Dashboard statistics unavailable. Your investments are still loading below.
            </div>
          )}
        </>
      )}

      {/* Smart Hive Telemetry Modal */}
      <HiveTelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        investment={selectedHive}
      />
    </div>
  );
};

export default PortfolioPage;

