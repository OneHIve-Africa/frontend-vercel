import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  AlertTriangle,
  Download,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Scale,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TermsAndConditionsModal, { LegalDocType } from "./TermsAndConditionsModal";
import { useAuthStore } from "../../auth/store/AuthStore";
import { useSettingsStore } from "../store/SettingsStore";

const AccountActions: React.FC = () => {
  const navigate = useNavigate();
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>("terms");
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateConfirmed, setDeactivateConfirmed] = useState(false);
  const [deactivateSuccess, setDeactivateSuccess] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLocalError, setPasswordLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { changePassword, isLoading, error, fieldErrors, setError } =
    useAuthStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordLocalError(null);
    setSuccessMessage("");

    if (newPassword.length < 8) {
      setPasswordLocalError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordLocalError("New passwords do not match.");
      return;
    }

    const success = await changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: confirmPassword,
    });

    if (success) {
      setSuccessMessage("Your password has been changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMessage(""), 6000);
    }
  };

  const handleDownloadStatement = (format: "pdf" | "csv") => {
    const dummyContent = `OneHive Africa - Investor Statement (${format.toUpperCase()})\nGenerated: ${new Date().toLocaleDateString()}\nStatus: Active Verified Investor\nLegal Framework: Agricultural Commerce Laws of Ghana`;
    const blob = new Blob([dummyContent], {
      type: format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onehive_investor_statement_${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsStatementModalOpen(false);
  };

  const openLegalDocument = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setIsLegalModalOpen(true);
  };

  return (
    <div className="space-y-8 sm:space-y-10 bg-white/80 sm:bg-transparent backdrop-blur-xs p-4 sm:p-0 rounded-2xl sm:rounded-none border border-stone-200/70 sm:border-0 shadow-2xs sm:shadow-none">
      {/* Page Header */}
      <div className="border-b border-stone-300/80 sm:border-stone-200/80 pb-3.5 sm:pb-5">
        <h2 className="text-base sm:text-xl font-bold text-stone-900">Security & Legal Compliance</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5 sm:mt-1">
          Manage access credentials, certified investment statements, and statutory investment disclosures.
        </p>
      </div>

      {/* 1. Security & Authentication Card */}
      <div className="p-0 sm:p-7 rounded-none sm:rounded-2xl bg-transparent sm:bg-white border-0 sm:border border-stone-200/80 shadow-none sm:shadow-xs space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-100 sm:bg-emerald-50 text-emerald-800 sm:text-emerald-700 border border-emerald-300 sm:border-emerald-200 shrink-0">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">
              Update Password
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500">
              Ensure your account is protected with a secure password of at least 8 characters.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5 sm:space-y-4 max-w-2xl">
          {/* Current Password */}
          <div>
            <label
              htmlFor="old_password"
              className="block text-xs font-semibold uppercase text-stone-600 mb-1"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="old_password"
                type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                required
              />
              <button
                type="button"
                aria-label={showOld ? "Hide password" : "Show password"}
                onClick={() => setShowOld((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center text-stone-400 hover:text-stone-600 min-w-[44px] min-h-[44px] justify-center"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="new_password"
                className="block text-xs font-semibold uppercase text-stone-600 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  aria-label={showNew ? "Hide password" : "Show password"}
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center text-stone-400 hover:text-stone-600 min-w-[44px] min-h-[44px] justify-center"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-xs font-semibold uppercase text-stone-600 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center text-stone-400 hover:text-stone-600 min-w-[44px] min-h-[44px] justify-center"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error messages */}
          {(passwordLocalError || error) && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {passwordLocalError || error}
            </div>
          )}

          {fieldErrors && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(fieldErrors).map(([field, errors]) => (
                  <li key={field}>{`${field}: ${errors.join(", ")}`}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {successMessage}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors shadow-xs min-h-[44px] flex items-center justify-center"
            >
              {isLoading ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Institutional Legal, Compliance & Disclosures Suite */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Legal, Compliance & Disclosures
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Binding agreements and statutory declarations governing your apiculture assets.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Charter Signed & Legally Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Document 1: Terms of Service & Investor Charter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Investor Terms & Apiary Charter
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Core charter detailing hive sponsorship ownership, harvest profit-share calculations, and bi-annual distributions.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLegalDocument("terms")}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors w-full"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Read Investor Charter
            </button>
          </div>

          {/* Document 2: Risk Disclosures */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Agricultural Risk & Biological Disclosures
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Statutory risk disclosure on rainfall variability, floral nectar seasons, and One Hive's colony absconding mitigations.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLegalDocument("risk")}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors w-full"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Read Risk Disclosures
            </button>
          </div>

          {/* Document 3: Honey Off-Take Agreement */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  100% Commercial Honey Off-Take Agreement
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Legally binding purchase commitment by One Hive Africa to purchase all harvested honey at wholesale benchmark floors.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLegalDocument("offtake")}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors w-full"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Read Off-Take Agreement
            </button>
          </div>

          {/* Document 4: Privacy & Data Protection */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Privacy Policy & KYC Protection
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Ghana Data Protection Act (Act 843) compliance framework covering investor national identification and payout encryption.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLegalDocument("privacy")}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors w-full"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Read Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* 3. Statements & Concierge Support */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base font-bold text-stone-900">
          Financial Records & Investor Concierge
        </h3>

        <div className="grid grid-cols-1 gap-2 sm:gap-4">
          {/* Statement Request Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 sm:bg-amber-50 text-amber-900 sm:text-amber-800 border border-amber-300 sm:border-amber-200 shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900">
                  Certified Investment Statements & Tax Summaries
                </h4>
                <p className="text-xs text-stone-600 sm:text-stone-500 mt-0.5 max-w-xl leading-relaxed">
                  Download certified records of your hive sponsorships, honey dividend receipts, and calendar year tax reports.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsStatementModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors shrink-0 min-h-[40px] sm:min-h-[44px]"
            >
              <Download className="w-4 h-4" /> Download Statement
            </button>
          </div>

          {/* Support Concierge Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-stone-100 text-stone-800 sm:text-stone-700 border border-stone-300 sm:border-stone-200 shrink-0">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900">
                  Investor Concierge & Feedback
                </h4>
                <p className="text-xs text-stone-600 sm:text-stone-500 mt-0.5 max-w-xl leading-relaxed">
                  Have inquiries about apiary telemetry, custom institutional sponsorships, or need account assistance?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/feedback")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 sm:text-emerald-800 transition-colors shrink-0 min-h-[40px] sm:min-h-[44px]"
            >
              Contact Concierge <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone */}
      <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-rose-50/70 sm:bg-rose-50/50 border border-rose-300 sm:border-rose-200/80 space-y-3 sm:space-y-4">
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-rose-900">
              Account Deactivation & Asset Redemption
            </h3>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed max-w-2xl">
              Deactivating your investor account initiates cycle settlement. Any active beehive sponsorship packages will conclude naturally at the end of the ongoing harvest season, after which final yields and principal are wired to your registered account.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-stretch sm:justify-end">
          <button
            type="button"
            onClick={() => setIsDeactivateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 transition-colors shadow-2xs min-h-[44px] flex items-center justify-center"
          >
            Request Account Deactivation
          </button>
        </div>
      </div>

      {/* Statement Download Modal */}
      {isStatementModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                Download Statement
              </h3>
              <button
                type="button"
                onClick={() => setIsStatementModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 text-base font-medium min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Select your preferred export format for the current calendar year financial report.
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadStatement("pdf")}
                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3.5 sm:p-4 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-stone-800 min-h-[110px]"
              >
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-rose-600" />
                <span className="text-xs font-bold">PDF Statement</span>
                <span className="text-[10px] text-stone-400">Formal Report</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadStatement("csv")}
                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3.5 sm:p-4 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-stone-800 min-h-[110px]"
              >
                <Download className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
                <span className="text-xs font-bold">CSV Spreadsheet</span>
                <span className="text-[10px] text-stone-400">Raw Financial Data</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsStatementModalOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors min-h-[44px] flex items-center justify-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                Confirm Deactivation Request
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to submit a deactivation request? Our compliance desk will reach out to confirm remaining payouts and finalize your account closure.
            </p>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deactivateConfirmed}
                  onChange={(e) => setDeactivateConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 min-w-[18px] min-h-[18px]"
                />
                <span className="text-[11px] sm:text-xs leading-relaxed">
                  I understand that active investments will conclude naturally and capital returned according to standard terms.
                </span>
              </label>
            </div>

            {deactivateSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                Deactivation request received. An investor liaison will email you within 2 business days.
              </div>
            ) : (
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeactivateModalOpen(false);
                    setDeactivateConfirmed(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!deactivateConfirmed}
                  onClick={() => {
                    setDeactivateSuccess(true);
                    setTimeout(() => {
                      setIsDeactivateModalOpen(false);
                      setDeactivateSuccess(false);
                      setDeactivateConfirmed(false);
                    }, 3000);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Confirm Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal & Compliance Multi-Document Modal — portalled to document.body so it always covers the full screen */}
      {isLegalModalOpen &&
        ReactDOM.createPortal(
          <TermsAndConditionsModal
            initialDoc={activeLegalDoc}
            onClose={() => setIsLegalModalOpen(false)}
          />,
          document.body
        )}
    </div>
  );
};

export default AccountActions;
