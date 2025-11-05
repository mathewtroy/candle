import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

// Protects admin-only routes. If user isn't admin, redirect to /404.
export default function RequireAdmin({ children }) {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        if (!currentUser) {
          setRole("guest");
          return;
        }
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setRole(snap.exists() ? snap.data().role || "user" : "user");
      } catch {
        setRole("user");
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [currentUser]);

  // While checking role, render nothing (or a tiny placeholder)
  if (checking) return null;

  return role === "admin" ? children : <Navigate to="/404" replace />;
}
