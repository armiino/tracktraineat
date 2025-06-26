import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { validate } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { registerSessionHandler } from "@/lib/api";

type LogoutReason = "manual" | "unauthorized" | "expired";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: (reason?: LogoutReason) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
  useEffect(() => {
    registerSessionHandler((reason = "unauthorized") => {
      const protectedPaths = ["/dashboard", "/profile", "/saved"];
      const currentPath = window.location.pathname;
      const isProtected = protectedPaths.some((p) => currentPath.startsWith(p));
      if (isProtected) {
        console.log(2);
        logout(reason); // nur wenn ich auch auf einer gesicherten page bin -> plus redirect ans /login
      } else {
        setIsAuthenticated(false);
      }
    });

    const check = async () => {
      try {
        const res = await validate();
        setIsAuthenticated(res.data.authenticated);
        //  console.log("info:" + res.data.authenticated)
      } catch {
        console.log(3);
        /*  bei refresh wird wieder /validate abgefragt und hier auf false gesetzt.
            dadurch wird man automatisch auf login geleitet weil das system denkt man ist nicht eingeloggt 
            TODO: Zustandsabfrage ändern?
        */
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    check();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss mit einem AuthProvider verwendet werden!");
  }
  return context;
};
