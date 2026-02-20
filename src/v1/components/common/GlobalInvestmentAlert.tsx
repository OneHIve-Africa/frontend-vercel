import React, { useEffect, useMemo, useState } from "react";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNewInvestmentStore } from "@/v1/features/dashboard/store/NewInvestmentStore";
import { useNotificationStore } from "@/v1/features/notifications/store/NotificationStore";
import type { Notification } from "@/v1/features/notifications/lib/types";

const IN_PROGRESS_KEY = "newInvestmentData";
const DISMISS_KEY = "dismissedNewInvestmentAlert";
const COMPLETED_KEY = "newInvestmentCompleted";

const GlobalInvestmentAlert: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const notifications = useNotificationStore((s) => s.notifications);

  // Read from the Zustand store for immediate, in-session detection
  const currentStep = useNewInvestmentStore((s) => s.currentStep);
  const hiveType = useNewInvestmentStore((s) => s.hiveType);
  const investmentTier = useNewInvestmentStore((s) => s.investmentTier);

  const inProgress = useMemo(() => {
    return Boolean(
      (currentStep ?? 0) > 0 || hiveType || investmentTier
    );
  }, [currentStep, hiveType, investmentTier]);

  const hasActionRequiredInvestment = useMemo(() => {
    return notifications.some(
      (n: Notification) => n.group === "Investment" && n.actionRequired && !n.read
    );
  }, [notifications]);

  useEffect(() => {
    const completed = localStorage.getItem(COMPLETED_KEY);
    const dismissedNow = sessionStorage.getItem(DISMISS_KEY) === "true";
    console.log("[GlobalInvestmentAlert] effect run", { completed, dismissedNow });
    const showOnMount = !dismissedNow && inProgress && !hasActionRequiredInvestment;
    console.log("[GlobalInvestmentAlert] showOnMount", showOnMount);
    if (showOnMount) {
      setVisible(true);
    } else {
      setVisible(false);
    }

    // Listen for storage changes (e.g., completion on another tab)
    const onStorage = (e: StorageEvent) => {
      console.log("[GlobalInvestmentAlert] storage event", {
        key: e.key,
        newValue: e.newValue,
        oldValue: e.oldValue,
      });
      if (e.key === IN_PROGRESS_KEY || e.key === COMPLETED_KEY) {
        const show = !dismissedNow && inProgress && !hasActionRequiredInvestment;
        console.log("[GlobalInvestmentAlert] storage recompute show=", show);
        setVisible(show);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [inProgress, hasActionRequiredInvestment, location.pathname]);

  // When leaving the new-investment route, clear the session dismissal so the alert can reappear if still in progress
  useEffect(() => {
    const isOnNewInvestment = location.pathname.includes("new-investment");
    if (!isOnNewInvestment) {
      try {
        sessionStorage.removeItem(DISMISS_KEY);
      } catch {
        // noop
      }
      // Recompute visibility immediately after route change if still in progress
      const show = inProgress && !hasActionRequiredInvestment;
      setVisible(show);
    }
  }, [location.pathname, inProgress, hasActionRequiredInvestment]);

  const isOnNewInvestment = location.pathname.includes("new-investment");
  if (!visible || isOnNewInvestment) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] flex justify-center px-4">
      <div className="mt-2 w-full max-w-4xl rounded-md border border-yellow-300 bg-oha_primary text-white shadow-md">
        <div className="flex items-start gap-3 p-3 justify-center">
          <div className="mt-0.5">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium">Incomplete investment in progress</p>
            <p className="text-white">
              You started a new investment but haven’t completed payment. You
              can resume from where you left off.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Hide the notifier immediately and keep it hidden for this session
                sessionStorage.setItem(DISMISS_KEY, "true");
                setVisible(false);
                navigate("/new-investment");
              }}
              className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-oha_primary text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
            <button
              aria-label="Dismiss"
              onClick={() => {
                sessionStorage.setItem(DISMISS_KEY, "true");
                setVisible(false);
                try {
                  const exists = notifications.some(
                    (n: Notification) => n.group === "Investment" && n.actionRequired && !n.read
                  );
                  if (!exists) {
                    addNotification({
                      id: `local-${Date.now()}`,
                      group: "Investment",
                      title: "Investment reminder dismissed",
                      message: "You dismissed the in-progress investment reminder.",
                      timestamp: new Date().toISOString(),
                      actionRequired: true,
                      ctaLabel: "Continue investment",
                      route: "/new-investment",
                    });
                  }
                } catch {
                  // noop
                }
              }}
              className="rounded-md p-1 hover:bg-oha_primary text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalInvestmentAlert;
