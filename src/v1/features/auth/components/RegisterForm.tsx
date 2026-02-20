import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Separator } from "@/components/Separator";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "react-hot-toast";
import AuthTermsModal from "../components/AuthTermsModal";
import { useGoogleLogin } from "@react-oauth/google";

interface RegisterFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  primary_phone: string;
  location: string;
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    primary_phone: "",
    location: "",
  });

  const { register, googleLogin, isLoading, fieldErrors } = useAuthStore();
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [focusedErrorField, setFocusedErrorField] = useState<string | null>(null);

  // Compute the first field with an error to focus/highlight
  const firstErrorField = useMemo(() => {
    if (!fieldErrors) return null;
    const keys = Object.keys(fieldErrors);
    return keys.length ? keys[0] : null;
  }, [fieldErrors]);

  // Focus the first errored field and apply a primary ring highlight
  useEffect(() => {
    if (!firstErrorField) return;
    const el = document.querySelector<HTMLInputElement>(`input[name="${firstErrorField}"]`);
    if (el) {
      el.focus();
      setFocusedErrorField(firstErrorField);
    }
  }, [firstErrorField]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleLoginSuccess = async (tokenResponse: any) => {
    console.log("[GoogleDebug] Token Response:", tokenResponse);
    const success = await googleLogin(tokenResponse.access_token);
    
    if (success) {
      toast.success("Google registration successful!");
      // Redirect to portfolio/onboarding as it's a social login/signup hybrid
      const isFirst = useAuthStore.getState().isFirstTime;
      navigate(isFirst ? "/onboarding" : "/portfolio");
    } else {
      const currentError = useAuthStore.getState().error;
      toast.error(currentError || "Google registration failed");
    }
  };

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => toast.error("Google Registration Failed"),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!acceptedTerms) {
      toast.error("You must accept the Terms and Conditions to register.");
      return;
    }
    const success = await register(formData);
    
    // Get the latest error state directly from the store
    const currentError = useAuthStore.getState().error;
    
    if (success) {
      toast.success("Registration successful! Please login to continue.");
      navigate("/login");
    } else if (currentError) {
      toast.error(currentError);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-12 bg-white max-w-xl w-full mx-auto gap-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 text-oha.dark.gray">
          Create Account
        </h2>
        <p className="text-oha.light.gray mb-8">
          Create a One Hive Account to start buzzing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {fieldErrors && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            <p className="font-medium mb-1">Please fix the following:</p>
            <ul className="list-disc ml-5 space-y-1">
              {Object.entries(fieldErrors).map(([key, msgs]) => (
                <li key={key}>
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>: {msgs[0]}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Google Sign In Button */}
        <Button
          type="button"
          className="w-full mb-6 py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors h-12"
          onClick={() => handleGoogleRegister()}
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

        <div className="text-center mb-6 grid grid-cols-5 place-items-center">
          <Separator className="col-span-2" />
          <span className="text-gray-500 col-span-1">Or</span>
          <Separator className="col-span-2" />
        </div>

        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              name="first_name"
              placeholder="First Name"
              aria-invalid={!!fieldErrors?.first_name}
              aria-describedby={fieldErrors?.first_name ? 'first_name_error' : undefined}
              className={`m_input ${fieldErrors?.first_name ? 'border border-red-500' : ''} ${focusedErrorField === 'first_name' ? 'ring-2 ring-oha_primary border border-oha_primary' : ''}`}
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            {fieldErrors?.first_name && (
              <p id="first_name_error" className="text-red-500 text-sm mt-1">{fieldErrors.first_name[0]}</p>
            )}
          </div>
          <div>
            <Input
              type="text"
              name="last_name"
              placeholder="Last Name"
              aria-invalid={!!fieldErrors?.last_name}
              aria-describedby={fieldErrors?.last_name ? 'last_name_error' : undefined}
              className={`m_input ${fieldErrors?.last_name ? 'border border-red-500' : ''} ${focusedErrorField === 'last_name' ? 'ring-2 ring-oha_primary border border-oha_primary' : ''}`}
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            {fieldErrors?.last_name && (
              <p id="last_name_error" className="text-red-500 text-sm mt-1">{fieldErrors.last_name[0]}</p>
            )}
          </div>
        </div>

        {/* Email Input */}
        <div>
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            aria-invalid={!!fieldErrors?.email}
            aria-describedby={fieldErrors?.email ? 'email_error' : undefined}
            className={`m_input ${fieldErrors?.email ? 'border border-red-500' : ''} ${focusedErrorField === 'email' ? 'ring-2 ring-oha_primary border border-oha_primary' : ''}`}
            value={formData.email}
            onChange={handleChange}
            required
          />
          {fieldErrors?.email && (
            <p id="email_error" className="text-red-500 text-sm mt-1">{fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            aria-invalid={!!fieldErrors?.password}
            aria-describedby={fieldErrors?.password ? 'password_error' : undefined}
            className={`m_input ${fieldErrors?.password ? 'border border-red-500' : ''} ${focusedErrorField === 'password' ? 'ring-2 ring-oha_primary border border-oha_primary' : ''}`}
            value={formData.password}
            onChange={handleChange}
            required
          />
          {fieldErrors?.password && (
            <p id="password_error" className="text-red-500 text-sm mt-1">{fieldErrors.password[0]}</p>
          )}
        </div>

        {/* Phone and Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="tel"
              name="primary_phone"
              placeholder="Phone Number"
              aria-invalid={!!fieldErrors?.primary_phone}
              aria-describedby={fieldErrors?.primary_phone ? 'primary_phone_error' : undefined}
              className={`m_input ${fieldErrors?.primary_phone ? 'border border-red-500' : ''} ${focusedErrorField === 'primary_phone' ? 'ring-2 ring-oha_primary border border-oha_primary' : ''}`}
              value={formData.primary_phone}
              onChange={handleChange}
            />
            {fieldErrors?.primary_phone && (
              <p id="primary_phone_error" className="text-red-500 text-sm mt-1">{fieldErrors.primary_phone[0]}</p>
            )}
          </div>
          <div>
            <Input
              type="text"
              name="location"
              placeholder="Location"
              aria-invalid={!!fieldErrors?.location}
              aria-describedby={fieldErrors?.location ? 'location_error' : undefined}
              className={`m_input ${fieldErrors?.location ? 'border border-red-500' : ''} ${focusedErrorField === 'location' ? 'ring-2 ring-oha_primary border border-oha_primary' : ''}`}
              value={formData.location}
              onChange={handleChange}
            />
            {fieldErrors?.location && (
              <p id="location_error" className="text-red-500 text-sm mt-1">{fieldErrors.location[0]}</p>
            )}
          </div>
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          disabled={isLoading || !acceptedTerms}
          className={`w-full py-3 rounded-md transition-colors mb-6 h-12 ${
            isLoading || !acceptedTerms
              ? "bg-gray-300 cursor-not-allowed text-gray-600"
              : "bg-shads text-white hover:bg-shadsd"
          }`}
        >
          {isLoading ? "Creating Account..." : "Register"}
        </Button>

        {/* Terms and Conditions */}
        <div className="-mt-3 mb-6">
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-oha_primary focus:ring-oha_primary"
            />
            <span>
              I have read and agree to the
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="ml-1 text-green-700 font-medium hover:underline"
              >
                Terms and Conditions
              </button>
            </span>
          </label>
          {submitAttempted && !acceptedTerms && (
            <p className="text-red-500 text-sm mt-2">You must accept the Terms and Conditions to continue.</p>
          )}
        </div>

        {/* Sign In Link */}
        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </form>

      {showTerms && (
        <AuthTermsModal
          onClose={() => setShowTerms(false)}
          onAccept={() => setAcceptedTerms(true)}
        />
      )}
    </div>
  );
};

export default RegisterForm;
