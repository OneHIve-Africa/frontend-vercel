import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { toast } from "react-hot-toast";

// type Props = {}

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { requestPasswordReset, isLoading, error } = useAuthStore();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await requestPasswordReset({
      email,
      password: "",
      password_confirm: "",
    });
    if (success) {
      localStorage.setItem("r_email", email);
      toast.success("Password reset instructions sent to your email");
      navigate("/otp-verify");
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <form
      className="flex flex-col gap-6 mt-5 lg:w-[500px]"
      onSubmit={handleEmailSubmit}
    >
      <div>
        <Input
          type="email"
          placeholder="johndoe@mail.com"
          className="m_input"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update state on input change
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 text-sm font-semibold text-white bg-shads rounded-lg hover:bg-shadsd focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none h-12"
      >
        {isLoading ? "Sending..." : "Send"}
      </Button>
      <Button
        type="button"
        className="w-full py-2 text-sm font-semibold text-green-600 border border-shads rounded-lg hover:bg-shadsd hover:text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none h-12"
        onClick={() => navigate("/login")}
      >
        <ArrowLeft />
        Back
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
