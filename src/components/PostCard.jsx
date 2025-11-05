import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import defaultAvatar from "../assets/candle-logo.svg";
import candleIcon from "../assets/candle-icon.svg";
import candleRedIcon from "../assets/candle-red-icon.svg";

export default function PostCard({ post, onLike, onDelete, liked }) {
  const isAuthor = auth.currentUser?.uid === post.authorId;
  const [avatar, setAvatar] = useState(defaultAvatar);

  // Subscribe to real-time avatar updates
  useEffect(() => {
    const userRef = doc(db, "users", post.authorId);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAvatar(data.photoURL || defaultAvatar);
      } else {
        setAvatar(defaultAvatar);
      }
    });

    // cleanup subscription
    return () => unsubscribe();
  }, [post.authorId]);

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={avatar} alt="avatar" className="post-avatar" />
        <div>
          <strong>{post.username}</strong>
          <div className="post-date">
            {post.createdAt?.toDate
              ? post.createdAt.toDate().toLocaleString()
              : "Just now"}
          </div>
        </div>
      </div>

      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button
          className={`like-button ${liked ? "liked" : ""}`}
          onClick={() => onLike(post.id)}
        >
          <img
            src={liked ? candleRedIcon : candleIcon}
            alt="like"
            className="candle-icon"
          />
          <span>{post.likes || 0}</span>
        </button>

        {isAuthor && (
          <button
            onClick={() => onDelete(post.id, post.authorId)}
            className="delete-button"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}
