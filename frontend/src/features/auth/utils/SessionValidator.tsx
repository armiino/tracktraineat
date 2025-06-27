import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validate } from "../services/authService";
import { handleApiError } from "@/lib/handleApiError";

const protectedPaths = ["/dashboard", "/profile", "/saved"];

export default function SessionValidator() {
  const location = useLocation();
  const { login, logout } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    if (!protectedPaths.some((p) => path.startsWith(p))) return;

    const checkSession = async () => {
      try {
        const res = await validate();
        if (res.data.authenticated) {
          login();
        } else {
          console.log(4);
          logout();
        }
      } catch (err) {
        handleApiError(err, "Verbindung zum Server fehlgeschlagen");
      }
    };

    checkSession();
  }, [location.pathname]);

  return null;
}
