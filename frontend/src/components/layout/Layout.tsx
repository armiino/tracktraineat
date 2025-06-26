import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="pt-16 px-4 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </>
  );
}
