import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  sanitizeInput,
  isValidUsername,
  isValidEmail,
  isAllowedImageType,
  isAllowedImageSize,
} from "../firebase/validateUserInput";
import imageCompression from "browser-image-compression";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  // Compress image before upload
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

  // Upload image to Cloudinary
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

  const handleRegister = async () => {
    setLoading(true);
    try {
      console.log("🚀 Starting registration...");

      // Clean and validate inputs
      const cleanUsername = sanitizeInput(username.trim());
      const cleanEmail = sanitizeInput(email.trim());

      if (!isValidUsername(cleanUsername)) {
        alert("Username must be 1–50 chars and contain only letters and numbers.");
        return;
      }
      if (!isValidEmail(cleanEmail)) {
        alert("Please enter a valid email.");
        return;
      }
      if (!password) {
        alert("Password is required.");
        return;
      }

      // Check duplicates
      const usernameSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", cleanUsername))
      );
      if (!usernameSnap.empty) {
        alert("This username is already taken.");
        return;
      }

      const emailSnap = await getDocs(
        query(collection(db, "users"), where("email", "==", cleanEmail))
      );
      if (!emailSnap.empty) {
        alert("This email is already registered.");
        return;
      }

      // Validate and upload avatar before creating user
      let photoURL = "";
      if (avatarFile) {
        if (!isAllowedImageType(avatarFile)) {
          alert("Only image files (JPG/PNG/WebP/GIF) are allowed.");
          return;
        }
        if (!isAllowedImageSize(avatarFile, 2 * 1024 * 1024)) {
          alert("Image must be ≤ 2MB.");
          return;
        }

        const compressed = await compressImage(avatarFile);
        photoURL = await uploadImageToCloudinary(compressed);
      }

      // Create user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      console.log("✅ Firebase Auth user created:", user.uid);

      try {
        // Update Auth profile
        await updateProfile(user, {
          displayName: cleanUsername,
          ...(photoURL ? { photoURL } : {}),
        });

        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: cleanEmail,
          username: cleanUsername,
          ...(photoURL ? { photoURL } : {}),
          createdAt: new Date(),
        });

        alert("✅ Registration successful!");
        navigate(`/${cleanUsername}`);
      } catch (innerErr) {
        console.error("Error after Auth creation:", innerErr);
        await user.delete(); // rollback on fail
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("🔥 Registration error:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
        disabled={loading || uploadingAvatar}
      />

      <button onClick={handleRegister} disabled={loading || uploadingAvatar}>
        {uploadingAvatar ? (
          <>
            <span className="spinner"></span> Uploading Avatar...
          </>
        ) : loading ? (
          <>
            <span className="spinner"></span> Registering...
          </>
        ) : (
          "Register"
        )}
      </button>
    </div>
  );
}
