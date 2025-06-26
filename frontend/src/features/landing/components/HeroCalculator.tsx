import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "@/lib/handleApiError";
import { calculateSchema } from "@/features/landing/validation/calculateSchema";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { calculatorService } from "@/features/landing/services/calculatorService";
import type { CalculatePayload } from "@/features/landing/types/calculator";

export default function HeroCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");
  const [goal, setGoal] = useState("");
  const [burned, setBurned] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleCalculate = async () => {
    try {
      const parsed: CalculatePayload = calculateSchema.parse({
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        gender,
        activity,
        goal,
        burned: burned ? Number(burned) : 0,
      });

      const res = await calculatorService.calculate(parsed);
      setResult(res.data.totalCalories);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0]?.message || "Ungültige Eingaben";
        toast.error(firstError);
        return;
      }

      handleApiError(err, "Kalorienberechnung fehlgeschlagen");
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-12 bg-gray-100 px-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-md max-w-xl w-full text-center border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Kalorienrechner
        </h1>
        <p className="text-gray-600 mb-6">
          Berechne deinen Tagesbedarf als Beispiel – ganz ohne Anmeldung.
        </p>
        <div className="space-y-4 mb-6">
          <input
            className="w-full p-3 border border-gray-300 rounded-xl"
            type="number"
            placeholder="Gewicht (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-xl"
            type="number"
            placeholder="Größe (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-xl"
            type="number"
            placeholder="Alter (Jahre)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <select
            className="w-full p-3 border border-gray-300 rounded-xl"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Geschlecht wählen</option>
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
          </select>

          <select
            className="w-full p-3 border border-gray-300 rounded-xl"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          >
            <option value="">Aktivität wählen</option>
            <option value="low">Niedrig</option>
            <option value="medium">Mittel</option>
            <option value="high">Hoch</option>
            <option value="superhigh">Sehr hoch</option>
          </select>

          <select
            className="w-full p-3 border border-gray-300 rounded-xl"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            <option value="">Ziel wählen</option>
            <option value="noChange">Gewicht halten</option>
            <option value="gainMuscle">Muskeln aufbauen</option>
            <option value="loseWeight">Abnehmen</option>
          </select>

          <input
            className="w-full p-3 border border-gray-300 rounded-xl"
            type="number"
            placeholder="Zusätzlich verbrannte Kalorien (optional)"
            value={burned}
            onChange={(e) => setBurned(e.target.value)}
          />

          <button
            onClick={handleCalculate}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl transition"
          >
            Berechnen
          </button>
        </div>

        {result && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-100 p-6 rounded-xl shadow mt-6 text-left"
            >
              <h2 className="text-lg text-gray-800 mb-4">
                Dein <strong>Tagesbedarf: {result} kcal</strong> – Das könntest
                du essen!
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Haferflocken mit Banane",
                    kcal: 450,
                    image: "/breakfast.jpg",
                    desc: "Haferflocken, Banane, Milch",
                  },
                  {
                    title: "Hähnchen mit Quinoa",
                    kcal: 700,
                    image: "/lunch.jpg",
                    desc: "Hähnchen, Gemüse, Quinoa",
                  },
                  {
                    title: "Linsensuppe",
                    kcal: 600,
                    image: "/dinner.jpg",
                    desc: "Linsen, Brühe, Gewürze",
                  },
                  {
                    title: "Griechischer Joghurt",
                    kcal: 450,
                    image: "/snack.jpg",
                    desc: "Joghurt, Honig, Nüsse",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-xl shadow-sm flex items-start gap-4 hover:shadow-md transition"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">{item.kcal} kcal</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="mt-6">
              <button
                onClick={goToRegister}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl transition"
              >
                Jetzt ein Account anlegen und personalisierte Mealplans
                erhalten!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
