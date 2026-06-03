import { useState } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Track() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    try {
      const res = await api.get(`/complaints/track/${encodeURIComponent(code.trim())}`);
      setResult(res.data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Lookup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-4">
      <div className="text-center mb-6">
        <p className="label-luxe">Hostel Services</p>
        <h1 className="font-serif text-3xl font-semibold text-ink">Track a Complaint</h1>
        <p className="text-sm text-taupe mt-1">Enter your complaint ID to see the latest status.</p>
      </div>

      <form onSubmit={submit} className="flex gap-2 mb-6">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. HCMS-AB12CD34"
          required
          className="field flex-1"
        />
        <button disabled={busy} className="btn-primary px-6">
          {busy ? '…' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="bg-rose-soft text-rose-ink text-sm rounded-xl px-3 py-2">{error}</div>
      )}

      {result && (
        <div className="bg-paper rounded-3xl ring-1 ring-line shadow-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-sand">{result.complaint_code}</span>
            <StatusBadge status={result.status} />
          </div>
          <h2 className="font-serif text-xl text-ink">{result.title}</h2>
          <p className="text-taupe text-sm">{result.description}</p>
          <dl className="grid grid-cols-2 gap-y-2 text-sm pt-3 border-t border-line">
            <dt className="label-luxe">Category</dt>
            <dd className="capitalize text-ink">{result.category}</dd>
            <dt className="label-luxe">Submitted by</dt>
            <dd className="text-ink">{result.student_name}</dd>
            <dt className="label-luxe">Assigned staff</dt>
            <dd className="text-ink">{result.staff_name || 'Not yet assigned'}</dd>
            <dt className="label-luxe">Created</dt>
            <dd className="text-ink">{new Date(result.created_at).toLocaleString()}</dd>
            <dt className="label-luxe">Last update</dt>
            <dd className="text-ink">{new Date(result.updated_at).toLocaleString()}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
