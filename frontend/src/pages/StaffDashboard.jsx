import { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge.jsx';

const STATUSES = ['Pending', 'In Progress', 'Resolved'];

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);

  const load = async () => {
    const res = await api.get('/staff/complaints');
    setComplaints(res.data.complaints);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/staff/complaints/${id}/status`, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label-luxe">Assigned to you</p>
        <h1 className="font-serif text-3xl font-semibold text-ink">Staff Dashboard</h1>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-paper rounded-3xl ring-1 ring-line p-8 text-center text-taupe">
          No complaints assigned yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl ring-1 ring-line p-5 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] text-sand">{c.complaint_code}</span>
                <StatusBadge status={c.status} />
              </div>
              <h3 className="font-serif text-lg text-ink">{c.title}</h3>
              <p className="text-sm text-taupe mt-1">{c.description}</p>
              <div className="text-[11px] text-sand mt-3 flex flex-wrap gap-x-4">
                <span className="capitalize">Category: {c.category}</span>
                <span>Student: {c.student_name}</span>
                <span>Room: {c.room_number || '—'}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-line2 pt-4">
                <label className="label-luxe">Update status</label>
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="field w-auto text-sm py-1.5"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
