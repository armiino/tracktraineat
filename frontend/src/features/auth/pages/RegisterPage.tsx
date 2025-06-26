import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { register as registerAPI } from "../services/authService";
import { toast } from "react-hot-toast";
import { registerSchema } from "@/features/auth/validation/registerSchema"; // ✔️ dein Zod-Schema
import { handleApiError } from "@/lib/handleApiError";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = { email, password };

    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.issues.map((i) => i.message).join("\n"));
      return;
    }

    try {
      await registerAPI(formData);
      toast.success("Registrierung erfolgreich!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      handleApiError(err, "Registrierung fehlgeschlagen.");
    }
  };

  return (
    <PageWrapper>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative mt-10">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Registrieren
        </h2>

        <form onSubmit={handleRegister} noValidate className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
          />
          <button
            className="w-full bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors duration-200"
            type="submit"
          >
            Registrieren
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-700 underline"
          >
            Bereits registriert? Hier einloggen
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Register;
