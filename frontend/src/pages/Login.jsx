import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CrestPanel from '../components/CrestPanel.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden bg-paper shadow-lift ring-1 ring-line">
        <CrestPanel />

        <div className="p-8 sm:p-10">
          <h1 className="font-serif text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="text-sm text-taupe mt-1 mb-6">Sign in to your residence account</p>

          {error && (
            <div className="bg-blush-soft text-blush-ink text-sm rounded-xl px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-luxe block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field"
                placeholder="you@hostel.com"
              />
            </div>
            <div>
              <label className="label-luxe block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field"
                placeholder="••••••••"
              />
            </div>
            <button disabled={busy} className="btn-primary w-full">
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-taupe mt-5">
            New student?{' '}
            <Link to="/register" className="text-blush-ink hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
