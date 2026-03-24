import { useState, useEffect } from 'react';
import { useAuth } from './App';

const API = import.meta.env.VITE_API_URL || 'https://nexteraestate.onrender.com';

export default function DeathSwitchPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState({ enabled: false, inactivityPeriod: 90, lastCheckin: null as string | null });
  const [heirs, setHeirs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [heirForm, setHeirForm] = useState({ name: '', email: '', relationship: '', phone: '' });
  const [showHeirForm, setShowHeirForm] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/death-switch`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d) setSettings({ enabled: d.enabled || false, inactivityPeriod: d.inactivity_period || d.inactivityPeriod || 90, lastCheckin: d.last_checkin || d.lastCheckin || null }); }).catch(() => {});
    fetch(`${API}/api/death-switch/heirs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) ? setHeirs(d) : null).catch(() => {});
  }, [token]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/death-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: settings.enabled, inactivityPeriod: settings.inactivityPeriod })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const checkin = async () => {
    try {
      await fetch(`${API}/api/death-switch/checkin`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setSettings(p => ({ ...p, lastCheckin: new Date().toISOString() }));
      setCheckinDone(true);
      setTimeout(() => setCheckinDone(false), 3000);
    } catch {}
  };

  const addHeir = async () => {
    if (!heirForm.name || !heirForm.email) return;
    try {
      const r = await fetch(`${API}/api/death-switch/heirs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(heirForm)
      });
      const d = await r.json();
      if (d.id) { setHeirs(prev => [...prev, d]); setHeirForm({ name: '', email: '', relationship: '', phone: '' }); setShowHeirForm(false); }
    } catch {}
  };

  const removeHeir = async (id: string) => {
    await fetch(`${API}/api/death-switch/heirs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setHeirs(prev => prev.filter(h => h.id !== id));
  };

  const daysLeft = settings.lastCheckin
    ? settings.inactivityPeriod - Math.floor((Date.now() - new Date(settings.lastCheckin).getTime()) / (1000 * 60 * 60 * 24))
    : settings.inactivityPeriod;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="text-xl font-bold text-blue-400">NextEra Estate</a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
          <a href="/vault" className="hover:text-blue-400">Vault</a>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Death Switch</h1>
        <p className="text-slate-500 mb-8">Automatically notify your heirs and release your estate documents if you become inactive.</p>

        {/* Status Banner */}
        <div className={`rounded-2xl p-6 mb-8 flex items-center justify-between ${settings.enabled ? 'bg-green-50 border border-green-200' : 'bg-slate-100 border border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${settings.enabled ? 'bg-green-500' : 'bg-slate-400'}`}>
              {settings.enabled ? '🛡️' : '⭕'}
            </div>
            <div>
              <div className={`font-bold text-lg ${settings.enabled ? 'text-green-800' : 'text-slate-600'}`}>
                Death Switch is {settings.enabled ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="text-sm text-slate-500">
                {settings.enabled
                  ? `Will trigger after ${settings.inactivityPeriod} days of inactivity • ${daysLeft > 0 ? daysLeft + ' days remaining' : 'OVERDUE - check in now'}`
                  : 'Enable to protect your estate'}
              </div>
            </div>
          </div>
          {settings.enabled && (
            <button onClick={checkin} className={`px-5 py-2 rounded-xl font-semibold text-sm transition-colors ${checkinDone ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {checkinDone ? '✅ Checked In!' : '👋 I\'m Alive'}
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-5">Settings</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-700">Enable Death Switch</div>
                  <div className="text-xs text-slate-400">Monitor your activity and notify heirs</div>
                </div>
                <button
                  onClick={() => setSettings(p => ({ ...p, enabled: !p.enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Inactivity Period</label>
                <select value={settings.inactivityPeriod} onChange={e => setSettings(p => ({ ...p, inactivityPeriod: parseInt(e.target.value) }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days (recommended)</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>
              {settings.lastCheckin && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <span className="text-slate-500">Last check-in: </span>
                  <span className="font-medium text-slate-700">{new Date(settings.lastCheckin).toLocaleDateString()}</span>
                </div>
              )}
              <button onClick={save} disabled={saving} className={`w-full py-2 rounded-xl font-semibold text-sm transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-50`}>
                {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-5">How It Works</h2>
            <div className="space-y-4">
              {[
                { step: '1', icon: '👋', title: 'Regular Check-ins', desc: 'Log in to reset your inactivity timer automatically' },
                { step: '2', icon: '⚠️', title: 'Warning Emails', desc: 'Receive email warnings before the timer expires' },
                { step: '3', icon: '📧', title: 'Heir Notification', desc: 'Your heirs receive notification emails with instructions' },
                { step: '4', icon: '📄', title: 'Document Release', desc: 'Designated documents are released to your executor' },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                  <div><div className="text-sm font-medium text-slate-700">{s.icon} {s.title}</div><div className="text-xs text-slate-400">{s.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heir Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800">Heir Notification List</h2>
              <p className="text-sm text-slate-500">People who will be notified when the death switch triggers</p>
            </div>
            <button onClick={() => setShowHeirForm(!showHeirForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ Add Heir</button>
          </div>

          {showHeirForm && (
            <div className="bg-slate-50 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'Jane Smith' },
                { label: 'Email', key: 'email', placeholder: 'jane@email.com' },
                { label: 'Relationship', key: 'relationship', placeholder: 'Spouse, Child, Executor...' },
                { label: 'Phone', key: 'phone', placeholder: '(205) 555-0100' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                  <input value={(heirForm as any)[f.key]} onChange={e => setHeirForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              ))}
              <div className="col-span-2 flex gap-3">
                <button onClick={addHeir} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">Add Heir</button>
                <button onClick={() => setShowHeirForm(false)} className="border border-slate-200 px-5 py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          )}

          {heirs.length === 0
            ? <div className="text-center py-8 text-slate-400"><div className="text-3xl mb-2">👥</div><p className="text-sm">No heirs added yet. Add people to notify when the death switch triggers.</p></div>
            : <div className="space-y-3">
                {heirs.map(h => (
                  <div key={h.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">{h.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{h.name}</div>
                        <div className="text-xs text-slate-400">{h.email} • {h.relationship}</div>
                      </div>
                    </div>
                    <button onClick={() => removeHeir(h.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
