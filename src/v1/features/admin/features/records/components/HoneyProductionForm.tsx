import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import Select from "react-select";
import FarmersApi from "@/v1/api/FarmerApi";
import BeehivesApi, { HiveItem } from "@/v1/api/Beehives";
import { useProductionStore } from "../store/ProductionStore";

interface OptionType {
  value: string;
  label: string;
}

interface HoneyProductionFormProps {
  onSuccess?: () => void;
}

const HoneyProductionForm: React.FC<HoneyProductionFormProps> = ({ onSuccess }) => {
  const { createRecord, isLoading } = useProductionStore();
  
  // Data State
  // Data State
  const [hives, setHives] = useState<HiveItem[]>([]);
  
  // Options State
  const [farmerOptions, setFarmerOptions] = useState<OptionType[]>([]);
  const [hiveOptions, setHiveOptions] = useState<OptionType[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    harvestDate: new Date().toISOString().split("T")[0],
    region: "",
    farmerId: "",
    hiveId: "",
    quantityProduced: "",
    hiveType: "",
    notes: "",
  });

  // Selected Option State (to control React Select)
  const [selectedFarmer, setSelectedFarmer] = useState<OptionType | null>(null);
  const [selectedHive, setSelectedHive] = useState<OptionType | null>(null);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const fApi = FarmersApi.getInstance();
        const bApi = BeehivesApi.getInstance();
        
        const [fRes, bRes] = await Promise.all([
          fApi.listFarmers(),
          bApi.getHives()
        ]);
        
        if (fRes.data) {
            setFarmerOptions(fRes.data.map(f => ({
                value: String(f.id),
                label: `${f.first_name} ${f.last_name}`.trim() || f.user_email || `Farmer #${f.id}`
            })));
        }
        if (bRes.data) {
            setHives(bRes.data);
        }
      } catch (err) {
        toast.error("Failed to load farmers or hives data");
      }
    };
    loadData();
  }, []);

  // Filter Hives when Farmer Changes
  useEffect(() => {
    if (formData.farmerId) {
      const farmerHives = hives.filter(h => h.assigned_farmer === Number(formData.farmerId));
      setHiveOptions(farmerHives.map(h => ({
          value: String(h.id),
          label: h.hive_id || `Hive #${h.id}`
      })));
    } else {
      setHiveOptions([]);
    }
  }, [formData.farmerId, hives]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFarmerChange = (option: OptionType | null) => {
      setSelectedFarmer(option);
      setSelectedHive(null); // Reset hive selection
      
      setFormData(prev => ({
          ...prev,
          farmerId: option ? option.value : "",
          hiveId: "",
          hiveType: "",
          // If we want to capture farmer name for some reason, we can do it here, 
          // but we rely on IDs for logic.
      }));
  };

  const handleHiveChange = (option: OptionType | null) => {
      setSelectedHive(option);
      
      if (option) {
          const hive = hives.find(h => String(h.id) === option.value);
          setFormData(prev => ({
              ...prev,
              hiveId: option.value,
              hiveType: hive?.hive_type || "",
              region: hive?.location || prev.region
          }));
      } else {
          setFormData(prev => ({
              ...prev,
              hiveId: "",
              hiveType: ""
          }));
      }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.farmerId || !formData.hiveId || !formData.quantityProduced) {
      toast.error("Please fill in all required fields");
      return;
    }

    const success = await createRecord({
      farmer: Number(formData.farmerId),
      hive: Number(formData.hiveId),
      hives_managed: 1, // Default to 1 for single hive entry
      honey_produced_liters: Number(formData.quantityProduced),
      production_date: formData.harvestDate,
      region: formData.region,
      notes: formData.notes
    });

    if (success) {
      toast.success("Harvest record saved successfully!");
      // Reset form
      setFormData({
        harvestDate: new Date().toISOString().split("T")[0],
        region: "",
        farmerId: "",
        hiveId: "",
        quantityProduced: "",
        hiveType: "",
        notes: "",
      });
      setSelectedFarmer(null);
      setSelectedHive(null);
      
      // Trigger update callback
      if (onSuccess) {
          onSuccess();
      }
    } else {
      toast.error("Failed to save record");
    }
  };

  // Custom styles for React Select to match existing UI
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      padding: '0.1rem',
      borderColor: state.isFocused ? '#E59035' : '#D1D5DB', // oha_primary or gray-300
      boxShadow: state.isFocused ? '0 0 0 1px #E59035' : null,
      '&:hover': {
        borderColor: '#E59035'
      },
      borderRadius: '0.5rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#E59035' : state.isFocused ? '#FFF7ED' : null, // orange-50
      color: state.isSelected ? 'white' : 'black',
    })
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-6 border-t border-[rgba(0,0,0,0.05)] bg-white"
      >
        {/* Harvest Date */}
        <div className="flex flex-col">
          <label
            htmlFor="harvestDate"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Harvest Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              id="harvestDate"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary"
            />
            <Calendar
              className="absolute right-3 top-3 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Region */}
        <div className="flex flex-col">
          <label
            htmlFor="region"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Region
          </label>
          <div className="relative">
             <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary"
              placeholder="e.g. Volta Region"
            />
             <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Farmer's Name (Searchable React Select) */}
        <div className="flex flex-col">
          <label
            htmlFor="farmerName"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Farmer's Name <span className="text-red-500">*</span>
          </label>
          <Select
            id="farmerName"
            value={selectedFarmer}
            onChange={handleFarmerChange}
            options={farmerOptions}
            placeholder="Search farmer..."
            isClearable
            styles={customStyles}
            required
            className="text-sm"
          />
        </div>

        {/* Hive ID (Searchable React Select) */}
        <div className="flex flex-col">
          <label
            htmlFor="hiveId"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Hive ID <span className="text-red-500">*</span>
          </label>
          <Select
             id="hiveId"
             value={selectedHive}
             onChange={handleHiveChange}
             options={hiveOptions}
             placeholder="Select Hive"
             isDisabled={!formData.farmerId}
             isClearable
             styles={customStyles}
             required
             className="text-sm"
          />
          {!formData.farmerId && <span className="text-xs text-gray-500 mt-1">Select a farmer first</span>}
        </div>

        {/* Quantity Produced */}
        <div className="flex flex-col">
          <label
            htmlFor="quantityProduced"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Quantity Produced (litres) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="quantityProduced"
            name="quantityProduced"
            value={formData.quantityProduced}
            onChange={handleChange}
            required
            step="0.01"
            className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary"
            placeholder="0.00"
          />
        </div>

        {/* Hive Type (Auto-filled) */}
        <div className="flex flex-col">
          <label
            htmlFor="hiveType"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Hive Type
          </label>
          <input
            type="text"
            id="hiveType"
            name="hiveType"
            value={formData.hiveType}
            readOnly
            className="p-3 border border-gray-300 rounded-lg w-full bg-gray-50 text-gray-500"
            placeholder="Auto-filled from Hive ID"
          />
        </div>

        {/* Notes (Full width) */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <label
            htmlFor="notes"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange(e)
            }
            className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary"
            placeholder="Write a brief note..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end items-end col-span-1 md:col-span-2">
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`bg-[#FF7900] text-white text-sm font-medium px-5 py-2 rounded-full shadow-md hover:bg-[#e86f00] transition cursor-pointer ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? "Saving..." : "Save Record"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default HoneyProductionForm;
