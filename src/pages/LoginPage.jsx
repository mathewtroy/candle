import { useState } from 'react';
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput, isValidEmail } from '../firebase/validateUserInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const cleanEmail = sanitizeInput(email.trim());
      if (!isValidEmail(cleanEmail)) {
        alert('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      if (!password) {
        alert('Password is required.');
        setLoading(false);
        return;
      }

      // Login via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Fetch username from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        alert('User profile not found.');
        setLoading(false);
        return;
      }

      const { username, photoURL } = userDoc.data();

      // Update Auth profile to sync displayName and avatar
      await updateProfile(user, {
        displayName: username,
        ...(photoURL ? { photoURL } : {}),
      });

      // Navigate to user profile page
      navigate(`/${username}`);
    } catch (err) {
      console.error('Login error:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>

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
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
