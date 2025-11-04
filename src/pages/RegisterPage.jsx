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
  const navigate = useNavigate();

  // Compress image before upload
  const compressImage = async (file) => {
    const options = { maxSizeMB: 0.2, maxWidthOrHeight: 300, useWebWorker: true };
    console.log("🗜️ Compressing image:", file.name);
    try {
      const compressed = await imageCompression(file, options);
      console.log("✅ Image compressed:", compressed.size, "bytes");
      return compressed;
    } catch (err) {
      console.error("🚫 Image compression failed:", err);
      throw err;
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    console.log("☁️ Uploading image to Cloudinary...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      console.log("✅ Cloudinary upload success:", data.secure_url);
      return data.secure_url;
    } catch (err) {
      console.error("🚫 Cloudinary upload error:", err);
      throw err;
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      console.log("🚀 Starting registration...");

      const cleanUsername = sanitizeInput(username.trim());
      const cleanEmail = sanitizeInput(email.trim());

      // Validate inputs
      if (!isValidUsername(cleanUsername)) {
        alert("Username must be 1–50 chars and contain only letters and numbers.");
        setLoading(false);
        return;
      }
      if (!isValidEmail(cleanEmail)) {
        alert("Please enter a valid email.");
        setLoading(false);
        return;
      }
      if (!password) {
        alert("Password is required.");
        setLoading(false);
        return;
      }

      // Check duplicates
      const usernameSnap = await getDocs(query(collection(db, "users"), where("username", "==", cleanUsername)));
      if (!usernameSnap.empty) {
        alert("This username is already taken.");
        setLoading(false);
        return;
      }

      const emailSnap = await getDocs(query(collection(db, "users"), where("email", "==", cleanEmail)));
      if (!emailSnap.empty) {
        alert("This email is already registered.");
        setLoading(false);
        return;
      }

      // Create user
      const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      console.log("✅ Firebase Auth user created:", user.uid);

      // Handle avatar
      let photoURL = "";
      if (avatarFile) {
        console.log("📤 Uploading avatar file:", avatarFile.name);
        if (!isAllowedImageType(avatarFile)) {
          alert("Only image files (JPG/PNG/WebP/GIF) are allowed.");
          setLoading(false);
          return;
        }
        if (!isAllowedImageSize(avatarFile, 2 * 1024 * 1024)) {
          alert("Image must be ≤ 2MB.");
          setLoading(false);
          return;
        }

        const compressed = await compressImage(avatarFile);
        photoURL = await uploadImageToCloudinary(compressed);
      } else {
        console.log("ℹ️ No avatar selected.");
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: cleanUsername,
        ...(photoURL ? { photoURL } : {}),
      });
      console.log("✅ Firebase Auth profile updated");

      // Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: cleanEmail,
        username: cleanUsername,
        ...(photoURL ? { photoURL } : {}),
        createdAt: new Date(),
      });
      console.log("✅ Firestore user created");

      alert("Registration successful!");
      navigate(`/${cleanUsername}`);
    } catch (err) {
      console.error("🔥 Registration error:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
      console.log("🧭 Registration finished");
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
        disabled={loading}
      />

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}
