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
  Save
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

    setSubmitting(true);
    try {
      if (isEditMode) {
        const res = await api.put(`/donations/${id}`, formData);
        if (res.data.success) {
          navigate(`/donor/donation/${id}`);
        }
      } else {
        const res = await api.post('/donations', formData);
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

          <button
            type="submit"
            disabled={submitting || riskAssessment.remainingMinutes <= 0}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? (
              <span>Saving and running matching engine...</span>
            ) : isEditMode ? (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes & Re-evaluate Match</span>
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
