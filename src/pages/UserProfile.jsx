import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import {
  getDocs,
  query,
  collection,
  where,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useUserPosts } from "../firebase/useUserPosts";
import PostCard from "../components/PostCard";
import { updateProfile } from "firebase/auth";
import imageCompression from "browser-image-compression";
import "../index.css"; // 

export default function UserProfile() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  // Fetch user profile by username
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const q = query(collection(db, "users"), where("username", "==", username), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setUserData({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [username]);

  // Hook for posts
  const { posts, loading, handleCreatePost, handleDelete, handleLike, userLikes } =
    useUserPosts(username, postContent, setPostContent);

  const isOwner = auth.currentUser?.displayName === username;

  // Compress + Upload new avatar to Cloudinary
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUpdatingAvatar(true);
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 300, useWebWorker: true };
      const compressed = await imageCompression(file, options);

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

      await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: newPhotoURL });

      setUserData((prev) => ({ ...prev, photoURL: newPhotoURL }));

      alert("✅ Avatar updated successfully!");
    } catch (err) {
      console.error("🚫 Error updating avatar:", err);
      alert("Error: " + err.message);
    } finally {
      setUpdatingAvatar(false);
    }
  };

  if (loadingProfile) return <p className="text-center text-gray">Loading profile...</p>;
  if (!userData) return <p className="text-center text-error">User not found.</p>;

  return (
    <div className="container">
      <div className="profile-header">
        <img
          src={userData.photoURL || "/default-avatar.png"}
          alt="avatar"
          className="profile-avatar"
        />
        <h2>{username}</h2>
        <p className="profile-subtitle">Public profile</p>

        {isOwner && (
          <>
            <label htmlFor="avatarUpload" className="change-avatar-btn">
              {updatingAvatar ? "Uploading..." : "Change Avatar"}
            </label>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={handleAvatarChange}
              disabled={updatingAvatar}
            />
          </>
        )}
      </div>

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
          <p>Loading posts...</p>
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
