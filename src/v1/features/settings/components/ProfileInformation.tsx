import React, { useEffect, useState } from "react";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { UserProfile } from "@/v1/api/UserProfileApi";
import { logo as default_avatar } from "@/assets";

const ProfileInformation: React.FC = () => {
  const { profile, updateProfile, fetchProfile } = useUserProfileStore();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    } else {
      const initialFormData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        primary_phone: profile.primary_phone || "",
        profile_image_url: profile.profile_image_url || "",
      };
      setFormData(initialFormData);
    }
  }, [profile, fetchProfile]);

  useEffect(() => {
    if (profile) {
      const initialData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        primary_phone: profile.primary_phone || "",
        profile_image_url: profile.profile_image_url || "",
      };
      setHasChanged(JSON.stringify(formData) !== JSON.stringify(initialData));
    }
  }, [formData, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };
  return (
    <div>
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <img
            src={formData.profile_image_url || default_avatar}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-fit ring-2 ring-gray-200"
          />
          <button className="absolute bottom-0 right-0 bg-oha_secondary border-oha_secondary text-white rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div>
          <button className="bg-oha_secondary border-oha_secondary text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Update Now
          </button>
          <button className="ml-4 text-gray-500 hover:text-red-500 text-sm">
            Delete Avatar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-ohaborder-oha_secondary focus:border-oha_secondary"
            />
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-ohaborder-oha_secondary focus:border-oha_secondary"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-ohaborder-oha_secondary focus:border-oha_secondary"
              readOnly
            />
          </div>
          <div>
            <label
              htmlFor="primary_phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="primary_phone"
              value={formData.primary_phone || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-ohaborder-oha_secondary focus:border-oha_secondary"
            />
          </div>
        </div>
        <button
          type="submit"
          className={`px-6 py-2 rounded-lg font-semibold ${
            hasChanged
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!hasChanged}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileInformation;
