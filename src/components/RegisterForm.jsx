import { useState } from "react";

// Keeps form UI simple; logic handled in hook
export default function RegisterForm({ onSubmit, loading, uploadingAvatar }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, username, avatarFile });
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
        disabled={loading || uploadingAvatar}
      />

      <button type="submit" disabled={loading || uploadingAvatar}>
        {uploadingAvatar ? (
          <>
            <span className="spinner"></span> Uploading Avatar...
          </>
        ) : loading ? (
          <>
            <span className="spinner"></span> Registering...
          </>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
}
