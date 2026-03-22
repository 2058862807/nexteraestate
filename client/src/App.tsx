import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Landing from './pages/landing';
import Dashboard from './pages/dashboard';
import WillBuilder from './pages/will-builder';
import DigitalVault from './pages/digital-vault';
import Family from './pages/family';
import GriefCounseling from './pages/grief-counseling';
import NotFound from './pages/not-found';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User { id: string; email: string; name: string; avatar?: string; }
interface AuthContextType { user: User | null; loading: boolean; signIn: () => void; signOut: () => void; }

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signIn: () => {}, signOut: () => {} });
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) { localStorage.setItem('auth_token', token); window.history.replaceState({}, document.title, window.location.pathname); }
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      fetch(`${API_BASE_URL}/api/user`, { headers: { 'Authorization': `Bearer ${storedToken}` } })
        .then(res => res.json())
        .then(data => { if (data.id) setUser(data); else localStorage.removeItem('auth_token'); })
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const signIn = () => { window.location.href = `${API_BASE_URL}/api/auth/google`; };
  const signOut = () => { localStorage.removeItem('auth_token'); setUser(null); window.location.href = '/'; };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/will-builder" element={<ProtectedRoute><WillBuilder /></ProtectedRoute>} />
          <Route path="/vault" element={<ProtectedRoute><DigitalVault /></ProtectedRoute>} />
          <Route path="/family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
          <Route path="/grief" element={<ProtectedRoute><GriefCounseling /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
