import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
  limit,
} from "firebase/firestore";
import searchIcon from "../assets/search-icon.svg";
import { useDebounce } from "../hooks/useDebounce";
import { useClickOutside } from "../hooks/useClickOutside";
import "../index.css";

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null); // Reference for detecting clicks outside

  // Clear search results when navigating to another page
  useEffect(() => {
    setSearchError("");
    setSuggestions([]);
    setSearchValue("");
  }, [location.pathname]);

  // Close suggestion box when clicking outside
  useClickOutside(ref, () => setSuggestions([]));

  // Debounce search input to reduce Firestore calls
  const debouncedSearch = useDebounce(searchValue, 300);

  // Fetch username suggestions (live search)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.length < 1) {
        setSuggestions([]);
        return;
      }

      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          orderBy("usernameLower"),
          startAt(debouncedSearch.toLowerCase()),
          endAt(debouncedSearch.toLowerCase() + "\uf8ff"),
          limit(5)
        );

        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => doc.data().username);
        setSuggestions(list);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

  // Search for user by username (on Enter)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = searchValue.trim().toLowerCase();
    if (!username) return;

    try {
      const q = query(
        collection(db, "users"),
        where("usernameLower", "==", username.toLowerCase()),
        limit(1)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        navigate(`/${username}`);
        setSuggestions([]);
      } else {
        setSearchError("User not found");
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("Error searching user");
    }
  };

  return (
    <div className="navbar-search-wrapper" ref={ref}>
      {/* Search input + button */}
      <form onSubmit={handleSubmit} className="navbar-search">
        <button type="submit" className="search-button">
          <img src={searchIcon} alt="Search" className="search-icon" />
        </button>
        <input
          type="text"
          placeholder="Search username..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          autoComplete="off"
        />
      </form>

      {/* Username suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions-box">
          {suggestions.map((name) => (
            <div
              key={name}
              className="suggestion-item"
              onClick={() => {
                navigate(`/${name}`);
                setSuggestions([]);
                setSearchValue("");
              }}
            >
              🔥 {name}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {searchError && <span className="search-error">{searchError}</span>}
    </div>
  );
}
