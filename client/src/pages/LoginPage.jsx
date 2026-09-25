import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
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
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSubmitting(true);
    try {
      const data = await login(demoEmail, demoPassword);
      navigateRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">Access your Surplus-to-Shelter account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Remember me</span>
            </label>
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

        <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
          New to Surplus-to-Shelter?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Create an account
          </Link>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            ⚡ Quick Demo 1-Click Role Login
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoLogin('admin@surplustoshelter.org', 'password123')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/90 text-purple-900 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <span className="font-black block text-[11px]">🛡️ System Admin</span>
              <span className="text-[9px] text-purple-600 font-semibold block truncate">admin@surplustoshelter.org</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoLogin('fresh@goldenharvest.com', 'password123')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/90 text-amber-900 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <span className="font-black block text-[11px]">🍲 Food Donor</span>
              <span className="text-[9px] text-amber-600 font-semibold block truncate">fresh@goldenharvest.com</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoLogin('contact@annamkitchen.org', 'password123')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-900 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <span className="font-black block text-[11px]">🏢 Shelter / NGO</span>
              <span className="text-[9px] text-emerald-600 font-semibold block truncate">contact@annamkitchen.org</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemoLogin('vikas@drivervolunteer.org', 'password123')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/90 text-blue-900 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <span className="font-black block text-[11px]">🚚 Volunteer Driver</span>
              <span className="text-[9px] text-blue-600 font-semibold block truncate">vikas@drivervolunteer.org</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
