import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Separator } from "@/components/Separator";
import { InputOTP, InputOTPSlot } from "@/components/InputOTP";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "react-hot-toast";
import { useUserProfileStore } from "../store/UserProfileStore";
import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // MFA Flow State
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaTargetEmail, setMfaTargetEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, verifyMFA, resendMFA, googleLogin, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGoogleLoginSuccess = async (tokenResponse: any) => {
    console.log("[GoogleDebug] Token Response:", tokenResponse);
    const success = await googleLogin(tokenResponse.access_token);
    
    if (success) {
      toast.success("Google login successful!");
      const currentProfile = useUserProfileStore.getState().profile;
      if (currentProfile?.position === "Administrator") {
        navigate("/dashboard");
      } else {
        const isFirst = useAuthStore.getState().isFirstTime;
        navigate(isFirst ? "/onboarding" : "/portfolio");
      }
    } else {
      const currentError = useAuthStore.getState().error;
      toast.error(currentError || "Google login failed");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => toast.error("Google Login Failed"),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await login(formData);
    
    if (result.mfaRequired) {
      setIsMfaStep(true);
      setMfaTargetEmail(result.email || formData.email);
      setOtpValue("");
      setResendCooldown(60);
      toast.success(result.message || "Verification code sent to your email!");
      return;
    }

    if (result.success) {
      toast.success("Login successful!");
      const currentProfile = useUserProfileStore.getState().profile;
      if (currentProfile?.position === "Administrator") {
        navigate("/dashboard");
      } else {
        const isFirst = useAuthStore.getState().isFirstTime;
        navigate(isFirst ? "/onboarding" : "/portfolio");
      }
    } else {
      const currentError = useAuthStore.getState().error;
      toast.error(currentError || "Login failed");
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    const success = await verifyMFA({
      email: mfaTargetEmail,
      otp: otpValue,
    });

    if (success) {
      toast.success("Identity verified! Welcome back.");
      const currentProfile = useUserProfileStore.getState().profile;
      if (currentProfile?.position === "Administrator") {
        navigate("/dashboard");
      } else {
        const isFirst = useAuthStore.getState().isFirstTime;
        navigate(isFirst ? "/onboarding" : "/portfolio");
      }
    } else {
      const currentError = useAuthStore.getState().error;
      toast.error(currentError || "Invalid or expired verification code");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !mfaTargetEmail) return;
    const ok = await resendMFA(mfaTargetEmail);
    if (ok) {
      setResendCooldown(60);
    }
  };


  if (isMfaStep) {
    return (
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 bg-transparent max-w-xl w-full mx-auto gap-6 h-full">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-stone-500 mt-2 max-w-sm">
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-stone-800 break-all">{mfaTargetEmail}</span>
          </p>
        </div>

        <form onSubmit={handleMfaSubmit} className="flex flex-col items-center gap-6 w-full">
          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => setOtpValue(value)}
            >
              <InputOTPSlot index={0} className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-bold bg-white border border-stone-300 rounded-lg shadow-2xs" />
              <InputOTPSlot index={1} className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-bold bg-white border border-stone-300 rounded-lg shadow-2xs" />
              <InputOTPSlot index={2} className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-bold bg-white border border-stone-300 rounded-lg shadow-2xs" />
              <InputOTPSlot index={3} className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-bold bg-white border border-stone-300 rounded-lg shadow-2xs" />
              <InputOTPSlot index={4} className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-bold bg-white border border-stone-300 rounded-lg shadow-2xs" />
              <InputOTPSlot index={5} className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-bold bg-white border border-stone-300 rounded-lg shadow-2xs" />
            </InputOTP>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium text-center">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || otpValue.length !== 6}
            className="w-full px-4 py-2 text-white bg-shads rounded-md hover:bg-shadsd focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 h-12 text-sm font-semibold cursor-pointer"
          >
            {isLoading ? "Verifying..." : "Verify & Sign In"}
          </Button>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full text-xs text-stone-500 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsMfaStep(false)}
              className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </button>

            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={handleResend}
              className={`flex items-center gap-1.5 font-medium ${
                resendCooldown > 0
                  ? "text-stone-400 cursor-not-allowed"
                  : "text-emerald-700 hover:text-emerald-800 cursor-pointer"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "" : "hover:rotate-180 transition-transform"}`} />
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center p-12 bg-transparent max-w-xl w-full mx-auto gap-5 h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-gray-600 mt-2">
          Sign in to access your One Hive Account.
        </p>
      </div>

      <Button
        type="button"
        className="w-full mb-6 py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors h-12"
        onClick={() => handleGoogleLogin()}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-700">Continue with Google</span>
      </Button>

      <div className="text-center mb-6 grid grid-cols-5 place-items-center w-full">
        <Separator className="col-span-2" />
        <span className="text-gray-500 col-span-1">Or</span>
        <Separator className="col-span-2" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        <div>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            required
            className="m_input"
          />
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
            className="m_input pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 flex items-center justify-center cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="remember" id="" />
            <span>Remember Me</span>
          </div>
          <Link
            to="/forgot-password"
            className="text-blue-900 hover:text-blue-900"
          >
            Forgot Password?
          </Link>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 text-white bg-shads rounded-md hover:bg-shadsd focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 h-12"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="text-center text-gray-600">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-500 hover:text-blue-600">
          Create One
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
