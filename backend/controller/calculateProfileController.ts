import { Request, Response } from 'express';

export class CalculateProfileController {
  constructor(
    private readonly userProfileService: ReturnType<typeof import('../service/userProfileService').userProfileService>
  ) {}

  async calculateFromProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    const profile = await this.userProfileService.getProfile(userId);

    if (!profile) {
      res.status(404).json({ error: 'no profile found' });
      return;
    }

    const totalCalories = profile.calculateCaloriesProfile();
    //res.status(200).json({ totalCalories });

    const { bmr, tdee } = profile.getCalorieAnalysis();
    res.status(200).json({ bmr, tdee, totalCalories });

  }
}
