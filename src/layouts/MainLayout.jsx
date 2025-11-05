import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

// Simple shell: navbar on top, routed page content below
export default function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
