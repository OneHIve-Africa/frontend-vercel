import React, { useState } from "react";
import InvestorsApi, { CreateInvestorData } from "@/v1/api/InvestorsApi";
import toast from "react-hot-toast";

interface AddInvestorProps {
  onSuccess: () => void;
}

const AddInvestor: React.FC<AddInvestorProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CreateInvestorData>({
    user: 0,
    first_name: "",
    last_name: "",
    profile_email: "",
    primary_phone: "",
    other_phone: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "user" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user || !formData.first_name || !formData.last_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const api = InvestorsApi.getInstance();
      const response = await api.createInvestor(formData);

      if (response.data) {
        toast.success("Investor created successfully!");
        onSuccess();
      } else {
        toast.error(response.message || "Failed to create investor");
      }
    } catch (error) {
      console.error("Error creating investor:", error);
      toast.error("Failed to create investor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[600px] mx-auto mt-1 p-6">
      <h2 className="text-center text-lg font-semibold mb-6">
        Add New Investor
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            User ID *
          </label>
          <input
            type="number"
            name="user"
            value={formData.user || ""}
            onChange={handleInputChange}
            placeholder="Enter User ID"
            className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The User ID from the authentication system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="John"
              className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="Doe"
              className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="profile_email"
            value={formData.profile_email}
            onChange={handleInputChange}
            placeholder="john.doe@example.com"
            className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Primary Phone
            </label>
            <input
              type="tel"
              name="primary_phone"
              value={formData.primary_phone}
              onChange={handleInputChange}
              placeholder="+233201234567"
              className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Other Phone
            </label>
            <input
              type="tel"
              name="other_phone"
              value={formData.other_phone}
              onChange={handleInputChange}
              placeholder="+233501234567"
              className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Accra, Greater Accra"
            className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            * Required fields
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-oha_primary text-white text-sm font-medium px-10 py-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Investor"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInvestor;
