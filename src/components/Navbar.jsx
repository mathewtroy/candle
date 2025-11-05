import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import logo from "../assets/candle-logo.svg";
import SearchBar from "./SearchBar";
import "../index.css";

export default function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Logo and main title */}
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Candly Logo" />
        <span>CANDLY</span>
      </Link>

      {/* If user is not logged in */}
      {!currentUser ? (
        <div className="navbar-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      ) : (
        // If user is logged in
        <div className="navbar-right">
          {/* Search bar */}
          <SearchBar />

          {/* Link to user profile */}
          <Link
            to={`/${currentUser.displayName || "profile"}`}
            className="profile-link"
          >
            UserProfile
          </Link>

          {/* Logout button */}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
