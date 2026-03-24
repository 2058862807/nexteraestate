import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { TermsPage, PrivacyPage, FAQPage } from './LegalPages';
import { TermsPage, PrivacyPage, FAQPage } from './LegalPages';
import BlockchainPage from './BlockchainPage';
import VideoMessagesPage from './VideoMessagesPage';
import DeathSwitchPage from './DeathSwitchPage';
import PasswordVaultPage from './PasswordVaultPage';
import ChatWidget from './ChatWidget';

const API = import.meta.env.VITE_API_URL || 'https://nexteraestate.onrender.com';

interface User { id: string; email: string; name: string; avatar?: string; }
interface AuthCtx { user: User | null; loading: boolean; signIn: () => void; signOut: () => void; token: string | null; }
export const AuthContext = createContext<AuthCtx>({ user: null, loading: true, signIn: () => {}, signOut: () => {}, token: null });
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) { localStorage.setItem('ne_token', t); window.history.replaceState({}, '', window.location.pathname); }
    const stored = t || localStorage.getItem('ne_token');
    if (stored) {
      setToken(stored);
      fetch(`${API}/api/user`, { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => r.json())
        .then(d => { if (d.id) setUser(d); else { localStorage.removeItem('ne_token'); setToken(null); } })
        .catch(() => { localStorage.removeItem('ne_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);
  const signIn = () => { window.location.href = `${API}/api/auth/google`; };
  const signOut = () => { localStorage.removeItem('ne_token'); setUser(null); setToken(null); window.location.href = '/'; };
  return <AuthContext.Provider value={{ user, loading, signIn, signOut, token }}>{children}</AuthContext.Provider>;
}


