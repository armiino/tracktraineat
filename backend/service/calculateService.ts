// typskript -> interface als bauplan für "objekt" 
export interface CalorieInput {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activity: 'low' | 'medium' | 'high' | 'superhigh';
  goal: 'loseWeight' | 'gainMuscle' | 'noChange';
  burned?: number;  //? operator steht für optional, da ich nicht immer kalorien verbrennen werde
}

export const calculateCalories = ({
  weight,
  height,
  age,
  gender,
  activity,
  goal,
  burned = 0, // default falls nichts mitgeliefert wird
}: CalorieInput): number => {
  let bmr: number; //basal metabolic rate (bmr)= Grundumsatz

    /* Grundumsatz (BMR) wird hier durch die Mifflin St. Jeor Formel berrechnet.

    Männer: BMR = (10 x Gewicht in kg) + (6,25 x Größe in cm) - (5 x Alter in Jahren) + 5.
    Frauen: BMR = (10 x Gewicht in kg) + (6,25 x Größe in cm) – (5 x Alter in Jahren) – 161.

  */

  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  //  Aktivitätsfaktor anwenden - PAL-Faktor (Physical Activity Level)
  // eigentlich mehr werte aber hier einfachheitshalber nur low,medium,und high, superhigh (https://www.fitnessfirst.de/magazin/koerper-geist/gesundheit/grundumsatz)
  let activityFactor = 1.2; // default fürs nichtstun
  if (activity === 'medium') {
    activityFactor = 1.65;
  } else if (activity === 'high') {
    activityFactor = 1.9;
  } else if (activity === 'superhigh') {
    activityFactor = 2.2;
  }

  let total = bmr * activityFactor; // Grundumsatz * PAL faktor

  // Verbrannte Kalorien hinzufügen
  total += burned;

  // drei ziele: abnhemen, muskelnaufbauen, oder keine veränderungen
  if (goal === 'loseWeight') {
    total *= 0.85;
  } else if (goal === 'gainMuscle') {
    total *= 1.1;
  }

  return Math.round(total);
};
