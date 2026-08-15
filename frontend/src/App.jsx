import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardLayout from "./components/ui/DashboardLayout";
import OverviewPage from './pages/OverviewPage';
import StudentsPage from './pages/StudentsPage';
import SessionsPage from './pages/SessionsPage';

const Placeholder = ({ label }) => <div className="font-body text-neutral-500">{label} — coming soon.</div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<OverviewPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="billing" element={<Placeholder label="Billing" />} />
            <Route path="settings" element={<Placeholder label="Settings" />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
