import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { UserProfileDto } from '../dto/UserProfileDto';
import { userProfileService } from '../service/userProfileService';

export class UserProfileController {
  // creatProfile legt ein Profil an 
  async createProfile(req: Request, res: Response): Promise<void> {
    const dto = new UserProfileDto();
    dto.age = req.body.age;
    dto.height = req.body.height;
    dto.weight = req.body.weight;
    dto.gender = req.body.gender;
    dto.activity = req.body.activity;
    dto.goal = req.body.goal;
    dto.burned = req.body.burned;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.map(e => ({
          field: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }

    // id aus dem Request holen (wurde durch middleware gesetzt -> reqzireAuth)
    const userId = (req as any).user?.id;
    console.log("userprofileontroller (req as any).user?.id -> " + userId)

    try {
        const profile = userProfileService.createProfile(userId, dto);
        res.status(201).json(profile);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
  }

  //etwas am bereits existierenden profil ändern durch put request 
  async updateProfile(req: Request, res: Response): Promise<void> {
    const dto = new UserProfileDto();
    dto.age = req.body.age;
    dto.height = req.body.height;
    dto.weight = req.body.weight;
    dto.gender = req.body.gender;
    dto.activity = req.body.activity;
    dto.goal = req.body.goal;
    dto.burned = req.body.burned;
  
    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.map(e => ({
          field: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }
  
    const userId = (req as any).user?.id;
  
    try {
      const updated = userProfileService.updateProfile(userId, dto);
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
  

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    try {
      const profile = userProfileService.getProfile(userId);
      if (!profile) {
        res.status(404).json({ error: 'Kein Profil gefunden' });
        return;
      }
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
