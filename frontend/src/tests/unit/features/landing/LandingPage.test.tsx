import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LandingPage from "@/features/landing/pages/LandingPage";
import React from "react";

jest.mock("@/features/landing/components/HeroScreen", () => (props: any) => (
  <div>
    <p>Hero Screen</p>
    <button onClick={props.onStart}>Start</button>
  </div>
));

jest.mock("@/features/landing/components/HeroCalculator", () => () => (
  <div>Hero Calculator</div>
));

describe("LandingPage", () => {
  it("zeigt initial den HeroScreen", () => {
    render(<LandingPage />);
    expect(screen.getByText("Hero Screen")).toBeInTheDocument();
    expect(screen.queryByText("Hero Calculator")).not.toBeInTheDocument();
  });

  it("wechselt zu HeroCalculator nach Klick auf Start", async () => {
    render(<LandingPage />);

    fireEvent.click(screen.getByText("Start"));

    await waitFor(() => {
      expect(screen.getByText("Hero Calculator")).toBeInTheDocument();
    });

    expect(screen.queryByText("Hero Screen")).not.toBeInTheDocument();
  });
});
