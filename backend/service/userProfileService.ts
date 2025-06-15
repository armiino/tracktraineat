import { UserProfile } from '../model/UserProfile';
import { UserProfileDto } from '../dto/UserProfileDto';

const profiles: UserProfile[] = []; //TODO: array funkton weg -> DB 

export const userProfileService = {
  createProfile(userId: string, dto: UserProfileDto): UserProfile {

    //wenn muskelaufbau gesetzt -> mehr protein pro kg körpergewicht
 //   if (dto.goal === 'gainMuscle') {
 //     dto.proteinPerKg = 2.0;
 //   }

    const profile = new UserProfile(
      userId,
      dto.weight,
      dto.height,
      dto.age,
      dto.gender,
      dto.activity,
      dto.goal,
  //    dto.burned,
  //    dto.proteinPerKg,
   //   dto.dietType
    );

    if (profiles.find(p => p.userId === userId)) {
        throw new Error('Profile already exists');
      }
    profiles.push(profile);
    return profile;
  },

  getProfile(userId: string): UserProfile | undefined { //undefinded falls keins gefundn wird (typescript stresst hier)
    return profiles.find(function(p) { return p.userId === userId});
  },

  updateProfile(userId: string, dto: UserProfileDto): UserProfile {
    const profileIndex = profiles.findIndex(p => p.userId === userId); 
  
    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }
  
    // Update-Profil
    const updated = new UserProfile(
      userId,
      dto.weight,
      dto.height,
      dto.age,
      dto.gender,
      dto.activity,
      dto.goal,
   //   dto.burned,
  //    dto.proteinPerKg,
  //    dto.dietType
    );
  
    profiles[profileIndex] = updated;
    return updated;
  }
  
};
