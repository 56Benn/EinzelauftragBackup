// Import der API-Funktionen und Type-Definitionen
import { userApi, examApi, predictionApi } from './api';
import { User, Exam, Prediction } from '@/types';

/**
 * apiAdapter: Adapter-Pattern zur Konvertierung zwischen Backend- und Frontend-Formaten
 * 
 * Problem: Das Backend (Java/Spring Boot) verwendet Long-IDs (Zahlen) und andere Konventionen,
 * während das Frontend (TypeScript/React) String-IDs verwendet.
 * 
 * Lösung: Diese Adapter-Funktionen konvertieren automatisch zwischen den Formaten,
 * sodass der Rest der Anwendung nur mit Frontend-Formaten arbeiten muss.
 */

export const apiAdapter = {
  /**
   * userToFrontend: Konvertiert ein Backend-User-Objekt zu einem Frontend-User-Objekt
   * @param backendUser - User-Objekt vom Backend (mit Long-ID)
   * @returns User-Objekt für das Frontend (mit String-ID)
   */
  userToFrontend(backendUser: any): User {
    return {
      id: String(backendUser.id), // Konvertiere Long-ID zu String
      username: backendUser.username,
      email: backendUser.email,
      password: backendUser.password || '', // Fallback auf leeren String
      // Backend sendet Role in Großbuchstaben (TEACHER/STUDENT), Frontend verwendet Kleinbuchstaben
      role: backendUser.role?.toLowerCase() === 'teacher' ? 'teacher' : 'student',
    };
  },

  /**
   * userToBackend: Konvertiert ein Frontend-User-Objekt zu einem Backend-User-Objekt
   * @param frontendUser - User-Objekt vom Frontend (mit String-ID)
   * @returns User-Objekt für das Backend (mit Long-ID)
   */
  userToBackend(frontendUser: User): any {
    return {
      id: frontendUser.id ? Number(frontendUser.id) : undefined, // Konvertiere String-ID zu Number
      username: frontendUser.username,
      email: frontendUser.email,
      password: frontendUser.password,
      role: frontendUser.role.toUpperCase(), // Backend erwartet Großbuchstaben
    };
  },

  /**
   * examToFrontend: Konvertiert ein Backend-Exam-Objekt zu einem Frontend-Exam-Objekt
   * @param backendExam - Exam-Objekt vom Backend
   * @returns Exam-Objekt für das Frontend
   */
  examToFrontend(backendExam: any): Exam {
    // Konvertiere grades-Mapping: Backend verwendet Number-Keys, Frontend String-Keys
    const grades: Record<string, number> = {};
    if (backendExam.grades) {
      Object.keys(backendExam.grades).forEach((key) => {
        grades[String(key)] = backendExam.grades[key]; // Konvertiere Key zu String
      });
    }
    return {
      id: String(backendExam.id), // Konvertiere Long-ID zu String
      title: backendExam.title,
      subject: backendExam.subject,
      description: backendExam.description,
      date: backendExam.date,
      isClosed: backendExam.isClosed || false, // Fallback auf false
      grades, // Verwende konvertiertes grades-Mapping
    };
  },

  /**
   * examToBackend: Konvertiert ein Frontend-Exam-Objekt zu einem Backend-Exam-Objekt
   * @param frontendExam - Exam-Objekt vom Frontend
   * @returns Exam-Objekt für das Backend
   */
  examToBackend(frontendExam: Exam): any {
    // Konvertiere grades-Mapping: Frontend verwendet String-Keys, Backend Number-Keys
    const grades: Record<number, number> = {};
    if (frontendExam.grades) {
      Object.keys(frontendExam.grades).forEach((key) => {
        grades[Number(key)] = frontendExam.grades![key]; // Konvertiere Key zu Number
      });
    }
    return {
      id: frontendExam.id ? Number(frontendExam.id) : undefined, // Konvertiere String-ID zu Number
      title: frontendExam.title,
      subject: frontendExam.subject,
      description: frontendExam.description,
      date: frontendExam.date,
      isClosed: frontendExam.isClosed,
      grades, // Verwende konvertiertes grades-Mapping
    };
  },

  /**
   * predictionToFrontend: Konvertiert ein Backend-Prediction-Objekt zu einem Frontend-Prediction-Objekt
   * @param backendPrediction - Prediction-Objekt vom Backend
   * @returns Prediction-Objekt für das Frontend
   */
  predictionToFrontend(backendPrediction: any): Prediction {
    return {
      // Backend kann exam/student als Objekte oder IDs senden - handle beide Fälle
      examId: String(backendPrediction.exam?.id || backendPrediction.examId),
      studentId: String(backendPrediction.student?.id || backendPrediction.studentId),
      prediction1: backendPrediction.prediction1,
      prediction2: backendPrediction.prediction2,
      points1: backendPrediction.points1,
      points2: backendPrediction.points2,
    };
  },

  /**
   * predictionToBackend: Konvertiert ein Frontend-Prediction-Objekt zu einem Backend-Prediction-Objekt
   * @param frontendPrediction - Prediction-Objekt vom Frontend
   * @returns Prediction-Objekt für das Backend
   * 
   * Hinweis: examId und studentId werden nicht mitgesendet, da sie als URL-Parameter übergeben werden
   */
  predictionToBackend(frontendPrediction: Prediction): any {
    return {
      prediction1: frontendPrediction.prediction1,
      prediction2: frontendPrediction.prediction2,
      points1: frontendPrediction.points1,
      points2: frontendPrediction.points2,
    };
  },
};

/**
 * api: Wrapper-Funktionen, die automatisch die Adapter verwenden
 * 
 * Diese Funktionen werden in der gesamten Anwendung verwendet.
 * Sie rufen die Backend-API auf und konvertieren automatisch die Formate,
 * sodass der Rest der Anwendung nur mit Frontend-Formaten arbeitet.
 */
export const api = {
  /**
   * User API - Wrapper-Funktionen
   */
  
  /**
   * login: Authentifiziert einen Benutzer und konvertiert das Ergebnis
   * @param email - E-Mail-Adresse
   * @param password - Passwort
   * @returns Promise mit Frontend-User-Objekt
   */
  async login(email: string, password: string): Promise<User> {
    const backendUser = await userApi.login(email, password);
    return apiAdapter.userToFrontend(backendUser);
  },

  /**
   * getAllUsers: Lädt alle Benutzer und konvertiert sie
   * @returns Promise mit Array von Frontend-User-Objekten
   */
  async getAllUsers(): Promise<User[]> {
    const backendUsers = await userApi.getAllUsers();
    // Map über alle Benutzer und konvertiere jeden einzeln
    return backendUsers.map((u: any) => apiAdapter.userToFrontend(u));
  },

  /**
   * getUserById: Lädt einen Benutzer anhand der ID und konvertiert ihn
   * @param id - String-ID des Benutzers
   * @returns Promise mit Frontend-User-Objekt
   */
  async getUserById(id: string): Promise<User> {
    const backendUser = await userApi.getUserById(id);
    return apiAdapter.userToFrontend(backendUser);
  },

  /**
   * getUserByEmail: Lädt einen Benutzer anhand der E-Mail und konvertiert ihn
   * @param email - E-Mail-Adresse
   * @returns Promise mit Frontend-User-Objekt
   */
  async getUserByEmail(email: string): Promise<User> {
    const backendUser = await userApi.getUserByEmail(email);
    return apiAdapter.userToFrontend(backendUser);
  },

  /**
   * Exam API - Wrapper-Funktionen
   */
  
  /**
   * getAllExams: Lädt alle Prüfungen und konvertiert sie
   * @returns Promise mit Array von Frontend-Exam-Objekten
   */
  async getAllExams(): Promise<Exam[]> {
    const backendExams = await examApi.getAllExams();
    return backendExams.map((e: any) => apiAdapter.examToFrontend(e));
  },

  /**
   * getPendingExams: Lädt ausstehende Prüfungen und konvertiert sie
   * @returns Promise mit Array von Frontend-Exam-Objekten
   */
  async getPendingExams(): Promise<Exam[]> {
    const backendExams = await examApi.getPendingExams();
    return backendExams.map((e: any) => apiAdapter.examToFrontend(e));
  },

  /**
   * getGradedExams: Lädt benotete Prüfungen und konvertiert sie
   * @returns Promise mit Array von Frontend-Exam-Objekten
   */
  async getGradedExams(): Promise<Exam[]> {
    const backendExams = await examApi.getGradedExams();
    return backendExams.map((e: any) => apiAdapter.examToFrontend(e));
  },

  /**
   * getExamById: Lädt eine Prüfung anhand der ID und konvertiert sie
   * @param id - String-ID der Prüfung
   * @returns Promise mit Frontend-Exam-Objekt
   */
  async getExamById(id: string): Promise<Exam> {
    const backendExam = await examApi.getExamById(id);
    return apiAdapter.examToFrontend(backendExam);
  },

  /**
   * createExam: Erstellt eine neue Prüfung
   * Konvertiert Frontend-Format zu Backend-Format vor dem Senden,
   * dann Backend-Format zu Frontend-Format für die Antwort
   * @param exam - Frontend-Exam-Objekt
   * @returns Promise mit erstelltem Frontend-Exam-Objekt
   */
  async createExam(exam: Exam): Promise<Exam> {
    const backendExam = apiAdapter.examToBackend(exam);
    const created = await examApi.createExam(backendExam);
    return apiAdapter.examToFrontend(created);
  },

  /**
   * updateExam: Aktualisiert eine Prüfung
   * @param id - String-ID der Prüfung
   * @param exam - Frontend-Exam-Objekt mit aktualisierten Daten
   * @returns Promise mit aktualisiertem Frontend-Exam-Objekt
   */
  async updateExam(id: string, exam: Exam): Promise<Exam> {
    const backendExam = apiAdapter.examToBackend(exam);
    const updated = await examApi.updateExam(id, backendExam);
    return apiAdapter.examToFrontend(updated);
  },

  /**
   * closeExam: Schließt eine Prüfung
   * @param id - String-ID der Prüfung
   * @returns Promise mit aktualisiertem Frontend-Exam-Objekt
   */
  async closeExam(id: string): Promise<Exam> {
    const backendExam = await examApi.closeExam(id);
    return apiAdapter.examToFrontend(backendExam);
  },

  /**
   * deleteExam: Löscht eine Prüfung
   * @param id - String-ID der Prüfung
   * @returns Promise<void>
   */
  async deleteExam(id: string): Promise<void> {
    await examApi.deleteExam(id);
  },

  /**
   * Prediction API - Wrapper-Funktionen
   */
  
  /**
   * getAllPredictions: Lädt alle Vorhersagen und konvertiert sie
   * @returns Promise mit Array von Frontend-Prediction-Objekten
   */
  async getAllPredictions(): Promise<Prediction[]> {
    const backendPredictions = await predictionApi.getAllPredictions();
    return backendPredictions.map((p: any) => apiAdapter.predictionToFrontend(p));
  },

  /**
   * getPredictionByExamAndStudent: Lädt eine Vorhersage für eine Prüfung und einen Schüler
   * @param examId - String-ID der Prüfung
   * @param studentId - String-ID des Schülers
   * @returns Promise mit Frontend-Prediction-Objekt oder null
   */
  async getPredictionByExamAndStudent(examId: string, studentId: string): Promise<Prediction | null> {
    const backendPrediction = await predictionApi.getPredictionByExamAndStudent(examId, studentId);
    if (!backendPrediction) return null;
    return apiAdapter.predictionToFrontend(backendPrediction);
  },

  /**
   * getPredictionsByExam: Lädt alle Vorhersagen für eine Prüfung
   * @param examId - String-ID der Prüfung
   * @returns Promise mit Array von Frontend-Prediction-Objekten
   */
  async getPredictionsByExam(examId: string): Promise<Prediction[]> {
    const backendPredictions = await predictionApi.getPredictionsByExam(examId);
    return backendPredictions.map((p: any) => apiAdapter.predictionToFrontend(p));
  },

  /**
   * getPredictionsByStudent: Lädt alle Vorhersagen eines Schülers
   * @param studentId - String-ID des Schülers
   * @returns Promise mit Array von Frontend-Prediction-Objekten
   */
  async getPredictionsByStudent(studentId: string): Promise<Prediction[]> {
    const backendPredictions = await predictionApi.getPredictionsByStudent(studentId);
    return backendPredictions.map((p: any) => apiAdapter.predictionToFrontend(p));
  },

  /**
   * createOrUpdatePrediction: Erstellt oder aktualisiert eine Vorhersage
   * @param examId - String-ID der Prüfung
   * @param studentId - String-ID des Schülers
   * @param prediction - Frontend-Prediction-Objekt
   * @returns Promise mit erstelltem/aktualisiertem Frontend-Prediction-Objekt
   */
  async createOrUpdatePrediction(examId: string, studentId: string, prediction: Prediction): Promise<Prediction> {
    const backendPrediction = apiAdapter.predictionToBackend(prediction);
    const created = await predictionApi.createOrUpdatePrediction(examId, studentId, backendPrediction);
    return apiAdapter.predictionToFrontend(created);
  },
};


