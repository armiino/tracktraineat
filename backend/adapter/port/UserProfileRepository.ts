import { UserProfile } from '../../model/UserProfile';

export interface UserProfileRepository {
  save(profile: UserProfile): Promise<void>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  update(profile: UserProfile): Promise<void>;
}
