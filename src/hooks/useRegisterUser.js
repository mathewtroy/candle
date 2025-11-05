import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
  sanitizeInput,
  isValidUsername,
  isValidEmail,
  isAllowedImageType,
  isAllowedImageSize,
} from "../firebase/validateUserInput";
import { useAvatarUpload } from "./useAvatarUpload";

export function useRegisterUser() {
  const [loading, setLoading] = useState(false);
  const { compressImage, uploadImageToCloudinary, uploadingAvatar, setUploadingAvatar } =
    useAvatarUpload();

  const handleRegister = async ({ email, password, username, avatarFile }) => {
    setLoading(true);
    try {
      console.log("🚀 Starting registration...");

      const cleanUsername = sanitizeInput(username.trim());
      const cleanEmail = sanitizeInput(email.trim());

      if (!isValidUsername(cleanUsername)) {
        alert("Username must be 1–50 chars and contain only letters and numbers.");
        return false;
      }
      if (!isValidEmail(cleanEmail)) {
        alert("Please enter a valid email.");
        return false;
      }
      if (!password) {
        alert("Password is required.");
        return false;
      }

      const usernameSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", cleanUsername))
      );
      if (!usernameSnap.empty) {
        alert("This username is already taken.");
        return false;
      }

      const emailSnap = await getDocs(
        query(collection(db, "users"), where("email", "==", cleanEmail))
      );
      if (!emailSnap.empty) {
        alert("This email is already registered.");
        return false;
      }

      let photoURL = "";
      if (avatarFile) {
        if (!isAllowedImageType(avatarFile)) {
          alert("Only image files (JPG/PNG/WebP/GIF) are allowed.");
          return false;
        }
        if (!isAllowedImageSize(avatarFile, 2 * 1024 * 1024)) {
          alert("Image must be ≤ 2MB.");
          return false;
        }

        const compressed = await compressImage(avatarFile);
        photoURL = await uploadImageToCloudinary(compressed);
      }

      const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      console.log("✅ Firebase Auth user created:", user.uid);

      try {
        await updateProfile(user, {
          displayName: cleanUsername,
          ...(photoURL ? { photoURL } : {}),
        });

      await setDoc(doc(db, "users", user.uid), {
        email: cleanEmail,
        username: cleanUsername,
        usernameLower: cleanUsername.toLowerCase(), // search
        role: "user",                               // basic role
        ...(photoURL ? { photoURL } : {}),
        createdAt: new Date(),
      });


        alert("✅ Registration successful!");
        return true;
      } catch (innerErr) {
        console.error("Error after Auth creation:", innerErr);
        await user.delete();
        alert("Registration failed. Please try again.");
        return false;
      }
    } catch (err) {
      console.error("🔥 Registration error:", err);
      alert("Error: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, uploadingAvatar, setUploadingAvatar };
}
