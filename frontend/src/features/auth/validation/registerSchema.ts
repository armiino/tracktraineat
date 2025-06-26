import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail ein."),
  password: z.string().min(6, "Passwort: Mindestens 6 Zeichen!"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
