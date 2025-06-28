import { PostgresUserAdapter } from "../../adapter/PostgresUserAdapter";
import { User } from "../../model/User";
import { prisma } from "../../prisma";

describe("User Adapter Integration", () => {
  const adapter = new PostgresUserAdapter(prisma);

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("speichert und löscht einen Benutzer per Email erfolgreich", async () => {
    await adapter.save(new User("test-id", "email@test.com", "hash", "user"));
    await adapter.deleteByEmail("email@test.com");

    const user = await prisma.user.findUnique({ where: { email: "email@test.com" } });
    expect(user).toBeNull();
  });
});
