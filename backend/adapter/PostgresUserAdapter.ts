import { UserRepository } from '../port/UserRepository';
import { User } from '../model/User';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostgresUserAdapter implements UserRepository {
    async save(user: User): Promise<void> {
      await prisma.user.create({
        data: user.toPersistence(),
      });
    }
  
    async findByEmail(email: string): Promise<User | null> {
      const data = await prisma.user.findUnique({ where: { email } });
      if (!data) return null;
  
      const role = data.role === 'admin' ? 'admin' : 'user'; //notfalls einfach immer user
      return new User(data.id, data.email, data.passwordHash, data.role as 'user' | 'admin');
    }
  }
  