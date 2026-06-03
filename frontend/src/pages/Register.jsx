import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CrestPanel from '../components/CrestPanel.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    room_number: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden bg-paper shadow-lift ring-1 ring-line">
        <CrestPanel tagline="Join the residence and raise your first request in moments." />

        <div className="p-8 sm:p-10">
          <h1 className="font-serif text-2xl font-semibold text-ink">Create account</h1>
          <p className="text-sm text-taupe mt-1 mb-6">Register as a hostel student</p>

          {error && (
            <div className="bg-blush-soft text-blush-ink text-sm rounded-xl px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-luxe block mb-1">Full Name</label>
              <input value={form.name} onChange={update('name')} required className="field" />
            </div>
            <div>
              <label className="label-luxe block mb-1">Email</label>
              <input type="email" value={form.email} onChange={update('email')} required className="field" />
            </div>
            <div>
              <label className="label-luxe block mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
                className="field"
                placeholder="At least 6 characters"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-luxe block mb-1">Room No.</label>
                <input value={form.room_number} onChange={update('room_number')} className="field" />
              </div>
              <div>
                <label className="label-luxe block mb-1">Phone</label>
                <input value={form.phone} onChange={update('phone')} className="field" />
              </div>
            </div>
            <button disabled={busy} className="btn-primary w-full">
              {busy ? 'Creating…' : 'Register'}
            </button>
          </form>

          <p className="text-sm text-taupe mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blush-ink hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
