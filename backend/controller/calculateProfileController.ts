import { Request, Response } from 'express';
import { userProfileService } from '../service/userProfileService';
import { calculateCalories } from '../service/calculateService';

export class CalculateProfileController {
  async calculateFromProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    const profile = userProfileService.getProfile(userId);

    if (!profile) {
      res.status(404).json({ error: 'no profile found' });
      return;
    }

    const totalCalories = calculateCalories(profile);
    res.status(200).json({ totalCalories });
  }
}
