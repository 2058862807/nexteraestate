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

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Nav() {
  const { user, signIn, signOut } = useAuth();
  const [planOpen, setPlanOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-slate-800">
      <a href="/" className="text-lg font-bold text-blue-400 whitespace-nowrap">
        NextEra Estate<sup className="text-xs text-blue-300 ml-0.5">™</sup>
      </a>
      {user && (
        <div className="flex items-center gap-1 text-xs">
          <a href="/dashboard" className="px-3 py-2 rounded hover:bg-slate-800 whitespace-nowrap">Dashboard</a>

          {/* Planning dropdown */}
          <div className="relative">
            <button
              onClick={() => { setPlanOpen(o => !o); setToolsOpen(false); }}
              className="px-3 py-2 rounded hover:bg-slate-800 flex items-center gap-1"
            >
              Planning <span className="text-slate-400 text-xs">{planOpen ? "▲" : "▼"}</span>
            </button>
            {planOpen && (
              <div className="absolute top-full left-0 mt-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 w-56 z-50">
                {[
                  { href: '/will-builder', icon: '📝', label: 'Will Builder', desc: 'Create your legal will' },
                  { href: '/vault', icon: '📁', label: 'Document Vault', desc: 'Store important documents' },
                  { href: '/compliance', icon: '⚖️', label: 'Compliance', desc: '50-state legal requirements' },
                  { href: '/family', icon: '👨‍👩‍👧', label: 'Family', desc: 'Manage family members' },
                ].map(item => (
                  <a key={item.href} href={item.href} onClick={() => setPlanOpen(false)} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div><div className="font-medium text-white text-xs">{item.label}</div><div className="text-slate-400 text-xs">{item.desc}</div></div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => { setToolsOpen(o => !o); setPlanOpen(false); }}
              className="px-3 py-2 rounded hover:bg-slate-800 flex items-center gap-1"
            >
              Tools <span className="text-slate-400 text-xs">{toolsOpen ? "▲" : "▼"}</span>
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 w-56 z-50">
                {[
                  { href: '/blockchain', icon: '🔗', label: 'Blockchain', desc: 'Notarize documents' },
                  { href: '/videos', icon: '🎥', label: 'Video Messages', desc: 'Leave messages for loved ones' },
                  { href: '/death-switch', icon: '🛡️', label: 'Death Switch', desc: 'Inactivity monitoring' },
                  { href: '/password-vault', icon: '🔑', label: 'Password Vault', desc: 'Store credentials' },
                  { href: '/grief', icon: '💙', label: 'Grief Support', desc: 'AI counseling support' },
                ].map(item => (
                  <a key={item.href} href={item.href} onClick={() => setToolsOpen(false)} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div><div className="font-medium text-white text-xs">{item.label}</div><div className="text-slate-400 text-xs">{item.desc}</div></div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="/faq" className="px-3 py-2 rounded hover:bg-slate-800">FAQ</a>
        </div>
      )}
      <div className="flex items-center gap-2">
        {user
          ? <button onClick={signOut} title={user.email} className="bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-600 text-xs flex items-center gap-2">
              {user.avatar && <img src={user.avatar} className="w-5 h-5 rounded-full" />}
              {user.name?.split(' ')[0]}
            </button>
          : <button onClick={signIn} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 text-xs font-semibold">Sign In</button>}
      </div>
    </nav>
  );
}


function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Nav() {
  const { user, signIn, signOut } = useAuth();
  const [planOpen, setPlanOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-slate-800">
      <a href="/" className="text-lg font-bold text-blue-400 whitespace-nowrap">NextEra Estate</a>
      {user && (
        <div className="flex items-center gap-1 text-xs">
          <a href="/dashboard" className="px-3 py-2 rounded hover:bg-slate-800 whitespace-nowrap">Dashboard</a>

          {/* Planning dropdown */}
          <div className="relative" onMouseEnter={() => setPlanOpen(true)} onMouseLeave={() => setPlanOpen(false)}>
            <button className="px-3 py-2 rounded hover:bg-slate-800 flex items-center gap-1">
              Planning <span className="text-slate-400">▾</span>
            </button>
            {planOpen && (
              <div className="absolute top-full left-0 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 w-56 z-50">
                {[
                  { href: '/will-builder', icon: '📝', label: 'Will Builder', desc: 'Create your legal will' },
                  { href: '/vault', icon: '📁', label: 'Document Vault', desc: 'Store important documents' },
                  { href: '/compliance', icon: '⚖️', label: 'Compliance', desc: '50-state legal requirements' },
                  { href: '/family', icon: '👨‍👩‍👧', label: 'Family', desc: 'Manage family members' },
                ].map(item => (
                  <a key={item.href} href={item.href} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div><div className="font-medium text-white text-xs">{item.label}</div><div className="text-slate-400 text-xs">{item.desc}</div></div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Tools dropdown */}
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className="px-3 py-2 rounded hover:bg-slate-800 flex items-center gap-1">
              Tools <span className="text-slate-400">▾</span>
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 w-56 z-50">
                {[
                  { href: '/blockchain', icon: '🔗', label: 'Blockchain', desc: 'Notarize documents' },
                  { href: '/videos', icon: '🎥', label: 'Video Messages', desc: 'Leave messages for loved ones' },
                  { href: '/death-switch', icon: '🛡️', label: 'Death Switch', desc: 'Inactivity monitoring' },
                  { href: '/password-vault', icon: '🔑', label: 'Password Vault', desc: 'Store account credentials' },
                  { href: '/grief', icon: '💙', label: 'Grief Support', desc: 'AI counseling support' },
                ].map(item => (
                  <a key={item.href} href={item.href} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors">
                    <span className="text-base mt-0.5">{item.icon}</span>
                    <div><div className="font-medium text-white text-xs">{item.label}</div><div className="text-slate-400 text-xs">{item.desc}</div></div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="/faq" className="px-3 py-2 rounded hover:bg-slate-800">FAQ</a>
        </div>
      )}
      <div className="flex items-center gap-2">
        {user
          ? <button onClick={signOut} title={user.email} className="bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-600 text-xs flex items-center gap-2">
              {user.avatar && <img src={user.avatar} className="w-5 h-5 rounded-full" />}
              {user.name?.split(' ')[0]}
            </button>
          : <button onClick={signIn} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 text-xs font-semibold">Sign In</button>}
      </div>
    </nav>
  );
}

function Landing() {
  const { signIn, user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Protect Your Legacy</h1>
        <p className="text-xl text-blue-200 mb-10 max-w-3xl mx-auto">AI-powered estate planning with blockchain security, 50-state compliance, grief counseling, and death switch protection.</p>
        <div className="flex flex-wrap justify-center gap-3 mb-12 text-sm">
          {['🤖 AI Will Builder','🔒 Blockchain Notarization','⚖️ 50-State Compliance','💙 Grief Counseling','📹 Video Messages','🛡️ Death Switch'].map(f => (
            <span key={f} className="bg-blue-900/50 border border-blue-700 px-4 py-2 rounded-full">{f}</span>
          ))}
        </div>
        <button onClick={signIn} className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-colors mb-24">
          Get Started — Sign In with Google
        </button>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            {icon:'🤖',title:'AI-Powered',desc:'Claude AI guides you through will creation with smart suggestions and state-specific compliance.'},
            {icon:'🔗',title:'Blockchain Secured',desc:'Every document notarized on Polygon blockchain for tamper-proof, permanent verification.'},
            {icon:'🛡️',title:'Death Switch',desc:'Automated inactivity monitoring ensures your estate is handled even if you cannot act.'},
          ].map(f => (
            <div key={f.title} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalDocuments: 0, completedWills: 0, complianceScore: 0 });
  const [wills, setWills] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${API}/api/dashboard/stats`, { headers: h }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/wills`, { headers: h }).then(r => r.json()).then(d => Array.isArray(d) ? setWills(d) : null).catch(() => {});
    fetch(`${API}/api/documents`, { headers: h }).then(r => r.json()).then(d => Array.isArray(d) ? setDocs(d) : null).catch(() => {});
  }, [token]);
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 mb-8">Here's your estate planning overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{label:'Documents',value:stats.totalDocuments},{label:'Completed Wills',value:stats.completedWills},{label:'Compliance Score',value:stats.complianceScore+'%'},{label:'Family Members',value:0}].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <div className="text-3xl font-bold text-blue-600">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[{href:'/will-builder',icon:'📝',title:'Create Will',desc:'Start building your will'},{href:'/vault',icon:'📁',title:'Upload Document',desc:'Add to your vault'},{href:'/compliance',icon:'⚖️',title:'Check Compliance',desc:'View state requirements'}].map(a => (
            <a key={a.title} href={a.href} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="font-semibold text-slate-800">{a.title}</div>
              <div className="text-sm text-slate-500">{a.desc}</div>
            </a>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold mb-4">Recent Wills</h3>
            {wills.length === 0 ? <p className="text-slate-400 text-sm">No wills yet. <a href="/will-builder" className="text-blue-600">Create your first will →</a></p>
              : wills.slice(0,5).map(w => <div key={w.id} className="py-2 border-b border-slate-100 text-sm">{w.title} <span className="text-slate-400">— {w.status}</span></div>)}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold mb-4">Recent Documents</h3>
            {docs.length === 0 ? <p className="text-slate-400 text-sm">No documents yet. <a href="/vault" className="text-blue-600">Upload a document →</a></p>
              : docs.slice(0,5).map(d => <div key={d.id} className="py-2 border-b border-slate-100 text-sm">{d.original_name || d.originalName}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function WillBuilder() {
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const ask = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/ai/will-builder`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userInput: message })
      });
      const d = await r.json();
      setResponse(d.response || d.error);
    } catch { setResponse('Error connecting to AI service.'); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Will Builder</h1>
        <p className="text-slate-500 mb-6">Create your legal will with AI assistance</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This tool provides general guidance only. Always consult a licensed attorney before executing your will.
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold mb-4">Ask Esquire AI</h3>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask about will creation, asset distribution, executor selection, state requirements..." className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[120px] resize-none focus:outline-none focus:border-blue-400" />
          <button onClick={ask} disabled={loading} className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Thinking...' : 'Ask AI'}</button>
          {response && <div className="mt-6 bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">{response}</div>}
        </div>
      </div>
    </div>
  );
}

function Vault() {
  const { token } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/documents`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => Array.isArray(d) ? setDocs(d) : null).catch(() => {});
  }, [token]);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const r = await fetch(`${API}/api/documents`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const d = await r.json();
      if (d.id) setDocs(prev => [d, ...prev]);
    } catch {}
    setUploading(false);
  };
  const del = async (id: string) => {
    await fetch(`${API}/api/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setDocs(prev => prev.filter(d => d.id !== id));
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-slate-800">Document Vault</h1><p className="text-slate-500">Securely store your estate planning documents</p></div>
          <label className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">{uploading ? 'Uploading...' : '+ Upload'}<input type="file" className="hidden" onChange={upload} disabled={uploading} /></label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{label:'Total',value:docs.length,c:'bg-blue-500'},{label:'Notarized',value:docs.filter(d=>d.blockchain_hash).length,c:'bg-green-500'},{label:'Categories',value:new Set(docs.map(d=>d.category)).size,c:'bg-purple-500'},{label:'Storage',value:'0 MB',c:'bg-orange-500'}].map(s => (
            <div key={s.label} className={`${s.c} text-white rounded-xl p-5 text-center`}><div className="text-2xl font-bold">{s.value}</div><div className="text-sm opacity-80">{s.label}</div></div>
          ))}
        </div>
        {docs.length === 0
          ? <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">No documents yet.</div>
          : <div className="grid md:grid-cols-2 gap-4">{docs.map(d => (
              <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between">
                <div><div className="font-medium text-slate-800">{d.original_name || d.originalName}</div><div className="text-xs text-slate-400 mt-1">{d.category}</div></div>
                <button onClick={() => del(d.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            ))}</div>}
      </div>
    </div>
  );
}

function Compliance() {
  const { token } = useAuth();
  const [state, setState] = useState('AL');
  const [info, setInfo] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  const check = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API}/api/legal/state/${state}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API}/api/ai/compliance`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ state }) }).then(r => r.json())
      ]);
      setInfo(r1); setAiResponse(r2.response || '');
    } catch {}
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Compliance Center</h1>
        <p className="text-slate-500 mb-8">50-state legal requirements for estate planning</p>
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1"><label className="block text-sm font-medium text-slate-700 mb-2">Select State</label>
              <select value={state} onChange={e => setState(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400">
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <button onClick={check} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Loading...' : 'Check'}</button>
          </div>
        </div>
        {info && <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold mb-4">{info.stateName} Requirements</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[['Witnesses Required', info.witnesses],['Notarization', info.notarizationRequired ? 'Required' : 'Not Required'],['Holographic Wills', info.holographicAllowed ? 'Allowed' : 'Not Allowed'],['Self-Proving Affidavit', info.selfProvingAffidavit ? 'Available' : 'Not Available']].map(([k,v]) => (
              <div key={k as string} className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">{k}:</span> <span className="font-medium">{v}</span></div>
            ))}
          </div>
        </div>}
        {aiResponse && <div className="bg-white rounded-xl border border-slate-200 p-6"><h3 className="font-semibold mb-3">AI Legal Analysis</h3><div className="text-sm text-slate-700 whitespace-pre-wrap">{aiResponse}</div></div>}
      </div>
    </div>
  );
}

function Grief() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello, I'm here to offer compassionate support. How can I help you today?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const msg = input;
    setInput('');
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/ai/grief-counseling`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: msg }) });
      const d = await r.json();
      setMessages(prev => [...prev, { role: 'ai', text: d.response || 'I understand. Please continue.' }]);
    } catch { setMessages(prev => [...prev, { role: 'ai', text: 'I apologize, temporarily unavailable. Please try again.' }]); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Grief Support</h1>
        <div className="text-xs text-slate-400 mb-6 bg-slate-100 rounded-lg p-3">AI-powered support, not professional therapy. Crisis? Call <strong>988</strong>.</div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px] flex flex-col">
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[400px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{m.text}</div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-slate-100 rounded-xl px-4 py-3 text-sm text-slate-400">...</div></div>}
          </div>
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Share what's on your mind..." className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
            <button onClick={send} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">404</div><h1 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h1><a href="/" className="text-blue-600 hover:underline">Go Home</a></div></div>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/will-builder" element={<Protected><WillBuilder /></Protected>} />
          <Route path="/vault" element={<Protected><Vault /></Protected>} />
          <Route path="/compliance" element={<Protected><Compliance /></Protected>} />
          <Route path="/grief" element={<Protected><Grief /></Protected>} />
          <Route path="/blockchain" element={<Protected><BlockchainPage /></Protected>} />
          <Route path="/videos" element={<Protected><VideoMessagesPage /></Protected>} />
          <Route path="/death-switch" element={<Protected><DeathSwitchPage /></Protected>} />
          <Route path="/password-vault" element={<Protected><PasswordVaultPage /></Protected>} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </Router>
    </AuthProvider>
  );
}
