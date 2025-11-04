import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  getDocs
} from 'firebase/firestore';
import defaultAvatar from '../assets/candle-logo.svg';

export default function UserProfile() {
  const { username } = useParams(); // example: qwerty22
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [profileUserId, setProfileUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Step 1: Find UID by username
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        console.log('🔍 Fetching user for username:', username);
        const usersSnap = await getDocs(collection(db, 'users'));
        const userDoc = usersSnap.docs.find(
          (doc) => doc.data().username === username
        );

        if (userDoc) {
          console.log('✅ Found user:', userDoc.data().username);
          console.log('✅ UID:', userDoc.id);
          setProfileUserId(userDoc.id); // here id = uid
        } else {
          console.warn('⚠️ No such user found for username:', username);
          setProfileUserId(null);
        }
      } catch (err) {
        console.error('❌ Error fetching user id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [username]);

  // 🔹 Step 2: Subscribe to posts by authorId
  useEffect(() => {
    if (!profileUserId) {
      console.log('⏳ Waiting for profileUserId...');
      return;
    }

    console.log('📡 Subscribing to posts for UID:', profileUserId);

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', profileUserId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('🕯️ Posts loaded:', fetchedPosts.length);
        setPosts(fetchedPosts);
      },
      (err) => {
        console.error('❌ Firestore listener error:', err);
      }
    );

    return () => unsubscribe();
  }, [profileUserId]);

  // 🔹 Log when profileUserId changes
  useEffect(() => {
    if (profileUserId) {
      console.log('🎯 profileUserId changed:', profileUserId);
    }
  }, [profileUserId]);

  // 🔹 Step 3: Create post
  const handleCreatePost = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to create a post.');
      return;
    }

    if (!postContent.trim()) {
      alert('Post cannot be empty.');
      return;
    }

    try {
      await addDoc(collection(db, 'posts'), {
        authorId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'user',
        content: postContent.trim(),
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setPostContent('');
    } catch (err) {
      alert('Error creating post: ' + err.message);
    }
  };

  // 🔹 Delete post
  const handleDelete = async (postId, authorId) => {
    if (auth.currentUser?.uid !== authorId) {
      alert('You can only delete your own posts.');
      return;
    }
    await deleteDoc(doc(db, 'posts', postId));
  };

  // 🔹 Like post
  const handleLike = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { likes: increment(1) });
  };

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
            <div key={post.id} className="post-card">
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
                <button onClick={() => handleLike(post.id)}>❤️ {post.likes || 0}</button>
                {auth.currentUser?.uid === post.authorId && (
                  <button onClick={() => handleDelete(post.id, post.authorId)}>🗑️ Delete</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
