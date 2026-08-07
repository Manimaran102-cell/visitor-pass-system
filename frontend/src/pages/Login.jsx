import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import InlineNotice from '../components/InlineNotice';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mist-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="badge-punch h-16 w-16 rounded-xl2 bg-brass-500 flex items-center justify-center shadow-card">
            <span className="font-mono text-sm font-bold text-ink-950">VP</span>
          </div>
          <h1 className="font-display text-2xl font-semibold mt-4 text-ink-900">Gatekeep</h1>
          <p className="text-sm text-ink-600 mt-1">Sign in to manage your front desk</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && <InlineNotice tone="error">{error}</InlineNotice>}

          <div>
            <label htmlFor="email" className="label-eyebrow block mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm focus:border-ink-700 outline-none"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="label-eyebrow block mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-mist-200 px-3.5 py-2.5 text-sm focus:border-ink-700 outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" variant="brass" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-xs text-ink-600 mt-6">
          Seed accounts: admin@company.com · receptionist@company.com · john.employee@company.com
        </p>
      </div>
    </div>
  );
};

export default Login;
