import * as authService from "@/features/auth/services/authService";
import api from "@/lib/api";

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  },
}));

describe("authService", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("führt Login mit E-Mail und Passwort durch", async () => {
    const credentials = { email: "test@example.com", password: "123456" };
    const mockResponse = { data: { token: "abc123" } };
    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await authService.login(credentials);

    expect(api.post).toHaveBeenCalledWith("/auth/login", credentials);
    expect(result).toEqual(mockResponse);
  });

  it("führt Registrierung eines neuen Benutzers durch", async () => {
    const newUser = { email: "new@example.com", password: "abcdef" };
    const mockResponse = { data: { success: true } };
    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await authService.register(newUser);

    expect(api.post).toHaveBeenCalledWith("/auth/register", newUser);
    expect(result).toEqual(mockResponse);
  });

  it("meldet den Benutzer ab", async () => {
    const mockResponse = { data: { success: true } };
    (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await authService.apiLogout();

    expect(api.post).toHaveBeenCalledWith("/auth/logout");
    expect(result).toEqual(mockResponse);
  });

  it("prüft die Gültigkeit der aktuellen Sitzung", async () => {
    const mockResponse = { data: { valid: true } };
    (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await authService.validate();

    expect(api.get).toHaveBeenCalledWith("/auth/validate");
    expect(result).toEqual(mockResponse);
  });
});
