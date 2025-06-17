import { User } from '../model/User';
import jwt from 'jsonwebtoken';
import { RegisterUserDTO } from '../dto/RegisterUserDto';
import { UserRepository } from '../port/UserRepository';

//const users: User[] = []; // erst testweise mal im array speichern später DB wsl postgresql 

const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecrettest'; //fallback fürs testing später da jest kein .env ntzt 

export const authService = (repo: UserRepository) => ({
  async register(dto: RegisterUserDTO): Promise<User> {
    const exists = await repo.findByEmail(dto.email);
    if (exists) throw new Error('User already exists');

    const user = await User.create(dto.email, dto.password);
    await repo.save(user);

    return user;
  },

  async login(email: string, password: string): Promise<string> {
    const user = await repo.findByEmail(email);
    if (!user || !user.checkPassword(password)) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      id: user.getPublicProfile().id,
      role: user.getPublicProfile().role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  }
});
