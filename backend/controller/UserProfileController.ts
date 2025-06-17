import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { UserProfileDto } from '../dto/UserProfileDto';
import { userProfileService } from '../service/userProfileService';

export class UserProfileController {
  constructor(private readonly service: ReturnType<typeof userProfileService>) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    try {
      const profile = await this.service.getProfile(userId);
      if (!profile) {
        res.status(404).json({ error: 'Kein Profil gefunden' });
        return;
      }
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createProfile(req: Request, res: Response): Promise<void> {
    const dto = new UserProfileDto();
    Object.assign(dto, req.body); // führt felder automatisch zsm.. man muss nicht mamuell zuweisen

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

    try {
      const profile = await this.service.createProfile(userId, dto);
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const dto = new UserProfileDto();
    Object.assign(dto, req.body);

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
      const updated = await this.service.updateProfile(userId, dto);
      res.status(200).json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
}
