import { logo } from "@/assets";

import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="flex flex-col items-start justify-start h-screen bg-white w-full lg:p-12 gap-10">
      <div className="">
        <img src={logo} alt="logo" />
      </div>
      <div className="w-full p-8 flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-oha.dark.gray">
            Forgot Your Password?
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your email address to help retrieve your account
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
