import { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge.jsx';

const CATEGORIES = ['electricity', 'water', 'internet', 'maintenance', 'food'];

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ category: 'electricity', title: '', description: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await api.get('/complaints/mine');
    setComplaints(res.data.complaints);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage(null);
    setBusy(true);
    try {
      const res = await api.post('/complaints', form);
      setMessage(res.data.complaint.complaint_code);
      setForm({ category: 'electricity', title: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <section className="bg-paper rounded-3xl ring-1 ring-line shadow-card p-6">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-1">Submit a Complaint</h1>
        <p className="text-sm text-taupe mb-5">We’ll route it to the right team for you.</p>

        {message && (
          <div className="bg-blush-soft text-blush-ink text-sm rounded-xl px-3 py-3 mb-4">
            Submitted! Your complaint ID is{' '}
            <span className="font-mono font-semibold tracking-wide">{message}</span>. Save it to
            track status.
          </div>
        )}
        {error && (
          <div className="bg-rose-soft text-rose-ink text-sm rounded-xl px-3 py-2 mb-4">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-luxe block mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="field capitalize"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-luxe block mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="field"
              placeholder="Short summary"
            />
          </div>
          <div>
            <label className="label-luxe block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              className="field"
              placeholder="Describe the issue in detail"
            />
          </div>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink mb-5">My Complaints</h2>
        {complaints.length === 0 ? (
          <div className="bg-paper rounded-3xl ring-1 ring-line p-8 text-center text-taupe">
            You haven’t submitted any complaints yet.
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl ring-1 ring-line p-4 shadow-soft">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-sand">{c.complaint_code}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="font-serif text-lg text-ink">{c.title}</h3>
                <p className="text-sm text-taupe mt-1">{c.description}</p>
                <div className="text-[11px] text-sand mt-3 flex flex-wrap gap-x-4">
                  <span className="capitalize">Category: {c.category}</span>
                  <span>Staff: {c.staff_name || 'Unassigned'}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
