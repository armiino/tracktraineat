import { User } from "../model/User";
import jwt from "jsonwebtoken";
import { RegisterUserDTO } from "../dto/RegisterUserDto";
import { UserRepository } from "../adapter/port/UserRepository";

const JWT_SECRET = process.env.JWT_SECRET ?? "jwtsecrettest"; //fallback fürs testing später da jest kein .env ntzt

export const authService = (repo: UserRepository) => ({
  async register(dto: RegisterUserDTO): Promise<User> {
    const exists = await repo.findByEmail(dto.email);
    if (exists) {
      const err: any = new Error("User already exists");
      err.code = "email_taken";
      throw err;
    }

    const user = await User.create(dto.email, dto.password);

    try {
      await repo.save(user);
    } catch (err: any) {
      const code = err.code ?? "register_failed";
      const wrapped = new Error("Registrierung fehlgeschlagen");
      (wrapped as any).code = code;
      throw wrapped;
    }

    return user;
  },

  async login(email: string, password: string): Promise<string> {
    let user: User | null;

    try {
      user = await repo.findByEmail(email);
    } catch (err: any) {
      const code = err.code ?? "login_failed";
      const wrapped = new Error("Fehler beim Login");
      (wrapped as any).code = code;
      throw wrapped;
    }

    if (!user || !user.checkPassword(password)) {
      const err: any = new Error("Invalid credentials");
      err.code = "invalid_credentials";
      throw err;
    }

    const payload = {
      id: user.getPublicProfile().id,
      role: user.getPublicProfile().role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
  },
});
