import { useState, useEffect, ChangeEvent } from "react";
import { usePaystackPayment } from "react-paystack";
import { useNavigate } from "react-router-dom";
import { useNewInvestmentStore } from "../../../store/NewInvestmentStore";
import { airtel, master, mtn, vf, visa } from "@/assets";
import PaymentApi from "@/v1/api/PaymentApi";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";

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
  } = useNewInvestmentStore();
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
  } as const;

  const getPrice = () => {
    if (!hiveType) return 0;
    return priceMap[hiveType] || 0;
  };

  const getQuantity = () => {
    const quantityMap = {
      starter: 5,
      growth: 20,
      enterprise: 50,
      legacy: 100,
    } as const;
    return investmentTier ? quantityMap[investmentTier] || 0 : 0;
  };

  const getSubtotal = () => {
    return getPrice() * getQuantity();
  };

  const getServiceCharge = () => {
    return getSubtotal() * 0.05;
  };

  const getTotalAmount = () => {
    return getSubtotal() + getServiceCharge();
  };

  const getTotalAmountInPesewas = () => {
    return Math.round(getTotalAmount() * 100);
  };

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
          value: getQuantity(),
        },
        {
          display_name: "Subtotal",
          variable_name: "subtotal",
          value: getSubtotal(),
        },
        {
          display_name: "Service Charge (5%)",
          variable_name: "service_charge",
          value: getServiceCharge(),
        },
        {
          display_name: "Total",
          variable_name: "total",
          value: getTotalAmount(),
        },
      ],
    },
  } as const;

  const initializePayment = usePaystackPayment(config);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!localDetails.fullName) return "Full Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localDetails.email))
      return "Invalid email address";
    if (!/^[0-9]{7,15}$/.test(localDetails.phoneNumber.replace(/\D/g, "")))
      return "Invalid phone number";
    if (!localDetails.billingAddress) return "Billing address is required";
    if (!hiveType || !investmentTier) return "Please select tier and hive type";
    return "";
  };

  const handleSuccess = async (reference: PaystackReference) => {
    console.log("Payment success callback triggered:", reference);
    
    try {
      const investmentDetails = {
        reference: reference.reference,
        amount: getTotalAmount(),
        currency: config.currency,
        status: reference.status,
        hiveType: hiveType || "",
        investmentTier: investmentTier || "",
        quantity: getQuantity(),
        personalDetails: JSON.stringify(localDetails),
        timestamp: new Date().toISOString(),
      };

      console.log("Setting payment success data:", investmentDetails);
      
      // Set success data and trigger redirect
      const successData = {
        paymentDetails: investmentDetails,
        reference: reference.reference,
      };
      
      setPaymentSuccessData(successData);
      
      console.log("Payment success data set, redirect should trigger");

      // Send payment confirmation to backend (async, don't block redirect)
      PaymentApi.createPayment(investmentDetails)
        .then(() => {
          console.log("Payment confirmation sent to backend successfully");
        })
        .catch((err) => {
          console.error("Failed to send payment confirmation to backend:", err);
          // Don't block the user experience - they've already paid
        });

      // Mark as completed and clear in-progress data
      try {
        localStorage.setItem("newInvestmentCompleted", "true");
        localStorage.removeItem("newInvestmentData");
        console.log("Local storage cleared");
        
        // Reset Zustand store to clear in-progress state
        const { setCurrentStep, setHiveType, setInvestmentTier, setPersonalDetails } = useNewInvestmentStore.getState();
        setCurrentStep(0);
        setHiveType(null);
        setInvestmentTier(null);
        setPersonalDetails({
          fullName: "",
          email: "",
          phoneNumber: "",
          billingAddress: "",
        });
        console.log("Investment store reset");
      } catch (err) {
        console.error("Failed to clear local storage:", err);
      }
    } catch (err) {
      console.error("Payment post-processing failed:", err);
      // Still try to redirect even if there's an error
      const fallbackData = {
        paymentDetails: {
          reference: reference.reference,
          amount: getTotalAmount(),
          currency: config.currency,
          status: reference.status,
          hiveType: hiveType || "",
          investmentTier: investmentTier || "",
          quantity: getQuantity(),
          personalDetails: JSON.stringify(localDetails),
          timestamp: new Date().toISOString(),
        },
        reference: reference.reference,
      };
      setPaymentSuccessData(fallbackData);
    }
  };

  const handleClose = () => {};

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError("");

    initializePayment({ onSuccess: handleSuccess, onClose: handleClose });

    setPersonalDetails(localDetails);
    saveToLocalStorage();

    setTimeout(() => setIsProcessing(false), 3000);
  };

  const handleChangeTier = () => setCurrentStep(0);
  const handleChangeType = () => setCurrentStep(1);

  return (
    <div className="flex justify-center items-center bg-gray-100 p-4 w-full">
      <div className="w-full flex justify-center flex-col items-center">
        <div className="max-w-2xl text-center mt-16">
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
                  <span className="font-medium text-gray-800">
                    GHS {getSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Charge (5%)</span>
                  <span className="font-medium text-gray-800">
                    GHS {getServiceCharge().toFixed(2)}
                  </span>
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
