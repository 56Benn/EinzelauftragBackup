// Basis-URL für alle API-Aufrufe zum Backend
// Das Backend läuft standardmäßig auf Port 8080
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * ApiError: Interface für Fehlerantworten vom Backend
 * Wird verwendet, um strukturierte Fehlerinformationen zu verarbeiten
 */
export interface ApiError {
  timestamp: string; // Zeitstempel des Fehlers
  status: number; // HTTP-Statuscode (z.B. 400, 404, 500)
  error: string; // Fehlertyp
  message: string; // Fehlermeldung für den Benutzer
  type?: string; // Optional: Zusätzlicher Fehlertyp
}

/**
 * handleResponse: Verarbeitet HTTP-Responses und wirft Fehler bei Fehlschlägen
 * @param response - Die Response vom fetch-Request
 * @returns Promise<T> - Die geparsten JSON-Daten
 * @throws Error bei HTTP-Fehlern mit entsprechender Fehlermeldung
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Prüfe ob die Response erfolgreich war (Status 200-299)
  if (!response.ok) {
    // Spezielle Behandlung für 401 (Unauthorized) - Login-Fehler
    if (response.status === 401) {
      const errorText = await response.text();
      if (errorText) {
        try {
          // Versuche den Fehler als JSON zu parsen
          const error: ApiError = JSON.parse(errorText);
          throw new Error(error.message || 'Ungültige E-Mail oder Passwort');
        } catch {
          // Falls Parsing fehlschlägt, verwende Standard-Fehlermeldung
          throw new Error('Ungültige E-Mail oder Passwort');
        }
      }
      throw new Error('Ungültige E-Mail oder Passwort');
    }
    
    // Für andere Fehler: Versuche JSON-Fehler zu parsen, sonst verwende StatusText
    const error: ApiError = await response.json().catch(() => ({
      timestamp: new Date().toISOString(),
      status: response.status,
      error: 'Error',
      message: response.statusText,
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  // Bei erfolgreicher Response: Parse und gebe JSON zurück
  return response.json();
}

/**
 * userApi: API-Funktionen für Benutzer-Operationen
 * Enthält alle HTTP-Requests, die mit Benutzern zu tun haben
 */
export const userApi = {
  /**
   * login: Authentifiziert einen Benutzer
   * @param email - E-Mail-Adresse des Benutzers
   * @param password - Passwort des Benutzers
   * @returns Promise mit User-Objekt bei erfolgreichem Login
   * @throws Error bei fehlgeschlagenem Login oder Netzwerkfehler
   */
  async login(email: string, password: string) {
    try {
      // POST-Request zum Login-Endpoint
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Konvertiere Objekt zu JSON-String
      });
      
      // Spezielle Behandlung für 401 (Unauthorized)
      if (response.status === 401) {
        throw new Error('Ungültige E-Mail oder Passwort');
      }
      
      // Prüfe ob Response erfolgreich war
      if (!response.ok) {
        throw new Error(`Login fehlgeschlagen: ${response.status} ${response.statusText}`);
      }
      
      // Parse und gebe JSON-Response zurück
      return await response.json();
    } catch (error) {
      // Prüfe ob es ein Netzwerkfehler ist (Backend nicht erreichbar)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Backend nicht erreichbar. Stellen Sie sicher, dass das Backend auf http://localhost:8080 läuft.');
      }
      throw error;
    }
  },

  /**
   * getAllUsers: Lädt alle Benutzer vom Backend
   * @returns Promise mit Array von User-Objekten
   */
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(response);
  },

  /**
   * getUserById: Lädt einen Benutzer anhand seiner ID
   * @param id - Eindeutige ID des Benutzers
   * @returns Promise mit User-Objekt
   */
  async getUserById(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(response);
  },

  /**
   * getUserByEmail: Lädt einen Benutzer anhand seiner E-Mail-Adresse
   * @param email - E-Mail-Adresse des Benutzers
   * @returns Promise mit User-Objekt
   */
  async getUserByEmail(email: string) {
    // encodeURIComponent kodiert die E-Mail für die URL (z.B. @ wird zu %40)
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
    return handleResponse(response);
  },
};

/**
 * examApi: API-Funktionen für Prüfungs-Operationen
 * Enthält alle HTTP-Requests, die mit Prüfungen zu tun haben
 */
export const examApi = {
  /**
   * getAllExams: Lädt alle Prüfungen vom Backend
   * @returns Promise mit Array von Exam-Objekten
   */
  async getAllExams() {
    const response = await fetch(`${API_BASE_URL}/exams`);
    return handleResponse(response);
  },

  /**
   * getPendingExams: Lädt alle ausstehenden Prüfungen (noch nicht abgeschlossen)
   * @returns Promise mit Array von Exam-Objekten
   */
  async getPendingExams() {
    const response = await fetch(`${API_BASE_URL}/exams/pending`);
    return handleResponse(response);
  },

  /**
   * getGradedExams: Lädt alle benoteten Prüfungen (abgeschlossen und mit Noten)
   * @returns Promise mit Array von Exam-Objekten
   */
  async getGradedExams() {
    const response = await fetch(`${API_BASE_URL}/exams/graded`);
    return handleResponse(response);
  },

  /**
   * getExamById: Lädt eine Prüfung anhand ihrer ID
   * @param id - Eindeutige ID der Prüfung
   * @returns Promise mit Exam-Objekt
   */
  async getExamById(id: string) {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`);
    return handleResponse(response);
  },

  /**
   * createExam: Erstellt eine neue Prüfung
   * @param exam - Exam-Objekt mit allen Prüfungsdaten
   * @returns Promise mit erstelltem Exam-Objekt
   */
  async createExam(exam: any) {
    const response = await fetch(`${API_BASE_URL}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam), // Konvertiere Exam-Objekt zu JSON
    });
    return handleResponse(response);
  },

  /**
   * updateExam: Aktualisiert eine bestehende Prüfung
   * @param id - ID der zu aktualisierenden Prüfung
   * @param exam - Exam-Objekt mit aktualisierten Daten
   * @returns Promise mit aktualisiertem Exam-Objekt
   */
  async updateExam(id: string, exam: any) {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: 'PUT', // PUT wird für Updates verwendet
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
    return handleResponse(response);
  },

  /**
   * closeExam: Schließt eine Prüfung manuell (setzt isClosed auf true)
   * @param id - ID der zu schließenden Prüfung
   * @returns Promise mit aktualisiertem Exam-Objekt
   */
  async closeExam(id: string) {
    const response = await fetch(`${API_BASE_URL}/exams/${id}/close`, {
      method: 'PUT',
    });
    return handleResponse(response);
  },

  /**
   * deleteExam: Löscht eine Prüfung
   * @param id - ID der zu löschenden Prüfung
   * @returns Promise<void> - Kein Rückgabewert bei Erfolg
   * @throws Error bei Fehlschlag
   */
  async deleteExam(id: string) {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete exam: ${response.statusText}`);
    }
  },
};

/**
 * predictionApi: API-Funktionen für Vorhersage-Operationen
 * Enthält alle HTTP-Requests, die mit Vorhersagen (Tipps) zu tun haben
 */
export const predictionApi = {
  /**
   * getAllPredictions: Lädt alle Vorhersagen vom Backend
   * @returns Promise mit Array von Prediction-Objekten
   */
  async getAllPredictions() {
    const response = await fetch(`${API_BASE_URL}/predictions`);
    return handleResponse(response);
  },

  /**
   * getPredictionById: Lädt eine Vorhersage anhand ihrer ID
   * @param id - Eindeutige ID der Vorhersage
   * @returns Promise mit Prediction-Objekt
   */
  async getPredictionById(id: string) {
    const response = await fetch(`${API_BASE_URL}/predictions/${id}`);
    return handleResponse(response);
  },

  /**
   * getPredictionByExamAndStudent: Lädt die Vorhersage eines Schülers für eine bestimmte Prüfung
   * @param examId - ID der Prüfung
   * @param studentId - ID des Schülers
   * @returns Promise mit Prediction-Objekt oder null wenn keine Vorhersage existiert
   */
  async getPredictionByExamAndStudent(examId: string, studentId: string) {
    const response = await fetch(`${API_BASE_URL}/predictions/exam/${examId}/student/${studentId}`);
    // 404 bedeutet, dass keine Vorhersage existiert - das ist kein Fehler
    if (response.status === 404) {
      return null;
    }
    return handleResponse(response);
  },

  /**
   * getPredictionsByExam: Lädt alle Vorhersagen für eine bestimmte Prüfung
   * @param examId - ID der Prüfung
   * @returns Promise mit Array von Prediction-Objekten
   */
  async getPredictionsByExam(examId: string) {
    const response = await fetch(`${API_BASE_URL}/predictions/exam/${examId}`);
    return handleResponse(response);
  },

  /**
   * getPredictionsByStudent: Lädt alle Vorhersagen eines bestimmten Schülers
   * @param studentId - ID des Schülers
   * @returns Promise mit Array von Prediction-Objekten
   */
  async getPredictionsByStudent(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/predictions/student/${studentId}`);
    return handleResponse(response);
  },

  /**
   * createOrUpdatePrediction: Erstellt eine neue Vorhersage oder aktualisiert eine bestehende
   * Das Backend entscheidet automatisch, ob erstellt oder aktualisiert werden muss
   * @param examId - ID der Prüfung
   * @param studentId - ID des Schülers
   * @param prediction - Prediction-Objekt mit Vorhersagedaten
   * @returns Promise mit erstelltem/aktualisiertem Prediction-Objekt
   */
  async createOrUpdatePrediction(examId: string, studentId: string, prediction: any) {
    const response = await fetch(`${API_BASE_URL}/predictions/exam/${examId}/student/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    });
    return handleResponse(response);
  },

  /**
   * deletePrediction: Löscht eine Vorhersage
   * @param id - ID der zu löschenden Vorhersage
   * @returns Promise<void> - Kein Rückgabewert bei Erfolg
   * @throws Error bei Fehlschlag
   */
  async deletePrediction(id: string) {
    const response = await fetch(`${API_BASE_URL}/predictions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete prediction: ${response.statusText}`);
    }
  },
};


