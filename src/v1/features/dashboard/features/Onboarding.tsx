import { useEffect } from "react";
import { useOnboardingStore } from "../store/OnboardingStore";
import { StepOne } from "../components/onboarding/StepOne";
import { AnimatePresence } from "framer-motion";
import { StepTwo } from "../components/onboarding/StepTwo";
import Header from "@/v1/components/layout/Header";
import { StepFour } from "../components/onboarding/StepFour";

const Onboarding = () => {
  const { currentStep, loadFromLocalStorage } = useOnboardingStore();

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
            {currentStep === 0 && <StepOne key="step1" />}
            {currentStep === 1 && <StepTwo key="step2" />}
            {currentStep === 2 && <StepFour key="step3" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
