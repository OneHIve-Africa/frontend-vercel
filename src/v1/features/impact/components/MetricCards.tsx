import React from "react";

type MetricCardProps = {
  title: string;
  value: string | number;
  unit: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit }) => {
  return (
    <div className="p-4 bg-gray-100  rounded-md w-64 text-center h-36 flex flex-col items-center justify-center">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="font-semibold text-gray-800 mt-2">
        {value} <span className="text-base font-normal">{unit}</span>
      </p>
    </div>
  );
};

export default MetricCard;
