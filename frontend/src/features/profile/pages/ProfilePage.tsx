import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/features/profile/context/ProfileContext";
import { handleApiError } from "@/lib/handleApiError";
import { profileSchema } from "@/features/profile/validation/profileSchema";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useDailyNutrition } from "@/features/dashboard/hook/useDailyNutrition";
import {
  updateProfile,
  createProfile,
} from "@/features/profile/services/profileService";

export default function Profile() {
  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "",
    activity: "",
    goal: "",
    dietType: "",
  });

  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const { reset: resetCalories } = useDailyNutrition("calories");
  const { reset: resetProtein } = useDailyNutrition("protein");

  const { profile, setProfile, isLoading } = useProfile();

  useEffect(() => {
    if (profile) {
      setForm({
        age: profile.age.toString(),
        height: profile.height.toString(),
        weight: profile.weight.toString(),
        gender: profile.gender,
        activity: profile.activity,
        goal: profile.goal,
        dietType: profile.dietType,
      });
      setEditing(true);
    } else {
      setEditing(false);
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawData = {
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      gender: form.gender,
      activity: form.activity,
      goal: form.goal,
      dietType: form.dietType || "omnivore",
    };

    try {
      const validated = profileSchema.parse(rawData);

      if (editing) {
        await updateProfile(validated);
      } else {
        await createProfile(validated);
      }

      setProfile(validated);

      await resetCalories();
      await resetProtein();      

      toast.success("Aktualisierung erfolgreich");

      navigate("/dashboard");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        toast.error(`${first?.path[0]}: ${first?.message}`);
        return;
      }

      handleApiError(err, "Fehler beim Speichern des Profils.");
    }
  };

  if (isLoading) return <div className="text-center p-6">Lade Profil...</div>;

  return (
    <div className="min-h-screen flex items-start justify-center pt-12 bg-gray-100 px-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-md max-w-xl w-full border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {editing ? "Profil bearbeiten" : "Profil erstellen"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            type="number"
            placeholder="Alter"
          />
          <input
            name="height"
            value={form.height}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            type="number"
            placeholder="Größe (cm)"
          />
          <input
            name="weight"
            value={form.weight}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
            type="number"
            placeholder="Gewicht (kg)"
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          >
            <option value="">Geschlecht wählen</option>
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
          </select>

          <select
            name="activity"
            value={form.activity}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          >
            <option value="">Aktivitätslevel</option>
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
            <option value="superhigh">Sehr hoch</option>
          </select>

          <select
            name="goal"
            value={form.goal}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          >
            <option value="">Ziel</option>
            <option value="loseWeight">Abnehmen</option>
            <option value="noChange">Gewicht halten</option>
            <option value="gainMuscle">Muskeln aufbauen</option>
          </select>

          <select
            name="dietType"
            value={form.dietType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl"
          >
            <option value="">Ernährungsform</option>
            <option value="omnivore">Allesesser</option>
            <option value="vegetarian">Vegetarisch</option>
            <option value="vegan">Vegan</option>
          </select>

          <button
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl transition"
            type="submit"
          >
            {editing ? "Profil aktualisieren" : "Profil speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
