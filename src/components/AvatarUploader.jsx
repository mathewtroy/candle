import { useState } from "react";
import { updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import imageCompression from "browser-image-compression";
import { auth, db } from "../firebase/config";

/**
 * AvatarUploader
 * Updates avatar everywhere:
 *  - Firebase Auth
 *  - Firestore "users"
 *  - All user's posts (photoURL)
 */
export default function AvatarUploader({ currentPhoto, onPhotoChange }) {
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Compress image before upload
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

      // Update Auth + Firestore user profile
      await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: newPhotoURL });
      console.log("✅ Updated avatar in Auth and users doc");

      // Update all posts by this user
      const q = query(
        collection(db, "posts"),
        where("authorId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);

      let ok = 0;
      let fail = 0;

      for (const d of snap.docs) {
        try {
          await updateDoc(doc(db, "posts", d.id), { photoURL: newPhotoURL });
          ok++;
        } catch (e2) {
          // Ignore permission errors (common for non-admins)
          if (e2?.message?.includes("PERMISSION_DENIED")) {
            console.warn("Skipped (no permission):", d.id);
            continue;
          }
          fail++;
          console.warn("Post update failed:", d.id, e2?.message);
        }
      }


      console.log(`🔁 Posts touched: ${snap.size}, ✅ updated: ${ok}, ❌ failed: ${fail}`);
      // alert(`Avatar updated. Posts updated: ${ok}${fail ? `, failed: ${fail}` : ""}`);

      if (ok > 0 && fail === 0) {
        alert(`✅ Avatar updated successfully on ${ok} posts!`);
      } else if (ok > 0 && fail > 0) {
        alert(`⚠️ Avatar updated on ${ok} posts, skipped ${fail} (no permission).`);
      } else if (ok === 0 && fail === 0) {
        alert("✅ Avatar updated (no posts to update).");
      } else {
        alert("⚠️ Avatar updated, but some posts could not be updated.");
      }


      // Update parent UI
      onPhotoChange(newPhotoURL);
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
