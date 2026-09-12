import React, { useEffect, useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { UserProfile } from "@/v1/api/UserProfileApi";
import { logo as defaultAvatar } from "@/assets";
import { uploadToCloudinary } from "@/v1/lib/cloudinary";

const ProfileInformation: React.FC = () => {
  const {
    profile,
    updateProfile,
    fetchProfile,
    isLoading,
    error: storeError,
  } = useUserProfileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [initialData, setInitialData] = useState<Partial<UserProfile>>({});
  const [hasChanged, setHasChanged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    } else {
      const data: Partial<UserProfile> = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        primary_phone: profile.primary_phone || "",
        other_phone: profile.other_phone || "",
        location: profile.location || "",
        profile_image_url: profile.profile_image_url || "",
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [profile, fetchProfile]);

  useEffect(() => {
    setHasChanged(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setStatusMessage(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage({
        type: "error",
        text: "Please select a valid image file (PNG, JPG, WEBP, GIF).",
      });
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: "error",
        text: "Image file is too large. Please choose an image smaller than 10MB.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage({
      type: "info",
      text: "Uploading photo...",
    });

    try {
      const cld = await uploadToCloudinary(file, (p) => {
        setUploadProgress(p.percent);
      });

      if (cld.secure_url) {
        const newUrl = cld.secure_url;
        setFormData((prev) => ({
          ...prev,
          profile_image_url: newUrl,
        }));

        // Immediately persist the clean Cloudinary URL to Django backend
        const success = await updateProfile({
          ...formData,
          profile_image_url: newUrl,
        });

        if (success) {
          setInitialData((prev) => ({
            ...prev,
            profile_image_url: newUrl,
          }));
          setStatusMessage({
            type: "success",
            text: "Profile photo successfully uploaded and updated!",
          });
          setTimeout(() => setStatusMessage(null), 5000);
        } else {
          setStatusMessage({
            type: "info",
            text: "Photo uploaded. Click 'Save Changes' to finalize your profile update.",
          });
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Image upload failed:", err);
      setStatusMessage({
        type: "error",
        text:
          error?.message ||
          "Failed to upload photo. Please check your connection and try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    setIsUploading(true);
    setStatusMessage({
      type: "info",
      text: "Removing profile photo...",
    });

    setFormData((prev) => ({
      ...prev,
      profile_image_url: "",
    }));

    const success = await updateProfile({
      ...formData,
      profile_image_url: "",
    });

    setIsUploading(false);

    if (success) {
      setInitialData((prev) => ({
        ...prev,
        profile_image_url: "",
      }));
      setStatusMessage({
        type: "success",
        text: "Profile photo removed successfully.",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({
        type: "info",
        text: "Photo removed. Click 'Save Changes' below to finalize.",
      });
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const success = await updateProfile(formData);
    if (success) {
      setInitialData(formData);
      setHasChanged(false);
      setStatusMessage({
        type: "success",
        text: "Your profile information has been successfully updated.",
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage({
        type: "error",
        text:
          storeError ||
          "Failed to update profile. Please verify your information and try again.",
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 bg-white/80 sm:bg-transparent backdrop-blur-xs p-4 sm:p-0 rounded-2xl sm:rounded-none border border-stone-200/70 sm:border-0 shadow-2xs sm:shadow-none">
      {/* Section Header */}
      <div className="border-b border-stone-300/80 sm:border-stone-200/80 pb-3 sm:pb-5">
        <h2 className="text-base sm:text-xl font-bold text-stone-900">Personal Profile</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5 sm:mt-1">
          Update your official contact details and profile avatar used across honey statements and investment reports.
        </p>
      </div>

      {/* Avatar Management - Icon button handles upload; 'upload new photo' button removed */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3.5 sm:gap-6 p-0 sm:p-5 rounded-none sm:rounded-2xl bg-transparent sm:bg-stone-50 border-0 sm:border border-stone-200/80 text-center sm:text-left">
        <div className="relative shrink-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 border-stone-300 sm:border-stone-200 shadow-xs flex items-center justify-center">
            <img
              src={formData.profile_image_url || defaultAvatar}
              alt="Profile Avatar"
              className={`w-full h-full object-cover transition-opacity ${isUploading ? "opacity-40" : "opacity-100"
                }`}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
                {uploadProgress > 0 && (
                  <span className="text-[10px] font-bold mt-1">
                    {uploadProgress}%
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-oha_secondary text-white hover:bg-amber-600 disabled:bg-stone-400 transition-colors shadow-xs cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Upload photo"
            aria-label="Upload profile photo"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={handleImageUpload}
          />
        </div>

        <div className="space-y-1 sm:space-y-1.5 w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">

            {formData.profile_image_url && (
              <button
                type="button"
                disabled={isUploading}
                onClick={handleRemoveImage}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors min-h-[36px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Photo
              </button>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-stone-500 max-w-sm">
            Tap the camera icon on your avatar to upload a photo (PNG, JPG, or WEBP up to 10MB).
          </p>
        </div>
      </div>

      {/* Status Banners */}
      {statusMessage && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 ${statusMessage.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : statusMessage.type === "info"
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          ) : statusMessage.type === "info" ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 animate-spin shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 sm:text-stone-400 mb-2.5 sm:mb-4">
            Identity Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
            <div>
              <label
                htmlFor="first_name"
                className="block text-xs font-semibold uppercase text-stone-600 mb-1"
              >
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Samuel"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-xs font-semibold uppercase text-stone-600 mb-1"
              >
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Mensah"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 sm:text-stone-400 mb-2.5 sm:mb-4">
            Contact & Location
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase text-stone-600"
                >
                  Email Address
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Verified
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email || ""}
                  readOnly
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-200/50 sm:bg-stone-50 border border-stone-300 sm:border-stone-200 rounded-xl text-base sm:text-sm text-stone-500 cursor-not-allowed select-all shadow-2xs"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Primary login credential. Contact support to change your verified email.
              </p>
            </div>

            <div>
              <label
                htmlFor="primary_phone"
                className="block text-xs font-semibold uppercase text-stone-600 mb-1"
              >
                Primary Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  id="primary_phone"
                  value={formData.primary_phone || ""}
                  onChange={handleChange}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Used for SMS payout notifications and urgent apiary alerts.
              </p>
            </div>

            <div>
              <label
                htmlFor="other_phone"
                className="block text-xs font-semibold uppercase text-stone-600 mb-1"
              >
                Secondary Phone (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  id="other_phone"
                  value={formData.other_phone || ""}
                  onChange={handleChange}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-xs font-semibold uppercase text-stone-600 mb-1"
              >
                Residence / Country Region
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  placeholder="e.g. Accra, Greater Accra Region"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-base sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 sm:pt-6 border-t border-stone-300/80 sm:border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-500 text-center sm:text-left">
            {hasChanged ? (
              <span className="text-amber-800 font-medium">
                ● You have unsaved profile changes
              </span>
            ) : (
              <span>All changes saved to cloud</span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {hasChanged && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading || isUploading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-200/80 transition-colors min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                Discard
              </button>
            )}

            <button
              type="submit"
              disabled={!hasChanged || isLoading || isUploading}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs min-h-[44px] ${hasChanged && !isLoading && !isUploading
                ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                : "bg-stone-300 text-stone-500 cursor-not-allowed"
                }`}
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileInformation;
