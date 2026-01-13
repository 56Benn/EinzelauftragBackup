// Import der React-Bibliotheken für das Rendering der Anwendung
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap CSS wird importiert für die grundlegenden Styles (Buttons, Forms, etc.)
import 'bootstrap/dist/css/bootstrap.min.css'
// Eigene CSS-Datei mit Custom-Styles und Tailwind-Klassen
import './index.css'
// Hauptkomponente der Anwendung
import App from './App.tsx'

// Einstiegspunkt der Anwendung:
// - createRoot erstellt einen React Root Container für die moderne React 18+ API
// - document.getElementById('root') findet das HTML-Element mit id="root" im index.html
// - Das ! (Non-null assertion) sagt TypeScript, dass wir sicher sind, dass das Element existiert
// - StrictMode aktiviert zusätzliche Entwicklungsmodus-Checks (z.B. Warnungen bei veralteten APIs)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


