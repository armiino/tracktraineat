import bcrypt from 'bcryptjs';

export class User {
  constructor(
    public id: string,
    public email: string,
    private passwordHash: string,
    public role: 'user' | 'admin' = 'user'
  ) {}

  checkPassword(plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, this.passwordHash);
  }

  // infos fürs frontend 
  getPublicProfile() {
    return {
      id: this.id,
      email: this.email,
      role: this.role
    };
  }

  // user erstellen
  // password wird gehashed
  // random uid
  // role hier egal und wird nicht mitgegeben -> registerUserDto besteht nur aus email und password -> egal was man im body mitgibt es wird immer auf user gesetzt
  // plan ist erst mal über die DB die rechte zu verwalten - später vllt mit funktionen
  static async create(email: string, plainPassword: string): Promise<User> {
    const hashed = await bcrypt.hash(plainPassword, 10); // 10 runden Salting
    const id = crypto.randomUUID(); // später db id ?? - aktuell random generiert
    return new User(id, email, hashed, 'user');
  }
  //methode die alles liefert für DB
  toPersistence() {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      role: this.role
    };
  }
}
