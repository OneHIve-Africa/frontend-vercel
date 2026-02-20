import React from "react";

type Props = {
  visible: boolean;
  filename?: string;
  percent: number; // 0-100
  status?: "uploading" | "success" | "error";
  onClose?: () => void;
};

const ProgressToast: React.FC<Props> = ({ visible, filename, percent, status = "uploading", onClose }) => {
  if (!visible) return null;
  const isDone = status === "success" || status === "error";
  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[320px] bg-white shadow-xl rounded-lg border">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">
            {status === "uploading" && "Uploading..."}
            {status === "success" && "Upload complete"}
            {status === "error" && "Upload failed"}
          </p>
          {isDone && (
            <button className="text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>✕</button>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mb-2">{filename}</p>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`${status === "error" ? "bg-red-500" : "bg-oha_primary"} h-full transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressToast;
