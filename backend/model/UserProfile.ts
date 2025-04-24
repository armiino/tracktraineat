export class UserProfile {
    constructor(
      public userId: string, // connection zum User (also acc) - sollte dann in der DB verbunden werden
      public weight: number,
      public height: number,
      public age: number,
      public gender: 'male' | 'female',
      public activity: 'low' | 'medium' | 'high' | 'superhigh',
      public goal: 'loseWeight' | 'gainMuscle' | 'noChange',
      public burned?: number 
    ) {}
  
    // simple getter für alle Daten des Profils
    getProfileData() {
      return {
        userId: this.userId,
        weight: this.weight,
        height: this.height,
        age: this.age,
        gender: this.gender,
        activity: this.activity,
        goal: this.goal,
        burned: this.burned ?? 0,
      };
    }
  }
  