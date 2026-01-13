// React Router für Client-Side Routing (Navigation zwischen Seiten ohne Seitenreload)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// AuthProvider stellt den Authentifizierungskontext bereit, useAuth ist der Hook zum Zugriff
import { AuthProvider, useAuth } from '@/context/AuthContext';
// Layout-Komponente mit Navigation und Header
import Layout from '@/components/Layout';
// Alle Seiten-Komponenten importieren
import Login from '@/pages/Login';
import StudentDashboard from '@/pages/StudentDashboard';
import Profile from '@/pages/Profile';
import Leaderboard from '@/pages/Leaderboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import ClassManagement from '@/pages/ClassManagement';
import StudentDetail from '@/pages/StudentDetail';

/**
 * ProtectedRoute: Route Guard für geschützte Routen
 * Prüft ob ein Benutzer eingeloggt ist. Falls nicht, wird zur Login-Seite umgeleitet.
 * @param children - Die Komponente, die gerendert werden soll, wenn der Benutzer eingeloggt ist
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Wenn user existiert, rendere die children, sonst leite zur Login-Seite um
  // replace={true} ersetzt den aktuellen Eintrag in der Browser-Historie
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * StudentRoute: Route Guard speziell für Schüler
 * Nur Schüler können auf diese Routen zugreifen, Lehrer werden zur Startseite umgeleitet
 * @param children - Die Komponente, die nur für Schüler sichtbar sein soll
 */
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Optional Chaining (?.) prüft ob user existiert, bevor auf role zugegriffen wird
  // Nur wenn user.role === 'student', wird die Komponente gerendert
  return user?.role === 'student' ? <>{children}</> : <Navigate to="/" replace />;
}

/**
 * TeacherRoute: Route Guard speziell für Lehrer
 * Nur Lehrer können auf diese Routen zugreifen, Schüler werden zur Startseite umgeleitet
 * @param children - Die Komponente, die nur für Lehrer sichtbar sein soll
 */
function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Prüft ob der Benutzer die Rolle 'teacher' hat
  return user?.role === 'teacher' ? <>{children}</> : <Navigate to="/" replace />;
}

/**
 * AppRoutes: Definiert alle Routen der Anwendung
 * Hier wird die gesamte Routing-Struktur festgelegt mit entsprechenden Route Guards
 */
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login-Route: Wenn bereits eingeloggt, wird zur Startseite umgeleitet */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      
      {/* Hauptroute: Zeigt je nach Rolle das Student- oder Teacher-Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              {/* Conditional Rendering: Zeigt unterschiedliche Dashboards basierend auf der Benutzerrolle */}
              {user?.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Leaderboard: Nur für Schüler zugänglich, zeigt die Gesamt-Rangliste */}
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <StudentRoute>
              <Layout>
                <Leaderboard />
              </Layout>
            </StudentRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Profil: Nur für Schüler, zeigt persönliche Prüfungsergebnisse */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <StudentRoute>
              <Layout>
                <Profile />
              </Layout>
            </StudentRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Klassenverwaltung: Nur für Lehrer, Verwaltung der Schüler in der Klasse */}
      <Route
        path="/class"
        element={
          <ProtectedRoute>
            <TeacherRoute>
              <Layout>
                <ClassManagement />
              </Layout>
            </TeacherRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Schüler-Detail: Nur für Lehrer, zeigt Details eines einzelnen Schülers */}
      {/* :studentId ist ein URL-Parameter, der in der Komponente mit useParams() abgerufen wird */}
      <Route
        path="/class/student/:studentId"
        element={
          <ProtectedRoute>
            <TeacherRoute>
              <Layout>
                <StudentDetail />
              </Layout>
            </TeacherRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Catch-All Route: Alle nicht definierten Routen werden zur Startseite umgeleitet */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App: Hauptkomponente der Anwendung
 * Wrappert die gesamte App mit:
 * - AuthProvider: Stellt Authentifizierungs-Kontext bereit
 * - BrowserRouter: Ermöglicht Client-Side Routing
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


