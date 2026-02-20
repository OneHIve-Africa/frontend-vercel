import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Download, ArrowRight, Mail, Phone } from "lucide-react";
import { useAuthStore } from "@/v1/features/auth/store/AuthStore";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import UserProfileApi from "@/v1/api/UserProfileApi";
import { success } from "@/assets";

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

// Minimalist confetti effect
const Confetti = () => {
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "8px";
      confetti.style.height = "8px";
      confetti.style.backgroundColor =
        randomInRange(0, 1) > 0.5 ? "#1b9d3c" : "#f09443";
      confetti.style.left = randomInRange(0, window.innerWidth) + "px";
      confetti.style.top = "-10px";
      confetti.style.zIndex = "9999";
      confetti.style.pointerEvents = "none";
      confetti.style.borderRadius = "50%";
      confetti.style.animation = `fall ${randomInRange(2, 4)}s linear forwards`;

      document.body.appendChild(confetti);

      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 4000);
    }, 300);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      clearInterval(interval);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsFirstTime } = useAuthStore();
  const { profile, setProfile } = useUserProfileStore();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [showConfetti, setShowConfetti] = useState(true);
  const didFinalizeRef = useRef(false);

  useEffect(() => {
    // First check location.state for fresh payment data
    const locationState = (location.state as any) || {};
    const stateDetails = locationState.paymentDetails as PaymentDetails | undefined;
    
    // Fall back to localStorage if no state data
    const storedDetails = !stateDetails 
      ? (JSON.parse(localStorage.getItem("lastPayment") || "null") as PaymentDetails | null)
      : null;
    
    const details = stateDetails || storedDetails;

    if (!details) {
      navigate("/");
      return;
    }

    setPaymentDetails(details);
    
    // Update localStorage with latest payment
    if (stateDetails) {
      localStorage.setItem("lastPayment", JSON.stringify(stateDetails));
    }

    if (!didFinalizeRef.current) {
      didFinalizeRef.current = true;
      setIsFirstTime(false);
      if (profile) {
        const updated = { ...profile, is_first: false } as typeof profile;
        setProfile(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        (async () => {
          try {
            await UserProfileApi.getInstance().updateProfile({ is_first: false });
          } catch (e) {
            console.warn("Failed to update is_first on server:", e);
          }
        })();
      } else {
        const raw = localStorage.getItem("user");
        if (raw) {
          try {
            const u = JSON.parse(raw);
            u.is_first = false;
            localStorage.setItem("user", JSON.stringify(u));
          } catch {}
        }
      }
    }

    localStorage.removeItem("onboardingData");

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadReceipt = () => {
    if (!paymentDetails) return;

    // Create a formatted HTML receipt
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt - One Hive Africa</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 40px;
            background: #f9fafb;
          }
          .receipt {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f09443 0%, #1b9d3c 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 700;
          }
          .header p {
            font-size: 14px;
            opacity: 0.95;
          }
          .content {
            padding: 30px;
          }
          .success-badge {
            background: #dcfce7;
            color: #166534;
            padding: 12px 24px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
            font-weight: 600;
            font-size: 16px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #6b7280;
            font-size: 14px;
          }
          .detail-value {
            color: #111827;
            font-weight: 600;
            font-size: 14px;
            text-align: right;
          }
          .amount-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .amount-section .detail-row {
            border: none;
            padding: 8px 0;
          }
          .total-amount {
            font-size: 24px;
            color: #1b9d3c;
            font-weight: 700;
          }
          .footer {
            background: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
          }
          .footer strong {
            color: #111827;
          }
          @media print {
            body { padding: 0; background: white; }
            .receipt { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>One Hive Africa</h1>
            <p>Investment Receipt</p>
          </div>
          
          <div class="content">
            <div class="success-badge">
              ✓ Payment Successful
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Reference Number</span>
              <span class="detail-value">${paymentDetails.reference}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${new Date(paymentDetails.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Customer Email</span>
              <span class="detail-value">${paymentDetails.personalDetails}</span>
            </div>
            
            <div class="amount-section">
              <div class="detail-row">
                <span class="detail-label">Hive Type</span>
                <span class="detail-value" style="text-transform: capitalize;">${paymentDetails.hiveType}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Investment Tier</span>
                <span class="detail-value" style="text-transform: capitalize;">${paymentDetails.investmentTier}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Quantity</span>
                <span class="detail-value">${paymentDetails.quantity} ${paymentDetails.quantity === 1 ? 'hive' : 'hives'}</span>
              </div>
              
              <div class="detail-row" style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #e5e7eb;">
                <span class="detail-label" style="font-size: 16px; font-weight: 600; color: #111827;">Total Amount Paid</span>
                <span class="detail-value total-amount">GHS ${paymentDetails.amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
                Thank you for investing in One Hive Africa. Your investment supports sustainable beekeeping 
                and empowers local communities. You will receive email confirmation within 24 hours.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>One Hive Africa</strong></p>
            <p>Email: support@onehiveafrica.com | Phone: +233 12 345 6789</p>
            <p style="margin-top: 8px;">This is an official payment receipt. Please keep it for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a new window with the receipt
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  const handleViewDashboard = () => {
    navigate("/portfolio");
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-oha_secondary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {showConfetti && <Confetti />}

      {/* Mobile Layout */}
      <div className="lg:hidden max-w-2xl mx-auto px-4 py-8 sm:py-16">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-oha_secondary/10 mb-6">
            <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-oha_secondary" strokeWidth={2} />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Payment Successful
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
            Thank you for investing in One Hive Africa. Your beekeeping journey begins now.
          </p>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500">Amount Paid</span>
            <span className="text-2xl sm:text-3xl font-bold text-oha_secondary">
              GHS {paymentDetails.amount?.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reference</span>
              <span className="font-medium text-gray-900 break-all text-right ml-4">
                {paymentDetails.reference}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hive Type</span>
              <span className="font-medium text-gray-900 capitalize">
                {paymentDetails.hiveType}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="font-medium text-gray-900">
                {paymentDetails.quantity} {paymentDetails.quantity === 1 ? 'hive' : 'hives'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Investment Tier</span>
              <span className="font-medium text-gray-900 capitalize">
                {paymentDetails.investmentTier}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(paymentDetails.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
          <div className="space-y-3">
            {[
              { step: "1", title: "Email Confirmation", desc: "Within 24 hours" },
              { step: "2", title: "Team Contact", desc: "2-3 business days" },
              { step: "3", title: "Hive Setup", desc: "1-2 weeks" },
              { step: "4", title: "Regular Updates", desc: "Ongoing reports" }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-oha_primary flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{item.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleViewDashboard}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-oha_secondary text-white rounded-xl font-semibold hover:bg-oha_secondary/90 transition-colors shadow-sm"
          >
            View Portfolio
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleDownloadReceipt}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
        </div>

        {/* Support */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Need help?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:support@onehiveafrica.com"
              className="flex items-center gap-2 text-oha_secondary hover:text-oha_secondary/80 transition-colors font-medium"
            >
              <Mail className="w-4 h-4" />
              support@onehiveafrica.com
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="tel:+233123456789"
              className="flex items-center gap-2 text-oha_secondary hover:text-oha_secondary/80 transition-colors font-medium"
            >
              <Phone className="w-4 h-4" />
              +233 12 345 6789
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen items-center justify-center p-8">
        <div className="max-w-7xl w-full grid grid-cols-2 gap-12 items-center">
          {/* Left Side - Image/Illustration */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden relative">
              {/* Background Image */}
              <img 
                src={success} 
                alt="Success" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Honeycomb overlay */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="honeycomb" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
                    <polygon points="10,0 20,5.77 20,14.43 10,20.21 0,14.43 0,5.77" fill="none" stroke="#f09443" strokeWidth="0.8"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#honeycomb)" />
                </svg>
              </div>
              
              {/* Gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              {/* Success Icon */}
              <div className="relative z-10 flex items-center justify-center h-full text-center px-8">
                <div>
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-2xl mb-6">
                    <CheckCircle2 className="w-20 h-20 text-oha_secondary" strokeWidth={2} />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Success!</h2>
                  <p className="text-lg text-white drop-shadow-md">Your investment is confirmed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Payment Successful
              </h1>
              <p className="text-gray-600 text-lg">
                Thank you for investing in One Hive Africa. Your beekeeping journey begins now.
              </p>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-500">Amount Paid</span>
                <span className="text-3xl font-bold text-oha_secondary">
                  GHS {paymentDetails.amount?.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reference</p>
                  <p className="font-medium text-gray-900 text-sm break-all">
                    {paymentDetails.reference}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hive Type</p>
                  <p className="font-medium text-gray-900 text-sm capitalize">
                    {paymentDetails.hiveType}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quantity</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {paymentDetails.quantity} {paymentDetails.quantity === 1 ? 'hive' : 'hives'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Investment Tier</p>
                  <p className="font-medium text-gray-900 text-sm capitalize">
                    {paymentDetails.investmentTier}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {new Date(paymentDetails.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps - Compact Grid */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { step: "1", title: "Email Confirmation", desc: "Within 24 hours" },
                  { step: "2", title: "Team Contact", desc: "2-3 business days" },
                  { step: "3", title: "Hive Setup", desc: "1-2 weeks" },
                  { step: "4", title: "Regular Updates", desc: "Ongoing reports" }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-oha_primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{item.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleViewDashboard}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-oha_secondary text-white rounded-xl font-semibold hover:bg-oha_secondary/90 transition-colors shadow-sm"
              >
                View Portfolio
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDownloadReceipt}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
            </div>

            {/* Support */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Need help?</p>
              <div className="flex items-center gap-6 text-sm">
                <a
                  href="mailto:support@onehiveafrica.com"
                  className="flex items-center gap-2 text-oha_secondary hover:text-oha_secondary/80 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  support@onehiveafrica.com
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="tel:+233123456789"
                  className="flex items-center gap-2 text-oha_secondary hover:text-oha_secondary/80 transition-colors font-medium"
                >
                  <Phone className="w-4 h-4" />
                  +233 12 345 6789
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
