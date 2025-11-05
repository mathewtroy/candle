import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import logo from "../assets/candle-logo.svg";
import SearchBar from "./SearchBar";
import "../index.css";

export default function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("user"); // default to 'user'

  // Fetch user role once on login
  useEffect(() => {
    const fetchRole = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || "user");
          } else {
            setRole("user");
          }
        } catch (err) {
          console.error("Failed to load role:", err);
        }
      } else {
        setRole("user");
      }
    };
    fetchRole();
  }, [currentUser]);

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Candly Logo" />
        <span>CANDLY</span>
      </Link>

      {!currentUser ? (
        <div className="navbar-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      ) : (
        <div className="navbar-right">
          <SearchBar />

          {/* Only visible for admin users */}
          {role === "admin" && (
            <Link to="/admin" className="admin-link">
              AdminPanel
            </Link>
          )}

          <Link
            to={`/${currentUser.displayName || "profile"}`}
            className="profile-link"
          >
            UserProfile
          </Link>

          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
