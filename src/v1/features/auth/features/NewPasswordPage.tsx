import NewPasswordForm from "../components/NewPasswordForm";
import { logo } from "@/assets";

const NewPasswordPage = () => {
  return (
    <div className="flex flex-col items-start justify-start h-screen bg-white w-full lg:p-12 gap-10">
      <div className="">
        <img src={logo} alt="logo" />
      </div>
      <div className="w-full p-8 flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-oha.dark.gray">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter a new passsword to get access to your account{" "}
          </p>
        </div>
        <NewPasswordForm />
      </div>
    </div>
  );
};

export default NewPasswordPage;
