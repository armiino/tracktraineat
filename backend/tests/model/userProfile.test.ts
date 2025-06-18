// tests/model/userProfile.test.ts
import { UserProfile } from '../../model/UserProfile';

describe('UserProfile komplette testabdeckung', () => {
  const baseProfileData = {
    userId: 'user',
    weight: 70,
    height: 170,
    age: 30,
  };

  const genderCases = ['male', 'female'] as const;
  const activityCases = ['low', 'medium', 'high', 'superhigh'] as const;
  const goalCases = ['gainMuscle', 'loseWeight', 'noChange'] as const;

  describe('calculateCaloriesProfile()', () => {
    genderCases.forEach(gender => {
      activityCases.forEach(activity => {
        goalCases.forEach(goal => {
          it(`berechnet Kalorien – ${gender}, ${activity}, ${goal}`, () => {
            const profile = new UserProfile(
              baseProfileData.userId,
              baseProfileData.weight,
              baseProfileData.height,
              baseProfileData.age,
              gender,
              activity,
              goal
            );
            const kcal = profile.calculateCaloriesProfile();
            expect(typeof kcal).toBe('number');
            expect(kcal).toBeGreaterThan(0);
          });

          it(`berechnet Kalorien mit burned – ${gender}, ${activity}, ${goal}`, () => {
            const profile = new UserProfile(
              baseProfileData.userId,
              baseProfileData.weight,
              baseProfileData.height,
              baseProfileData.age,
              gender,
              activity,
              goal
            );
            const kcalWithBurned = profile.calculateCaloriesProfile(300);
            expect(kcalWithBurned).toBeGreaterThan(profile.calculateCaloriesProfile(0));
          });
        });
      });
    });
  });

  describe('getCalorieAnalysis()', () => {
    it('liefert korrektes bmr und tdee (male)', () => {
      const profile = new UserProfile('u', 70, 170, 30, 'male', 'medium', 'gainMuscle');
      const { bmr, tdee } = profile.getCalorieAnalysis();
      expect(bmr).toBeGreaterThan(0);
      expect(tdee).toBeGreaterThan(0);
    });

    it('liefert korrektes bmr und tdee (female)', () => {
      const profile = new UserProfile('u', 70, 170, 30, 'female', 'high', 'loseWeight');
      const { bmr, tdee } = profile.getCalorieAnalysis(250);
      expect(bmr).toBeGreaterThan(0);
      expect(tdee).toBeGreaterThan(bmr);
    });
  });

  describe('proteinTarget Getter', () => {
    it('liefert korrektes Ziel für gainMuscle', () => {
      const profile = new UserProfile('u', 60, 165, 28, 'male', 'medium', 'gainMuscle');
      expect(profile.proteinTarget).toBe(120);
    });

    it('liefert korrektes Ziel für noChange', () => {
      const profile = new UserProfile('u', 60, 165, 28, 'male', 'medium', 'noChange');
      expect(profile.proteinTarget).toBe(90);
    });

    it('liefert korrektes Ziel für loseWeight', () => {
      const profile = new UserProfile('u', 60, 165, 28, 'male', 'medium', 'loseWeight');
      expect(profile.proteinTarget).toBe(90);
    });
  });

  describe('getProfileData()', () => {
    it('liefert vollständige Profildaten zurück', () => {
      const profile = new UserProfile('uid', 75, 180, 32, 'female', 'high', 'gainMuscle', 'vegan');
      const data = profile.getProfileData();
      expect(data).toEqual({
        userId: 'uid',
        weight: 75,
        height: 180,
        age: 32,
        gender: 'female',
        activity: 'high',
        goal: 'gainMuscle',
        dietType: 'vegan',
      });
    });
  });
});
