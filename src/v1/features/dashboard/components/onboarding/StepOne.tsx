import { motion } from "framer-motion";
import InvestmentTiers from "./components/InvestmentTiers";

export const StepOne = () => {
  return (
    <motion.div
      className="w-full max-w-6xl mx-auto p-4 pt-32"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <InvestmentTiers />

      {/* <div className="mt-6">
        <button
          onClick={handleNext}
          disabled={!investmentTier}
          className="bg-oha_secondary hover:bg-oha_secondary/80 text-white px-6 py-2 rounded disabled:bg-gray-300 cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div> */}
    </motion.div>
  );
};
