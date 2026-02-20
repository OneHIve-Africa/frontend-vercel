import { logo, sucess } from "@/assets";
import { Button } from "@/components/Button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChangeSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 10000); // 10 seconds

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [navigate]);

  return (
    <div className="flex flex-col items-start justify-start h-screen bg-white w-full p-5 lg:p-12 gap-6 lg:gap-10">
      {/* Logo Section */}
      <div className="w-full flex justify-center lg:justify-start">
        <img src={logo} alt="logo" className="h-10 lg:h-auto" />
      </div>

      {/* Main Content */}
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 lg:gap-10">
        {/* Success Image */}
        <div className="w-full flex justify-center items-center">
          <img
            src={sucess}
            alt="Success"
            className="h-32 lg:h-auto object-center object-cover"
          />
        </div>

        {/* Message and Button */}
        <div className="w-full flex flex-col justify-center items-center gap-4">
          <h2 className="text-base lg:text-lg font-semibold text-gray-800 text-center">
            Password Reset Successful!
          </h2>
          <Button
            type="button"
            className="w-full max-w-[300px] py-2 text-sm font-semibold text-white bg-shads rounded-lg hover:bg-shadsd focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none h-12"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangeSuccessPage;
