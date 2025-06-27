import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../../../components/layout/PageWrapper";
import { login as loginAPI } from "../services/authService";
import { loginSchema } from "@/features/auth/validation/loginSchema";
import { handleApiError } from "@/lib/handleApiError";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (toastShownRef.current) return;
    toastShownRef.current = true;

    //falls ich zurücknavigier-> cleanup
    window.history.replaceState({}, document.title);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = { email, password };

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const msg = validation.error.issues.map((i) => i.message).join("\n");
      toast.error(msg);
      return;
    }

    try {
      await loginAPI(formData);
      login();
      toast.success("Login erfolgreich");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      handleApiError(err, "Login fehlgeschlagen");
    }
  };

  return (
    <PageWrapper>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative mt-10">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors duration-200"
            type="submit"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-gray-700 underline"
          >
            Noch keinen Account? Hier Registrieren!
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
