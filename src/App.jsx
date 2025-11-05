// src/App.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RequireAdmin from "./components/RequireAdmin";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfile from "./pages/UserProfile";
import PageNotFound from "./pages/PageNotFound";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <Routes>
      {/* All public pages share the same layout with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin-only route wrapped with guard */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPanel />
            </RequireAdmin>
          }
        />

        {/* Dynamic user profile */}
        <Route path="/:username" element={<UserProfile />} />

        {/* Static 404 route so navigate('/404') works */}
        <Route path="/404" element={<PageNotFound />} />

        {/* Catch-all */}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}
