import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const ROLE_LABEL = {
  student: 'Student Profile',
  admin: 'Administrator Profile',
  staff: 'Staff Profile',
};

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const isStudent = user?.role === 'student';

  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', room_number: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await api.get('/auth/me');
      setProfile(me.data.user);
      setForm({
        name: me.data.user.name || '',
        email: me.data.user.email || '',
        phone: me.data.user.phone || '',
        room_number: me.data.user.room_number || '',
      });
      // Only students have their own complaints.
      if (me.data.user.role === 'student') {
        const mine = await api.get('/complaints/mine');
        setComplaints(mine.data.complaints);
      }
    })();
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    try {
      const updated = await updateProfile(form);
      setProfile((p) => ({ ...p, ...updated }));
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (!profile) {
    return <div className="p-10 text-center font-serif text-taupe">Loading…</div>;
  }

  const initials = (profile.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const detailsCard = (
    <section className="bg-paper rounded-3xl ring-1 ring-line shadow-card p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blush grid place-items-center text-ink font-serif text-2xl">
          {initials}
        </div>
        <div>
          <p className="label-luxe">{ROLE_LABEL[profile.role] || 'Profile'}</p>
          <h1 className="font-serif text-2xl font-semibold text-ink leading-tight">{profile.name}</h1>
          <p className="text-sm text-taupe">{profile.email}</p>
        </div>
      </div>

      {message && (
        <div className="bg-rose-soft text-rose-ink text-sm rounded-xl px-3 py-2 mb-4">{message}</div>
      )}
      {error && (
        <div className="bg-blush-soft text-blush-ink text-sm rounded-xl px-3 py-2 mb-4">{error}</div>
      )}

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="label-luxe block mb-1">Name</label>
          <input value={form.name} onChange={update('name')} required className="field" />
        </div>
        <div>
          <label className="label-luxe block mb-1">
            Email{' '}
            <span className="text-sand normal-case tracking-normal">· current: {profile.email}</span>
          </label>
          <input type="email" value={form.email} onChange={update('email')} required className="field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isStudent && (
            <div>
              <label className="label-luxe block mb-1">Room No.</label>
              <input value={form.room_number} onChange={update('room_number')} className="field" />
            </div>
          )}
          <div className={isStudent ? '' : 'col-span-2'}>
            <label className="label-luxe block mb-1">Phone</label>
            <input value={form.phone} onChange={update('phone')} className="field" />
          </div>
        </div>
        <button disabled={busy} className="btn-primary w-full">
          {busy ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </section>
  );

  // Admin & staff: just the details card, centered.
  if (!isStudent) {
    return <div className="max-w-xl mx-auto">{detailsCard}</div>;
  }

  // Students: details + their complaints with assigned staff contact.
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {detailsCard}

      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-serif text-2xl font-semibold text-ink">My Complaints</h2>
          <span className="label-luxe">{complaints.length} total</span>
        </div>

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
                <div className="text-[11px] text-sand mt-1 capitalize">Category: {c.category}</div>

                <div className="mt-3 border-t border-line2 pt-3 flex items-center justify-between">
                  <div>
                    <p className="label-luxe">Assigned staff</p>
                    <p className="text-sm text-ink">{c.staff_name || 'Not yet assigned'}</p>
                  </div>
                  {c.staff_name && (
                    <div className="text-right">
                      <p className="label-luxe">Contact</p>
                      <p className="text-sm text-blush-ink font-medium">{c.staff_phone || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
