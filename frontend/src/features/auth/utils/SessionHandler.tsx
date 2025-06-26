import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { registerSessionHandler } from "@/lib/api";
import { useAuth } from "../context/AuthContext";

// tracken der gründe warum man rausgeworfen werden soll -> intercepter fängt 401/403 ab
type LogoutReason = "unauthorized" | "expired" | "manual" | undefined;

const protectedPaths = ["/dashboard", "/profile", "/saved"];

export default function SessionHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    registerSessionHandler((reason?: LogoutReason) => {
      logout();

      const isProtected = protectedPaths.some((path) =>
        location.pathname.startsWith(path)
      );

      if (isProtected) {
        navigate("/login", {
          replace: true,
          state: { error: reason },
        });
      }
    });
  }, [logout, navigate, location.pathname]);

  return null;
}
