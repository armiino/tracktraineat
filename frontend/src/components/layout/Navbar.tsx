import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { apiLogout } from "@/features/auth/services/authService";
import { handleApiError } from "@/lib/handleApiError";
import {
  Menu,
  X,
  LogOut,
  UserCircle,
  Home,
  Bookmark,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    setOpen(false);
    try {
      await apiLogout();
      toast.success("Erfolgreich ausgeloggt");
    } catch (err) {
      console.warn("Logout failed", err);
      handleApiError(err, "Logout fehlgeschlagen.");
      return;
    }

    logout("manual");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          TrackTrainEat
        </Link>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div
          className={`md:flex ${
            open ? "block" : "hidden"
          } absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none`}
        >
          <ul className="flex flex-col md:flex-row gap-4 p-4 md:p-0 items-center">
            <li>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="hover:text-blue-600 flex items-center"
              >
                <Home size={24} />
              </Link>
            </li>

            {!isAuthenticated && (
              <>
                <li>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="hover:text-blue-600"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="hover:text-blue-600"
                  >
                    Login
                  </Link>
                </li>
              </>
            )}

            {isAuthenticated && (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    aria-label="Dashboard"
                    onClick={() => setOpen(false)}
                    className="hover:text-blue-600 flex items-center"
                  >
                    <LayoutDashboard size={24} />
                  </Link>
                </li>

                <li>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    aria-label="Profile"
                    className="hover:text-blue-600 flex items-center"
                  >
                    <UserCircle size={24} />
                  </Link>
                </li>

                <li>
                  <Link
                    to="/saved"
                    onClick={() => setOpen(false)}
                    aria-label="Saved Recipes"
                    className="hover:text-blue-600 flex items-center"
                  >
                    <Bookmark size={24} />
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="hover:text-red-600 flex items-center"
                  >
                    <LogOut size={24} />
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
