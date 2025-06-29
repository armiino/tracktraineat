import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { validate } from "../services/authService";
import { registerSessionHandler } from "@/lib/api";

type LogoutReason = "manual" | "unauthorized" | "expired";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: (reason?: LogoutReason) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const login = () => setIsAuthenticated(true);

  const logout = (reason: LogoutReason = "manual") => {
    console.log(1);
    setIsAuthenticated(false);

    navigate("/login", {
      replace: true,
      state: {
        [reason === "manual" ? "info" : "error"]:
          reason === "manual" ? "logout" : reason,
      },
    });
  };

  const contextValue = useMemo(
    () => ({ isAuthenticated, isLoading, login, logout }),
    [isAuthenticated, isLoading]
  );

  useEffect(() => {
    registerSessionHandler((reason = "unauthorized") => {
      const protectedPaths = ["/dashboard", "/profile", "/saved"];
      const currentPath = location.pathname;
      const isProtected = protectedPaths.some((p) => currentPath.startsWith(p));
      if (isProtected) {
        console.log(2);
        logout(reason);
      } else {
        setIsAuthenticated(false);
      }
    });

    const check = async () => {
      try {
        const res = await validate();
        setIsAuthenticated(res.data.authenticated);
      } catch {
        console.log(3);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    check();
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss mit einem AuthProvider verwendet werden!");
  }
  return context;
};
