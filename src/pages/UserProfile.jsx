import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../firebase/config';
import { useUserPosts } from '../firebase/useUserPosts';
import PostCard from '../components/PostCard';

export default function UserProfile() {
  const { username } = useParams();
  const [postContent, setPostContent] = useState('');

  // Custom hook handles all Firestore logic
  const {
    posts,
    loading,
    handleCreatePost,
    handleDelete,
    handleLike,
    userLikes,
  } = useUserPosts(username, postContent, setPostContent);

  return (
    <div className="container">
      <h2>{username}'s Profile</h2>
      <p>This is a public page for viewing and placing candles.</p>

      {auth.currentUser?.displayName === username && (
        <div className="post-create">
          <textarea
            placeholder="Write a post..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={4}
          />
          <button onClick={handleCreatePost}>Create Post</button>
        </div>
      )}

      <div className="posts-section">
        <h3>🕯️ Posts</h3>
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet...</p>
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
