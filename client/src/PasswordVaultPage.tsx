import { useState, useEffect } from 'react';
import { useAuth } from './App';

const API = import.meta.env.VITE_API_URL || 'https://nexteraestate.onrender.com';

const CATEGORIES = [
  { id: 'devices', label: 'Devices', icon: '💻', desc: 'Phones, computers, tablets' },
  { id: 'financial', label: 'Financial', icon: '🏦', desc: 'Banks, investments, crypto' },
  { id: 'email', label: 'Email & Accounts', icon: '📧', desc: 'Gmail, Outlook, iCloud' },
  { id: 'social', label: 'Social Media', icon: '📱', desc: 'Facebook, Instagram, Twitter' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '🔄', desc: 'Netflix, Spotify, Amazon' },
  { id: 'crypto', label: 'Crypto & Wallets', icon: '₿', desc: 'Bitcoin, Ethereum, wallets' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️', desc: 'Life, health, auto policies' },
  { id: 'other', label: 'Other', icon: '🔑', desc: 'Other accounts and access' },
];

export default function PasswordVaultPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showValue, setShowValue] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', category: 'devices', username: '', password: '', url: '', pin: '', notes: '', recovery_codes: '' });

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/password-vault`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) ? setEntries(d) : null).catch(() => {});
  }, [token]);

  const save = async () => {
    if (!form.title) return;
    try {
      const r = await fetch(`${API}/api/password-vault`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (d.id) { setEntries(prev => [d, ...prev]); setShowForm(false); setForm({ title: '', category: 'devices', username: '', password: '', url: '', pin: '', notes: '', recovery_codes: '' }); }
    } catch {}
  };

  const del = async (id: string) => {
    await fetch(`${API}/api/password-vault/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const filtered = activeCategory === 'all' ? entries : entries.filter(e => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="text-xl font-bold text-blue-400">NextEra Estate</a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
          <a href="/vault" className="hover:text-blue-400">Vault</a>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Password Vault</h1>
            <p className="text-slate-500">Securely store account credentials, device PINs, and access information for your heirs</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">+ Add Entry</button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
          <strong>🔒 Security Notice:</strong> This vault is encrypted and only released to your executor upon death switch activation. Never share your vault access with anyone.
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">New Vault Entry</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="iPhone, Gmail, Chase Bank..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username / Email</label>
                  <input value={form.username} onChange={e => setForm(p => ({...p, username: e.target.value}))} placeholder="john@email.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder="••••••••" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website / URL</label>
                  <input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} placeholder="https://chase.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PIN / Passcode</label>
                  <input value={form.pin} onChange={e => setForm(p => ({...p, pin: e.target.value}))} placeholder="Device PIN, card PIN..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recovery Codes / Security Questions</label>
                <textarea value={form.recovery_codes} onChange={e => setForm(p => ({...p, recovery_codes: e.target.value}))} placeholder="Backup codes, security question answers, seed phrases..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-h-[60px] resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Additional instructions for your heirs..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-h-[60px] resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={save} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Save Entry</button>
                <button onClick={() => setShowForm(false)} className="border border-slate-200 px-6 py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveCategory('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            All ({entries.length})
          </button>
          {CATEGORIES.map(c => {
            const count = entries.filter(e => e.category === c.id).length;
            if (count === 0) return null;
            return (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === c.id ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {c.icon} {c.label} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0
          ? <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <div className="text-5xl mb-4">🔑</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Entries Yet</h3>
              <p className="text-slate-400 text-sm mb-6">Store passwords, PINs, and account access information for your heirs.</p>
              <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">Add Your First Entry</button>
            </div>
          : <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(e => {
                const cat = CATEGORIES.find(c => c.id === e.category);
                return (
                  <div key={e.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-lg">{cat?.icon || '🔑'}</div>
                        <div>
                          <div className="font-semibold text-slate-800">{e.title}</div>
                          <div className="text-xs text-slate-400">{cat?.label}</div>
                        </div>
                      </div>
                      <button onClick={() => del(e.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                    </div>
                    <div className="space-y-2">
                      {e.username && <div className="text-xs bg-slate-50 rounded px-3 py-2"><span className="text-slate-400">Username: </span><span className="text-slate-700 font-mono">{e.username}</span></div>}
                      {e.password && (
                        <div className="text-xs bg-slate-50 rounded px-3 py-2 flex items-center justify-between">
                          <span><span className="text-slate-400">Password: </span><span className="text-slate-700 font-mono">{showValue === e.id + '_pw' ? e.password : '••••••••'}</span></span>
                          <button onClick={() => setShowValue(showValue === e.id + '_pw' ? null : e.id + '_pw')} className="text-blue-500 text-xs ml-2">{showValue === e.id + '_pw' ? 'Hide' : 'Show'}</button>
                        </div>
                      )}
                      {e.pin && (
                        <div className="text-xs bg-slate-50 rounded px-3 py-2 flex items-center justify-between">
                          <span><span className="text-slate-400">PIN: </span><span className="text-slate-700 font-mono">{showValue === e.id + '_pin' ? e.pin : '••••'}</span></span>
                          <button onClick={() => setShowValue(showValue === e.id + '_pin' ? null : e.id + '_pin')} className="text-blue-500 text-xs ml-2">{showValue === e.id + '_pin' ? 'Hide' : 'Show'}</button>
                        </div>
                      )}
                      {e.url && <div className="text-xs bg-slate-50 rounded px-3 py-2"><span className="text-slate-400">URL: </span><a href={e.url} target="_blank" className="text-blue-600 hover:underline">{e.url}</a></div>}
                      {e.notes && <div className="text-xs bg-slate-50 rounded px-3 py-2"><span className="text-slate-400">Notes: </span><span className="text-slate-600">{e.notes}</span></div>}
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}
