import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import imageCompression from "browser-image-compression";
import { auth, db } from "../firebase/config";

export default function AvatarUploader({ currentPhoto, onPhotoChange }) {
  const [uploading, setUploading] = useState(false);

  // Handle avatar file selection
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Compress the image before upload
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 300, useWebWorker: true };
      const compressed = await imageCompression(file, options);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD;

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      const newPhotoURL = data.secure_url;

      // Update Firebase Auth and Firestore
      await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: newPhotoURL });

      // Notify parent component about the change
      onPhotoChange(newPhotoURL);

      alert("✅ Avatar updated successfully!");
    } catch (err) {
      console.error("🚫 Error updating avatar:", err);
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-uploader">
      <img
        src={currentPhoto || "/default-avatar.png"}
        alt="User Avatar"
        className="profile-avatar"
      />
      <label htmlFor="avatarUpload" className="change-avatar-btn">
        {uploading ? "Uploading..." : "Change Avatar"}
      </label>
      <input
        id="avatarUpload"
        type="file"
        accept="image/*"
        className="hidden-input"
        onChange={handleAvatarChange}
        disabled={uploading}
      />
    </div>
  );
}
