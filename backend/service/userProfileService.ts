import { UserProfileRepository } from "../adapter/port/UserProfileRepository";
import { UserProfileDto } from "../dto/UserProfileDto";
import { UserProfile } from "../model/UserProfile";
import { Prisma } from "@prisma/client";

export const userProfileService = (repo: UserProfileRepository) => ({
  async createProfile(
    userId: string,
    dto: UserProfileDto
  ): Promise<UserProfile> {
    const profile = new UserProfile(
      userId,
      dto.weight,
      dto.height,
      dto.age,
      dto.gender,
      dto.activity,
      dto.goal,
      dto.dietType
    );

    try {
      await repo.save(profile);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          const conflict = new Error("Profil bereits vorhanden");
          (conflict as any).code = "profile_already_existing";
          throw conflict;
        }
      }

      const unknown = new Error("Fehler beim Erstellen des Profils");
      (unknown as any).code = "create_profile_failed";
      throw unknown;
    }

    return profile;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      return await repo.findByUserId(userId);
    } catch (err: any) {
      console.error("DbgInfo: Fehler beim Laden des Profils",err);
      const error = new Error("Fehler beim Laden des Profils");
      (error as any).code = "get_profile_failed";
      throw error;
    }
  },

  async updateProfile(
    userId: string,
    dto: UserProfileDto
  ): Promise<UserProfile> {
    const updated = new UserProfile(
      userId,
      dto.weight,
      dto.height,
      dto.age,
      dto.gender,
      dto.activity,
      dto.goal,
      dto.dietType
    );

    try {
      await repo.update(updated);
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        const notFound = new Error("Profil nicht gefunden");
        notFound.name = "NotFoundError";
        notFound.message = "Profil nicht gefunden";
        throw notFound;
      }

      const error = new Error("Fehler beim Aktualisieren des Profils");
      (error as any).code = "update_profile_failed";
      throw error;
    }

    return updated;
  },
});
