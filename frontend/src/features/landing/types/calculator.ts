export interface CalculatePayload {
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activity: "low" | "medium" | "high" | "superhigh";
  goal: "noChange" | "gainMuscle" | "loseWeight";
  burned?: number;
}
