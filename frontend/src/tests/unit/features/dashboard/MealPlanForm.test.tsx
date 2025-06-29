import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MealPlanForm from "@/features/dashboard/components/MealPlanForm"; // Passe ggf. den Importpfad an
import "@testing-library/jest-dom";

describe("MealPlanForm", () => {
  const mockOnGenerate = jest.fn();

  const setup = () => {
    render(<MealPlanForm onGenerate={mockOnGenerate} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zeigt Standardwerte für 3 Mahlzeiten (40/30/30)", () => {
    setup();

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs).toHaveLength(3);
    expect(inputs[0]).toHaveValue(40);
    expect(inputs[1]).toHaveValue(30);
    expect(inputs[2]).toHaveValue(30);
  });

  it("ändert Verteilung bei Auswahl von 2 Mahlzeiten", () => {
    setup();

    fireEvent.change(screen.getByLabelText(/anzahl mahlzeiten/i), {
      target: { value: "2" },
    });

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue(50);
    expect(inputs[1]).toHaveValue(50);
  });

  it("zeigt Fehler wenn Verteilung ≠ 100%", async () => {
    setup();

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "10" } });

    fireEvent.click(
      screen.getByRole("button", { name: /rezepte generieren/i })
    );

    await screen.findByText(/100% ergeben/i);

    expect(mockOnGenerate).not.toHaveBeenCalled();
  });

  it("ruft onGenerate auf bei gültiger Verteilung", () => {
    setup();

    const inputs = screen.getAllByRole("spinbutton");

    fireEvent.change(inputs[0], { target: { value: "50" } });
    fireEvent.change(inputs[1], { target: { value: "30" } });
    fireEvent.change(inputs[2], { target: { value: "20" } });

    fireEvent.click(
      screen.getByRole("button", { name: /rezepte generieren/i })
    );

    expect(mockOnGenerate).toHaveBeenCalledWith({
      mealsPerDay: 3,
      mealDistribution: [50, 30, 20],
    });
  });

  it("beschränkt Einzelwerte auf maximal 70%", () => {
    setup();

    const input = screen.getAllByRole("spinbutton")[0];

    fireEvent.change(input, { target: { value: "90" } });

    expect(input).toHaveValue(70);
  });
});
