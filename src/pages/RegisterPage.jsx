import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        createdAt: new Date(),
      });

      alert('Registration successful!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
        <h2>Register</h2>
        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleRegister}>Register</button>
    </div>
  );
}
