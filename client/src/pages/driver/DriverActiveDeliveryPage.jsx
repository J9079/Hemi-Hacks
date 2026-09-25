import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import RescueMap from '../../components/maps/RescueMap';
import StatusTimeline from '../../components/common/StatusTimeline';
import {
  Truck,
  Compass,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building2,
  UtensilsCrossed,
  Sparkles,
  Navigation,
  Database,
  AlertTriangle
} from 'lucide-react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
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
  return Math.round(R * c * 100) / 100;
};

export default function DriverActiveDeliveryPage() {
  const { liveEvent, playAlertSound } = useSocket();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [impactResult, setImpactResult] = useState(null);
  const [shelterProfile, setShelterProfile] = useState(null);

  // Live driver GPS coordinates
  const [driverLocation, setDriverLocation] = useState([26.4650, 74.6390]);
  const [gpsActive, setGpsActive] = useState(false);

  // Track live GPS
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDriverLocation([pos.coords.latitude, pos.coords.longitude]);
          setGpsActive(true);
        },
        (err) => {
          console.log('GPS error/fallback:', err.message);
          setGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const fetchActiveDelivery = async () => {
    try {
      const res = await api.get('/drivers/active');
      if (res.data.success && res.data.delivery) {
        setDelivery(res.data.delivery);

        // Fetch shelter profile for capacity details
        if (res.data.delivery.ngoId) {
          const ngoRes = await api.get(`/ngos/${res.data.delivery.ngoId._id}`);
          if (ngoRes.data.success) {
            setShelterProfile(ngoRes.data.ngo);
          }
        }
      } else {
        setDelivery(null);
      }
    } catch (err) {
      console.error('Failed to load active delivery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDelivery();
  }, [liveEvent]);

  // Execute transition in the delivery state machine
  const handleTransition = async (nextStatus) => {
    if (!delivery) return;
    setUpdating(true);
    try {
      const res = await api.put(`/deliveries/${delivery._id}/status`, {
        status: nextStatus
      });

      if (res.data.success) {
        playAlertSound();
        setDelivery(res.data.delivery);
        if (res.data.impactSummary) {
          setImpactResult(res.data.impactSummary);
        }
        // Refresh shelter capacity
        if (delivery.ngoId) {
          const ngoRes = await api.get(`/ngos/${delivery.ngoId._id}`);
          if (ngoRes.data.success) setShelterProfile(ngoRes.data.ngo);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400 text-xs">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading active mission dispatch & GPS tracking...
      </div>
    );
  }

  // If mission is completed
  if (impactResult || (delivery && delivery.status === 'DELIVERED')) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rescue Mission Successful!</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Food Safely Delivered to Shelter</h2>
            <p className="text-xs text-slate-500 mt-1">
              Surplus edible food reached the beneficiaries before expiry. Shelter capacity updated.
            </p>
          </div>

          {/* Social Impact Metric Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
              <span className="text-xl sm:text-2xl font-black text-emerald-700 block">
                {impactResult?.mealsRescued || Math.round((delivery?.donationId?.quantity || 30) / 0.42)}
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">Meals Fed</span>
            </div>

            <div className="bg-teal-50 p-3.5 rounded-2xl border border-teal-100">
              <span className="text-xl sm:text-2xl font-black text-teal-700 block">
                {delivery?.donationId?.quantity || 30} kg
              </span>
              <span className="text-[10px] text-teal-800 font-semibold block mt-0.5">Food Saved</span>
            </div>

            <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
              <span className="text-xl sm:text-2xl font-black text-blue-700 block">
                {impactResult?.co2eAvoidedKg || Math.round((delivery?.donationId?.quantity || 30) * 2.5)} kg
              </span>
              <span className="text-[10px] text-blue-800 font-semibold block mt-0.5">CO2e Avoided</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/driver')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            Return to Available Requests
          </button>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Active Delivery Mission</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have a food rescue in progress. Browse nearby requests and accept a dispatch!
          </p>
          <Link
            to="/driver"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200"
          >
            View Available Pickup Requests
          </Link>
        </div>
      </div>
    );
  }

  const d = delivery.donationId;
  const status = delivery.status;

  // Real-time live distance calculations from driver's moving GPS coordinates
  const distanceToPickup = calculateDistance(
    driverLocation[0],
    driverLocation[1],
    delivery.pickupLocation.latitude,
    delivery.pickupLocation.longitude
  );

  const distanceToDelivery = calculateDistance(
    driverLocation[0],
    driverLocation[1],
    delivery.deliveryLocation.latitude,
    delivery.deliveryLocation.longitude
  );

  const isNearShelter = distanceToDelivery < 0.35; // Within 350 meters
  const isNearPickup = distanceToPickup < 0.35;

  const activeRoute = {
    waypoints: delivery.routeCoordinates || [
      [delivery.pickupLocation.latitude, delivery.pickupLocation.longitude],
      [delivery.deliveryLocation.latitude, delivery.deliveryLocation.longitude]
    ]
  };

  const donorMarker = {
    latitude: delivery.pickupLocation.latitude,
    longitude: delivery.pickupLocation.longitude,
    name: delivery.donorId?.name || 'Pickup Point',
    pickupAddress: delivery.pickupLocation.address
  };

  const ngoMarker = {
    latitude: delivery.deliveryLocation.latitude,
    longitude: delivery.deliveryLocation.longitude,
    organizationName: delivery.ngoId?.name || 'Destination Shelter',
    address: delivery.deliveryLocation.address,
    capacity: shelterProfile?.capacity || 100,
    availableCapacity: shelterProfile?.availableCapacity || 80
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar with Live GPS status */}
      <div className="flex items-center justify-between">
        <Link
          to="/driver"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
        >
          <span>← Back to Dispatches</span>
        </Link>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
            <Navigation className={`w-3.5 h-3.5 ${gpsActive ? 'text-emerald-500 animate-pulse' : 'text-blue-500'}`} />
            <span>GPS Tracking: {driverLocation[0].toFixed(3)}°, {driverLocation[1].toFixed(3)}°</span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
            ● State: {status}
          </span>
        </div>
      </div>

      {/* Proximity / Nearest Area Arrival Alerts */}
      {status === 'IN_TRANSIT' && isNearShelter && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2.5">
            <MapPin className="w-5 h-5 text-white" />
            <span className="text-xs font-bold">
              📍 PROXIMITY ALERT: You have arrived at the nearest shelter ({ngoMarker.organizationName})! Ready to confirm delivery.
            </span>
          </div>
          <button
            onClick={() => handleTransition('DELIVERED')}
            className="px-4 py-1.5 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow"
          >
            Confirm Delivery ✓
          </button>
        </div>
      )}

      {status === 'PICKUP_STARTED' && isNearPickup && (
        <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2.5">
            <MapPin className="w-5 h-5 text-white" />
            <span className="text-xs font-bold">
              📍 PROXIMITY ALERT: You are at the food donor location ({donorMarker.name})! Ready to inspect & load food.
            </span>
          </div>
          <button
            onClick={() => handleTransition('PICKED_UP')}
            className="px-4 py-1.5 bg-white text-amber-800 font-extrabold text-xs rounded-xl shadow"
          >
            Confirm Food Loaded ✓
          </button>
        </div>
      )}

      {/* Main Delivery Flow Action Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Live Volunteer Mission
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">{d?.foodName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {d?.quantity} {d?.unit} • {d?.category}
            </p>
          </div>

          {/* Dynamic Real-Time Distance Live Counter */}
          <div className="text-right bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 font-semibold block">
              {['ASSIGNED', 'PICKUP_STARTED'].includes(status)
                ? 'Distance to Pickup (Donor):'
                : 'Distance to Drop-off (Shelter):'}
            </span>
            <span className="text-xl font-black text-blue-700">
              {['ASSIGNED', 'PICKUP_STARTED'].includes(status) ? distanceToPickup : distanceToDelivery} km
            </span>
            <span className="text-[10px] text-slate-500 block">
              Estimated: ~{delivery.estimatedTime} mins total
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <StatusTimeline currentStatus={status} />

        {/* Turn-by-Turn Action Buttons based on status */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Next Step Action</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {status === 'ASSIGNED' && 'Proceed to restaurant / donor location.'}
              {status === 'PICKUP_STARTED' && 'Arrive at donor location and verify food hygiene.'}
              {status === 'PICKED_UP' && 'Secure food containers in vehicle and depart for shelter.'}
              {status === 'IN_TRANSIT' && 'Arrive at destination shelter and complete hand-off.'}
            </p>
          </div>

          <div>
            {status === 'ASSIGNED' && (
              <button
                onClick={() => handleTransition('PICKUP_STARTED')}
                disabled={updating}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-105"
              >
                {updating ? 'Updating...' : 'START PICKUP →'}
              </button>
            )}

            {status === 'PICKUP_STARTED' && (
              <button
                onClick={() => handleTransition('PICKED_UP')}
                disabled={updating}
                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-200 transition-all hover:scale-105"
              >
                {updating ? 'Updating...' : 'CONFIRM PICKUP (FOOD LOADED) →'}
              </button>
            )}

            {status === 'PICKED_UP' && (
              <button
                onClick={() => handleTransition('IN_TRANSIT')}
                disabled={updating}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-105"
              >
                {updating ? 'Updating...' : 'START DELIVERY TO SHELTER →'}
              </button>
            )}

            {status === 'IN_TRANSIT' && (
              <button
                onClick={() => handleTransition('DELIVERED')}
                disabled={updating}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all hover:scale-105"
              >
                {updating ? 'Updating...' : 'CONFIRM DELIVERY COMPLETE ✓'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Map & Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Rescue Map with Moving GPS Radar */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Live GPS Delivery Tracking</h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {delivery.distance} km route
            </span>
          </div>

          <RescueMap
            height="340px"
            driverLocation={driverLocation}
            showNearestRadius={true}
            nearestRadiusMeters={2500}
            donors={[donorMarker]}
            ngos={[ngoMarker]}
            activeRoute={activeRoute}
          />
        </div>

        {/* Location & Shelter Capacity Details */}
        <div className="space-y-4">
          {/* Pickup Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-600">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>STEP 1: PICKUP ORIGIN</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">{delivery.donorId?.name}</h4>
            <p className="text-xs text-slate-600 flex items-start space-x-1.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{delivery.pickupLocation?.address}</span>
            </p>
            {delivery.donorId?.phone && (
              <div className="pt-2 text-xs text-slate-500 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact: {delivery.donorId.phone}</span>
              </div>
            )}
          </div>

          {/* Destination Shelter with EXPLICIT CAPACITY VERIFICATION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>STEP 2: DROP-OFF SHELTER</span>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                {shelterProfile?.organizationName || delivery.ngoId?.name}
              </h4>
              {shelterProfile?.organizationName && delivery.ngoId?.name && (
                <span className="text-[11px] text-slate-500 font-medium block">
                  Contact / Representative: {delivery.ngoId.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 flex items-start space-x-1.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{delivery.deliveryLocation?.address}</span>
            </p>

            {/* Shelter Intake Capacity Verification Block */}
            <div className="mt-2 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">Shelter Intake Capacity:</span>
                </div>
                <span className="font-extrabold text-emerald-700">
                  {shelterProfile?.availableCapacity ?? 80} / {shelterProfile?.capacity ?? 100} meals free
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                ✓ Capacity verified: Shelter can accept this <span className="font-bold">{d?.quantity} {d?.unit}</span> rescue safely.
              </p>
            </div>

            {delivery.ngoId?.phone && (
              <div className="pt-1 text-xs text-slate-500 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Shelter Contact: {delivery.ngoId.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
