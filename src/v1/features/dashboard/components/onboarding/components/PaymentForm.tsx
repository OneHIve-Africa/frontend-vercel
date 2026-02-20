import { useState, useEffect, ChangeEvent } from "react";
import { usePaystackPayment } from "react-paystack";
import { useNavigate } from "react-router-dom";
import { useOnboardingStore } from "../../../store/OnboardingStore";
import { airtel, master, mtn, vf, visa } from "@/assets";
import PaymentApi from "@/v1/api/PaymentApi";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { useAuthStore } from "@/v1/features/auth/store/AuthStore";

interface PaystackReference {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

interface PaymentDetails {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  hiveType: string;
  investmentTier: string;
  quantity: number;
  personalDetails: string;
  timestamp: string;
}

interface PaymentSuccessData {
  paymentDetails: PaymentDetails;
  reference: string;
}

const PaymentForm = () => {
  const navigate = useNavigate();
  const {
    hiveType,
    investmentTier,
    personalDetails,
    setCurrentStep,
    setPersonalDetails,
    saveToLocalStorage,
  } = useOnboardingStore();
  const { profile, fetchProfile } = useUserProfileStore();

  const [localDetails, setLocalDetails] = useState({
    fullName: personalDetails.fullName || "",
    email: personalDetails.email || "",
    phoneNumber: personalDetails.phoneNumber || "",
    billingAddress: personalDetails.billingAddress || "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccessData, setPaymentSuccessData] =
    useState<PaymentSuccessData | null>(null);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    } else {
      setLocalDetails((prev) => ({
        ...prev,
        fullName:
          profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : prev.fullName,
        email: profile.email || prev.email,
        phoneNumber: profile.primary_phone || prev.phoneNumber,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    console.log("Payment success data changed:", paymentSuccessData);
    if (paymentSuccessData) {
      console.log("Navigating to payment success page with data:", paymentSuccessData);
      navigate("/payment-success", {
        state: paymentSuccessData,
      });
    }
  }, [paymentSuccessData, navigate]);

  const priceMap = {
    ktbh: 1000,
    langstroth: 1500,
    saltpond: 1000,
    legacy: 2000,
  };

  // Get current price
  const getPrice = () => {
    if (!hiveType) return 0;
    return priceMap[hiveType] || 0;
  };

  // Get quantity based on tier
  const getQuantity = () => {
    const quantityMap = {
      starter: 5,
      growth: 20,
      enterprise: 50,
      legacy: 100,
    };
    return investmentTier ? quantityMap[investmentTier] || 0 : 0;
  };

  // Calculate amounts
  const getSubtotal = () => {
    return getPrice() * getQuantity();
  };

  const getServiceCharge = () => {
    return getSubtotal() * 0.05;
  };

  const getTotalAmount = () => {
    return getSubtotal() + getServiceCharge();
  };

  // Calculate total amount in pesewas for Paystack
  const getTotalAmountInPesewas = () => {
    return Math.round(getTotalAmount() * 100);
  };

  // Paystack configuration
  const config = {
    reference: `oha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: localDetails.email,
    amount: getTotalAmountInPesewas(),
    currency: "GHS",
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        {
          display_name: "Full Name",
          variable_name: "full_name",
          value: localDetails.fullName,
        },
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: localDetails.phoneNumber,
        },
        {
          display_name: "Billing Address",
          variable_name: "billing_address",
          value: localDetails.billingAddress,
        },
        {
          display_name: "Hive Type",
          variable_name: "hive_type",
          value: hiveType,
        },
        {
          display_name: "Investment Tier",
          variable_name: "investment_tier",
          value: investmentTier,
        },
        {
          display_name: "Quantity",
          variable_name: "quantity",
          value: getQuantity().toString(),
        },
      ],
    },
  };

  // Initialize Paystack payment
  const initializePayment = usePaystackPayment(config);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Validate form fields
  const validateForm = () => {
    if (!localDetails.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!localDetails.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!localDetails.phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!localDetails.billingAddress.trim()) {
      setError("Billing address is required");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(localDetails.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  // Handle successful payment
  const handleSuccess = async (reference: PaystackReference) => {
    setIsProcessing(true);
    console.log("Payment success callback triggered:", reference);

    if (!hiveType || !investmentTier) {
      setError("Invalid hive type or investment tier");
      setIsProcessing(false);
      return;
    }

    // Save payment details (note: we save the subtotal as the investment amount)
    const paymentDetails = {
      reference: reference.reference,
      amount: getSubtotal(), // Investment amount, excluding service charge
      currency: "GHS",
      status: "success",
      hiveType,
      investmentTier,
      quantity: getQuantity(),
      personalDetails: localDetails.email,
      timestamp: new Date().toISOString(),
    };

    console.log("Setting payment success data:", paymentDetails);

    const successData = {
      paymentDetails,
      reference: reference.reference,
    };

    
    try {
      // Send payment details to backend (non-blocking)
      PaymentApi.createPayment(paymentDetails)
        .then(() => {
          console.log("Payment confirmation sent to backend successfully");
        })
        .catch((err) => {
          console.error("Failed to send payment confirmation to backend:", err);
        });

      // Save to localStorage
      localStorage.setItem("lastPayment", JSON.stringify(paymentDetails));
      
      // Clear investment in progress state
      localStorage.removeItem("newInvestmentData");
      const { setCurrentStep, setHiveType, setInvestmentTier, setPersonalDetails } = useOnboardingStore.getState();
      setCurrentStep(0);
      setHiveType(null);
      setInvestmentTier(null);
      setPersonalDetails({
        fullName: "",
        email: "",
        phoneNumber: "",
        billingAddress: "",
      });
      console.log("Onboarding store reset");

      // Update store with payment details
      setPersonalDetails(localDetails);
      saveToLocalStorage();

      // If onboarding, update profile is_first to false
      if (profile?.is_first) {
        try {
          const { updateProfile, setProfile, fetchProfile } =
            useUserProfileStore.getState();
          const { setIsFirstTime } = useAuthStore.getState();
          const success = await updateProfile({ is_first: false });
          if (success) {
            await fetchProfile();
            const updatedProfile = useUserProfileStore.getState().profile;
            if (updatedProfile) {
              setProfile(updatedProfile);
              setIsFirstTime(false);
              localStorage.setItem("user", JSON.stringify(updatedProfile));
              console.log("Onboarding profile updated successfully");
            }
          }
        } catch (err) {
          console.error("Failed to update onboarding profile:", err);
        }
      }
      
      // Set success data to trigger redirect
      setPaymentSuccessData(successData);
      console.log("Payment success data set, redirect should trigger");
      
    } catch (error) {
      console.error("Failed to process payment:", error);
      // Still redirect even if there's an error
      setPaymentSuccessData(successData);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment close (user closed payment modal)
  const handleClose = () => {
    console.log("Payment modal closed");
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) return;

    // Check if required investment details are available
    if (!hiveType || !investmentTier) {
      setError("Please select hive type and investment tier");
      return;
    }

    setIsProcessing(true);
    setError("");

    // Update store with current details
    setPersonalDetails(localDetails);
    saveToLocalStorage();

    // Initialize Paystack payment
    initializePayment({ onSuccess: handleSuccess, onClose: handleClose });
  };

  const handleChangeTier = () => {
    setCurrentStep(0);
  };

  const handleChangeType = () => {
    setCurrentStep(1);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 p-4 w-full">
      <div className="w-full flex justify-center flex-col items-center">
        <div className="max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Make Payment
          </h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl">
            At One Hive Africa, we offer different beehive options tailored to
            maximize honey production, sustainability, and impact. Select the
            hive that aligns with your investment goals.
          </p>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Personal details form */}
          <div className="bg-oha_secondary py-4 px-8 rounded-xl flex-1 scale-90 -mr-10">
            <h2 className="text-2xl font-semibold text-white mb-3">
              Personal details
            </h2>
            <p className="text-white text-sm mb-6 max-w-80">
              Fill in the containers with your personal details to complete your
              purchase
            </p>

            <div className="flex flex-col gap-8">
              <input
                type="text"
                name="fullName"
                placeholder="Full name"
                className="w-full p-4 rounded-lg border-none bg-white"
                value={localDetails.fullName}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-4 rounded-lg border-none bg-white"
                value={localDetails.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone number"
                className="w-full p-4 rounded-lg border-none bg-white"
                value={localDetails.phoneNumber}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="billingAddress"
                placeholder="Billing address"
                className="w-full p-4 rounded-lg border-none bg-white"
                value={localDetails.billingAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Payment details */}
          <div className="bg-white p-8 rounded-xl border flex-1 flex flex-col gap-4 z-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium capitalize">
                {investmentTier} pack
              </h3>
              <button
                className="bg-oha_secondary text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                onClick={handleChangeTier}
                disabled={isProcessing}
              >
                Change Tier
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium capitalize">
                {hiveType} hive
              </h3>
              <button
                className="border border-oha_secondary text-oha_secondary px-4 py-2 rounded-md hover:bg-green-100 transition-colors"
                onClick={handleChangeType}
                disabled={isProcessing}
              >
                Change Type
              </button>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg mb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">GHS {getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Charge (5%)</span>
                  <span className="font-medium text-gray-800">GHS {getServiceCharge().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span className="text-gray-800">Total</span>
                    <span className="text-green-600">
                      GHS {getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-base font-medium">Pay with:</h3>
              <div className="flex gap-4 flex-wrap">
                <img src={master} alt="Mastercard" className="h-10" />
                <img src={visa} alt="Visa" className="h-10" />
                <div className="w-4"></div>
                <img src={mtn} alt="MTN Mobile Money" className="h-10" />
                <img src={airtel} alt="Airtel Money" className="h-10" />
                <img src={vf} alt="Vodafone Cash" className="h-10" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Secure payment powered by Paystack
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-center mb-4 p-3 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <button
              className="w-full bg-oha_secondary text-white py-4 rounded-md hover:bg-green-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : `Pay GHS ${getTotalAmount().toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}`}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By clicking "Pay", you agree to our terms and conditions. Your
              payment is secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
