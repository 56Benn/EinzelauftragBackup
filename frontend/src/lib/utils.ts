// Import von clsx für das Zusammenführen von CSS-Klassen
import { type ClassValue, clsx } from "clsx"

/**
 * cn: Utility-Funktion zum Zusammenführen von CSS-Klassen
 * 
 * Diese Funktion ist ein Wrapper um clsx und wird verwendet, um mehrere CSS-Klassen
 * zu kombinieren. Sie wird häufig in Komponenten verwendet, um conditional classes
 * zu erstellen (z.B. "active" Klasse nur wenn ein Button aktiv ist).
 * 
 * Beispiel:
 * cn("base-class", isActive && "active-class", className)
 * → "base-class active-class" wenn isActive true ist
 * 
 * @param inputs - Beliebige Anzahl von ClassValue-Argumenten (Strings, Objekte, Arrays)
 * @returns Zusammengeführte CSS-Klassen als String
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
