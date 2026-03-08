import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import UserProfileApi from "@/v1/api/UserProfileApi";

interface AddAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        position: "",
        permission_level: "standard",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const api = UserProfileApi.getInstance();
            await api.createAdmin(formData);
            toast.success("Admin created successfully! Credentials sent via email.");
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                department: "",
                position: "",
                permission_level: "standard",
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const detail = error.response?.data?.detail || error.response?.data?.email?.[0] || "Failed to create admin.";
            toast.error(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Add New Admin</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-oha_primary focus:ring-1 focus:ring-oha_primary/20 transition-all text-sm"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-oha_primary focus:ring-1 focus:ring-oha_primary/20 transition-all text-sm"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-oha_primary focus:ring-1 focus:ring-oha_primary/20 transition-all text-sm"
                                    placeholder="jane.doe@onehiveafrica.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-oha_primary focus:ring-1 focus:ring-oha_primary/20 transition-all text-sm"
                                        placeholder="e.g. Operations"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Position</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-oha_primary focus:ring-1 focus:ring-oha_primary/20 transition-all text-sm"
                                        placeholder="e.g. Manager"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Permission Level</label>
                                <select
                                    name="permission_level"
                                    value={formData.permission_level}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-oha_primary focus:ring-1 focus:ring-oha_primary/20 transition-all text-sm bg-white"
                                >
                                    <option value="standard">Standard Admin</option>
                                    <option value="super">Super Admin</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.permission_level === "super"
                                        ? "Full system access, including managing other admins."
                                        : "Standard operational access based on department."}
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-oha_primary text-white font-medium rounded-lg hover:bg-opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddAdminModal;
