/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "react-hot-toast";

const NewPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [validationError, setValidationError] = useState("");

  const { setNewPassword: resetPassword, isLoading, error } = useAuthStore();

  useEffect(() => {
    const storedEmail = localStorage.getItem("r_email");
    const storedOtp = localStorage.getItem("r_otp");
    if (!storedEmail || !storedOtp) {
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
    setOtp(storedOtp);
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }

    const success = await resetPassword({
      email,
      otp,
      new_password1: newPassword,
      new_password2: confirmPassword,
    });
    if (success) {
      toast.success("Password has been reset successfully!");
      // Clean up stored email
      localStorage.removeItem("r_email");
      navigate("/change-success");
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <form
      className="flex flex-col gap-6 mt-5 lg:w-[500px]"
      onSubmit={handlePasswordReset}
    >
      {validationError && (
        <div className="text-red-600 text-sm font-medium">
          {validationError}
        </div>
      )}
      {/* Backend field errors for password */}
      {useAuthStore.getState().fieldErrors?.password && (
        <div className="text-red-600 text-xs font-medium">
          {useAuthStore.getState().fieldErrors?.password?.join(" ")}
        </div>
      )}
      {/* Backend field errors for password_confirm */}
      {useAuthStore.getState().fieldErrors?.password_confirm && (
        <div className="text-red-600 text-xs font-medium">
          {useAuthStore.getState().fieldErrors?.password_confirm?.join(" ")}
        </div>
      )}
      <div>
        <Input
          type="password"
          placeholder="New Password"
          className="m_input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Confirm New Password"
          className="m_input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 text-sm font-semibold text-white bg-shads rounded-lg hover:bg-shadsd focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none h-12"
      >
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </Button>
      <Button
        type="button"
        className="w-full py-2 text-sm font-semibold text-green-600 border border-shads rounded-lg hover:bg-shadsd hover:text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none h-12"
        onClick={() => navigate("/login")}
      >
        <XIcon />
        Cancel
      </Button>
    </form>
  );
};

export default NewPasswordForm;
