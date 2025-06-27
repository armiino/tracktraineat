export type Gender = "male" | "female";
export class UserProfile {
  constructor(
    public userId: string, // connection zum User (also acc) - sollte dann in der DB verbunden werden
    public weight: number,
    public height: number,
    public age: number,
    public gender: Gender,
    public activity: "low" | "medium" | "high" | "superhigh",
    public goal: "loseWeight" | "gainMuscle" | "noChange",
    public dietType: "omnivore" | "vegetarian" | "vegan" = "omnivore"
  ) {}

  // simple getter für alle Daten des Profils
  getProfileData() {
    return {
      userId: this.userId,
      weight: this.weight,
      height: this.height,
      age: this.age,
      gender: this.gender,
      activity: this.activity,
      goal: this.goal,
      dietType: this.dietType,
    };
  }

  //selbe methode wie in calculateService
  calculateCaloriesProfile(burned: number = 0): number {
    let bmr: number;

    if (this.gender === "male") {
      bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
    } else {
      bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
    }

    let activityFactor = 1.2;
    if (this.activity === "medium") activityFactor = 1.65;
    else if (this.activity === "high") activityFactor = 1.9;
    else if (this.activity === "superhigh") activityFactor = 2.2;

    let total = bmr * activityFactor;

    total += burned;

    if (this.goal === "loseWeight") {
      total *= 0.85;
    } else if (this.goal === "gainMuscle") {
      total *= 1.1;
    }

    return Math.round(total);
  }

  get proteinTarget(): number {
    return this.goal === "gainMuscle" ? this.weight * 2 : this.weight * 1.5;
  }

  //zusatz um bmr und tdee sepeart zu liefern -> grundumsatz und gesamt
  getCalorieAnalysis(burned: number = 0): { bmr: number; tdee: number } {
    let bmr: number;

    if (this.gender === "male") {
      bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
    } else {
      bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
    }

    let activityFactor = 1.2;
    if (this.activity === "medium") activityFactor = 1.65;
    else if (this.activity === "high") activityFactor = 1.9;
    else if (this.activity === "superhigh") activityFactor = 2.2;

    let tdee = bmr * activityFactor;
    tdee += burned;

    if (this.goal === "loseWeight") {
      tdee *= 0.85;
    } else if (this.goal === "gainMuscle") {
      tdee *= 1.1;
    }

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    };
  }
}
