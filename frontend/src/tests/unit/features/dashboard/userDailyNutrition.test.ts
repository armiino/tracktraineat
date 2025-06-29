import { renderHook, act } from "@testing-library/react";
import { useDailyNutrition } from "@/features/dashboard/hook/useDailyNutrition";
import { dashboardService } from "@/features/dashboard/services/dashboardService";
import { handleApiError } from "@/lib/handleApiError";

jest.mock("@/features/dashboard/services/dashboardService", () => ({
  dashboardService: {
    getCalorieCalculation: jest.fn(),
  },
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const mockDate = new Date("2025-06-29");
const todayStr = mockDate.toDateString();

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
});

describe("useDailyNutrition", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("lädt Wert aus localStorage, wenn resetDate stimmt", () => {
    localStorage.setItem("remainingCalories", "1234");
    localStorage.setItem("caloriesResetDate", todayStr);

    const { result } = renderHook(() => useDailyNutrition("calories"));

    expect(result.current.value).toBe(1234);
  });

  it("ruft API auf, wenn kein gespeicherter Wert vorhanden", async () => {
    (dashboardService.getCalorieCalculation as jest.Mock).mockResolvedValue({
      totalCalories: 2000,
      totalProtein: 150,
    });

    const { result } = renderHook(() => useDailyNutrition("calories"));

    // await next tick
    await act(async () => {});

    expect(result.current.value).toBe(2000);
    expect(localStorage.getItem("remainingCalories")).toBe("2000");
    expect(localStorage.getItem("dailyCalories")).toBe("2000");
    expect(localStorage.getItem("caloriesResetDate")).toBe(todayStr);
  });

  it("nutzt totalProtein bei type=protein", async () => {
    (dashboardService.getCalorieCalculation as jest.Mock).mockResolvedValue({
      totalCalories: 2000,
      totalProtein: 123,
    });

    const { result } = renderHook(() => useDailyNutrition("protein"));

    await act(async () => {});

    expect(result.current.value).toBe(123);
    expect(localStorage.getItem("remainingProtein")).toBe("123");
  });

  it("behandelt Fehler bei initialem Fetch", async () => {
    const error = new Error("Fail");
    (dashboardService.getCalorieCalculation as jest.Mock).mockRejectedValue(
      error
    );

    renderHook(() => useDailyNutrition("calories"));

    await act(async () => {});

    expect(handleApiError).toHaveBeenCalledWith(
      error,
      "Fehler beim Laden von calories."
    );
  });

  it("führt reset korrekt aus", async () => {
    (dashboardService.getCalorieCalculation as jest.Mock).mockResolvedValue({
      totalCalories: 1800,
      totalProtein: 100,
    });

    const { result } = renderHook(() => useDailyNutrition("calories"));

    await act(async () => {});

    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.value).toBe(1800);
    expect(localStorage.getItem("remainingCalories")).toBe("1800");
    expect(localStorage.getItem("caloriesResetDate")).toBe(todayStr);
  });

  it("behandelt Fehler beim reset", async () => {
    const error = new Error("Reset kaputt");
    (dashboardService.getCalorieCalculation as jest.Mock).mockRejectedValue(
      error
    );

    const { result } = renderHook(() => useDailyNutrition("protein"));

    await act(async () => {
      await result.current.reset();
    });

    expect(handleApiError).toHaveBeenCalledWith(
      error,
      "Fehler beim Zurücksetzen von protein."
    );
  });
});
