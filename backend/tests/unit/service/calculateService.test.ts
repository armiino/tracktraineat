import {
  calculateCalories,
  CalorieInput,
} from "../../../service/calculateService";

describe("calculateCalories", () => {
  it("male mit medium activity und nogoalchange", () => {
    const input: CalorieInput = {
      weight: 80,
      height: 180,
      age: 30,
      gender: "male",
      activity: "medium",
      goal: "noChange",
    };
    const result = calculateCalories(input);
    expect(result).toBe(Math.round((10 * 80 + 6.25 * 180 - 5 * 30 + 5) * 1.65));
  });

  it("female mit low activity und loseWeight goal", () => {
    const input: CalorieInput = {
      weight: 65,
      height: 165,
      age: 25,
      gender: "female",
      activity: "low",
      goal: "loseWeight",
    };
    const bmr = 10 * 65 + 6.25 * 165 - 5 * 25 - 161;
    const total = bmr * 1.2 * 0.85;
    expect(calculateCalories(input)).toBe(Math.round(total));
  });

  it("mit extra kcal", () => {
    const input: CalorieInput = {
      weight: 75,
      height: 175,
      age: 40,
      gender: "male",
      activity: "high",
      goal: "gainMuscle",
      burned: 500,
    };
    const bmr = 10 * 75 + 6.25 * 175 - 5 * 40 + 5;
    const total = (bmr * 1.9 + 500) * 1.1;
    expect(calculateCalories(input)).toBe(Math.round(total));
  });

  it("burned = 0", () => {
    const input: CalorieInput = {
      weight: 60,
      height: 170,
      age: 22,
      gender: "female",
      activity: "superhigh",
      goal: "noChange",
    };
    const bmr = 10 * 60 + 6.25 * 170 - 5 * 22 - 161;
    const total = bmr * 2.2;
    expect(calculateCalories(input)).toBe(Math.round(total));
  });
});
