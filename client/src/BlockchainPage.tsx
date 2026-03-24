import { useState, useEffect } from 'react';
import { useAuth } from './App';

const API = import.meta.env.VITE_API_URL || 'https://nexteraestate.onrender.com';

export default function BlockchainPage() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [hash, setHash] = useState('');
  const [notarizations, setNotarizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/blockchain/notarizations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => Array.isArray(d) ? setNotarizations(d) : null).catch(() => {});
  }, [token]);

  const hashText = async () => {
    if (!textContent.trim()) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(textContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHash(hashHex);
  };

  const hashFile = async (f: File) => {
    const buffer = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHash(hashHex);
    setFile(f);
  };

  const notarize = async () => {
    if (!hash) return;
    setLoading(true);
    setStatus('Submitting to Polygon blockchain...');
    try {
      const r = await fetch(`${API}/api/blockchain/notarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hash, fileName: file?.name || 'Text Content', fileSize: file?.size || textContent.length })
      });
      const d = await r.json();
      if (d.id) {
        setNotarizations(prev => [d, ...prev]);
        setStatus('✅ Successfully notarized on Polygon blockchain!');
        setHash('');
        setTextContent('');
        setFile(null);
      } else {
        setStatus('❌ Notarization failed. Please try again.');
      }
    } catch {
      setStatus('❌ Error connecting to blockchain service.');
    }
    setLoading(false);
  };

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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Blockchain Notarization</h1>
        <p className="text-slate-500 mb-8">Create tamper-proof, timestamped verification of your documents on the Polygon blockchain.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { icon: '🔐', title: 'Tamper-Proof', desc: 'Once recorded, document hashes cannot be altered' },
            { icon: '⏱️', title: 'Timestamped', desc: 'Permanent proof of when your document existed' },
            { icon: '🌐', title: 'Polygon Network', desc: 'Low-cost, fast blockchain verification' },
            { icon: '✅', title: 'Legally Recognized', desc: 'Blockchain timestamps are admissible as evidence' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4">
              <span className="text-2xl">{f.icon}</span>
              <div><div className="font-semibold text-slate-800 text-sm">{f.title}</div><div className="text-xs text-slate-500 mt-1">{f.desc}</div></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Generate Document Hash</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload File</label>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-sm text-slate-600">{file ? file.name : 'Click to upload or drag and drop'}</div>
                  <div className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, JPG, PNG up to 100MB</div>
                </div>
                <input type="file" className="hidden" onChange={e => e.target.files?.[0] && hashFile(e.target.files[0])} />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-sm text-slate-400">or hash text content</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Text Content</label>
              <textarea value={textContent} onChange={e => setTextContent(e.target.value)} placeholder="Enter text to hash..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-h-[80px] resize-none" />
              <button onClick={hashText} disabled={!textContent.trim()} className="mt-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-600 disabled:opacity-40">Hash Text</button>
            </div>
            {hash && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">SHA-256 Hash:</div>
                <div className="font-mono text-xs text-slate-800 break-all bg-white rounded border border-slate-200 p-3">{hash}</div>
                <button onClick={notarize} disabled={loading} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? '⏳ Submitting to Blockchain...' : '🔗 Notarize on Polygon'}
                </button>
                {status && <div className={`mt-3 text-sm text-center ${status.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{status}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Notarization History</h2>
          {notarizations.length === 0
            ? <p className="text-slate-400 text-sm text-center py-8">No notarizations yet.</p>
            : <div className="space-y-3">
                {notarizations.map(n => (
                  <div key={n.id} className="bg-slate-50 rounded-xl p-4 flex items-start justify-between">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{n.file_name || n.fileName || 'Document'}</div>
                      <div className="font-mono text-xs text-slate-400 mt-1 break-all">{n.hash?.substring(0, 42)}...</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(n.created_at || n.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${n.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {n.status || 'pending'}
                    </span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
