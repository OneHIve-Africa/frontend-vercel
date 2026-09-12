import React from "react";
import { Investment } from "@/v1/api/types";
import { Calendar, TreePine, Users, Sprout, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ImpactTimelineProps {
  investments: Investment[];
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const ImpactTimeline: React.FC<ImpactTimelineProps> = ({ investments }) => {
  const navigate = useNavigate();

  // Sort investments by investment_date or created_at descending (most recent first)
  const sortedInvestments = React.useMemo(() => {
    return [...(investments || [])].sort((a, b) => {
      const dateA = new Date(a.investment_date || a.created_at).getTime();
      const dateB = new Date(b.investment_date || b.created_at).getTime();
      return dateB - dateA;
    });
  }, [investments]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Impact & Harvest Timeline
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Chronological log of your investments and environmental contributions
          </p>
        </div>
        <button
          onClick={() => navigate("/new-investment")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Fund More Hives</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {sortedInvestments.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
            <Sprout className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            No Impact Milestones Recorded Yet
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            When you fund your first apiary hive, your tree-planting and beekeeper support milestones will be tracked here.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line for desktop and mobile */}
          <div className="absolute top-3 left-4.5 bottom-3 w-0.5 bg-gray-100"></div>

          <div className="space-y-6">
            {sortedInvestments.map((inv, index) => {
              const amountNum = parseFloat(inv.amount || "0");
              const hives = inv.number_of_hives || 1;
              const isMatured = inv.investment_status === "matured";

              return (
                <div key={inv.id || index} className="relative flex items-start gap-4 pl-1">
                  {/* Node icon */}
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      isMatured
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "bg-green-50 border-green-300 text-green-600"
                    }`}
                  >
                    <Sprout className="w-4 h-4" />
                  </div>

                  {/* Milestone Card */}
                  <div className="flex-1 bg-gray-50/70 border border-gray-100/90 rounded-lg p-4 transition-all hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {hives} {hives === 1 ? "Hive Funded" : "Hives Funded"}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            isMatured
                              ? "bg-blue-100/80 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {inv.investment_status || "Active"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(inv.investment_date || inv.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 pt-1">
                      <span className="font-semibold text-gray-800">
                        Capital: GHS {amountNum.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                        <TreePine className="w-3.5 h-3.5" />
                        +{hives} {hives === 1 ? "Tree Planted" : "Trees Planted"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-orange-700 font-medium">
                        <Users className="w-3.5 h-3.5" />
                        +1 Beekeeper Household
                      </span>
                      {inv.maturity_date && (
                        <span className="text-gray-400 text-[11px]">
                          Est. Maturity: {formatDate(inv.maturity_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactTimeline;
