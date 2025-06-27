import { User } from "../../../model/User";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs", () => ({
  compareSync: jest.fn(),
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

describe("User model", () => {
  it("returns public profile", () => {
    const user = new User("123", "test@example.com", "secret", "user");
    expect(user.getPublicProfile()).toEqual({
      id: "123",
      email: "test@example.com",
      role: "user",
    });
  });

  it("check password mit bcrypt", () => {
    const mockCompare = bcrypt.compareSync as jest.Mock;
    mockCompare.mockReturnValue(true);
    const user = new User("1", "a@b.de", "hashed");
    expect(user.checkPassword("secret")).toBe(true);
  });

  it("create neuen user mit hashed password und uuid", async () => {
    const user = await User.create("new@example.com", "123456");
    expect(user).toBeInstanceOf(User);
    expect(user.email).toBe("new@example.com");
    expect(user.getPublicProfile().role).toBe("user");
    expect(user.getPublicProfile().id).toBeDefined();
  });

  it("returns persistence object", () => {
    const user = new User("1", "a@b.de", "hashed", "admin");
    expect(user.toPersistence()).toEqual({
      id: "1",
      email: "a@b.de",
      passwordHash: "hashed",
      role: "admin",
    });
  });
});
