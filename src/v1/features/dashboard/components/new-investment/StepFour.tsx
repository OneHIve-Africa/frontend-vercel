import { motion } from "framer-motion";
import PaymentForm from "./components/PaymentForm";

export const StepFour = () => {
  return (
    <motion.div
      className="w-full mx-auto p-4 bg-gray-100 h-screen"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <PaymentForm />
    </motion.div>
  );
};
