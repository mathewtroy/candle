import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput, isValidUsername, isValidEmail } from '../firebase/validateUserInput';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      const cleanUsername = sanitizeInput(username.trim());
      const cleanEmail = sanitizeInput(email.trim());

      // Validate username
      if (!isValidUsername(cleanUsername)) {
        alert('Username must be 1–50 chars and contain only letters and numbers.');
        setLoading(false);
        return;
      }

      // Validate email
      if (!isValidEmail(cleanEmail)) {
        alert('Please enter a valid email (max 70 chars).');
        setLoading(false);
        return;
      }

      if (!password) {
        alert('Password is required.');
        setLoading(false);
        return;
      }

      // Check for duplicate username
      const usernameQuery = query(collection(db, 'users'), where('username', '==', cleanUsername));
      const usernameSnap = await getDocs(usernameQuery);
      if (!usernameSnap.empty) {
        alert('This username is already taken.');
        setLoading(false);
        return;
      }

      // Check for duplicate email
      const emailQuery = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        alert('This email is already registered.');
        setLoading(false);
        return;
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Wait for Firebase Auth to update context
      await updateProfile(user, { displayName: cleanUsername });
      await new Promise((resolve) => setTimeout(resolve, 300)); // short delay for auth sync

      // ✅ Ensure user is authenticated before writing to Firestore
      if (!auth.currentUser || auth.currentUser.uid !== user.uid) {
        alert('Authentication not ready. Please try again.');
        setLoading(false);
        return;
      }

      // Add user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: cleanEmail,
        username: cleanUsername,
        createdAt: new Date(),
      });

      alert('Registration successful!');
      navigate(`/${cleanUsername}`);
    } catch (err) {
      console.error('Registration error:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
}
