import { UserProfileRepository } from '../adapter/port/UserProfileRepository';
import { UserProfileDto } from '../dto/UserProfileDto';
import { UserProfile } from '../model/UserProfile';

export const userProfileService = (repo: UserProfileRepository) => ({
  async createProfile(userId: string, dto: UserProfileDto): Promise<UserProfile> {
    const profile = new UserProfile(userId, dto.weight, dto.height, dto.age, dto.gender, dto.activity, dto.goal, dto.dietType);
    await repo.save(profile);
    return profile;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    return repo.findByUserId(userId);
  },

  async updateProfile(userId: string, dto: UserProfileDto): Promise<UserProfile> {
    const updated = new UserProfile(userId, dto.weight, dto.height, dto.age, dto.gender, dto.activity, dto.goal, dto.dietType);
    await repo.update(updated);
    return updated; 
  }
});
