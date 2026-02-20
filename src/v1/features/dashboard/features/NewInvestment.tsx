import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/v1/components/layout/Header";
import { useNewInvestmentStore } from "../store/NewInvestmentStore";
import { StepOne } from "../components/new-investment/StepOne";
import { StepTwo } from "../components/new-investment/StepTwo";
import { StepFour } from "../components/new-investment/StepFour";

const NewInvestment = () => {
  const { currentStep, loadFromLocalStorage } = useNewInvestmentStore();

  useEffect(() => {
    // Load any saved data from localStorage on component mount
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex w-full justify-center items-center bg-gray-100">
        <div className="bg-gray-100 p-6 w-full max-w-7xl">
          <AnimatePresence mode="wait">
            {currentStep === 0 && <StepOne key="new-investment-step1" />}
            {currentStep === 1 && <StepTwo key="new-investment-step2" />}
            {currentStep === 2 && <StepFour key="new-investment-step3" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NewInvestment;
