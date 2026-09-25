import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import ExpiryBadge from '../../components/common/ExpiryBadge';
import MatchBreakdownModal from '../../components/common/MatchBreakdownModal';
import {
  UtensilsCrossed,
  PlusCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Eye,
  AlertCircle,
  Truck,
  Edit2,
  Trash2,
  Search,
  Filter,
  X
} from 'lucide-react';

export default function DonorDashboard() {
  const { liveEvent } = useSocket();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    foodRescuedKg: 0,
    mealsRescued: 0,
    completedPickups: 0
  });
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonationForBreakdown, setSelectedDonationForBreakdown] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Delete confirmation modal state
  const [donationToDelete, setDonationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/donor');
      if (res.data.success) {
        setStats(res.data.stats || {});
        setDonations(res.data.recentDonations || []);
      }
    } catch (err) {
      console.error('Failed to load donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [liveEvent]);

  const handleDelete = async () => {
    if (!donationToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/donations/${donationToDelete._id}`);
      if (res.data.success) {
        setDonationToDelete(null);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete donation.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'POSTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">POSTED</span>;
      case 'MATCHED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800">MATCHED</span>;
      case 'DRIVER_ASSIGNED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">DRIVER ASSIGNED</span>;
      case 'PICKUP_STARTED':
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">IN TRANSIT</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">DELIVERED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-200 text-slate-700">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Filtered donations
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.pickupAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-orange-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Food Donor Portal</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Dispatch surplus food instantly to nearby verified shelters.
          </p>
        </div>

        <Link
          to="/donor/post"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Post Surplus Food</span>
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Donations</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">
            {stats.totalDonations || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime posted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Active Rescues</span>
          <span className="text-2xl sm:text-3xl font-black text-orange-600 block mt-1">
            {stats.activeDonations || 0}
          </span>
          <span className="text-[11px] text-orange-500 font-medium mt-1 block">In matching / transit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Food Rescued</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 block mt-1">
            {stats.foodRescuedKg || 0} <span className="text-sm font-bold text-slate-400">kg</span>
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">~{stats.mealsRescued || 0} meals served</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Completed Deliveries</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 block mt-1">
            {stats.completedPickups || 0}
          </span>
          <span className="text-[11px] text-blue-500 font-medium mt-1 block">Safely delivered</span>
        </div>
      </div>

      {/* Donations List Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Surplus Food Donations</h3>
            <p className="text-xs text-slate-500">Live rescue routing pipeline and status management</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search food or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="POSTED">Posted</option>
              <option value="MATCHED">Matched</option>
              <option value="DRIVER_ASSIGNED">Driver Assigned</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading donations...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-bold text-sm">No donations match your filter.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Post fresh surplus food from your kitchen or banquet to connect with nearby shelters.
            </p>
            <Link
              to="/donor/post"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Post Surplus Food
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Food Item</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Usable Expiry</th>
                  <th className="py-3.5 px-4">Matched Shelter</th>
                  <th className="py-3.5 px-4">Assigned Driver</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDonations.map((d) => {
                  const isEditable = ['POSTED', 'MATCHED'].includes(d.status);

                  return (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{d.foodName}</div>
                        <span className="text-[10px] text-slate-400">{d.category}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {d.quantity} {d.unit}
                      </td>
                      <td className="py-4 px-4">
                        <ExpiryBadge usableUntil={d.usableUntil} />
                      </td>
                      <td className="py-4 px-4">
                        {d.matchedNgoId ? (
                          <div>
                            <span className="font-bold text-emerald-800">{d.matchedNgoId.name}</span>
                            <button
                              onClick={() => setSelectedDonationForBreakdown(d._id)}
                              className="block text-[10px] text-emerald-600 hover:underline mt-0.5"
                            >
                              View Match Score
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Searching shelter...</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {d.assignedDriverId ? (
                          <span className="font-semibold text-blue-700 flex items-center space-x-1">
                            <Truck className="w-3.5 h-3.5" />
                            <span>{d.assignedDriverId.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending assignment</span>
                        )}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(d.status)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Track Button */}
                          <button
                            onClick={() => navigate(`/donor/donation/${d._id}`)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center space-x-1 font-bold text-[11px] transition-colors"
                            title="View tracking"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Track</span>
                          </button>

                          {/* Edit Button (Allowed if not yet in transit) */}
                          {isEditable && (
                            <button
                              onClick={() => navigate(`/donor/edit/${d._id}`)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] transition-colors"
                              title="Edit listing"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Button (Allowed if not yet in transit) */}
                          {isEditable && (
                            <button
                              onClick={() => setDonationToDelete(d)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-[11px] transition-colors"
                              title="Delete donation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {donationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Delete Food Donation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{donationToDelete.foodName}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDonationToDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Keep Listing
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-200"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
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
