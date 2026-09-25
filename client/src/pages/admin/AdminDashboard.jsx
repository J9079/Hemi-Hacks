import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import RescueMap from '../../components/maps/RescueMap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  HeartHandshake,
  Truck,
  Building2,
  Clock,
  Sparkles,
  AlertTriangle,
  Leaf,
  CheckCircle2,
  MapPin
} from 'lucide-react';

const CATEGORY_COLORS = ['#059669', '#2563eb', '#d97706', '#9333ea', '#06b6d4', '#e11d48'];

export default function AdminDashboard() {
  const { liveEvent } = useSocket();

  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    matchedDonations: 0,
    completedDeliveries: 0,
    expiredDonations: 0,
    totalFoodRescuedKg: 0,
    totalMealsRescued: 0,
    totalCo2eAvoidedKg: 0,
    totalDonors: 0,
    totalNGOs: 0,
    totalDrivers: 0,
    completionRate: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setStats(res.data.stats);
        setCategoryData(res.data.categoryBreakdown || []);
        setTimelineData(res.data.rescuedTimeline || []);
        setRecentDeliveries(res.data.recentDeliveries || []);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [liveEvent]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent p-6 rounded-3xl border border-purple-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Admin Command & Impact Center</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            System-wide logistics observability, real-time dispatch monitoring, and environmental impact audits.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-Time Mesh Connected</span>
        </div>
      </div>

      {/* Top 6 Impact KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Meals Rescued</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">
            {stats.totalMealsRescued}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Nutritional relief</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Food Diverted</span>
          <span className="text-2xl font-black text-teal-600 block mt-1">
            {stats.totalFoodRescuedKg} <span className="text-xs font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">Diverted from landfill</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">CO2e Avoided</span>
          <span className="text-2xl font-black text-indigo-600 block mt-1">
            {stats.totalCo2eAvoidedKg} <span className="text-xs font-normal text-slate-400">kg</span>
          </span>
          <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">Emissions mitigated</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Active Rescues</span>
          <span className="text-2xl font-black text-amber-600 block mt-1">
            {stats.activeDonations}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">In dispatch pipeline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Success Rate</span>
          <span className="text-2xl font-black text-blue-600 block mt-1">
            {stats.completionRate}%
          </span>
          <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">Delivery completion</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Expired Rate</span>
          <span className="text-2xl font-black text-rose-600 block mt-1">
            {stats.expiredDonations}
          </span>
          <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">Unrescued items</span>
        </div>
      </div>

      {/* Network Scale Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200 flex items-center space-x-3">
          <div className="p-3 bg-white rounded-xl shadow-sm text-orange-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600">Food Donors</span>
            <span className="text-lg font-black text-orange-800 block">{stats.totalDonors} Enrolled</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex items-center space-x-3">
          <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600">Shelters & NGOs</span>
            <span className="text-lg font-black text-emerald-800 block">{stats.totalNGOs} Active</span>
          </div>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 flex items-center space-x-3">
          <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600">Volunteers & Drivers</span>
            <span className="text-lg font-black text-blue-800 block">{stats.totalDrivers} Fleet</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Rescued Over Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Rescued Food Trend (kg)</h3>
              <p className="text-[11px] text-slate-500">Historical daily weight diverted</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Awaiting historical delivery milestones...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="kgRescued" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donations by Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Donations by Food Category</h3>
              <p className="text-[11px] text-slate-500">Cooked food, produce, bakery, and dairy ratios</p>
            </div>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-xs text-slate-400">Loading categories...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fontSize={10}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Network Live Map */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Ajmer Metro Real-Time Logistics Grid</h3>
            <p className="text-xs text-slate-500">Live geographic tracking of donors, shelters, and drivers</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            Ajmer, Rajasthan (26.4499° N, 74.6399° E)
          </span>
        </div>

        <RescueMap height="400px" />
      </div>

      {/* Recent Deliveries Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Recent Dispatches & Audit Trail</h3>
          <p className="text-xs text-slate-500">Delivery verification records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Food Item</th>
                <th className="p-4">Donor (Origin)</th>
                <th className="p-4">Shelter (Destination)</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentDeliveries.map((del) => (
                <tr key={del._id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">
                    {del.donationId?.foodName || 'Surplus Meal'}
                  </td>
                  <td className="p-4">{del.donorId?.name || 'Restaurant'}</td>
                  <td className="p-4 font-semibold text-emerald-800">{del.ngoId?.name || 'Shelter'}</td>
                  <td className="p-4 text-blue-700">{del.driverId?.name || 'Volunteer'}</td>
                  <td className="p-4 font-mono">{del.distance} km</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      del.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {del.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Metric Methodology Note (Section 21 compliance) */}
      <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
        <span className="font-bold text-slate-700">Scientific Estimation Methodology:</span> Meals rescued are calculated based on standard FAO portion metrics (1 average meal = 0.42 kg edible food). Greenhouse gas savings are estimated using standard EPA WARM coefficients (approx. 2.5 kg CO2e emissions avoided per 1 kg of edible food diverted from anaerobic landfill decomposition). All values represent modeled empirical estimates.
      </div>
    </div>
  );
}
