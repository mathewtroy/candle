import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";

/**
 * AdminPanel.jsx
 * Admin-only page for managing users:
 *  - View all users
 *  - Promote/demote between "user" and "admin"
 *  - Delete users (except self)
 */
export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const userList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
        alert("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Change user role between 'user' and 'admin'
   * Prevents admin from changing their own role.
   */
  const changeRole = async (id, newRole) => {
    if (id === auth.currentUser?.uid) {
      alert("⚠️ You cannot change your own role.");
      return;
    }

    if (!window.confirm(`Change this user's role to '${newRole}'?`)) return;

    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      alert("✅ Role updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role. Check permissions or Firestore rules.");
    }
  };

  /**
   * Delete a user from Firestore.
   * Admin cannot delete their own account.
   */
  const deleteUser = async (id) => {
    if (id === auth.currentUser?.uid) {
      alert("⚠️ You cannot delete your own account.");
      return;
    }

    if (!window.confirm("⚠️ Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      alert("🗑️ User deleted successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Check permissions or Firestore rules.");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="container">
      <h2>Admin Panel</h2>
      <p>Manage users, roles, and moderation tasks.</p>

      <div className="admin-list">
        {users.map((u) => (
          <div key={u.id} className="post-card">
            <div className="post-header">
              <img
                src={u.photoURL || "/default-avatar.png"}
                alt="User avatar"
                className="post-avatar"
              />
              <div>
                <strong>{u.username}</strong>
                <div className="post-date">{u.email}</div>
                <div className="text-gray">Role: {u.role}</div>
              </div>
            </div>

            <div className="post-actions">
              {/* Prevent changing your own role */}
              {u.id !== auth.currentUser?.uid && (
                <>
                  {u.role !== "admin" ? (
                    <button onClick={() => changeRole(u.id, "admin")}>Make Admin</button>
                  ) : (
                    <button onClick={() => changeRole(u.id, "user")}>Remove Admin</button>
                  )}
                  <button onClick={() => deleteUser(u.id)} className="delete-button">
                    🗑️ Delete User
                  </button>
                </>
              )}

              {/* Visual feedback for current admin */}
              {u.id === auth.currentUser?.uid && (
                <p className="text-gray">👑 This is your account (admin)</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
