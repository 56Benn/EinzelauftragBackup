// React Hooks für State Management und Context API
import React, { createContext, useContext, useState, useEffect } from 'react';
// User-Typdefinition
import { User } from '@/types';
// API-Adapter für Backend-Kommunikation
import { api } from '@/lib/apiAdapter';

/**
 * AuthContextType: Interface für den Authentifizierungs-Kontext
 * Definiert welche Funktionen und Daten über den Context verfügbar sind
 */
interface AuthContextType {
  user: User | null; // Aktuell eingeloggter Benutzer oder null
  login: (email: string, password: string) => Promise<boolean>; // Login-Funktion
  logout: () => void; // Logout-Funktion
  setCurrentUser: (user: User | null) => void; // Manuelles Setzen des Benutzers
  loading: boolean; // Loading-State während der Initialisierung
}

// Erstellt einen React Context für die Authentifizierung
// undefined wird als Default-Wert verwendet, um zu erkennen wenn der Context außerhalb des Providers verwendet wird
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Schlüssel für sessionStorage: Hier wird der eingeloggte Benutzer gespeichert
// sessionStorage bleibt nur während der Browser-Session erhalten (wird beim Schließen gelöscht)
const STORAGE_KEY = 'app_current_user';

/**
 * getStoredUser: Lädt den gespeicherten Benutzer aus sessionStorage
 * @returns User-Objekt oder null wenn keiner gespeichert ist
 */
function getStoredUser(): User | null {
  try {
    // Versuche den gespeicherten Wert zu lesen
    const stored = sessionStorage.getItem(STORAGE_KEY);
    // Wenn ein Wert existiert, parse ihn von JSON zu JavaScript-Objekt
    return stored ? JSON.parse(stored) : null;
  } catch {
    // Bei Fehler (z.B. ungültiges JSON) gebe null zurück
    return null;
  }
}

/**
 * setStoredUser: Speichert den Benutzer in sessionStorage oder löscht ihn
 * @param user - User-Objekt zum Speichern oder null zum Löschen
 */
function setStoredUser(user: User | null) {
  if (user) {
    // Wenn ein Benutzer existiert, konvertiere ihn zu JSON und speichere ihn
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    // Wenn null, entferne den Eintrag aus sessionStorage
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * AuthProvider: React Context Provider für Authentifizierung
 * Wrappert die gesamte App und stellt Authentifizierungs-Funktionen bereit
 * @param children - Alle Komponenten, die Zugriff auf den Auth-Context haben sollen
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State für den aktuell eingeloggten Benutzer
  const [user, setUser] = useState<User | null>(null);
  // Loading-State: true während der Initialisierung (z.B. beim Laden aus sessionStorage)
  const [loading, setLoading] = useState(true);

  /**
   * useEffect: Wird einmal beim Mounten der Komponente ausgeführt (leeres Dependency-Array [])
   * Versucht den Benutzer aus sessionStorage zu laden, um die Session nach Seitenreload beizubehalten
   */
  useEffect(() => {
    // Lade gespeicherten Benutzer aus sessionStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      // Wenn ein Benutzer gefunden wurde, setze ihn als aktuellen Benutzer
      setUser(storedUser);
    }
    // Setze loading auf false, da die Initialisierung abgeschlossen ist
    setLoading(false);
  }, []); // Leeres Array bedeutet: nur einmal beim Mounten ausführen

  /**
   * login: Authentifiziert einen Benutzer mit E-Mail und Passwort
   * @param email - E-Mail-Adresse des Benutzers
   * @param password - Passwort des Benutzers
   * @returns Promise<boolean> - true bei erfolgreichem Login, false bei Fehler
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Rufe die API auf, um den Benutzer zu authentifizieren
      const loggedInUser = await api.login(email, password);
      // Prüfe ob die Antwort gültig ist (muss ein User-Objekt mit id sein)
      if (loggedInUser && loggedInUser.id) {
        // Setze den eingeloggten Benutzer im State
        setUser(loggedInUser);
        // Speichere den Benutzer in sessionStorage für Persistenz
        setStoredUser(loggedInUser);
        return true;
      }
      return false;
    } catch (error) {
      // Bei Fehler logge den Fehler in der Konsole
      console.error('Login failed:', error);
      // Prüfe ob es ein Netzwerkfehler ist (Backend nicht erreichbar)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Backend nicht erreichbar. Stellen Sie sicher, dass das Backend auf http://localhost:8080 läuft.');
      }
      return false;
    }
  };

  /**
   * logout: Meldet den aktuellen Benutzer ab
   * Setzt den User-State auf null und entfernt ihn aus sessionStorage
   */
  const logout = () => {
    setUser(null);
    setStoredUser(null);
  };

  /**
   * setCurrentUser: Setzt den aktuellen Benutzer manuell
   * Wird verwendet, wenn sich Benutzerdaten ändern (z.B. nach Update)
   * @param newUser - Neuer Benutzer oder null zum Löschen
   */
  const setCurrentUser = (newUser: User | null) => {
    setUser(newUser);
    setStoredUser(newUser);
  };

  // Provider stellt den Context-Wert (user, login, logout, etc.) für alle Child-Komponenten bereit
  return (
    <AuthContext.Provider value={{ user, login, logout, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth: Custom Hook zum Zugriff auf den Authentifizierungs-Context
 * Muss innerhalb eines AuthProvider verwendet werden
 * @returns AuthContextType - Der Authentifizierungs-Context mit user, login, logout, etc.
 * @throws Error wenn außerhalb eines AuthProvider verwendet
 */
export function useAuth() {
  // Hole den Context-Wert
  const context = useContext(AuthContext);
  // Prüfe ob der Context undefined ist (dann wurde er außerhalb des Providers verwendet)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

