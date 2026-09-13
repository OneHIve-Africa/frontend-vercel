import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Thermometer,
  Scale,
  Droplets,
  Activity,
  CheckCircle2,
  Sparkles,
  MapPin,
} from "lucide-react";
import { Investment } from "@/v1/api/types";

interface HiveTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment?: Investment | null;
}

export const HiveTelemetryModal: React.FC<HiveTelemetryModalProps> = ({
  isOpen,
  onClose,
  investment,
}) => {
  if (!isOpen) return null;

  const hiveId = investment ? `HIV-${String(investment.id).padStart(4, "0")}` : "HIV-0482";
  const packageType = investment?.hive_status_summary || "Langstroth Pro Smart Hive";
  const location = "Ashanti Apiary Cluster, Zone 4";

  const sensors = [
    {
      title: "Brood Temperature",
      value: "34.8°C",
      target: "33°C - 36°C",
      status: "Optimal",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <Thermometer className="w-5 h-5 text-emerald-600" />,
      desc: "Brood nest maintains strict thermoregulation for larvae growth.",
    },
    {
      title: "Super Weight",
      value: "24.6 kg",
      target: "+1.8 kg / 7 days",
      status: "Accumulating",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Scale className="w-5 h-5 text-amber-600" />,
      desc: "Nectar inflow indicates robust honey capping in upper chambers.",
    },
    {
      title: "Relative Humidity",
      value: "58%",
      target: "50% - 65%",
      status: "Healthy",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Droplets className="w-5 h-5 text-blue-600" />,
      desc: "Adequate moisture circulation for enzymatic honey ripening.",
    },
    {
      title: "Acoustic Colony Hum",
      value: "215 Hz",
      target: "190 - 240 Hz",
      status: "Queen Active",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: <Activity className="w-5 h-5 text-purple-600" />,
      desc: "Vigorous worker frequency. No swarming impulse detected.",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 sm:p-6 flex items-start justify-between">
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl shrink-0">
                🐝
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">Smart Hive Telemetry</h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Sensors
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1 flex items-center gap-2">
                  <span className="font-mono text-amber-300">{hiveId}</span>
                  <span>•</span>
                  <span>{packageType}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location & Status Pill Banner */}
          <div className="bg-amber-50/60 border-b border-amber-100 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Agronomist Verified (Inspected 2 days ago)</span>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {sensors.map((sensor, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-4 bg-stone-50 border border-stone-200/80 flex flex-col justify-between hover:border-amber-300 transition-all hover:bg-white shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white border border-stone-200/70 shadow-xs">
                        {sensor.icon}
                      </div>
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        {sensor.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sensor.badgeColor}`}
                    >
                      {sensor.status}
                    </span>
                  </div>

                  <div className="my-1.5">
                    <div className="text-2xl font-black text-stone-900 tracking-tight font-mono">
                      {sensor.value}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      Target threshold: {sensor.target}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 mt-2 pt-2 border-t border-stone-200/50 leading-relaxed">
                    {sensor.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Smart Hive Automated Diagnostics */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 text-emerald-950">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Colony Health Synthesis
                </h4>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Colony density is performing in the <strong>top 10th percentile</strong> across the Ashanti basin. Queen oviposition is continuous, and supers are on track to achieve expected peak honey harvest extraction volume.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">
              Telemetry syncs hourly via satellite LoRaWAN IoT mesh.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold cursor-pointer transition shadow-sm"
            >
              Close Telemetry
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HiveTelemetryModal;
