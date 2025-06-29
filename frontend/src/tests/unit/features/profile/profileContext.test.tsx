import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import {
  ProfileProvider,
  useProfile,
} from "@/features/profile/context/ProfileContext";
import { fetchProfile as fetchProfileAPI } from "@/features/profile/services/profileService";
import { handleApiError } from "@/lib/handleApiError";

jest.mock("@/features/profile/services/profileService", () => ({
  fetchProfile: jest.fn(),
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const mockLogout = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    logout: mockLogout,
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const TestComponent = () => {
  const { profile, isLoading } = useProfile();
  return (
    <div data-testid="test-profile">
      {isLoading
        ? "Lade..."
        : `Alter: ${profile?.age}, Gewicht: ${profile?.weight}, Ziel: ${profile?.goal}`}
    </div>
  );
};

describe("ProfileProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lädt Profil korrekt", async () => {
    (fetchProfileAPI as jest.Mock).mockResolvedValueOnce({
      data: {
        age: 30,
        height: 180,
        weight: 75,
        gender: "male",
        activity: "medium",
        goal: "gainMuscle",
        dietType: "omnivore",
      },
    });

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    expect(screen.getByTestId("test-profile")).toHaveTextContent("Lade...");

    await waitFor(() => {
      expect(fetchProfileAPI).toHaveBeenCalled();
      expect(screen.getByTestId("test-profile")).toHaveTextContent(/Alter: 30/);
      expect(screen.getByTestId("test-profile")).toHaveTextContent(
        /Gewicht: 75/
      );
      expect(screen.getByTestId("test-profile")).toHaveTextContent(
        /Ziel: gainMuscle/
      );
    });
  });

  it("loggt aus bei 401 Fehler", async () => {
    (fetchProfileAPI as jest.Mock).mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        replace: true,
        state: { error: "unauthorized" },
      });
    });
  });

  it("behandelt andere Fehler korrekt", async () => {
    const error = new Error("Kaputt");
    (fetchProfileAPI as jest.Mock).mockRejectedValueOnce(error);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        error,
        expect.stringContaining("Profil")
      );
    });
  });
});
