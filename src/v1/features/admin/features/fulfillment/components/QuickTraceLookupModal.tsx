import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Search, Sparkles, ArrowRight } from "lucide-react";

interface QuickTraceLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCode: (code: string) => void;
}

const QuickTraceLookupModal: React.FC<QuickTraceLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectCode,
}) => {
  const [code, setCode] = useState("");

  const sampleCodes = [
    "TRC-FC-ASH-01-2024-0001",
    "TRC-FC-ASH-01-2026-0008",
    "TRC-FC-VOL-02-2025-0014",
    "TRC-FC-NOR-04-2026-0021",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSelectCode(code.trim());
      onClose();
    }
  };

  const handlePickSample = (sample: string) => {
    onSelectCode(sample);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-oha_primary flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Traceability Passport Scanner</h3>
                  <p className="text-xs text-gray-500">Scan or search batch code</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Traceability Batch Code or QR String
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRC-FC-ASH-01-2026-0008"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-oha_primary"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Or select a verified recent batch:
                </span>
                <div className="space-y-1.5">
                  {sampleCodes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handlePickSample(s)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-amber-50 hover:text-amber-900 border border-gray-100 text-xs font-mono text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{s}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-oha_primary hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Passport</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickTraceLookupModal;
