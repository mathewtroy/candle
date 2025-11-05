import { useState } from "react";
import imageCompression from "browser-image-compression";

export function useAvatarUpload() {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const compressImage = async (file) => {
    const options = { maxSizeMB: 0.2, maxWidthOrHeight: 300, useWebWorker: true };
    try {
      const compressed = await imageCompression(file, options);
      return compressed;
    } catch (err) {
      console.error("Image compression failed:", err);
      throw err;
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      setUploadingAvatar(true);
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw err;
    } finally {
      setUploadingAvatar(false);
    }
  };

  return { compressImage, uploadImageToCloudinary, uploadingAvatar, setUploadingAvatar };
}
