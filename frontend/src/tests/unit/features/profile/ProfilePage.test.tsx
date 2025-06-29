import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "@/features/profile/pages/ProfilePage";
import { useProfile } from "@/features/profile/context/ProfileContext";
import {
  updateProfile,
  createProfile,
} from "@/features/profile/services/profileService";
import { useDailyNutrition } from "@/features/dashboard/hook/useDailyNutrition";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/lib/handleApiError";
import { BrowserRouter } from "react-router-dom";

jest.mock("@/features/profile/context/ProfileContext", () => ({
  useProfile: jest.fn(),
}));

jest.mock("@/features/profile/services/profileService", () => ({
  updateProfile: jest.fn(),
  createProfile: jest.fn(),
}));

jest.mock("@/features/dashboard/hook/useDailyNutrition", () => ({
  useDailyNutrition: (type: string) => ({
    reset: jest.fn(),
  }),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const setup = () => {
  render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );
};

describe("Profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zeigt Ladezustand, wenn `isLoading` true ist", () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: true,
      profile: null,
      setProfile: jest.fn(),
    });

    setup();

    expect(screen.getByText(/lade profil/i)).toBeInTheDocument();
  });

  it("füllt Formular mit bestehenden Daten und sendet Update", async () => {
    const mockSetProfile = jest.fn();

    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: {
        age: 30,
        height: 180,
        weight: 75,
        gender: "male",
        activity: "medium",
        goal: "gainMuscle",
        dietType: "omnivore",
      },
      setProfile: mockSetProfile,
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/alter/i), {
      target: { value: "31" },
    });

    fireEvent.click(screen.getByRole("button", { name: /aktualisieren/i }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ age: 31 })
      );
      expect(mockSetProfile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("legt neues Profil an, wenn kein bestehendes vorhanden", async () => {
    const mockSetProfile = jest.fn();

    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: null,
      setProfile: mockSetProfile,
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText(/alter/i), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByPlaceholderText(/größe/i), {
      target: { value: "170" },
    });
    fireEvent.change(screen.getByPlaceholderText(/gewicht/i), {
      target: { value: "65" },
    });

    fireEvent.change(screen.getByDisplayValue("Geschlecht wählen"), {
      target: { value: "female" },
    });

    fireEvent.change(screen.getByDisplayValue("Aktivitätslevel"), {
      target: { value: "low" },
    });

    fireEvent.change(screen.getByDisplayValue("Ziel"), {
      target: { value: "loseWeight" },
    });

    fireEvent.change(screen.getByDisplayValue("Ernährungsform"), {
      target: { value: "vegetarian" },
    });

    fireEvent.click(screen.getByRole("button", { name: /profil speichern/i }));

    await waitFor(() => {
      expect(createProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 25,
          height: 170,
          weight: 65,
          gender: "female",
          activity: "low",
          goal: "loseWeight",
          dietType: "vegetarian",
        })
      );
      expect(mockSetProfile).toHaveBeenCalled();
    });
  });

  it("zeigt Zod-Fehler bei ungültigen Eingaben", async () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: null,
      setProfile: jest.fn(),
    });

    setup();

    fireEvent.click(screen.getByRole("button", { name: /profil speichern/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/age/i));
    });
  });

  it("zeigt handleApiError bei Serverfehler", async () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
    };

    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: null,
      setProfile: jest.fn(),
    });

    (createProfile as jest.Mock).mockRejectedValueOnce(error);

    setup();

    fireEvent.change(screen.getByPlaceholderText(/alter/i), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByPlaceholderText(/größe/i), {
      target: { value: "170" },
    });
    fireEvent.change(screen.getByPlaceholderText(/gewicht/i), {
      target: { value: "70" },
    });
    fireEvent.change(screen.getByDisplayValue("Geschlecht wählen"), {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByDisplayValue("Aktivitätslevel"), {
      target: { value: "medium" },
    });
    fireEvent.change(screen.getByDisplayValue("Ziel"), {
      target: { value: "gainMuscle" },
    });
    fireEvent.change(screen.getByDisplayValue("Ernährungsform"), {
      target: { value: "omnivore" },
    });

    fireEvent.click(screen.getByRole("button", { name: /profil speichern/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("Fehler beim Speichern")
      );
    });
  });
});
