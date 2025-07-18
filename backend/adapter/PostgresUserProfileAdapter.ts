import { UserProfileRepository } from "./port/UserProfileRepository";
import { UserProfile } from "../model/UserProfile";
import { PrismaClient } from "@prisma/client";

export class PostgresUserProfileAdapter implements UserProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(profile: UserProfile): Promise<void> {
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
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
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
  }

  async update(profile: UserProfile): Promise<void> {
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
  }
}
