/**
 * calculatePoints: Berechnet die Punkte für eine Vorhersage basierend auf der Genauigkeit
 * 
 * Punkte-System:
 * - Exakte Übereinstimmung: 5 Punkte
 * - Abweichung von 0.25: 4 Punkte
 * - Abweichung von 0.5: 3 Punkte
 * - Abweichung von 0.75: 2 Punkte
 * - Abweichung von 1.0: 1 Punkt
 * - Abweichung von mehr als 1.0: 0 Punkte
 * 
 * @param prediction - Die vorhergesagte Note (1-6 in 0.25er Schritten)
 * @param actualGrade - Die tatsächliche Note (1-6)
 * @returns Anzahl der Punkte (0-5)
 */
export function calculatePoints(prediction: number, actualGrade: number): number {
  // Berechne die absolute Differenz zwischen Vorhersage und tatsächlicher Note
  const difference = Math.abs(prediction - actualGrade);
  
  // Prüfe die Differenz und gebe entsprechende Punkte zurück
  if (difference === 0) return 5; // Exakt richtig
  if (difference <= 0.25) return 4; // Sehr nah
  if (difference <= 0.5) return 3; // Nah
  if (difference <= 0.75) return 2; // Akzeptabel
  if (difference <= 1.0) return 1; // Weit entfernt
  return 0; // Zu weit entfernt
}

/**
 * getGradeOptions: Generiert alle gültigen Noten-Optionen
 * Erstellt ein Array mit Noten von 1.0 bis 6.0 in 0.25er Schritten
 * (1.0, 1.25, 1.5, 1.75, 2.0, ..., 5.75, 6.0)
 * 
 * @returns Array von Zahlen mit allen möglichen Noten
 */
export function getGradeOptions(): number[] {
  const options: number[] = [];
  // Iteriere von 1.0 bis 6.0 in 0.25er Schritten (1.0, 1.25, 1.5, ..., 5.75, 6.0)
  for (let i = 1; i <= 6; i += 0.25) {
    // Runde auf 2 Dezimalstellen, um Floating-Point-Fehler zu vermeiden
    // JavaScript: 0.1 + 0.2 = 0.30000000000000004 (Ungenauigkeit bei Floats)
    // Lösung: Multipliziere mit 100, runde, dann dividiere durch 100
    // z.B. 1.25 * 100 = 125, Math.round(125) = 125, 125 / 100 = 1.25
    options.push(Math.round(i * 100) / 100);
  }
  return options;
}

/**
 * formatGrade: Formatiert eine Note für die Anzeige
 * Entfernt unnötige Nullen (z.B. "5.00" wird zu "5", "4.50" bleibt "4.5")
 * 
 * @param grade - Die zu formatierende Note
 * @returns Formatierter String (z.B. "5", "4.5", "3.25") oder "-" bei ungültiger Note
 */
export function formatGrade(grade: number): string {
  // Prüfe ob die Note ungültig ist (null, undefined oder NaN)
  if (grade === null || grade === undefined || Number.isNaN(grade)) {
    return '-';
  }
  // toFixed(2): Konvertiert zu String mit genau 2 Dezimalstellen (z.B. 5 → "5.00")
  // replace(/\.00$/, ''): Entfernt ".00" am Ende (z.B. "5.00" → "5")
  //   /\.00$/ = Regex: Punkt + zwei Nullen am Ende ($) des Strings
  // replace(/\.(\d)0$/, '.$1'): Entfernt führende 0 nach Punkt (z.B. "4.50" → "4.5")
  //   /\.(\d)0$/ = Regex: Punkt + eine Ziffer (gespeichert in $1) + 0 am Ende
  //   '.$1' = Ersetze durch Punkt + die gespeicherte Ziffer
  return grade.toFixed(2).replace(/\.00$/, '').replace(/\.(\d)0$/, '.$1');
}

/**
 * calculatePredictionPoints: Berechnet Punkte für eine Vorhersage mit Null-Checks
 * Wrapper-Funktion für calculatePoints, die mit null/undefined Werten umgeht
 * 
 * @param prediction - Die vorhergesagte Note (kann null/undefined sein)
 * @param actualGrade - Die tatsächliche Note (kann null/undefined sein)
 * @returns Anzahl der Punkte oder undefined wenn eine Note fehlt
 */
export function calculatePredictionPoints(
  prediction: number | null | undefined,
  actualGrade: number | null | undefined
): number | undefined {
  // Wenn keine Vorhersage vorhanden ist, gebe undefined zurück
  if (prediction === null || prediction === undefined) {
    return undefined;
  }
  // Wenn keine tatsächliche Note vorhanden ist, gebe undefined zurück
  if (actualGrade === null || actualGrade === undefined || Number.isNaN(actualGrade)) {
    return undefined;
  }
  // Beide Werte vorhanden: Berechne die Punkte
  return calculatePoints(prediction, actualGrade);
}


