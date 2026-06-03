import { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge.jsx';

const STATUSES = ['Pending', 'In Progress', 'Resolved'];
const CATEGORIES = ['electricity', 'water', 'internet', 'maintenance', 'food'];

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-line p-4 shadow-soft">
      <p className="label-luxe">{label}</p>
      <p className={`font-serif text-3xl font-semibold ${color}`}>{value ?? 0}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: '', category: '' });

  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', phone: '' });
  const [staffMsg, setStaffMsg] = useState('');
  const [staffErr, setStaffErr] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    const [c, st, s] = await Promise.all([
      api.get('/admin/complaints', { params }),
      api.get('/admin/stats'),
      api.get('/admin/staff'),
    ]);
    setComplaints(c.data.complaints);
    setStats(st.data.stats);
    setStaff(s.data.staff);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const assign = async (id, staffId) => {
    if (!staffId) return;
    await api.put(`/admin/complaints/${id}/assign`, { staff_id: Number(staffId) });
    load();
  };

  const addStaff = async (e) => {
    e.preventDefault();
    setStaffMsg('');
    setStaffErr('');
    setAdding(true);
    try {
      await api.post('/admin/staff', newStaff);
      setNewStaff({ name: '', email: '', password: '', phone: '' });
      setStaffMsg(`${newStaff.name} added to the team.`);
      load();
    } catch (err) {
      setStaffErr(err.response?.data?.message || 'Could not add staff');
    } finally {
      setAdding(false);
    }
  };

  const removeStaff = async (s) => {
    const active = Number(s.active) || 0;
    const note = active
      ? `\n\n${s.name} has ${active} active complaint(s); they will be released back to unassigned.`
      : '';
    if (!window.confirm(`Remove ${s.name} from the team?${note}`)) return;
    await api.delete(`/admin/staff/${s.id}`);
    load();
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="label-luxe">Overview</p>
        <h1 className="font-serif text-3xl font-semibold text-ink">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} color="text-inkdeep" />
        <StatCard label="Pending" value={stats.pending} color="text-blush-ink" />
        <StatCard label="In Progress" value={stats.in_progress} color="text-caramel-ink" />
        <StatCard label="Resolved" value={stats.resolved} color="text-rose-ink" />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="field w-auto text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="field w-auto text-sm capitalize"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-paper rounded-3xl ring-1 ring-line shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left label-luxe border-b border-line">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Assign Staff</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-taupe">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="border-t border-line2">
                    <td className="px-5 py-3 font-mono text-[11px] text-sand">{c.complaint_code}</td>
                    <td className="px-5 py-3 text-ink">{c.title}</td>
                    <td className="px-5 py-3 capitalize text-taupe">{c.category}</td>
                    <td className="px-5 py-3 text-ink">{c.student_name}</td>
                    <td className="px-5 py-3 text-taupe">{c.room_number || '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3">
                      <select
                        value={c.assigned_staff_id || ''}
                        onChange={(e) => assign(c.id, e.target.value)}
                        className="field w-auto text-sm py-1.5"
                      >
                        <option value="">Unassigned</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Team & performance ---- */}
      <div>
        <p className="label-luxe">Team</p>
        <h2 className="font-serif text-2xl font-semibold text-ink">Staff &amp; Performance</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Staff list */}
        <div className="lg:col-span-2 bg-paper rounded-3xl ring-1 ring-line shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left label-luxe border-b border-line">
                  <th className="px-5 py-3 font-medium">Staff</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium text-center">Assigned</th>
                  <th className="px-5 py-3 font-medium text-center">Resolved</th>
                  <th className="px-5 py-3 font-medium text-center">Active</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-taupe">
                      No staff members yet. Add one on the right.
                    </td>
                  </tr>
                ) : (
                  staff.map((s) => (
                    <tr key={s.id} className="border-t border-line2">
                      <td className="px-5 py-3">
                        <p className="text-ink">{s.name}</p>
                        <p className="text-[11px] text-sand">{s.email}</p>
                      </td>
                      <td className="px-5 py-3 text-taupe">{s.phone || '—'}</td>
                      <td className="px-5 py-3 text-center text-ink">{s.total_assigned ?? 0}</td>
                      <td className="px-5 py-3 text-center text-rose-ink font-medium">{s.resolved ?? 0}</td>
                      <td className="px-5 py-3 text-center text-caramel-ink font-medium">{s.active ?? 0}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => removeStaff(s)}
                          className="text-xs rounded-full border border-blush text-blush-ink px-3 py-1 hover:bg-blush-soft transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add staff */}
        <div className="bg-paper rounded-3xl ring-1 ring-line shadow-card p-6">
          <h3 className="font-serif text-lg font-semibold text-ink mb-1">Add Staff Member</h3>
          <p className="text-sm text-taupe mb-4">They can sign in with these credentials.</p>

          {staffMsg && (
            <div className="bg-rose-soft text-rose-ink text-sm rounded-xl px-3 py-2 mb-3">{staffMsg}</div>
          )}
          {staffErr && (
            <div className="bg-blush-soft text-blush-ink text-sm rounded-xl px-3 py-2 mb-3">{staffErr}</div>
          )}

          <form onSubmit={addStaff} className="space-y-3">
            <div>
              <label className="label-luxe block mb-1">Name</label>
              <input
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                required
                className="field"
              />
            </div>
            <div>
              <label className="label-luxe block mb-1">Email</label>
              <input
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                required
                className="field"
              />
            </div>
            <div>
              <label className="label-luxe block mb-1">Password</label>
              <input
                type="password"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                required
                minLength={6}
                className="field"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="label-luxe block mb-1">Phone</label>
              <input
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                className="field"
              />
            </div>
            <button disabled={adding} className="btn-primary w-full">
              {adding ? 'Adding…' : 'Add Staff'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
