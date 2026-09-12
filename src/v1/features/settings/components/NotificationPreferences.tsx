import React, { useEffect, useState } from "react";
import {
  Bell,
  Coins,
  Sparkles,
  Activity,
  Leaf,
  Check,
  CheckCheck,
  VolumeX,
} from "lucide-react";
import { useSettingsStore } from "../store/SettingsStore";
import { UserSettings } from "@/v1/api/types";

interface PreferenceItem {
  key: keyof UserSettings;
  label: string;
  description: string;
  category: "financial" | "ecology";
  icon: React.ComponentType<{ className?: string }>;
}

const PREFERENCES: PreferenceItem[] = [
  {
    key: "payout_updates",
    label: "Payout & Yield Distributions",
    description: "Receive instant notifications when honey dividend disbursements and capital payouts are credited to your account.",
    category: "financial",
    icon: Coins,
  },
  {
    key: "new_investment_opportunities",
    label: "Priority Apiary Clusters",
    description: "Get early access notifications whenever new apiary clusters, beehive packages, or regional expansions are listed.",
    category: "financial",
    icon: Sparkles,
  },
  {
    key: "hive_activity_alerts",
    label: "Hive Colonization & Health Logs",
    description: "Stay updated on apiary colony health, queen acceptance, swarm monitoring, and field management inspections.",
    category: "ecology",
    icon: Activity,
  },
  {
    key: "environmental_impact_reports",
    label: "Carbon Sequestration & Community Reports",
    description: "Quarterly summaries of your investments' carbon offsets, pollinated flora hectares, and local beekeeper household income.",
    category: "ecology",
    icon: Leaf,
  },
];

const NotificationPreferences: React.FC = () => {
  const { settings, isLoading, fetchSettings, updateSettings } = useSettingsStore();
  const [saveIndicator, setSaveIndicator] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = async (key: keyof UserSettings) => {
    if (!settings) return;
    const nextVal = !settings[key];
    const success = await updateSettings({ [key]: nextVal });
    if (success) {
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2500);
    }
  };

  const handleToggleAll = async (enable: boolean) => {
    const patch: Partial<UserSettings> = {
      payout_updates: enable,
      new_investment_opportunities: enable,
      hive_activity_alerts: enable,
      environmental_impact_reports: enable,
    };
    const success = await updateSettings(patch);
    if (success) {
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2500);
    }
  };

  const renderGroup = (
    title: string,
    description: string,
    items: PreferenceItem[]
  ) => (
    <div className="space-y-2 sm:space-y-4">
      <div>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800 sm:text-stone-700">
          {title}
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">{description}</p>
      </div>

      <div className="space-y-1 sm:space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isChecked = Boolean(settings?.[item.key]);

          return (
            <div
              key={item.key}
              className={`p-2.5 sm:p-5 rounded-none sm:rounded-xl transition-all duration-150 border-0 border-b sm:border border-stone-300/80 sm:border-stone-200/90 last:border-b-0 sm:last:border-b ${
                isChecked
                  ? "bg-transparent sm:bg-white shadow-none sm:shadow-xs"
                  : "bg-transparent sm:bg-stone-50/70 opacity-90 sm:opacity-100"
              }`}
            >
              {/* Row 1: Icon, Title, Status, Switch */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div
                    className={`p-1.5 sm:p-2.5 rounded-xl shrink-0 transition-colors ${
                      isChecked
                        ? "bg-emerald-100 sm:bg-emerald-50 text-emerald-800 sm:text-emerald-700 border border-emerald-300 sm:border-emerald-200"
                        : "bg-stone-300/60 sm:bg-stone-200/70 text-stone-600 sm:text-stone-400 border border-stone-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                        {item.label}
                      </h4>
                      <span
                        className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md shrink-0 ${
                          isChecked
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-300/80 sm:bg-stone-200/70 text-stone-700 sm:text-stone-500"
                        }`}
                      >
                        {isChecked ? "Active" : "Muted"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Touch-friendly toggle switch */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 p-1 -mr-1 min-w-[48px] min-h-[40px] justify-end">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isChecked}
                    onChange={() => handleToggle(item.key)}
                    disabled={isLoading}
                    aria-label={`Toggle ${item.label}`}
                  />
                  <div className="w-11 h-6 bg-stone-300 sm:bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[11px] after:left-[7px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Row 2: Description */}
              <p className="text-xs text-stone-600 sm:text-stone-500 mt-1.5 sm:mt-1.5 pl-8 sm:pl-12 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 bg-white/80 sm:bg-transparent backdrop-blur-xs p-4 sm:p-0 rounded-2xl sm:rounded-none border border-stone-200/70 sm:border-0 shadow-2xs sm:shadow-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-stone-300/80 sm:border-stone-200/80 pb-3.5 sm:pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-bold text-stone-900">
              Notification Preferences
            </h2>
            <div className="p-1 rounded-md bg-stone-200/70 sm:bg-stone-100 text-stone-700 sm:text-stone-600">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5 sm:mt-1">
            Choose which investor alerts and operational updates you want to receive.
          </p>
        </div>

        {/* Global toggles & sync status */}
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          {saveIndicator && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 sm:text-emerald-700 bg-emerald-100/80 sm:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-300 sm:border-emerald-200 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Synced
            </span>
          )}
          <button
            type="button"
            onClick={() => handleToggleAll(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-stone-800 sm:text-stone-700 bg-stone-200 sm:bg-stone-100 hover:bg-stone-300 sm:hover:bg-stone-200 transition-colors min-h-[36px]"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Enable All
          </button>
          <button
            type="button"
            onClick={() => handleToggleAll(false)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 sm:text-stone-600 hover:text-stone-900 hover:bg-stone-200 sm:hover:bg-stone-100 transition-colors min-h-[36px]"
          >
            <VolumeX className="w-3.5 h-3.5" /> Mute All
          </button>
        </div>
      </div>

      {/* Financial Section */}
      {renderGroup(
        "Financial & Yield Distributions",
        "Direct updates regarding your honey harvests, disbursements, and fund movements.",
        PREFERENCES.filter((p) => p.category === "financial")
      )}

      {/* Ecology Section */}
      {renderGroup(
        "Ecology & Apiary Telemetry",
        "Field updates, hive inspections, and ecological sustainability reports from your sponsor colonies.",
        PREFERENCES.filter((p) => p.category === "ecology")
      )}

      {/* Channels Info Banner - Fluid on mobile */}
      <div className="p-3 sm:p-4 rounded-none sm:rounded-xl bg-transparent sm:bg-stone-50 border-0 sm:border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs text-stone-600">
        <div>
          <span className="font-semibold text-stone-800">Delivery Channels:</span>{" "}
          Alerts are delivered in-app to your Investor Inbox and sent to your verified email.
        </div>
        <div className="text-stone-400">
          Preferences save automatically on click.
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
