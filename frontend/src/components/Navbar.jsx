import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-paper/90 backdrop-blur border-b border-line sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-blush grid place-items-center text-ink">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
          <span className="font-serif text-lg font-semibold text-ink">Hostel Complaints</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/track" className="text-taupe hover:text-ink transition-colors">
            Track Complaint
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="text-taupe hover:text-ink transition-colors">
                My Profile
              </Link>
              <span className="hidden sm:inline label-luxe">
                {user.name} · {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-blush-btn hover:bg-blush text-white px-4 py-1.5 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-taupe hover:text-ink transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-blush-btn hover:bg-blush text-white px-4 py-1.5 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
