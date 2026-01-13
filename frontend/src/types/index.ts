/**
 * UserRole: Union Type für die möglichen Benutzerrollen
 * 'student' = Schüler, 'teacher' = Lehrer
 */
export type UserRole = 'student' | 'teacher';

/**
 * User: Interface für einen Benutzer
 * Repräsentiert sowohl Schüler als auch Lehrer
 */
export interface User {
  id: string; // Eindeutige ID des Benutzers
  username: string; // Anzeigename des Benutzers
  email: string; // E-Mail-Adresse (wird auch für Login verwendet)
  password: string; // Passwort (sollte in Produktion gehasht sein)
  role: UserRole; // Rolle des Benutzers (student oder teacher)
}

/**
 * ExamStatus: Union Type für den Status einer Prüfung
 * 'open' = Tipp noch möglich (vor oder am Prüfungstag)
 * 'evaluation' = In Auswertung (1-4 Tage nach Prüfung, Schüler können noch Tipps abgeben)
 * 'closed' = Abgeschlossen (5+ Tage nach Prüfung oder manuell geschlossen)
 */
export type ExamStatus = 'open' | 'evaluation' | 'closed';

/**
 * Exam: Interface für eine Prüfung
 * Enthält alle Informationen über eine Prüfung
 */
export interface Exam {
  id: string; // Eindeutige ID der Prüfung
  title: string; // Titel der Prüfung (z.B. "Proportionalität")
  subject: string; // Fach (z.B. "Mathematik")
  description?: string; // Optionale Beschreibung der Prüfung
  date: string; // ISO date string - Datum der Prüfung
  isClosed: boolean; // Ob die Prüfung abgeschlossen ist (manuell oder automatisch)
  closedAt?: string; // ISO date string - Zeitpunkt, wann die Prüfung geschlossen wurde
  grades?: Record<string, number>; // Mapping von studentId zu Note (wird vom Lehrer eingetragen)
}

/**
 * Prediction: Interface für eine Vorhersage eines Schülers
 * Ein Schüler kann zwei Vorhersagen pro Prüfung abgeben
 */
export interface Prediction {
  examId: string; // ID der Prüfung, für die die Vorhersage gilt
  studentId: string; // ID des Schülers, der die Vorhersage abgegeben hat
  prediction1?: number; // Erste Vorhersage (vor der Prüfung): Note von 1 bis 6 in 0.25er Schritten
  prediction2?: number; // Zweite Vorhersage (nach der Prüfung): Note von 1 bis 6 in 0.25er Schritten
  points1?: number; // Punkte für die erste Vorhersage (berechnet basierend auf Genauigkeit)
  points2?: number; // Punkte für die zweite Vorhersage (berechnet basierend auf Genauigkeit)
}

/**
 * LeaderboardEntry: Interface für einen Eintrag in der Rangliste
 * Wird verwendet, um Schüler mit ihren Gesamtpunkten zu sortieren
 */
export interface LeaderboardEntry {
  studentId: string; // ID des Schülers
  studentName: string; // Name des Schülers
  totalPoints: number; // Gesamtpunkte über alle Prüfungen
  rank: number; // Position in der Rangliste (1 = erster Platz)
}

/**
 * ClassMembership: Interface für eine Klassenmitgliedschaft
 * Verbindet einen Schüler mit einem Lehrer (Klasse)
 */
export interface ClassMembership {
  studentId: string; // ID des Schülers
  teacherId: string; // ID des Lehrers
  joinedAt: string; // ISO date string - Zeitpunkt, wann der Schüler zur Klasse hinzugefügt wurde
}

/**
 * ClassRequest: Interface für eine Klassenanfrage
 * Wird verwendet, wenn ein Schüler eine Anfrage sendet, um zu einer Klasse hinzugefügt zu werden
 */
export interface ClassRequest {
  id: string; // Eindeutige ID der Anfrage
  studentId: string; // ID des Schülers, der die Anfrage stellt
  studentEmail: string; // E-Mail des Schülers
  studentName: string; // Name des Schülers
  teacherEmail: string; // E-Mail des Lehrers, an den die Anfrage gerichtet ist
  status: 'pending' | 'approved' | 'rejected'; // Status der Anfrage
  createdAt: string; // ISO date string - Zeitpunkt der Anfrage
  respondedAt?: string; // ISO date string - Zeitpunkt der Antwort (wenn approved oder rejected)
}


