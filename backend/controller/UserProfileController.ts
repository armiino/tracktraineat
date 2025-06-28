import { Response } from "express";
import { validate } from "class-validator";
import { UserProfileDto } from "../dto/UserProfileDto";
import { userProfileService } from "../service/userProfileService";
import { RequestWithUser } from "../globalTypes/RequestWithUser";

export class UserProfileController {
  constructor(
    private readonly service: ReturnType<typeof userProfileService>
  ) {}

  async getProfile(req: RequestWithUser, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ code: "no_token" });
      return;
    }

    try {
      const profile = await this.service.getProfile(userId);

      if (!profile) {
        res.status(404).json({ code: "profile_not_found" });
        return;
      }

      res.status(200).json(profile);
    } catch (error: any) {
      console.error("Fehler beim Abrufen des Profils:", error);
      res.status(500).json({ code: "get_profile_failed" });
    }
  }

  async createProfile(req: RequestWithUser, res: Response): Promise<void> {
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

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ code: "no_token" });
      return;
    }

    try {
      const profile = await this.service.createProfile(userId, dto);
      res.status(201).json(profile);
    } catch (err: any) {
      console.error("Fehler beim Erstellen des Profils:", err);

      if (err.code === "profile_already_existing") {
        res.status(409).json({ code: "profile_already_existing" });
      } else {
        res.status(500).json({ code: "create_profile_failed" });
      }
    }
  }

  async updateProfile(req: RequestWithUser, res: Response): Promise<void> {
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

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ code: "no_token" });
      return;
    }

    try {
      const updated = await this.service.updateProfile(userId, dto);
      res.status(200).json(updated);
    } catch (err: any) {
      console.error("Fehler beim Aktualisieren des Profils:", err);

      if (err.name === "NotFoundError") {
        res.status(404).json({ code: "profile_not_found" });
      } else {
        res.status(500).json({ code: "update_profile_failed" });
      }
    }
  }
}
