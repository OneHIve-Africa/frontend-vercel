import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TreesPlantedFormData } from "../types/types";
import { TreeDeciduous } from "lucide-react";
import Select from "react-select";
import FarmersApi, { FarmerDetails } from "@/v1/api/FarmerApi";
import ImpactApi from "../api/ImpactApi";
import SystemApi from "@/v1/api/SystemApi";
import { toast } from "react-hot-toast";

interface OptionType {
  value: string;
  label: string;
}

interface ImpactFormProps {
  onSuccess?: () => void;
}

const Form: React.FC<ImpactFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<TreesPlantedFormData>({
    farmerName: "", 
    region: "",
    volumeSold: "", // Used for trees planted
    date: new Date().toISOString().split("T")[0],
  });
  
  
  const [farmerOptions, setFarmerOptions] = useState<OptionType[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<OptionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
        try {
            const [farmersRes, configRes] = await Promise.all([
                FarmersApi.getInstance().listFarmers(),
                SystemApi.getInstance().getConfig()
            ]);

            if (farmersRes.data) {
                setFarmerOptions(farmersRes.data.map((f: FarmerDetails) => ({
                    value: String(f.id),
                    label: `${f.first_name} ${f.last_name}`.trim() || f.user_email || `Farmer #${f.id}`
                })));
            }

            if (configRes.data && configRes.data.regions) {
                setRegionOptions(configRes.data.regions);
            }
        } catch (error) {
            console.error("Failed to load impact form data", error);
        }
    };
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFarmerChange = (option: OptionType | null) => {
      setSelectedFarmer(option);
      setFormData(prev => ({ ...prev, farmerName: option ? option.value : "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.farmerName || !formData.volumeSold || !formData.region) {
        toast.error("Please fill in all required fields");
        return; 
    }

    setIsLoading(true);
    try {
        const response = await ImpactApi.getInstance().logTreePlanting({
            farmerId: Number(formData.farmerName), // farmerName holds ID here
            trees_planted: Number(formData.volumeSold),
            date: formData.date,
            region: formData.region,
        });

        if (response.error) {
            toast.error(response.error as string);
        } else {
            toast.success("Tree planting record saved!");
            // Reset form
            setFormData(prev => ({ ...prev, volumeSold: "", farmerName: "" }));
            setSelectedFarmer(null);
            if (onSuccess) onSuccess();
        }
    } catch (error) {
        toast.error("Failed to save record");
    } finally {
        setIsLoading(false);
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
    <motion.div
      className="bg-white rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="flex">
        <motion.div className="px-8 py-6 border-b-2 border-oha_primary text-oha_primary font-semibold">
          Trees Planted Entry
        </motion.div>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-6 border-t-[0.2px] border-[rgba(0,0,0,0.07)]"
      >
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

        <div className="flex flex-col">
          <label
            htmlFor="region"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Region <span className="text-red-500">*</span>
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary appearance-none bg-white"
          >
            <option value="">Select Region</option>
            {regionOptions.map((region) => (
                <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="volumeSold"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Number of Trees Planted <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
                type="number"
                id="volumeSold"
                name="volumeSold"
                value={formData.volumeSold}
                onChange={handleChange}
                required
                className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-oha_primary"
                placeholder="0"
            />
            <TreeDeciduous className="absolute right-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex justify-end items-end col-span-1 md:col-span-2 md:mt-auto">
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`bg-oha_primary cursor-pointer text-white text-sm font-medium px-5 py-2 rounded-full shadow-md focus:outline-none focus:ring-1 focus:ring-oha_primary focus:ring-offset-1 transition-colors ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? "Saving..." : "Save Record"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default Form;
