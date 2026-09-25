import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import ExpiryBadge from '../../components/common/ExpiryBadge';
import MatchBreakdownModal from '../../components/common/MatchBreakdownModal';
import {
  Building2,
  Database,
  Utensils,
  Check,
  X,
  Clock,
  Compass,
  Award,
  Truck,
  AlertCircle,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function NgoDashboard() {
  const { liveEvent } = useSocket();

  const [stats, setStats] = useState({
    totalCapacity: 0,
    availableCapacity: 0,
    incomingMealsToday: 0,
    totalReceivedMeals: 0
  });
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonationForBreakdown, setSelectedDonationForBreakdown] = useState(null);

  // Capacity adjustment modal
  const [showCapModal, setShowCapModal] = useState(false);
  const [newCap, setNewCap] = useState(0);
  const [newAvail, setNewAvail] = useState(0);
  const [updatingCap, setUpdatingCap] = useState(false);

  const fetchNgoData = async () => {
    try {
      const res = await api.get('/dashboard/ngo');
      if (res.data.success) {
        setStats(res.data.stats);
        setProfile(res.data.ngoProfile);
        setDonations(res.data.donations || []);
        if (res.data.ngoProfile) {
          setNewCap(res.data.ngoProfile.capacity);
          setNewAvail(res.data.ngoProfile.availableCapacity);
        }
      }
    } catch (err) {
      console.error('Failed to load NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, [liveEvent]);

  const handleAccept = async (donationId) => {
    try {
      await api.post(`/ngos/donations/${donationId}/accept`);
      fetchNgoData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept donation.');
    }
  };

  const handleReject = async (donationId) => {
    const reason = prompt('Please specify reason for rejecting (e.g. storage full, dietary mismatch):');
    if (reason === null) return;
    try {
      await api.post(`/ngos/donations/${donationId}/reject`, { reason });
      fetchNgoData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject donation.');
    }
  };

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    setUpdatingCap(true);
    try {
      await api.put(`/ngos/${profile._id}/capacity`, {
        capacity: newCap,
        availableCapacity: newAvail
      });
      setShowCapModal(false);
      fetchNgoData();
    } catch (err) {
      alert('Failed to update capacity.');
    } finally {
      setUpdatingCap(false);
    }
  };

  const incomingDonations = donations.filter(d => ['POSTED', 'MATCHED'].includes(d.status));
  const activeDeliveries = donations.filter(d => ['DRIVER_ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status));
  const completedDeliveries = donations.filter(d => d.status === 'DELIVERED');

  const capacityPercentage = stats.totalCapacity > 0
    ? Math.round(((stats.totalCapacity - stats.availableCapacity) / stats.totalCapacity) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-3xl border border-emerald-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              {profile?.organizationName || 'Shelter & Food Bank Command'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Accept matching surplus food, manage intake capacity, and monitor incoming dispatches in Ajmer.
          </p>
        </div>

        <button
          onClick={() => setShowCapModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm"
        >
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>Adjust Shelter Capacity</span>
        </button>
      </div>

      {/* Capacity & Needs KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capacity Meter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-semibold">Available Intake</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.availableCapacity} / {stats.totalCapacity} meals
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-2">
            {stats.availableCapacity} <span className="text-sm font-bold text-slate-400">meals free</span>
          </span>
          {/* Capacity Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-500 ${
                capacityPercentage > 85 ? 'bg-red-500' : capacityPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 block">{capacityPercentage}% filled capacity</span>
        </div>

        {/* Today's Incoming Meals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Incoming Meals Today</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 block mt-1">
            {stats.incomingMealsToday} <span className="text-sm font-bold text-slate-400">meals</span>
          </span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {activeDeliveries.length} dispatches on route
          </span>
        </div>

        {/* Current Requirement Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Current Urgency Need</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 block mt-1">
            {profile?.currentNeeds || 'High'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Matching engine prioritized</span>
        </div>

        {/* Lifetime Meals Received */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Meals Rescued</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 block mt-1">
            {stats.totalReceivedMeals}
          </span>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">Distributed to beneficiaries</span>
        </div>
      </div>

      {/* Section 1: Incoming Food Rescue Matching Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Incoming Surplus Rescue Matches</h3>
            <p className="text-xs text-slate-500">
              Surplus food scored by the matching engine for your shelter based on proximity and compatibility.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {incomingDonations.length} Pending Actions
          </span>
        </div>

        {incomingDonations.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            No pending incoming food matches currently waiting for acceptance.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingDonations.map((d) => (
              <div
                key={d._id}
                className="bg-white p-6 rounded-3xl border border-emerald-300 shadow-md shadow-emerald-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                        {d.category}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">{d.foodName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{d.donorId?.name || 'Restaurant Donor'}</p>
                    </div>
                    <ExpiryBadge usableUntil={d.usableUntil} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-semibold block">Quantity</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {d.quantity} {d.unit}
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-800 font-semibold block">Match Score</span>
                        <span className="font-extrabold text-emerald-700 text-sm">89.5 / 100</span>
                      </div>
                      <button
                        onClick={() => setSelectedDonationForBreakdown(d._id)}
                        className="text-[10px] text-emerald-600 underline font-semibold"
                      >
                        Breakdown
                      </button>
                    </div>
                  </div>

                  {d.foodSafetyInfo && (
                    <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{d.foodSafetyInfo}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center space-x-3">
                  <button
                    onClick={() => handleAccept(d._id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center space-x-1 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>ACCEPT SURPLUS</span>
                  </button>

                  <button
                    onClick={() => handleReject(d._id)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span>REJECT</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Incoming Deliveries (On Road) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-lg font-black text-slate-900">En Route Dispatches</h3>
        {activeDeliveries.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No drivers actively in transit to your shelter at this moment.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {activeDeliveries.map((d) => (
                <div key={d._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{d.foodName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {d.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {d.quantity} {d.unit} • Donor: {d.donorId?.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-700">
                      Driver: {d.assignedDriverId?.name || 'Assigned Driver'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Capacity Adjustment Modal */}
      {showCapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-1">Adjust Shelter Capacity</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update real-time available capacity to guide the matching engine.
            </p>

            <form onSubmit={handleUpdateCapacity} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Capacity (Meals)</label>
                <input
                  type="number"
                  min={0}
                  value={newCap}
                  onChange={(e) => setNewCap(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Available Intake Free (Meals)</label>
                <input
                  type="number"
                  min={0}
                  value={newAvail}
                  onChange={(e) => setNewAvail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCapModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingCap}
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  {updatingCap ? 'Saving...' : 'Save Capacity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match breakdown modal */}
      {selectedDonationForBreakdown && (
        <MatchBreakdownModal
          donationId={selectedDonationForBreakdown}
          isOpen={!!selectedDonationForBreakdown}
          onClose={() => setSelectedDonationForBreakdown(null)}
        />
      )}
    </div>
  );
}
