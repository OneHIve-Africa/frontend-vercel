import { motion } from "framer-motion";
import HiveType from "./components/HiveType";

export const StepTwo = () => {
  return (
    <motion.div
      className="w-full max-w-9xl mx-auto p-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <HiveType />
    </motion.div>
  );
};
