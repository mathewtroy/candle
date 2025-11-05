import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { getDocs, query, collection, where, limit } from "firebase/firestore";
import { useUserPosts } from "../hooks/useUserPosts";
import PostCard from "../components/PostCard";
import AvatarUploader from "../components/AvatarUploader";
import Loader from "../components/Loader";
import "../index.css";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile by username
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setUserData(null);
      try {
        const q = query(
          collection(db, "users"),
          where("username", "==", username),
          limit(1)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          setUserData({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          // Navigate to 404 if user not found
          navigate("/404", { replace: true });
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        navigate("/404", { replace: true });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [username, navigate]);

  // Posts logic
  const { posts, loading, handleCreatePost, handleDelete, handleLike, userLikes } =
    useUserPosts(username, postContent, setPostContent);

  // Only owner can upload/change avatar or create posts
  const isOwner = auth.currentUser?.displayName === username;

  if (loadingProfile) return <Loader text="Loading profile..." />;
  if (!userData) return null; // prevent rendering old state

  return (
    <div className="container">
      <div className="profile-header">
        {isOwner ? (
          <AvatarUploader
            currentPhoto={userData.photoURL}
            onPhotoChange={(url) =>
              setUserData((prev) => ({ ...prev, photoURL: url }))
            }
          />
        ) : (
          <img
            src={userData.photoURL || "/default-avatar.png"}
            alt="User Avatar"
            className="profile-avatar"
          />
        )}

        <h2>{username}</h2>
        <p className="profile-subtitle">Public profile</p>
      </div>

      {/* Post creation visible only to profile owner */}
      {isOwner && (
        <div className="post-create">
          <textarea
            placeholder="Write something..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={3}
          />
          <button onClick={handleCreatePost}>Create Post</button>
        </div>
      )}

      <div className="posts-section">
        <h3>🕯️ Posts</h3>
        {loading ? (
          <Loader text="Loading posts..." />
        ) : posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              liked={userLikes[post.id]}
            />
          ))
        )}
      </div>
    </div>
  );
}
