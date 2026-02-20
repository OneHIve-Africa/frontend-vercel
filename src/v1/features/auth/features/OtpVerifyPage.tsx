import { logo, otp_verify } from "@/assets";
import { useEffect, useState } from "react";
import OtpVerifyForm from "../components/OtpVerifyForm";

const OtpVerifyPage = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Retrieve the email from localStorage
    const storedEmail = localStorage.getItem("r_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <div className="flex flex-col items-start justify-start h-screen bg-white w-full lg:p-12 gap-10">
      <div>
        <img src={logo} alt="logo" />
      </div>
      <div className="w-full p-8 flex flex-col h-full items-center justify-center">
        <div className=" w-full h-full flex justify-center items-center gap-32">
          <img
            src={otp_verify}
            alt="side image"
            className="w-[183px] h-fit object-center aspect-auto object-cover"
          />
          <OtpVerifyForm email={email} />
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
