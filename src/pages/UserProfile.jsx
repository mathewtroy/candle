import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function UserProfile() {
  const { username } = useParams();
  const [postContent, setPostContent] = useState('');

  const handleCreatePost = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to create a post.');
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        authorId: auth.currentUser.uid,
        username,
        content: postContent,
        createdAt: serverTimestamp(),
      });
      alert('Post created!');
      setPostContent('');
    } catch (err) {
      alert('Error creating post: ' + err.message);
    }
  };

  return (
    <div className="container">
      <h2>{username}'s Profile</h2>
      <p>This is a public page for viewing and placing candles.</p>

      {auth.currentUser && (
        <div style={{ marginTop: '20px' }}>
          <textarea
            placeholder="Write a post..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={4}
            style={{ width: '100%' }}
          />
          <button onClick={handleCreatePost}>Create Post</button>
        </div>
      )}
    </div>
  );
}
