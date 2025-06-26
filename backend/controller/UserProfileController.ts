import { Request, Response } from "express";
import { validate } from "class-validator";
import { UserProfileDto } from "../dto/UserProfileDto";
import { userProfileService } from "../service/userProfileService";

export class UserProfileController {
  constructor(
    private readonly service: ReturnType<typeof userProfileService>
  ) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    try {
      const profile = await this.service.getProfile(userId);
      if (!profile) {
        res.status(404).json({ code: "profile_not_found" });
        return;
      }
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ code: "get_profile_failed" });
    }
  }

  async createProfile(req: Request, res: Response): Promise<void> {
    const dto = new UserProfileDto();
    Object.assign(dto, req.body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({
        code: "validation_failed",
        details: errors.map((e) => ({
          field: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }

    const userId = (req as any).user?.id;

    try {
      const profile = await this.service.createProfile(userId, dto);
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(500).json({ code: "create_profile_failed" });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const dto = new UserProfileDto();
    Object.assign(dto, req.body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({
        code: "validation_failed",
        details: errors.map((e) => ({
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
      console.error("Update error:", err);

      if (err.message === "Profil nicht gefunden") {
        res.status(404).json({ code: "profile_not_found" });
      } else {
        res.status(500).json({ code: "update_profile_failed" });
      }
    }
  }
}
