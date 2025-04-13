import { User } from '../model/User';
import jwt from 'jsonwebtoken';
import { RegisterUserDTO } from '../dto/RegisterUserDto';

const users: User[] = []; // erst testweise mal im array speichern später DB wsl postgresql 

const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecrettest'; //fallback fürs testing später da jest kein .env ntzt 

export const authService = {
  //neuen user anlegen
  async register(dto: RegisterUserDTO): Promise<User>{
    const exists = users.find(u => u.getPublicProfile().email === dto.email);
    if (exists) throw new Error('User already exists');

    const user = await User.create(dto.email, dto.password);
    users.push(user); // später in die DB speichern

    return user; 
  },

  // Login: User finden und passwort checken -> wenn korrekt dann JWT token generieren 
  async login(email: string, password: string): Promise<string> {
    const user = users.find(u => u.getPublicProfile().email === email);
    if (!user || !user.checkPassword(password)) {
      throw new Error('Invalid email or password');
    }

    // Wenn korrekt → JWT generieren
    return authService.generateToken(user);

    
  },

  // token generieren mit user id und role 
  // später mit middleware überprüfen -> verfiy methode (jwt.verify oder so)
  generateToken(user: User): string {
    const payload = {
      id: user.getPublicProfile().id,
      role: user.getPublicProfile().role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  },

  //gerade nur für testzweck
  //TODO wieder entfernen 
  getAllUsers(): User[] {
    console.log(users);
    return users;
  },


};
