// Import der Type-Definitionen
import { Exam, ExamStatus, Prediction } from '@/types';

/**
 * getExamStatus: Berechnet den aktuellen Status einer Prüfung
 * 
 * Der Status wird basierend auf dem Prüfungsdatum und dem aktuellen Datum berechnet:
 * - "open": Vor oder am Tag der Prüfung (Schüler können noch Tipps abgeben)
 * - "evaluation": 1-4 Tage nach der Prüfung (Prüfung wird ausgewertet, Schüler können noch Tipps abgeben)
 * - "closed": 5+ Tage nach der Prüfung oder manuell geschlossen (keine Tipps mehr möglich)
 * 
 * @param exam - Die Prüfung, deren Status berechnet werden soll
 * @returns ExamStatus - Der aktuelle Status der Prüfung
 */
export function getExamStatus(exam: Exam): ExamStatus {
  // Erstelle aktuelles Datum und setze Zeit auf Mitternacht (00:00:00)
  // Dadurch wird nur das Datum verglichen, nicht die Uhrzeit
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Erstelle Prüfungsdatum und setze Zeit auf Mitternacht
  const examDate = new Date(exam.date);
  examDate.setHours(0, 0, 0, 0);
  
  // Wenn die Prüfung manuell geschlossen wurde, ist sie immer "closed"
  if (exam.isClosed) {
    return 'closed';
  }

  // Berechne die Anzahl der Tage seit der Prüfung
  // getTime() gibt Millisekunden seit 1970 (Unix-Epoch) zurück
  // Differenz in Millisekunden / (1000ms * 60s * 60min * 24h) = Tage
  // Math.floor() rundet ab (z.B. 1.9 Tage → 1 Tag)
  const daysSinceExam = Math.floor((now.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 1-4 Tage nach Prüfung: Status "evaluation"
  // Die Prüfung wird ausgewertet, aber Schüler können noch Tipps abgeben
  if (daysSinceExam >= 1 && daysSinceExam < 5) {
    return 'evaluation';
  }
  
  // 5+ Tage nach Prüfung: Status "closed"
  // Die Prüfung ist automatisch abgeschlossen
  if (daysSinceExam >= 5) {
    return 'closed';
  }
  
  // Vor oder am Tag der Prüfung: Status "open"
  // Schüler können noch Tipps abgeben
  return 'open';
}

/**
 * canSubmitTips: Prüft ob für eine Prüfung noch Tipps abgegeben werden können
 * 
 * Tipps können abgegeben werden, wenn die Prüfung "open" oder "evaluation" ist.
 * Bei "closed" können keine Tipps mehr abgegeben werden.
 * 
 * @param exam - Die zu prüfende Prüfung
 * @returns true wenn Tipps abgegeben werden können, sonst false
 */
export function canSubmitTips(exam: Exam): boolean {
  const status = getExamStatus(exam);
  // Tipps sind möglich bei "open" oder "evaluation"
  return status === 'open' || status === 'evaluation';
}

/**
 * hasNoTips: Prüft ob ein Schüler noch keine Tipps für eine Prüfung abgegeben hat
 * 
 * @param examId - ID der Prüfung
 * @param studentId - ID des Schülers
 * @param predictions - Array aller Vorhersagen
 * @returns true wenn der Schüler noch keine Tipps hat, sonst false
 */
export function hasNoTips(examId: string, studentId: string, predictions: Prediction[]): boolean {
  // Suche nach einer Vorhersage für diese Prüfung und diesen Schüler
  const prediction = predictions.find(p => p.examId === examId && p.studentId === studentId);
  // Keine Vorhersage vorhanden ODER beide Vorhersagen sind undefined
  return !prediction || (prediction.prediction1 === undefined && prediction.prediction2 === undefined);
}

/**
 * hasBothTips: Prüft ob ein Schüler beide Tipps für eine Prüfung abgegeben hat
 * 
 * @param examId - ID der Prüfung
 * @param studentId - ID des Schülers
 * @param predictions - Array aller Vorhersagen
 * @returns true wenn beide Tipps vorhanden sind, sonst false
 */
export function hasBothTips(examId: string, studentId: string, predictions: Prediction[]): boolean {
  // Suche nach einer Vorhersage für diese Prüfung und diesen Schüler
  const prediction = predictions.find(p => p.examId === examId && p.studentId === studentId);
  // Vorhersage existiert UND beide Vorhersagen sind definiert
  return prediction !== undefined && 
         prediction.prediction1 !== undefined && 
         prediction.prediction2 !== undefined;
}

/**
 * sortExamsByStatus: Sortiert Prüfungen basierend auf ihrem Status
 * 
 * Sortierlogik:
 * - Für "open" oder "evaluation": Aufsteigend nach Datum (nächste Prüfung zuerst)
 *   → Schüler sehen die nächste Prüfung zuerst
 * - Für "closed": Absteigend nach Datum (neueste Prüfung zuerst)
 *   → Schüler sehen die neuesten Ergebnisse zuerst
 * 
 * @param exams - Array von Prüfungen, die sortiert werden sollen
 * @param status - Der Status, nach dem sortiert werden soll
 * @returns Sortiertes Array von Prüfungen
 */
export function sortExamsByStatus(exams: Exam[], status: ExamStatus): Exam[] {
  // Erstelle eine Kopie des Arrays (Spread-Operator), um das Original nicht zu verändern
  const sorted = [...exams];
  
  if (status === 'open' || status === 'evaluation') {
    // Für offene Prüfungen: Sortiere aufsteigend (nächste zuerst)
    // getTime() konvertiert Datum zu Millisekunden für Vergleich
    // a - b: wenn a < b → negative Zahl → a kommt vor b (aufsteigend)
    return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else {
    // Für abgeschlossene Prüfungen: Sortiere absteigend (neueste zuerst)
    // b - a: wenn b > a → positive Zahl → b kommt vor a (absteigend)
    return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

