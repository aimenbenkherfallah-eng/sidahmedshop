import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || t.admin.login.invalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link to="/" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-primary-700">
            S
          </Link>
          <h1 className="mt-4 text-xl font-extrabold text-white">{t.admin.login.title}</h1>
          <p className="text-sm text-primary-200">{t.admin.login.subtitle}</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">{error}</p>
          )}
          <div>
            <label className="label">{t.admin.login.username}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="label">{t.admin.login.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading || !username || !password} className="btn-primary w-full">
            {loading ? '...' : t.admin.login.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
