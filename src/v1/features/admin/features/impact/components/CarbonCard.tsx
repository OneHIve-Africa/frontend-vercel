import React from "react";
import { motion } from "framer-motion";
import { CarbonOffsetCardProps } from "../types/types";
import { LeafInHand } from "@/assets";

const CarbonCard: React.FC<CarbonOffsetCardProps> = ({ title, value, isPrimary = false, delay }) => {
  const cardClasses = isPrimary
    ? "bg-oha_primary text-white shadow-lg"
    : "bg-white text-gray-800 shadow-md";


  return (
    <motion.div
      className={`rounded-xl p-6 flex flex-col items-center justify-center text-center ${cardClasses}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        boxShadow: isPrimary
          ? "0 10px 15px -3px rgb(249 115 22 / 0.5)"
          : "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      }}
    >
      <div className="relative w-24 h-24 rounded-full flex items-center justify-center mb-4">
        {/* Placeholder for dotted circles */}
        <div
          className={`absolute w-full h-full rounded-full border-2 border-dashed ${
            isPrimary ? "border-white border-opacity-50" : "border-gray-300"
          }`}
        ></div>
        <div
          className={`absolute w-16 p-2 h-16 rounded-full flex items-center justify-center ${
            isPrimary ? "bg-white bg-opacity-20" : "bg-gray-200"
          }`}
        >
          <img src={LeafInHand} alt="" className="w-[60px]" />
        </div>
      </div>
      <h3 className="text-sm font-semibold">{value}</h3>
      <p className="text-sm font-light mt-1">{title}</p>
    </motion.div>
  );
};

export default CarbonCard;
