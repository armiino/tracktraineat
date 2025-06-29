import api, { registerSessionHandler } from "@/lib/api";
import MockAdapter from "axios-mock-adapter";
import { toast } from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  toast: { error: jest.fn() },
}));

describe("Axios Interceptor", () => {
  let mock: MockAdapter;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    mock = new MockAdapter(api);
    console.warn = jest.fn();
    console.log = jest.fn();
    (toast.error as jest.Mock).mockClear();
  });

  afterEach(() => {
    mock.restore();
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  it("zeigt Toast bei Serverfehler (500)", async () => {
    mock.onGet("/test").reply(500);

    await expect(api.get("/test")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      "Interner Serverfehler. Bitte versuche es später erneut."
    );
  });

  it("triggert Logout-Handler bei Status 401", async () => {
    const logoutMock = jest.fn();
    registerSessionHandler(logoutMock);

    mock.onGet("/test").reply(401);
    await expect(api.get("/test")).rejects.toThrow();
    expect(logoutMock).toHaveBeenCalledWith("unauthorized");
  });

  it("triggert Logout-Handler bei Status 403", async () => {
    const logoutMock = jest.fn();
    registerSessionHandler(logoutMock);

    mock.onGet("/test").reply(403);
    await expect(api.get("/test")).rejects.toThrow();
    expect(logoutMock).toHaveBeenCalledWith("expired");
  });

  it("zeigt Warnung bei Netzwerkfehler", async () => {
    mock.onGet("/test").networkError();

    await expect(api.get("/test")).rejects.toThrow("Server nicht erreichbar.");
    expect(console.warn).toHaveBeenCalledWith("Server nicht erreichbar.");
  });
});
