import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import React, { useCallback, useRef, useState } from "react";
import ResourcesTable from "../components/ResourcesTable";
import UploadResourceModal, {
  type UploadFormValues,
} from "../components/UploadResourceModal";
import ProgressToast from "../components/ProgressToast";
import { uploadToCloudinary } from "@/v1/lib/cloudinary";
import ResourcesApi from "@/v1/api/ResourcesApi";

// Resource interface removed as it was unused

const Resources: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastStatus, setToastStatus] = useState<"uploading" | "success" | "error">("uploading");
  const [dragActive, setDragActive] = useState(false);
  // bump this to force remount of TableComponent and trigger its data fetch
  const [refreshTick, setRefreshTick] = useState(0);

  const handlePick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      // Let user review in the preview card first
      setModalOpen(false);
    }
    // reset input so same file can be re-selected later
    e.currentTarget.value = "";
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  }, [dragActive]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const startUpload = useCallback(async (values: UploadFormValues) => {
    if (!selectedFile) return;
    setUploadBusy(true);
    setToastVisible(true);
    setToastStatus("uploading");
    setProgress(0);
    try {
      const cld = await uploadToCloudinary(selectedFile, (p) => {
        setProgress(p.percent);
      });
      setProgress(100);
      setToastStatus("success");

      const api = ResourcesApi.getInstance();
      const toTitle = (r: string) => {
        const low = r.toLowerCase();
        if (low === "admins") return "Admins" as const;
        if (low === "farmers") return "Farmers" as const;
        if (low === "investors") return "Investors" as const;
        // Fallback to original value capitalized
        return (r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()) as
          | "Admins"
          | "Farmers"
          | "Investors";
      };
      await api.createResource({
        title: values.title,
        desc: values.description,
        accessed_by: values.audience.map(toTitle),
        public_url: cld.secure_url,
      });

      // Close modal and reset file
      setModalOpen(false);
      setSelectedFile(null);
      // trigger table reload
      setRefreshTick((t) => t + 1);
    } catch (err) {
      console.error("Upload failed", err);
      setToastStatus("error");
    } finally {
      setUploadBusy(false);
      // Auto-hide toast after a short delay when done
      setTimeout(() => setToastVisible(false), 2500);
    }
  }, [selectedFile]);

  return (
    <div className="py-6">
      <motion.div
        className={`rounded-xl p-8 flex flex-col items-center justify-center text-center h-64 transition-colors cursor-pointer border-2 border-dashed ${dragActive ? "border-oha_secondary bg-green-50" : "border-gray-300 bg-white"}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onClick={handlePick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <Upload className={`mb-4 ${dragActive ? "text-oha_secondary" : "text-gray-400"}`} size={48} />
        <h3 className="text-xl font-semibold text-gray-700 mb-1">Drag & drop files here</h3>
        <p className="text-sm text-gray-500 mb-2">or click to browse. Supported: PDF, Excel, Docs, Images, Videos</p>
        <button className="mt-1 px-5 py-2 rounded-full bg-oha_primary text-white text-sm font-medium hover:opacity-95 cursor-pointer transition-colors">Select File</button>
        <input ref={fileInputRef} type="file" id="fileInput" className="hidden" onChange={onFileChange} />
      </motion.div>

      {selectedFile && !modalOpen && (
        <div className="mt-4 bg-white rounded-lg border p-4 flex items-center justify-between">
          <div className="text-left">
            <div className="text-sm text-gray-600">Selected file</div>
            <div className="text-gray-900 font-medium">{selectedFile.name}</div>
            <div className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedFile(null)} className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-100">Change file</button>
            <button onClick={() => setModalOpen(true)} className="px-5 py-2 rounded-full text-white text-sm font-medium bg-oha_secondary hover:opacity-95 cursor-pointer transition-colors">Continue</button>
          </div>
        </div>
      )}
      <div className="mt-8">
        <ResourcesTable key={refreshTick} />
      </div>

      <UploadResourceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        file={selectedFile}
        onStart={startUpload}
        busy={uploadBusy}
      />

      <ProgressToast
        visible={toastVisible}
        filename={selectedFile?.name}
        percent={progress}
        status={toastStatus}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
};

export default Resources;
