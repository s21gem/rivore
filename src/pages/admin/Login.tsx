import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const isDark = typeof window !== 'undefined' ? localStorage.getItem('rivore_admin_theme') === 'dark' : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuth(data.user, data.token);
        localStorage.setItem('token', data.token); // Explicit fallback
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background px-4 ${isDark ? 'dark' : ''}`}>
      <div className="bg-card p-10 md:p-16 w-full max-w-md border border-border">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-light text-primary mb-3 tracking-[0.2em] uppercase">Rivore</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-muted-foreground">Admin Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 mb-8 text-xs font-medium border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-border pb-3 text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="admin@rivore.com"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-border pb-3 text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex justify-center items-center mt-10"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
