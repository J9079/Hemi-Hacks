import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, quickSwitchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      // Navigate to role specific dashboard
      navigateRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateRole = (r) => {
    switch (r) {
      case 'DONOR':
        navigate('/donor');
        break;
      case 'NGO':
        navigate('/ngo');
        break;
      case 'DRIVER':
        navigate('/driver');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  const handleQuickLogin = async (roleName) => {
    setError('');
    const user = await quickSwitchRole(roleName);
    if (user) {
      navigateRole(user.role);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in to Surplus-to-Shelter</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time surplus food coordination & rescue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1-Click Quick Demo Switcher Buttons */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">Judge / Demo Quick Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('DONOR')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-400 text-slate-700 font-semibold hover:bg-orange-50 text-left transition-colors"
            >
              <span className="block font-bold text-orange-600">🍲 Donor</span>
              <span className="text-[10px] text-slate-400">Royal Spice</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('NGO')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 font-semibold hover:bg-emerald-50 text-left transition-colors"
            >
              <span className="block font-bold text-emerald-600">🏠 NGO</span>
              <span className="text-[10px] text-slate-400">Helping Hands</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('DRIVER')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-semibold hover:bg-blue-50 text-left transition-colors"
            >
              <span className="block font-bold text-blue-600">🛵 Driver</span>
              <span className="text-[10px] text-slate-400">Vikram Singh</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-400 text-slate-700 font-semibold hover:bg-purple-50 text-left transition-colors"
            >
              <span className="block font-bold text-purple-600">📊 Admin</span>
              <span className="text-[10px] text-slate-400">Ajmer Control</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
