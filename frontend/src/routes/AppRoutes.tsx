import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Login from "@/features/auth/pages/LoginPage";
import Register from "@/features/auth/pages/RegisterPage";
import Profile from "@/features/profile/pages/ProfilePage";
import Dashboard from "@/features/dashboard/pages/DashboardPage";
import SavedRecipes from "@/features/myRecipes/pages/SavedRecipesPage";
import LandingPage from "@/features/landing/pages/LandingPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedRecipes />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
