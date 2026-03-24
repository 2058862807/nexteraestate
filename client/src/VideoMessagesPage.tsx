import { useState, useEffect, useRef } from 'react';
import { useAuth } from './App';

const API = import.meta.env.VITE_API_URL || 'https://nexteraestate.onrender.com';

export default function VideoMessagesPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', recipient: '', trigger: 'death', message: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/videos`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) ? setVideos(d) : null).catch(() => {});
  }, [token]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', form.title || file.name);
    formData.append('recipient', form.recipient);
    formData.append('trigger', form.trigger);
    formData.append('message', form.message);
    try {
      const r = await fetch(`${API}/api/videos`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const d = await r.json();
      if (d.id) { setVideos(prev => [d, ...prev]); setShowForm(false); setForm({ title: '', recipient: '', trigger: 'death', message: '' }); }
    } catch {}
    setUploading(false);
  };

  const del = async (id: string) => {
    await fetch(`${API}/api/videos/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const triggers = [
    { value: 'death', label: '💀 Upon Death', desc: 'Released when death switch activates' },
    { value: 'birthday', label: '🎂 Birthday', desc: 'Released on recipient\'s birthday' },
    { value: 'anniversary', label: '💍 Anniversary', desc: 'Released on a specific anniversary' },
    { value: 'graduation', label: '🎓 Graduation', desc: 'Released upon graduation' },
    { value: 'wedding', label: '💒 Wedding', desc: 'Released upon marriage' },
    { value: 'manual', label: '🔓 Manual Release', desc: 'Released by executor' },
  ];

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Video Messages</h1>
            <p className="text-slate-500">Record personal messages to be delivered to loved ones at the right moment</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">+ Add Message</button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">New Video Message</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Message to Sarah on her wedding day" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient</label>
                <input value={form.recipient} onChange={e => setForm(p => ({...p, recipient: e.target.value}))} placeholder="Sarah Smith - sarah@email.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Trigger Event</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {triggers.map(t => (
                    <label key={t.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.trigger === t.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                      <input type="radio" name="trigger" value={t.value} checked={form.trigger === t.value} onChange={() => setForm(p => ({...p, trigger: t.value}))} className="mt-0.5" />
                      <div><div className="text-sm font-medium text-slate-800">{t.label}</div><div className="text-xs text-slate-400">{t.desc}</div></div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Accompanying Message (optional)</label>
                <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} placeholder="A written note to accompany the video..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-h-[80px] resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Video</label>
                <label className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">{uploading ? '⏳' : '🎥'}</div>
                    <div className="text-sm text-slate-600">{uploading ? 'Uploading...' : 'Click to upload video'}</div>
                    <div className="text-xs text-slate-400 mt-1">MP4, MOV, AVI up to 500MB</div>
                  </div>
                  <input type="file" accept="video/*" className="hidden" onChange={upload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '📹', label: 'Total Messages', value: videos.length, color: 'bg-blue-500' },
            { icon: '📬', label: 'Pending Delivery', value: videos.filter(v => v.status !== 'delivered').length, color: 'bg-amber-500' },
            { icon: '✅', label: 'Delivered', value: videos.filter(v => v.status === 'delivered').length, color: 'bg-green-500' },
          ].map(s => (
            <div key={s.label} className={`${s.color} text-white rounded-xl p-5 text-center`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {videos.length === 0
          ? <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <div className="text-5xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Video Messages Yet</h3>
              <p className="text-slate-400 text-sm mb-6">Record personal messages for your loved ones to receive at meaningful moments.</p>
              <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">Create Your First Message</button>
            </div>
          : <div className="grid md:grid-cols-2 gap-4">
              {videos.map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">🎥</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${v.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{v.status || 'pending'}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{v.title || v.file_name}</h3>
                  <p className="text-sm text-slate-500 mb-2">To: {v.recipient || 'Not specified'}</p>
                  <p className="text-xs text-slate-400 mb-4">Trigger: {triggers.find(t => t.value === v.trigger)?.label || v.trigger || 'Upon death'}</p>
                  <button onClick={() => del(v.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
