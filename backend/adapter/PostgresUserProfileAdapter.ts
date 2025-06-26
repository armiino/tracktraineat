import { UserProfileRepository } from "./port/UserProfileRepository";
import { UserProfile } from "../model/UserProfile";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class PostgresUserProfileAdapter implements UserProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async save(profile: UserProfile): Promise<void> {
    try {
      await this.prisma.userProfile.create({
        data: {
          userId: profile.userId,
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
          gender: profile.gender,
          activity: profile.activity,
          goal: profile.goal,
          dietType: profile.dietType,
        },
      });
    } catch (err) {
      this.handleDbError(err, "Fehler beim Speichern des Profils");
    }
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const result = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      return result
        ? new UserProfile(
            result.userId,
            result.weight,
            result.height,
            result.age,
            result.gender as "male" | "female",
            result.activity as "low" | "medium" | "high" | "superhigh",
            result.goal as "loseWeight" | "gainMuscle" | "noChange",
            result.dietType as "omnivore" | "vegetarian" | "vegan"
          )
        : null;
    } catch (err) {
      this.handleDbError(err, "Fehler beim Laden des Profils");
    }
  }

  async update(profile: UserProfile): Promise<void> {
    try {
      await this.prisma.userProfile.update({
        where: { userId: profile.userId },
        data: {
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
          gender: profile.gender,
          activity: profile.activity,
          goal: profile.goal,
          dietType: profile.dietType,
        },
      });
    } catch (err) {
      this.handleDbError(err, "Fehler beim Aktualisieren des Profils");
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.prisma.userProfile.deleteMany({ where: { userId } });
    } catch (err) {
      this.handleDbError(err, "Fehler beim Löschen des Profils");
    }
  }

  private handleDbError(err: unknown, context = "profile_db_error"): never {
    console.error(`[DB Error] ${context}:`, err);

    const error = new Error(context) as any;

    if (err instanceof Prisma.PrismaClientInitializationError) {
      error.code = "db_not_available";
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error.code = "db_query_error";
    } else {
      error.code = "db_unknown_error";
    }

    throw error;
  }
}
