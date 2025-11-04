import { useEffect, useState } from 'react';
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
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './config';

// Custom hook for user posts (fetch, create, like, delete)
export function useUserPosts(username, postContent, setPostContent) {
  const [posts, setPosts] = useState([]);
  const [profileUserId, setProfileUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});

  // Fetch user UID by username
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const userDoc = usersSnap.docs.find(
          (doc) => doc.data().username === username
        );
        if (userDoc) setProfileUserId(userDoc.id);
      } catch (err) {
        console.error('Error fetching user id:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserId();
  }, [username]);

  // Subscribe to user's posts
  useEffect(() => {
    if (!profileUserId) return;

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', profileUserId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const likesData = {};
        for (const post of fetchedPosts) {
          const likeRef = doc(db, 'posts', post.id, 'likes', userId);
          const likeSnap = await getDoc(likeRef);
          likesData[post.id] = likeSnap.exists();
        }
        setUserLikes(likesData);
      }

      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, [profileUserId]);

  // Create new post
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

  // Delete post
  const handleDelete = async (postId, authorId) => {
    if (auth.currentUser?.uid !== authorId) {
      alert('You can only delete your own posts.');
      return;
    }
    await deleteDoc(doc(db, 'posts', postId));
  };

  // Like / Unlike post (anti-spam)
  const handleLike = async (postId) => {
    if (!auth.currentUser) {
      alert('You must be logged in to like posts.');
      return;
    }

    const userId = auth.currentUser.uid;
    const likeRef = doc(db, 'posts', postId, 'likes', userId);
    const postRef = doc(db, 'posts', postId);

    try {
      const likeSnap = await getDoc(likeRef);

      if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });
        setUserLikes((prev) => ({ ...prev, [postId]: false }));
      } else {
        await setDoc(likeRef, { userId, createdAt: new Date() });
        await updateDoc(postRef, { likes: increment(1) });
        setUserLikes((prev) => ({ ...prev, [postId]: true }));
      }
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  return {
    posts,
    loading,
    handleCreatePost,
    handleDelete,
    handleLike,
    userLikes,
  };
}
