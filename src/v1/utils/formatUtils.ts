export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(value)) {
    return "GHS 0.00";
  }

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
