import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ProfileProvider } from "@/features/profile/context/ProfileContext";
import AppRoutes from "@/routes/AppRoutes";
import SessionHandler from "@/features/auth/utils/SessionHandler";
import SessionValidator from "@/features/auth/utils/SessionValidator";
import { GlobalToast } from "@/components/ui/GlobalToast";

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <GlobalToast />
        <SessionHandler />
        <SessionValidator />
        <AppRoutes />
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
