import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  ChevronLeft,
  Save,
  Sparkles,
  Building2,
  Search
} from 'lucide-react';

export default function PostDonationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // If present, edit mode

  const isEditMode = !!id;

  const getInitialExpiry = (hours) => {
    const d = new Date(Date.now() + hours * 3600 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    foodName: '',
    category: 'Cooked Food',
    quantity: 10,
    unit: 'kg',
    description: '',
    preparedAt: new Date().toISOString().slice(0, 16),
    usableUntil: getInitialExpiry(3),
    pickupAddress: user?.location?.address || 'Ajmer, Rajasthan',
    latitude: user?.location?.latitude || 26.4499,
    longitude: user?.location?.longitude || 74.6399,
    foodSafetyInfo: 'Stored under hygienic temperature compliant conditions.',
    photo: ''
  });

  const [riskAssessment, setRiskAssessment] = useState({
    remainingMinutes: 180,
    status: 'SAFE',
    displayText: '3h 0m'
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);

  // Shelter routing strategy state
  const [matchingMode, setMatchingMode] = useState('AUTOMATIC');
  const [targetNgoId, setTargetNgoId] = useState('');
  const [ngos, setNgos] = useState([]);
  const [loadingNgos, setLoadingNgos] = useState(false);
  const [searchNgoQuery, setSearchNgoQuery] = useState('');

  // Haversine distance calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth radius in km
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

  // Fetch verified NGOs for direct shelter selection
  useEffect(() => {
    const fetchNgos = async () => {
      try {
        setLoadingNgos(true);
        const res = await api.get('/ngos');
        if (res.data?.success) {
          setNgos(res.data.ngos || []);
        }
      } catch (err) {
        console.error('Failed to load registered NGOs:', err);
      } finally {
        setLoadingNgos(false);
      }
    };
    fetchNgos();
  }, []);

  // Fetch existing data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchExisting = async () => {
        try {
          const res = await api.get(`/donations/${id}`);
          if (res.data.success && res.data.donation) {
            const d = res.data.donation;
            setFormData({
              foodName: d.foodName || '',
              category: d.category || 'Cooked Food',
              quantity: d.quantity || 10,
              unit: d.unit || 'kg',
              description: d.description || '',
              preparedAt: d.preparedAt ? new Date(d.preparedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
              usableUntil: d.usableUntil ? new Date(d.usableUntil).toISOString().slice(0, 16) : getInitialExpiry(3),
              pickupAddress: d.pickupAddress || '',
              latitude: d.latitude || 26.4499,
              longitude: d.longitude || 74.6399,
              foodSafetyInfo: d.foodSafetyInfo || '',
              photo: d.photo || ''
            });
            if (d.matchingMode) setMatchingMode(d.matchingMode);
            if (d.matchedNgoId) {
              setTargetNgoId(typeof d.matchedNgoId === 'object' ? d.matchedNgoId._id : d.matchedNgoId);
            }
          }
        } catch (err) {
          setError('Failed to load donation details for editing.');
        } finally {
          setLoading(false);
        }
      };
      fetchExisting();
    }
  }, [id, isEditMode]);

  // Update live expiry indicator whenever usableUntil changes
  useEffect(() => {
    if (!formData.usableUntil) return;
    const diffMs = new Date(formData.usableUntil).getTime() - Date.now();
    const mins = Math.floor(diffMs / (1000 * 60));

    let status = 'SAFE';
    if (mins <= 0) status = 'EXPIRED';
    else if (mins < 30) status = 'CRITICAL';
    else if (mins <= 120) status = 'WARNING';

    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const displayText = mins <= 0 ? 'Expired' : h > 0 ? `${h}h ${m}m` : `${m}m`;

    setRiskAssessment({ remainingMinutes: mins, status, displayText });
  }, [formData.usableUntil]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4))
        }));
        setDetectingGps(false);
      },
      (err) => {
        setDetectingGps(false);
        setError('Unable to fetch GPS position. Check permissions.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (riskAssessment.remainingMinutes <= 0) {
      setError('Usable expiry time must be in the future.');
      return;
    }

    if (matchingMode === 'MANUAL' && !targetNgoId) {
      setError('Please select a recipient NGO/Shelter from the directory, or select Automatic Matching.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        matchingMode,
        targetNgoId: matchingMode === 'MANUAL' ? targetNgoId : undefined
      };

      if (isEditMode) {
        const res = await api.put(`/donations/${id}`, payload);
        if (res.data.success) {
          navigate(`/donor/donation/${id}`);
        }
      } else {
        const res = await api.post('/donations', payload);
        if (res.data.success) {
          navigate(`/donor/donation/${res.data.donation._id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save donation.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNgos = ngos
    .map((ngo) => {
      const dist = calculateDistance(
        formData.latitude,
        formData.longitude,
        ngo.latitude,
        ngo.longitude
      );
      return { ...ngo, calculatedDistance: dist };
    })
    .sort((a, b) => {
      if (a.calculatedDistance === null) return 1;
      if (b.calculatedDistance === null) return -1;
      return a.calculatedDistance - b.calculatedDistance;
    })
    .filter((ngo) => {
      if (!searchNgoQuery.trim()) return true;
      const q = searchNgoQuery.toLowerCase();
      const name = (ngo.organizationName || ngo.userId?.name || '').toLowerCase();
      const addr = (ngo.address || '').toLowerCase();
      const contact = (ngo.contactPerson || '').toLowerCase();
      return name.includes(q) || addr.includes(q) || contact.includes(q);
    });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-400 text-xs">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
        Loading donation...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/donor"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Donations</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h2 className="text-2xl font-black text-slate-900">
            {isEditMode ? 'Edit Surplus Food Listing' : 'Post Surplus Food'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEditMode
              ? 'Update food details, quantity, or pickup window for matching shelters.'
              : 'Our matching engine will calculate the best-fit shelter based on capacity, distance, and dietary compatibility.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Food Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Food Details</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Food Item Name *</label>
              <input
                type="text"
                name="foodName"
                required
                value={formData.foodName}
                onChange={handleChange}
                placeholder="e.g. Freshly Cooked Rice and Lentil Curry"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                >
                  <option value="Cooked Food">Cooked Food</option>
                  <option value="Packaged Food">Packaged Food</option>
                  <option value="Produce / Raw">Produce / Raw</option>
                  <option value="Bakery / Dairy">Bakery / Dairy</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min={0.5}
                  step={0.5}
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                >
                  <option value="kg">kg (kilograms)</option>
                  <option value="meals">meals</option>
                  <option value="packets">packets</option>
                  <option value="trays">trays</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Details on food preparation, portions, dietary ingredients, packaging..."
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Expiry & Safety Window */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Usable Expiry Window & Food Safety
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prepared At *</label>
                <input
                  type="datetime-local"
                  name="preparedAt"
                  required
                  value={formData.preparedAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Usable Until / Expiry Time *</label>
                <input
                  type="datetime-local"
                  name="usableUntil"
                  required
                  value={formData.usableUntil}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Live Expiry-Risk Assessment Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              riskAssessment.status === 'SAFE'
                ? 'bg-emerald-50 border-emerald-200'
                : riskAssessment.status === 'WARNING'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200 animate-pulse'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${
                    riskAssessment.status === 'SAFE' ? 'text-emerald-600' : riskAssessment.status === 'WARNING' ? 'text-amber-600' : 'text-red-600'
                  }`} />
                  <span className="text-xs font-bold text-slate-800">
                    Estimated usable food window: <span className="font-extrabold">{riskAssessment.displayText}</span>
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  riskAssessment.status === 'SAFE'
                    ? 'bg-emerald-600 text-white'
                    : riskAssessment.status === 'WARNING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  {riskAssessment.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {riskAssessment.status === 'SAFE' && 'Sufficient window for multi-factor shelter matching and driver dispatch.'}
                {riskAssessment.status === 'WARNING' && 'Expedited volunteer assignment recommended.'}
                {riskAssessment.status === 'CRITICAL' && 'Urgent: Driver must be nearby to pick up in time.'}
                {riskAssessment.status === 'EXPIRED' && 'Food cannot be rescued past usable life.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Food Safety / Storage Information</label>
              <input
                type="text"
                name="foodSafetyInfo"
                value={formData.foodSafetyInfo}
                onChange={handleChange}
                placeholder="e.g. Maintained hot in insulated carriers / refrigerated at 4°C"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Pickup Location */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Pickup Location</h3>
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingGps}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <Navigation className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                <span>{detectingGps ? 'Detecting...' : 'Auto-Detect Current GPS'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Address *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="pickupAddress"
                  required
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder="Street, Area, Landmark"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Shelter Redistribution Routing Strategy */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                4. Shelter Redistribution Strategy
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Choose how your surplus food is matched and routed to recipient shelters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option A: Automatic Algorithmic Matching */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setMatchingMode('AUTOMATIC')}
                onKeyDown={(e) => e.key === 'Enter' && setMatchingMode('AUTOMATIC')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative ${
                  matchingMode === 'AUTOMATIC'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        matchingMode === 'AUTOMATIC'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Automatic Matching
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Recommended
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      matchingMode === 'AUTOMATIC'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {matchingMode === 'AUTOMATIC' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                  Our multi-factor algorithm scores proximity (&le;15 km), real-time capacity, urgency, and food safety transit windows to pair with the highest-priority shelter.
                </p>
              </div>

              {/* Option B: Direct Shelter Selection */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setMatchingMode('MANUAL')}
                onKeyDown={(e) => e.key === 'Enter' && setMatchingMode('MANUAL')}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative ${
                  matchingMode === 'MANUAL'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        matchingMode === 'MANUAL'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Direct Shelter Choice
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Donor Selected
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      matchingMode === 'MANUAL'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {matchingMode === 'MANUAL' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                  Directly choose a specific verified shelter or community kitchen from our registry to receive this rescue donation.
                </p>
              </div>
            </div>

            {/* Direct Shelter Directory (Rendered when MANUAL is selected) */}
            {matchingMode === 'MANUAL' && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Select Destination Shelter / NGO *
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {filteredNgos.length} shelter{filteredNgos.length !== 1 ? 's' : ''} available
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchNgoQuery}
                    onChange={(e) => setSearchNgoQuery(e.target.value)}
                    placeholder="Filter by shelter name, address, or contact..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {loadingNgos ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading verified shelters...
                  </div>
                ) : filteredNgos.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
                    No verified shelters match your search criteria.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredNgos.map((ngo) => {
                      const ngoIdentifier = ngo.userId?._id || ngo._id;
                      const isSelected = targetNgoId === ngoIdentifier;
                      return (
                        <div
                          key={ngo._id}
                          onClick={() => setTargetNgoId(ngoIdentifier)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/30 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {ngo.organizationName || ngo.userId?.name || 'Verified Shelter'}
                                </span>
                                {ngo.calculatedDistance !== null && (
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    {ngo.calculatedDistance} km away
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {ngo.address}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  Capacity: {ngo.availableCapacity ?? ngo.capacity ?? 100} meals free
                                </span>
                                {ngo.currentNeeds && (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      ngo.currentNeeds === 'Critical'
                                        ? 'text-red-700 bg-red-100'
                                        : ngo.currentNeeds === 'High'
                                        ? 'text-amber-700 bg-amber-100'
                                        : 'text-blue-700 bg-blue-100'
                                    }`}
                                  >
                                    Need: {ngo.currentNeeds}
                                  </span>
                                )}
                                {ngo.contactPerson && (
                                  <span className="text-[10px] text-slate-500">
                                    Contact: {ngo.contactPerson}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {targetNgoId && (
                  <div className="p-2.5 bg-emerald-100/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Target Destination:{' '}
                      <span className="font-bold underline">
                        {
                          ngos.find((n) => (n.userId?._id || n._id) === targetNgoId)?.organizationName ||
                          ngos.find((n) => (n.userId?._id || n._id) === targetNgoId)?.userId?.name ||
                          'Target Shelter'
                        }
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || riskAssessment.remainingMinutes <= 0}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? (
              <span>Saving and processing rescue routing...</span>
            ) : isEditMode ? (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes & Re-evaluate Shelter</span>
              </>
            ) : matchingMode === 'MANUAL' ? (
              <>
                <Building2 className="w-4 h-4" />
                <span>Submit & Route Directly to Selected Shelter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <UtensilsCrossed className="w-4 h-4" />
                <span>Submit & Run Real-Time Matching Engine</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
