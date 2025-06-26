import { z } from "zod";

export const calculateSchema = z.object({
  weight: z
    .number({ invalid_type_error: "Bitte gib ein gültiges Gewicht ein." })
    .min(1, "Gewicht muss größer als 0 sein."),
  height: z
    .number({ invalid_type_error: "Bitte gib eine gültige Größe ein." })
    .min(1, "Größe muss größer als 0 sein."),
  age: z
    .number({ invalid_type_error: "Bitte gib ein gültiges Alter ein." })
    .min(10, "Alter muss mindestens 10 Jahre sein."),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Geschlecht ist erforderlich." }),
  }),
  activity: z.enum(["low", "medium", "high", "superhigh"], {
    errorMap: () => ({ message: "Aktivitätslevel ist erforderlich." }),
  }),
  goal: z.enum(["noChange", "gainMuscle", "loseWeight"], {
    errorMap: () => ({ message: "Ziel ist erforderlich." }),
  }),
  burned: z
    .number({ invalid_type_error: "Verbrannte Kalorien müssen eine Zahl sein." })
    .min(0)
    .optional(),
});

export type CalculateSchema = z.infer<typeof calculateSchema>;
