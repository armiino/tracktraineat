import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import HeroCalculator from "@/features/landing/components/HeroCalculator";
import { calculatorService } from "@/features/landing/services/calculatorService";
import { handleApiError } from "@/lib/handleApiError";
import { toast } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

jest.mock("@/features/landing/services/calculatorService", () => ({
  calculatorService: {
    calculate: jest.fn(),
  },
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("HeroCalculator – handleCalculate Logik", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillValidForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/gewicht/i), {
      target: { value: "70" },
    });
    fireEvent.change(screen.getByPlaceholderText(/größe/i), {
      target: { value: "175" },
    });
    fireEvent.change(screen.getByPlaceholderText(/alter/i), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByDisplayValue("Geschlecht wählen"), {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByDisplayValue("Aktivität wählen"), {
      target: { value: "medium" },
    });
    fireEvent.change(screen.getByDisplayValue("Ziel wählen"), {
      target: { value: "gainMuscle" },
    });
    fireEvent.change(screen.getByPlaceholderText(/verbrannte kalorien/i), {
      target: { value: "100" },
    });
  };

  it("ruft den Service mit korrekt geparsten Daten auf", async () => {
    (calculatorService.calculate as jest.Mock).mockResolvedValueOnce({
      data: { totalCalories: 2000 },
    });

    render(
      <BrowserRouter>
        <HeroCalculator />
      </BrowserRouter>
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /berechnen/i }));

    await waitFor(() => {
      expect(calculatorService.calculate).toHaveBeenCalledWith({
        weight: 70,
        height: 175,
        age: 25,
        gender: "male",
        activity: "medium",
        goal: "gainMuscle",
        burned: 100,
      });
    });
  });

  it("zeigt Toast bei Zod-Validation-Fehler", async () => {
    render(
      <BrowserRouter>
        <HeroCalculator />
      </BrowserRouter>
    );

    // kein weight etc. => Schemafehler
    fireEvent.click(screen.getByRole("button", { name: /berechnen/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.any(String));
      expect(calculatorService.calculate).not.toHaveBeenCalled();
    });
  });

  it("ruft handleApiError bei API-Fehlern", async () => {
    (calculatorService.calculate as jest.Mock).mockRejectedValueOnce(
      new Error("API down")
    );

    render(
      <BrowserRouter>
        <HeroCalculator />
      </BrowserRouter>
    );

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /berechnen/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining("Kalorienberechnung")
      );
    });
  });
});
