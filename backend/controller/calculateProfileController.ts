import { Response } from "express";
import { RequestWithUser } from "../globalTypes/RequestWithUser";

export class CalculateProfileController {
  constructor(
    private readonly userProfileService: ReturnType<
      typeof import("../service/userProfileService").userProfileService
    >
  ) {}

  async calculateFromProfile(
    req: RequestWithUser,
    res: Response
  ): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ code: "get_profile_failed" });
      return;
    }

    try {
      const profile = await this.userProfileService.getProfile(userId);

      if (!profile) {
        res.status(404).json({ code: "profile_not_found" });
        return;
      }

      const totalCalories = profile.calculateCaloriesProfile();
      const totalProtein = profile.proteinTarget;
      const { bmr, tdee } = profile.getCalorieAnalysis();

      res.status(200).json({ bmr, tdee, totalCalories, totalProtein });
    } catch (error: any) {
      console.error("Fehler bei calculateFromProfile:", error);
      res.status(500).json({ code: "calculate_profile_failed" });
    }
  }
}
