import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanupTestUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.userProfile.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}
