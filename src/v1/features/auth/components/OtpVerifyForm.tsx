import { Button } from "@/components/Button";
import { InputOTP, InputOTPSlot } from "@/components/InputOTP";
import { XIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "react-hot-toast";

type Props = {
  email: string;
};

const OtpVerifyForm = (props: Props) => {
  const navigate = useNavigate();
  const { email } = props;
  const [otpValue, setOTPValue] = useState("");
  const { verifyOTP, isLoading, error } = useAuthStore();

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpValue.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    const success = await verifyOTP({ email, otp: otpValue });
    if (success) {
      toast.success("OTP verified successfully");
      navigate("/new-password");
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-oha.dark.gray">Enter Code</h1>
        <p className="text-sm text-gray-500 mt-2">
          We sent a code to <span className="font-medium">{email}</span>
        </p>
      </div>
      <form
        className="flex flex-col gap-8 mt-5 lg:w-[500px]"
        onSubmit={handleOTPSubmit}
      >
        <div>
          <InputOTP
            maxLength={4}
            value={otpValue}
            onChange={(value) => setOTPValue(value)}
          >
            <InputOTPSlot index={0} className="m_input " />
            <InputOTPSlot index={1} className="m_input" />
            <InputOTPSlot index={2} className="m_input" />
            <InputOTPSlot index={3} className="m_input" />
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 text-sm font-semibold text-white bg-shads rounded-lg hover:bg-shadsd focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none h-12"
        >
          {isLoading ? "Verifying..." : "Verify"}
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
    </div>
  );
};

export default OtpVerifyForm;
