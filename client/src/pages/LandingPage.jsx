import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RescueMap from '../components/maps/RescueMap';
import {
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Users,
  UtensilsCrossed,
  Truck,
  Leaf
} from 'lucide-react';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMealsRescued: 0,
    totalDonations: 0,
    totalNGOs: 0,
    totalFoodRescuedKg: 0
  });

  useEffect(() => {
    // Load live public community metrics from database
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/public-stats');
        if (res.data?.success && res.data.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        // Retain 0 counts on initial blank deployment
      }
    };
    fetchStats();
  }, []);

  const handleAction = (targetRole, targetPath) => {
    if (isAuthenticated) {
      if (user?.role === targetRole || user?.role === 'ADMIN') {
        navigate(targetPath);
      } else {
        // Navigate to their role dashboard
        navigate(`/${user?.role?.toLowerCase() || ''}`);
      }
    } else {
      navigate(`/register?role=${targetRole}`);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Real-Time Food Rescue & Redistribution Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Turn Surplus Food Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Someone's Next Meal.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect surplus food from restaurants, hotels, caterers, and campus cafeterias with nearby shelters and rescue it before it goes to waste.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleAction('DONOR', '/donor/post')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 flex items-center space-x-2 transition-transform hover:-translate-y-0.5"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Donate Food Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleAction('NGO', '/ngo')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm flex items-center space-x-2 transition-transform hover:-translate-y-0.5"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Find Food Rescue</span>
            </button>

            <button
              onClick={() => handleAction('DRIVER', '/driver')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 flex items-center space-x-2 transition-transform hover:-translate-y-0.5"
            >
              <Truck className="w-4 h-4" />
              <span>Join as Volunteer</span>
            </button>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl text-white">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Live Measured Social Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">Real-Time Community Rescue Numbers</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">
                {stats.totalMealsRescued || 0}
              </span>
              <span className="text-xs text-slate-300 font-medium mt-1 block">Meals Rescued</span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
              <span className="text-3xl sm:text-4xl font-black text-teal-400 block">
                {stats.totalFoodRescuedKg || 0} kg
              </span>
              <span className="text-xs text-slate-300 font-medium mt-1 block">Food Diverted</span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 block">
                {stats.totalDonations || 0}
              </span>
              <span className="text-xs text-slate-300 font-medium mt-1 block">Total Rescues</span>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
              <span className="text-3xl sm:text-4xl font-black text-blue-400 block">
                {stats.totalNGOs || 0}
              </span>
              <span className="text-xs text-slate-300 font-medium mt-1 block">Partner Shelters</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 5-Step Lifecycle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            End-To-End Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How Surplus-to-Shelter Works</h2>
          <p className="text-sm text-slate-500 mt-2">
            Replacing slow phone calls and spreadsheets with algorithmic matching and live dispatch tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Donate</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Donors post surplus food with quantity, category, temperature info, and usable expiry time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-base mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Match</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-factor engine scores shelters by distance, capacity, urgency, and transit safety buffer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Pickup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Volunteer driver accepts nearby dispatch request and sees turnkey route navigation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Deliver</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified food hand-off at shelter; shelter capacity adjusts dynamically in real time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-base mb-4">
              5
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Impact</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated calculations compute meals fed and verified metric tonnes of CO2e avoided.
            </p>
          </div>
        </div>
      </section>

      {/* Ajmer Live Logistics Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Active Food Rescue Network: Ajmer, Rajasthan</h3>
              <p className="text-xs text-slate-500">
                Interactive real-time map displaying donors (orange), shelters (green), and volunteer drivers (blue).
              </p>
            </div>
            <Link
              to="/admin"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Explore Admin Map & Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <RescueMap height="380px" />
        </div>
      </section>
    </div>
  );
}
