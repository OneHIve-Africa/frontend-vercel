import axios from "axios";

export type UploadProgress = {
  loaded: number;
  total?: number;
  percent: number; // 0-100
};

export interface CloudinaryResult {
  secure_url: string;
  original_filename?: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<CloudinaryResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary env missing: VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET must be set"
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await axios.post(url, formData, {
    onUploadProgress: (evt) => {
      if (!onProgress) return;
      const percent = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
      onProgress({ loaded: evt.loaded, total: evt.total ?? undefined, percent });
    },
  });

  const data = res.data as any;
  return {
    secure_url: data.secure_url,
    original_filename: data.original_filename,
    resource_type: data.resource_type,
    format: data.format,
    bytes: data.bytes,
  };
}
