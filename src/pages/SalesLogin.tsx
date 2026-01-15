import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSalesAuth } from '../hooks/useSalesAuth';

const SalesLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useSalesAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    login(email, password)
      .then(({ error }) => {
        if (error) {
          setError(error.message || 'Unable to sign in');
        } else {
          navigate('/sales/dashboard');
        }
      })
      .catch((err) => setError(err.message || 'Login failed'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sales Partner Login</h1>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Use your sales credential to access pipeline dashboards, lead assignments, and campaign integration points.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@organization.com"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-emerald-600 to-blue-500 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-40"
          >
            {loading ? 'Signing in…' : 'Continue to Sales Dashboard'}
          </button>
        </form>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <p className="text-xs text-gray-500">
          Need access? Request a sales-enabled account by contacting&nbsp;
          <a className="font-semibold text-primary-600" href="mailto:sales-ops@quickbid.example.com">
            sales-ops@quickbid.example.com
          </a>
          .
        </p>
        <Link to="/sales/dashboard" className="text-sm font-semibold text-indigo-600">
          Go directly to the sales dashboard (demo only)
        </Link>
      </div>
    </div>
  );
};

export default SalesLogin;
