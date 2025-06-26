export function validateDistribution(distribution: number[]): string | null {
  if (distribution.length < 2 || distribution.length > 4) {
    return "Es müssen zwischen 2 und 4 Mahlzeiten gewählt werden.";
  }

  const sum = distribution.reduce((acc, val) => acc + val, 0);
  if (sum !== 100) {
    return "Die Summe der Prozentwerte muss genau 100% ergeben.";
  }

  if (distribution.some((val) => val <= 0)) {
    return "Keine Verteilung darf 0% oder negativ sein.";
  }

  if (distribution.some((val) => val > 70)) {
    return "Einzelne Mahlzeiten dürfen nicht mehr als 70% enthalten.";
  }

  return null;
}
