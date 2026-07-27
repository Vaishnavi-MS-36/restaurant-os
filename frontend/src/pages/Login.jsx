import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-terracotta-400 font-semibold">RestaurantOS</h1>
          <p className="text-cream/50 text-sm mt-2">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-cream/70 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream placeholder-cream/30 focus:outline-none focus:border-terracotta-500 transition-colors"
              placeholder="owner@restaurantos.com"
            />
          </div>

          <div>
            <label className="block text-sm text-cream/70 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream placeholder-cream/30 focus:outline-none focus:border-terracotta-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
