/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import FarmersApi from "@/v1/api/FarmerApi";
import { FiUser, FiMapPin } from "react-icons/fi";
import { IdCard } from "lucide-react";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

interface NewFarmerForm {
  // Bio
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  primary_phone: string;
  other_phone: string;
  // Details
  gender: string;
  date_of_birth: string; // yyyy-mm-dd
  id_number: string;
  // Location
  country: string;
  region: string;
  district: string;
  town: string;
  // KYC
  ghana_card_image?: File | null;
}
interface Props {
  setIsAddModal: React.Dispatch<React.SetStateAction<boolean>>;

  setUp: any;
}

const AddFarmer: React.FC<Props> = ({ setIsAddModal, setUp }) => {
  const generateStrongPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}";
    let pwd = "";
    for (let i = 0; i < 14; i++)
      pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd;
  };
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewFarmerForm>({
    email: "",
    password: generateStrongPassword(),
    first_name: "",
    last_name: "",
    primary_phone: "",
    other_phone: "",
    gender: "",
    date_of_birth: "",
    id_number: "",
    country: "Ghana",
    region: "",
    district: "",
    town: "",
    ghana_card_image: null,
  });

  const canNext = useMemo(() => {
    if (step === 1) {
      return (
        !!formData.first_name &&
        !!formData.last_name &&
        !!formData.email &&
        !!formData.primary_phone
      );
    }
    if (step === 2) {
      return (
        !!formData.gender &&
        !!formData.date_of_birth &&
        !!formData.id_number &&
        true
      );
    }
    if (step === 3) {
      return !!formData.region && !!formData.district && !!formData.town;
    }
    return true; // step 3 optional fields
  }, [step, formData]);

  const onInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, ghana_card_image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
      return;
    }
    try {
      setIsSubmitting(true);
      const api = FarmersApi.getInstance();
      const res = await api.createFarmer({
        email: formData.email,
        profile_email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        primary_phone: formData.primary_phone,
        other_phone: formData.other_phone,
        role: "farmer",
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        id_number: formData.id_number,
        contact_number: formData.primary_phone,
        region: formData.region,
        district: formData.district,
        town: formData.town,
      });
      if ((res as any).error) {
        toast.error((res as any).message || "Failed to add farmer");
        return;
      }
      toast.success("Farmer added successfully");
      setIsAddModal(false);
      setUp?.();
    } catch (err) {
      toast.error("Something went wrong");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[800px] mx-auto mt-1 p-6 h-[600px]">
      <h2 className="text-center text-lg font-semibold mb-6">
        Input Farmer’s Details
      </h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Step indicators with icons and labels */}
        <div className="flex items-center justify-center gap-8 text-sm mb-2">
          {[
            { id: 1 as 1, label: "Bio", Icon: FiUser },
            { id: 2 as 2, label: "Details", Icon: FiUser },
            { id: 3 as 3, label: "Location", Icon: FiMapPin },
            { id: 4 as 4, label: "KYC", Icon: IdCard },
          ].map(({ id, label, Icon }) => {
            const active = step === id;
            const done = step > id;
            return (
              <div key={id} className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full border flex items-center justify-center ${
                    active || done
                      ? "border-oha_primary text-oha_primary bg-orange-50"
                      : "border-gray-300 text-gray-400 bg-white"
                  }`}
                >
                  <Icon className="text-lg" />
                </div>
                <span
                  className={`mt-2 ${
                    active || done ? "text-oha_primary" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="space-y-4 pt-10 h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="Kofi"
                  value={formData.first_name}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Mensah"
                  value={formData.last_name}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="kofi.farmer@example.com"
                  value={formData.email}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Primary Phone
                </label>
                <input
                  type="tel"
                  name="primary_phone"
                  placeholder="+233201234567"
                  value={formData.primary_phone}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Other Phone (optional)
                </label>
                <input
                  type="tel"
                  name="other_phone"
                  placeholder=""
                  value={formData.other_phone}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pt-10 h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, gender: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  National ID
                </label>
                <input
                  type="text"
                  name="id_number"
                  placeholder="GHA-1234567"
                  value={formData.id_number}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 pt-10 h-[300px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Country
                </label>
                <div className="relative w-full px-4 py-2 border border-gray-400 rounded-md outline-none">
                  <CountryDropdown
                    value={formData.country}
                    onChange={(val) =>
                      setFormData((p) => ({ ...p, country: val }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Region
                </label>
                <div className="relative w-full px-4 py-2 border border-gray-400 rounded-md outline-none">
                  <RegionDropdown
                    country={formData.country}
                    value={formData.region}
                    onChange={(val) =>
                      setFormData((p) => ({ ...p, region: val }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder="New Juaben South"
                  value={formData.district}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Town
                </label>
                <input
                  type="text"
                  name="town"
                  placeholder="Koforidua"
                  value={formData.town}
                  onChange={onInput}
                  className="w-full px-4 py-2 border rounded-md outline-none border-gray-400"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 pt-5 h-[300px]">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Ghana Card Image (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center h-[130px]">
                {formData.ghana_card_image ? (
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-left">
                      <p className="font-medium">
                        {formData.ghana_card_image.name}
                      </p>
                      <p className="text-gray-500">
                        {(formData.ghana_card_image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <label className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 cursor-pointer">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onFile}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700 cursor-pointer"
                        onClick={() =>
                          setFormData((p) => ({ ...p, ghana_card_image: null }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer">
                    <span>Click to upload Ghana Card image</span>
                    <span className="text-xs">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFile}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                National ID
              </label>
              <input
                type="text"
                value={formData.id_number}
                readOnly
                className="w-full px-4 py-2 border rounded-md outline-none border-gray-300 bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set this in the Details step.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-10">
          <button
            type="button"
            onClick={() =>
              setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s))
            }
            className="px-4 py-2 text-sm font-medium rounded-full border border-gray-300 text-gray-700 disabled:opacity-50 cursor-pointer"
            disabled={step === 1 || isSubmitting}
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-oha_primary text-white text-sm font-medium px-10 py-2 rounded-full disabled:opacity-60 cursor-pointer"
              disabled={isSubmitting || (step < 4 && !canNext)}
            >
              {isSubmitting ? "Saving..." : step < 4 ? "Continue" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddFarmer;
