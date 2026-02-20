import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import { useAuthStore } from "../../auth/store/AuthStore";

const ActionRow: React.FC<{
  title: string;
  description: string;
  buttonText: string;
  buttonClass?: string;
  onClick?: () => void;
}> = ({
  title,
  description,
  buttonText,
  buttonClass = "bg-green-600 hover:bg-green-700",
  onClick,
}) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200">
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <button
      onClick={onClick}
      className={`w-32 text-center shrink-0 text-white px-4 py-2 rounded-lg text-sm font-semibold ${buttonClass}`}
    >
      {buttonText}
    </button>
  </div>
);

const AccountActions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { changePassword, isLoading, error, fieldErrors, setError } =
    useAuthStore();
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    const success = await changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      // Backend expects new_password2; since UI removes confirm field,
      // pass the same value to satisfy validation.
      new_password2: newPassword,
    });

    if (success) {
      setSuccessMessage("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Change Password
        </h2>
        <p className="text-sm text-gray-500 mb-4">Update your password.</p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
              <button
                type="button"
                aria-label={showOld ? "Hide password" : "Show password"}
                onClick={() => setShowOld((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
              <button
                type="button"
                aria-label={showNew ? "Hide password" : "Show password"}
                onClick={() => setShowNew((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {fieldErrors && (
            <ul className="text-red-600 text-sm mt-2 list-disc list-inside">
              {Object.entries(fieldErrors).map(([field, errors]) => (
                <li key={field}>{`${field}: ${errors.join(", ")}`}</li>
              ))}
            </ul>
          )}
          {successMessage && (
            <div className="text-green-600 text-sm mt-2">{successMessage}</div>
          )}
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="space-y-2">
        <ActionRow
          title="Request Investment History (PDF, CSV)"
          description="Get a detailed record of your investments."
          buttonText="Request"
        />
        <ActionRow
          title="View Terms of Service / Privacy Policy"
          description="Read our terms and understand your rights."
          buttonText="View"
          onClick={() => setIsModalOpen(true)}
        />
        <ActionRow
          title="Contact Support"
          description="Get a detailed record of your investments."
          buttonText="Contact Us"
        />
        <ActionRow
          title="Request Account Deactivation"
          description="Close your account if you no longer wish to invest."
          buttonText="Request"
          buttonClass="bg-red-600 hover:bg-red-700"
        />
      </div>

      {isModalOpen && (
        <TermsAndConditionsModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default AccountActions;
