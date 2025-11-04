import defaultAvatar from '../assets/candle-logo.svg';
import { auth } from '../firebase/config';

export default function PostCard({ post, onLike, onDelete, liked }) {
  const isAuthor = auth.currentUser?.uid === post.authorId;

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={defaultAvatar} alt="avatar" className="post-avatar" />
        <div>
          <strong>{post.username}</strong>
          <div className="post-date">
            {post.createdAt?.toDate
              ? post.createdAt.toDate().toLocaleString()
              : 'Just now'}
          </div>
        </div>
      </div>

      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        <button
          onClick={() => onLike(post.id)}
          style={{
            color: liked ? 'red' : 'white',
            fontWeight: liked ? 'bold' : 'normal',
          }}
        >
          ❤️ {post.likes || 0}
        </button>

        {isAuthor && (
          <button onClick={() => onDelete(post.id, post.authorId)}>🗑️ Delete</button>
        )}
      </div>
    </div>
  );
}
