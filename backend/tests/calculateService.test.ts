import { calculateCalories } from '../service/calculateService';
import { CalorieInput } from '../service/calculateService'; 

describe('calculateCalories()', () => {
  it('erster Test für männlich, medium aktiv und ziel gainMuscle', () => {
    const input: CalorieInput = {
      weight: 75,
      height: 180,
      age: 25,
      gender: 'male',
      activity: 'medium',
      goal: 'gainMuscle',
      burned: 200
    };

    const result = calculateCalories(input);

    expect(result).toBeGreaterThan(2500);
    expect(typeof result).toBe('number');
  });

  it('keine verbrannten kalorien', () => {
    const input: CalorieInput = {
      weight: 70,
      height: 175,
      age: 30,
      gender: 'female',
      activity: 'low',
      goal: 'noChange',
      burned: 0
    };

    const result = calculateCalories(input);

    expect(result).toBeGreaterThan(1000);
    expect(typeof result).toBe('number');
  });

  it('loseweight sollte kleiner sein als noChange', () => {
    const normal = calculateCalories({
      weight: 80,
      height: 185,
      age: 28,
      gender: 'male',
      activity: 'medium',
      goal: 'noChange',
      burned: 0
    });

    const cut = calculateCalories({
      weight: 80,
      height: 185,
      age: 28,
      gender: 'male',
      activity: 'medium',
      goal: 'loseWeight',
      burned: 0
    });

    expect(cut).toBeLessThan(normal);
  });

  it('kalorien mit acktivity superhigh', () => {
    const result = calculateCalories({
      weight: 80,
      height: 180,
      age: 25,
      gender: 'male',
      activity: 'superhigh',
      goal: 'noChange',
      burned: 0
    });

    expect(result).toBeGreaterThan(2000);
  });

  it('testet explizit Aktivität "high"', () => {
    const result = calculateCalories({
      weight: 70,
      height: 175,
      age: 25,
      gender: 'male',
      activity: 'high',
      goal: 'noChange',
      burned: 0
    });

    expect(result).toBeGreaterThan(0);
  });

  it('noChange Kalorien', () => {
    const result = calculateCalories({
      weight: 70,
      height: 175,
      age: 25,
      gender: 'female',
      activity: 'low',
      goal: 'noChange',
      burned: 0
    });

    expect(result).toBeGreaterThan(1000);
  });
});
