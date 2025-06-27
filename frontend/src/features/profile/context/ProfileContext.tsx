import { UserProfile } from "../types/UserProfile";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback
} from "react";
import { fetchProfile as fetchProfileAPI } from "../services/profileService";
import { useAuth } from "../../auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "@/lib/handleApiError";



interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchProfileAPI();
      setProfile(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login", {
          replace: true,
          state: { error: "unauthorized" },
        });
      } else {
        setProfile(null);
        handleApiError(err, "Profil konnte nicht geladen werden.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout, navigate]);
  

  useEffect(() => {
    if (!isAuthenticated) return;
    refetch();
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({ profile, isLoading, refetch, setProfile }),
    [profile, isLoading, refetch, setProfile]
  );  
  
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
