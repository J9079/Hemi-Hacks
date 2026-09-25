import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusTimeline from '../../components/common/StatusTimeline';
import ExpiryBadge from '../../components/common/ExpiryBadge';
import MatchBreakdownModal from '../../components/common/MatchBreakdownModal';
import RescueMap from '../../components/maps/RescueMap';
import {
  UtensilsCrossed,
  Building2,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  ChevronLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function DonationDetailPage() {
  const { id } = useParams();
  const { liveEvent } = useSocket();

  const [donation, setDonation] = useState(null);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/donations/${id}`);
      if (res.data.success) {
        setDonation(res.data.donation);
        setProfiles(res.data.profiles || {});
      }
    } catch (err) {
      console.error('Failed to load donation detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, liveEvent]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-slate-400 text-xs">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading donation rescue details...
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-slate-500">
        Donation not found.
      </div>
    );
  }

  // Build map markers
  const donorMarker = {
    latitude: donation.latitude,
    longitude: donation.longitude,
    name: donation.donorId?.name || 'Pickup Point',
    pickupAddress: donation.pickupAddress
  };

  const ngoMarker = profiles.ngo
    ? {
        latitude: profiles.ngo.latitude,
        longitude: profiles.ngo.longitude,
        organizationName: profiles.ngo.organizationName,
        address: profiles.ngo.address,
        availableCapacity: profiles.ngo.availableCapacity
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/donor"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Donations</span>
        </Link>
        <ExpiryBadge usableUntil={donation.usableUntil} />
      </div>

      {/* Main Status Progression Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Surplus Rescue Ref #{donation._id.slice(-6)}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">{donation.foodName}</h1>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-emerald-700">
              {donation.quantity} {donation.unit}
            </span>
            <span className="text-xs text-slate-400 block">{donation.category}</span>
          </div>
        </div>

        {/* 7-Step Lifecycle Timeline */}
        <StatusTimeline
          currentStatus={donation.status}
          statusHistory={donation.statusHistory}
        />
      </div>

      {/* 2-Column Details: Logistics Partners & Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Matched Shelter & Assigned Driver */}
        <div className="space-y-6">
          {/* Matched Shelter Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Matched Recipient Shelter</h3>
                  <p className="text-[11px] text-slate-400">Algorithmic Best-Fit Selection</p>
                </div>
              </div>

              <button
                onClick={() => setShowMatchModal(true)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-200 flex items-center space-x-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Why Chosen?</span>
              </button>
            </div>

            {donation.matchedNgoId ? (
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {profiles.ngo?.organizationName || donation.matchedNgoId.name}
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    {profiles.ngo?.address || donation.matchedNgoId.location?.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Available Capacity</span>
                    <span className="font-bold text-emerald-700 text-xs">
                      {profiles.ngo?.availableCapacity ?? 100} meals
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Contact Person</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {profiles.ngo?.contactPerson || donation.matchedNgoId.name}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Evaluating candidate shelters nearby...
              </div>
            )}
          </div>

          {/* Assigned Driver Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Volunteer Driver</h3>
                <p className="text-[11px] text-slate-400">Pickup & Transit Dispatch</p>
              </div>
            </div>

            {donation.assignedDriverId ? (
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {donation.assignedDriverId.name}
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    Phone: {donation.assignedDriverId.phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-slate-600">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Vehicle</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {profiles.driver?.vehicleType || 'Two-Wheeler'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Plate Number</span>
                    <span className="font-bold text-blue-700 text-xs">
                      {profiles.driver?.vehicleNumber || 'RJ-01'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Pickup request broadcasted to active volunteers in Ajmer. Awaiting driver acceptance.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Route Map & Status History */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Rescue Route Map</h3>
            <RescueMap
              height="260px"
              donors={[donorMarker]}
              ngos={ngoMarker ? [ngoMarker] : []}
            />
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Donor (Pickup)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Shelter (Delivery)</span>
              </span>
            </div>
          </div>

          {/* Status History Audit Log */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Status Audit History</h3>
            <div className="space-y-3">
              {donation.statusHistory?.map((h, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{h.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {h.note && <p className="text-[11px] text-slate-500 mt-0.5">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Match Breakdown Modal */}
      <MatchBreakdownModal
        donationId={donation._id}
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
      />
    </div>
  );
}
