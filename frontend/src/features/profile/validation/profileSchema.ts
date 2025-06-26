import { z } from "zod";

export const profileSchema = z.object({
  age: z
    .number({ invalid_type_error: "Alter muss eine Zahl sein." })
    .min(10, "Alter muss mindestens 10 Jahre sein."),
  height: z
    .number({ invalid_type_error: "Größe muss eine Zahl sein." })
    .min(50, "Größe muss mindestens 50 cm sein."),
  weight: z
    .number({ invalid_type_error: "Gewicht muss eine Zahl sein." })
    .min(20, "Gewicht muss mindestens 20 kg sein."),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Bitte Geschlecht wählen." }),
  }),
  activity: z.enum(["low", "medium", "high", "superhigh"], {
    errorMap: () => ({ message: "Bitte Aktivität wählen." }),
  }),
  goal: z.enum(["loseWeight", "gainMuscle", "noChange"], {
    errorMap: () => ({ message: "Bitte Ziel wählen." }),
  }),
  dietType: z
    .enum(["omnivore", "vegetarian", "vegan"])
    .optional()
    .default("omnivore"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
