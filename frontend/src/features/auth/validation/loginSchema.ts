import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Passwort darf nicht leer sein."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
