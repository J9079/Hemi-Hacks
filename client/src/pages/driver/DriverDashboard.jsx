import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import ExpiryBadge from '../../components/common/ExpiryBadge';
import RescueMap from '../../components/maps/RescueMap';
import {
  Truck,
  Compass,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Utensils,
  Volume2,
  VolumeX,
  Navigation,
  Sparkles,
  Database
} from 'lucide-react';

// Haversine formula on client for real-time proximity sorting
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export default function DriverDashboard() {
  const { liveEvent, driverAlert, clearDriverAlert, soundEnabled, setSoundEnabled, playAlertSound } = useSocket();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  // Driver live location tracking (defaults to Ajmer city center)
  const [driverCoords, setDriverCoords] = useState([26.4600, 74.6380]);
  const [gpsActive, setGpsActive] = useState(false);

  // Initialize live browser geolocation tracking
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDriverCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsActive(true);
        },
        (err) => {
          console.log('Using default GPS coordinates:', err.message);
          setGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const fetchDriverData = async () => {
    try {
      const [dashRes, reqRes] = await Promise.all([
        api.get('/dashboard/driver'),
        api.get('/drivers/requests')
      ]);

      if (dashRes.data.success) {
        setActiveDelivery(dashRes.data.activeDelivery);
        setProfile(dashRes.data.profile);
      }
      if (reqRes.data.success) {
        setRequests(reqRes.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load driver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [liveEvent]);

  // Sort requests by nearest distance to driver's current coordinates
  const sortedRequests = [...requests].map((r) => {
    const d = r.donation;
    const distanceToPickup = calculateDistance(
      driverCoords[0],
      driverCoords[1],
      d.latitude || 26.47,
      d.longitude || 74.64
    );
    return {
      ...r,
      distanceFromDriver: distanceToPickup
    };
  }).sort((a, b) => a.distanceFromDriver - b.distanceFromDriver);

  const handleAcceptPickup = async (donationId) => {
    setAcceptingId(donationId);
    try {
      const res = await api.post(`/drivers/requests/${donationId}/accept`);
      if (res.data.success) {
        clearDriverAlert();
        navigate(`/driver/active`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept pickup request.');
    } finally {
      setAcceptingId(null);
    }
  };

  // Convert donor and NGO points for the live map
  const donorMapPoints = sortedRequests.map((r) => ({
    _id: r.donation._id,
    foodName: r.donation.foodName,
    pickupAddress: r.donation.pickupAddress,
    quantity: r.donation.quantity,
    unit: r.donation.unit,
    latitude: r.donation.latitude,
    longitude: r.donation.longitude
  }));

  const ngoMapPoints = sortedRequests
    .filter((r) => r.ngoProfile)
    .map((r) => ({
      _id: r.ngoProfile._id,
      organizationName: r.ngoProfile.organizationName,
      address: r.ngoProfile.address,
      capacity: r.ngoProfile.capacity,
      availableCapacity: r.ngoProfile.availableCapacity,
      latitude: r.ngoProfile.latitude,
      longitude: r.ngoProfile.longitude
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Driver Real-Time Emergency Dispatch Alert Banner */}
      {driverAlert && (
        <div className="p-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-3xl shadow-xl shadow-red-200 border border-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 block">
                {driverAlert.title}
              </span>
              <h3 className="text-base font-black mt-0.5">{driverAlert.message}</h3>
              <p className="text-xs text-red-100">
                A nearby shelter has matched capacity and needs immediate transportation.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {driverAlert.relatedDonationId && (
              <button
                onClick={() => handleAcceptPickup(driverAlert.relatedDonationId)}
                className="px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 font-bold text-xs rounded-xl shadow transition-transform hover:scale-105"
              >
                Accept Now →
              </button>
            )}
            <button
              onClick={clearDriverAlert}
              className="p-2 text-white/80 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-6 rounded-3xl border border-blue-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Volunteer Rescue Dispatch</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Pick up surplus food from donors and deliver directly to verified shelters in Ajmer.
          </p>
        </div>

        {/* Live GPS & Sound Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertSound();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
            title="Toggle audio dispatch alert chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Alert Chime ON' : 'Muted'}</span>
          </button>

          {/* GPS Tracking Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
            <Navigation className={`w-3.5 h-3.5 ${gpsActive ? 'text-emerald-500 animate-pulse' : 'text-blue-500'}`} />
            <span>GPS: {driverCoords[0].toFixed(3)}°, {driverCoords[1].toFixed(3)}°</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
          </div>

          {/* Vehicle Info */}
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm">
            {profile?.vehicleType || 'Two-Wheeler'} ({profile?.vehicleNumber || 'RJ-01'})
          </div>
        </div>
      </div>

      {/* Active Mission Notice Banner (if any) */}
      {activeDelivery && (
        <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-up">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Compass className="w-6 h-6 text-white animate-spin" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                Active Mission In Progress
              </span>
              <h3 className="text-base font-black">
                {activeDelivery.donationId?.foodName || 'Surplus Food Transit'}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Status: <span className="font-bold underline">{activeDelivery.status}</span> • Destination:{' '}
                {activeDelivery.ngoId?.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/driver/active')}
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow transition-transform hover:scale-105 whitespace-nowrap"
          >
            Open Live Navigation & Delivery Workflow →
          </button>
        </div>
      )}

      {/* Interactive Map: Nearest Food Rescues & Live Driver Location */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Automatic Nearest Area Radar Tracking</h3>
            <p className="text-xs text-slate-500">
              Live GPS location (blue pin) tracking available food pickups (orange) and shelter destinations (green).
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>You (Driver)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Donor Pickup</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Shelter</span>
            </span>
          </div>
        </div>

        <RescueMap
          height="320px"
          driverLocation={driverCoords}
          showNearestRadius={true}
          nearestRadiusMeters={3500}
          donors={donorMapPoints}
          ngos={ngoMapPoints}
        />
      </div>

      {/* Available Pickup Requests Sorted by Proximity / Nearest Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Available Pickup Requests (Sorted Nearest First)
            </h3>
            <p className="text-xs text-slate-500">
              Ranked automatically by closest distance to your live location.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {sortedRequests.length} Dispatches Available
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Scanning for active requests...</div>
        ) : sortedRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            No open pickup requests at the moment. All surplus donations have active drivers assigned!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedRequests.map((r, idx) => {
              const d = r.donation;
              const ngo = r.ngoProfile;
              const hasCapacity = ngo ? ngo.availableCapacity >= d.quantity : true;

              return (
                <div
                  key={d._id}
                  className={`bg-white p-6 rounded-3xl border shadow-sm transition-all flex flex-col justify-between ${
                    idx === 0
                      ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-md'
                      : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div>
                    {/* Nearest Badge & Category & Expiry */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                            {d.category}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-extrabold uppercase text-white bg-emerald-600 px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                              <span>⚡ NEAREST TO YOU ({r.distanceFromDriver} km)</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 mt-1">{d.foodName}</h4>
                        <span className="text-xs font-bold text-emerald-700">
                          {d.quantity} {d.unit}
                        </span>
                      </div>
                      <ExpiryBadge usableUntil={d.usableUntil} />
                    </div>

                    {/* Proximity & Transit Distance Card */}
                    <div className="mt-4 space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                      {/* Step 1: Pickup */}
                      <div className="flex items-start space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Pickup: {d.donorId?.name}
                          </span>
                          <span className="font-bold text-slate-800">{d.pickupAddress}</span>
                          <span className="block text-[11px] text-blue-600 font-semibold mt-0.5">
                            📍 {r.distanceFromDriver} km from your current GPS location
                          </span>
                        </div>
                      </div>

                      {/* Transit Line */}
                      <div className="border-l-2 border-dashed border-slate-300 ml-1 pl-3.5 my-1 text-[11px] font-semibold text-slate-600 flex items-center space-x-2">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          Transit to shelter: {r.distanceKm} km • ~{r.estimatedMinutes} mins
                        </span>
                      </div>

                      {/* Step 2: Destination Shelter & CAPACITY VERIFICATION */}
                      <div className="flex items-start space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                        <div className="w-full">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Dropoff Shelter: {ngo?.organizationName || d.matchedNgoId?.name}
                          </span>
                          <span className="font-bold text-slate-800">
                            {ngo?.address || d.matchedNgoId?.location?.address}
                          </span>

                          {/* Capacity Verification Badge */}
                          <div className="mt-1.5 p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <Database className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[11px] font-semibold text-slate-700">
                                Shelter Capacity:
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                hasCapacity
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {hasCapacity
                                ? `✓ Capacity Verified (${ngo?.availableCapacity || 100} meals free)`
                                : '⚠️ Capacity Limited'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accept Button */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleAcceptPickup(d._id)}
                      disabled={acceptingId === d._id}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                    >
                      {acceptingId === d._id ? (
                        <span>Accepting Request...</span>
                      ) : (
                        <>
                          <Truck className="w-4 h-4" />
                          <span>ACCEPT RESCUE PICKUP (START ROUTE)</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
