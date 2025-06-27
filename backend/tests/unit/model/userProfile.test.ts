import { UserProfile } from "../../../model/UserProfile";

describe("UserProfile model", () => {
  const baseData = {
    userId: "user123",
    weight: 70,
    height: 175,
    age: 30,
    gender: "male" as const,
    activity: "medium" as const,
    goal: "noChange" as const,
    dietType: "vegan" as const,
  };

  it("returns profile data korrekt", () => {
    const profile = new UserProfile(
      baseData.userId,
      baseData.weight,
      baseData.height,
      baseData.age,
      baseData.gender,
      baseData.activity,
      baseData.goal,
      baseData.dietType
    );

    expect(profile.getProfileData()).toEqual({
      userId: baseData.userId,
      weight: baseData.weight,
      height: baseData.height,
      age: baseData.age,
      gender: baseData.gender,
      activity: baseData.activity,
      goal: baseData.goal,
      dietType: baseData.dietType,
    });
  });

  it("kcal ohne burned", () => {
    const profile = new UserProfile(
      "id",
      80,
      180,
      25,
      "male",
      "high",
      "gainMuscle",
      "omnivore"
    );
    const cal = profile.calculateCaloriesProfile();
    expect(cal).toBeGreaterThan(0);
    expect(cal).toBe(3772); // Erwarteter Wert bei diesen Parametern
  });

  it("kcal mit superhigh activity und male gender", () => {
    const profile = new UserProfile(
      "id",
      70,
      170,
      30,
      "male",
      "superhigh",
      "noChange",
      "vegan"
    );
    const cal = profile.calculateCaloriesProfile();
    expect(cal).toBeGreaterThan(0);
    const expectedBMR = 10 * 70 + 6.25 * 170 - 5 * 30 + 5; // 1612.5
    const expectedTDEE = Math.round(expectedBMR * 2.2);
    expect(cal).toBe(expectedTDEE);
  });

  it(" kcal mit medium activity", () => {
    const profile = new UserProfile(
      "id",
      75,
      175,
      28,
      "male",
      "medium",
      "noChange",
      "vegan"
    );
    const cal = profile.calculateCaloriesProfile();
    const expectedBMR = 10 * 75 + 6.25 * 175 - 5 * 28 + 5;
    const expectedTDEE = Math.round(expectedBMR * 1.65);
    expect(cal).toBe(expectedTDEE);
  });

  it("kcal mit high activity", () => {
    const profile = new UserProfile(
      "id",
      75,
      175,
      28,
      "male",
      "high",
      "noChange",
      "vegan"
    );
    const cal = profile.calculateCaloriesProfile();
    const expectedBMR = 10 * 75 + 6.25 * 175 - 5 * 28 + 5;
    const expectedTDEE = Math.round(expectedBMR * 1.9);
    expect(cal).toBe(expectedTDEE);
  });

  it("kcal mit burned value", () => {
    const profile = new UserProfile(
      "id",
      60,
      165,
      28,
      "female",
      "medium",
      "loseWeight",
      "vegetarian"
    );
    const cal = profile.calculateCaloriesProfile(300);
    expect(cal).toBeGreaterThan(0);
  });

  it("proteine korrekt berrechnet", () => {
    const profileGain = new UserProfile(
      "id",
      80,
      180,
      25,
      "male",
      "low",
      "gainMuscle",
      "omnivore"
    );
    const profileLose = new UserProfile(
      "id",
      80,
      180,
      25,
      "male",
      "low",
      "loseWeight",
      "omnivore"
    );
    const profileNoChange = new UserProfile(
      "id",
      80,
      180,
      25,
      "male",
      "low",
      "noChange",
      "omnivore"
    );
    expect(profileGain.proteinTarget).toBe(160);
    expect(profileLose.proteinTarget).toBe(120);
    expect(profileNoChange.proteinTarget).toBe(120);
  });

  it("kcal analyse", () => {
    const profile = new UserProfile(
      "id",
      70,
      170,
      35,
      "female",
      "superhigh",
      "noChange",
      "vegan"
    );
    const { bmr, tdee } = profile.getCalorieAnalysis(200);
    expect(bmr).toBeGreaterThan(0);
    expect(tdee).toBeGreaterThan(bmr);
  });

  it("returns tdee mit gainMuscle goal", () => {
    const profile = new UserProfile(
      "id",
      70,
      170,
      35,
      "female",
      "superhigh",
      "gainMuscle",
      "vegan"
    );
    const { tdee } = profile.getCalorieAnalysis();
    expect(tdee).toBeGreaterThan(0);
  });

  it("returns tdee mit loseWeight goal", () => {
    const profile = new UserProfile(
      "id",
      70,
      170,
      35,
      "female",
      "superhigh",
      "loseWeight",
      "vegan"
    );
    const { tdee } = profile.getCalorieAnalysis();
    expect(tdee).toBeGreaterThan(0);
  });

  it(" BMR für male mit known values", () => {
    const profile = new UserProfile(
      "id",
      80,
      180,
      25,
      "male",
      "low",
      "noChange",
      "omnivore"
    );
    const { bmr } = profile.getCalorieAnalysis(0);
    expect(bmr).toBe(1805);
  });
  it("setzt den Standardwert für dietType auf 'omnivore' wenn kein Wert übergeben wird", () => {
    const profile = new UserProfile(
      "id",
      80,
      180,
      25,
      "male",
      "low",
      "noChange"
    );
    expect(profile.dietType).toBe("omnivore");
  });
  it("verwendet activityFactor 1.2 bei 'low' activity", () => {
    const profile = new UserProfile(
      "id",
      70,
      170,
      30,
      "male",
      "low",
      "noChange",
      "vegan"
    );
    const expectedBMR = 10 * 70 + 6.25 * 170 - 5 * 30 + 5;
    const expectedTDEE = Math.round(expectedBMR * 1.2);
    const result = profile.calculateCaloriesProfile();
    expect(result).toBe(expectedTDEE);
  });
});
