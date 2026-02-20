import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Receipt, Droplet, UserPlus, Printer, Calculator } from "lucide-react";
import { toast } from "react-hot-toast";
import Select from "react-select";
import { useProductionStore } from "../store/ProductionStore";
import { useBuyerStore } from "../store/BuyerStore";
import BuyerEnrollmentModal from "./BuyerEnrollmentModal";
import ReceiptModal from "./ReceiptModal";
import SystemApi, { SystemConfig } from "@/v1/api/SystemApi";

interface OptionType {
  value: string;
  label: string;
}

interface ReceiptData {
  referenceId: string;
  date: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerOrganization?: string;
  items: {
    description: string;
    quantity: number;
    rate: string;
    amount: string;
  }[];
  subtotal: string;
  discount: string;
  discountType: "percentage" | "fixed";
  total: string;
  currency: string;
}

const HoneySalesForm: React.FC = () => {
  const { createRevenue, isLoading } = useProductionStore();
  const { buyers, fetchBuyers } = useBuyerStore();
  
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSaleReceipt, setLastSaleReceipt] = useState<ReceiptData | null>(null);
  const [saleCompleted, setSaleCompleted] = useState(false);
  
  // Options State
  const [buyerOptions, setBuyerOptions] = useState<OptionType[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<OptionType | null>(null);

  // System Config State
  const [config, setConfig] = useState<SystemConfig | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    quantity: "",
    discount: "0",
    description: "",
  });

  // Load Buyers and Config
  useEffect(() => {
    fetchBuyers();
    const fetchConfig = async () => {
      const response = await SystemApi.getInstance().getConfig();
      if (response.data) {
        setConfig(response.data);
      }
    };
    fetchConfig();
  }, []);

  // Update options when buyers change
  useEffect(() => {
    setBuyerOptions(buyers.map(b => ({
      value: String(b.id),
      label: `${b.name} (${b.type})`
    })));
  }, [buyers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuyerChange = (option: OptionType | null) => {
    setSelectedBuyer(option);
  };

  const calculateTotal = () => {
    if (!config) return "0.00";
    const qty = parseFloat(formData.quantity) || 0;
    const discountInput = parseFloat(formData.discount) || 0;
    const rate = config.honey_price_per_liter;
    const gross = qty * rate;
    
    let total = 0;
    if (config.discount_type === 'percentage') {
       const discountAmount = gross * (discountInput / 100);
       total = gross - discountAmount;
    } else {
       total = gross - discountInput;
    }
    
    return Math.max(0, total).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity || !selectedBuyer || !config) {
      toast.error("Please fill in all required fields");
      return;
    }

    const buyer = buyers.find(b => b.id === Number(selectedBuyer.value));
    const qty = Number(formData.quantity);
    const discountInput = Number(formData.discount);
    const rate = config.honey_price_per_liter;
    const gross = qty * rate;
    
    // Calculate discount amount
    let discountAmount = 0;
    if (config.discount_type === 'percentage') {
      discountAmount = gross * (discountInput / 100);
    } else {
      discountAmount = discountInput;
    }
    
    const total = gross - discountAmount;

    const success = await createRevenue({
      source: 'honey_sales',
      amount: calculateTotal(), // Already a string with .toFixed(2)
      quantity: qty,
      discount: discountInput.toFixed(2), // Send as string with 2 decimals
      buyer: Number(selectedBuyer.value),
      description: formData.description || `Sale to ${selectedBuyer.label}`,
      transaction_date: new Date(formData.transactionDate).toISOString(),
    });

    if (success && buyer) {
      // Generate reference ID (mimicking backend format)
      const refId = `RCPT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // Save receipt data
      const receiptData: ReceiptData = {
        referenceId: refId,
        date: formData.transactionDate,
        buyerName: buyer.name,
        buyerEmail: buyer.email || undefined,
        buyerPhone: buyer.phone || undefined,
        buyerOrganization: buyer.organization || undefined,
        items: [{
          description: 'Honey (Liters)',
          quantity: qty,
          rate: `${rate} ${config.currency}/L`,
          amount: `${gross.toFixed(2)} ${config.currency}`
        }],
        subtotal: gross.toFixed(2),
        discount: config.discount_type === 'percentage' 
          ? `${discountInput}% (${discountAmount.toFixed(2)} ${config.currency})`
          : `${discountAmount.toFixed(2)} ${config.currency}`,
        discountType: config.discount_type,
        total: total.toFixed(2),
        currency: config.currency
      };
      
      setLastSaleReceipt(receiptData);
      
      toast.success("Sales record saved & receipt emailed!");
      setSaleCompleted(true);
    }
  };
  
  const clearForm = () => {
    setFormData({
      transactionDate: new Date().toISOString().split("T")[0],
      quantity: "",
      discount: "0",
      description: "",
    });
    setSelectedBuyer(null);
    setSaleCompleted(false);
  };
  
  const handlePrintReceipt = () => {
    if (lastSaleReceipt) {
      setIsReceiptModalOpen(true);
    } else {
      toast.error("No recent sale to print. Complete a sale first!", { icon: "🧾" });
    }
  };
  
  // Custom styles for React Select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      padding: '0.1rem',
      borderColor: state.isFocused ? '#E59035' : '#D1D5DB', 
      boxShadow: state.isFocused ? '0 0 0 1px #E59035' : null,
      '&:hover': { borderColor: '#E59035' },
      borderRadius: '0.5rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#E59035' : state.isFocused ? '#FFF7ED' : null,
      color: state.isSelected ? 'white' : 'black',
    })
  };

  return (
    <>
      <div>
        <div className="px-8 py-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
             <div className="flex items-center gap-2 text-orange-800">
                <Calculator size={18} />
                <span className="font-medium">Current Rate: </span>
                <span className="font-bold text-lg">{config ? `${config.honey_price_per_liter} ${config.currency}/liter` : "Loading..."}</span>
             </div>
            
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-6 border-t border-[rgba(0,0,0,0.05)] bg-white"
        >
          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Date of Sale <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                required
                disabled={saleCompleted}
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
            </div>
          </div>

          {/* Buyer Select */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
              <span>Buyer <span className="text-red-500">*</span></span>
              <button 
                type="button"
                onClick={() => setIsBuyerModalOpen(true)}
                className="text-xs text-oha_primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus size={14} /> New Buyer
              </button>
            </label>
            <Select
              value={selectedBuyer}
              onChange={handleBuyerChange}
              options={buyerOptions}
              placeholder="Select or search buyer..."
              isClearable
              isDisabled={saleCompleted}
              styles={customStyles}
              required
              className="text-sm"
            />
          </div>

          {/* Quantity (Liters) */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Quantity Sold (Liters) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                disabled={saleCompleted}
                step="0.01"
                min="0"
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="0.00"
              />
              <Droplet className="absolute right-3 top-3 text-gray-400" size={18} />
            </div>
          </div>

          {/* Discount */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Discount ({config?.discount_type === 'percentage' ? '%' : config?.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                disabled={saleCompleted}
                step="0.01"
                min="0"
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm font-semibold">
                {config?.discount_type === 'percentage' ? '%' : config?.currency}
              </span>
            </div>
          </div>

          {/* Calculated Amount */}
          <div className="flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
            <div className="flex justify-between items-end">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Total Amount
                    </label>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                    {config?.currency} {calculateTotal()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        ({formData.quantity || 0} L x {config?.honey_price_per_liter}) - {formData.discount || 0}{config?.discount_type === 'percentage' ? '%' : ` ${config?.currency}`} discount
                    </p>
                </div>
                 <div className="flex flex-col items-end">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Reference ID
                    </label>
                    <div className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-1">
                        <Receipt size={14} />
                         Auto-generated
                    </div>
                </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Notes / Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              disabled={saleCompleted}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Additional details about the sale..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-end gap-3 col-span-1 md:col-span-2">
            {saleCompleted ? (
              <>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-5 py-2 border-2 border-oha_primary text-oha_primary text-sm font-medium rounded-full hover:bg-orange-50 transition flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={18} />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-oha_primary text-white text-sm font-medium px-5 py-2 rounded-full shadow-md hover:bg-orange-600 transition cursor-pointer"
                >
                  Record New Sale
                </button>
              </>
            ) : (
              <motion.button
                type="submit"
                disabled={isLoading || !config}
                className={`bg-oha_primary text-white text-sm font-medium px-5 py-2 rounded-full shadow-md hover:bg-orange-600 transition cursor-pointer ${isLoading || !config ? "opacity-70 cursor-not-allowed" : ""}`}
                whileHover={!isLoading && config ? { scale: 1.05 } : {}}
                whileTap={!isLoading && config ? { scale: 0.95 } : {}}
              >
                {isLoading ? "Processing..." : "Confirm Sale & Send Receipt"}
              </motion.button>
            )}
          </div>
        </form>
      </div>
      
      <BuyerEnrollmentModal 
        isOpen={isBuyerModalOpen} 
        onClose={() => setIsBuyerModalOpen(false)} 
        onSuccess={() => fetchBuyers()} 
      />
      
      {isReceiptModalOpen && lastSaleReceipt && (
        <ReceiptModal
          data={lastSaleReceipt}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </>
  );
};

export default HoneySalesForm;
