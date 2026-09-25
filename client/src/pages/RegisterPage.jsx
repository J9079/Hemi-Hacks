import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, ArrowRight, UserCheck, Building, Truck, Shield } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('DONOR');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organizationName: '',
    businessType: 'Restaurant',
    address: 'Civil Lines, Ajmer',
    latitude: 26.4700,
    longitude: 74.6400,
    capacity: 100,
    vehicleType: 'Two-Wheeler (Bike/Scooter)',
    vehicleNumber: 'RJ-01-AB-1234'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await register({ ...formData, role });
      switch (role) {
        case 'DONOR':
          navigate('/donor');
          break;
        case 'NGO':
          navigate('/ngo');
          break;
        case 'DRIVER':
          navigate('/driver');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 max-w-xl w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Rescue Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join the Ajmer Real-Time Food Rescue Network</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center space-y-1 ${
              role === 'DONOR'
                ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🍲 Food Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('NGO')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center space-y-1 ${
              role === 'NGO'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🏠 NGO / Shelter</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('DRIVER')}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center space-y-1 ${
              role === 'DRIVER'
                ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🛵 Volunteer Driver</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Chef Rajesh"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rajesh@restaurant.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98290 12345"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Role specific inputs */}
          {role === 'DONOR' && (
            <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Restaurant</label>
                  <input
                    type="text"
                    name="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="e.g. Royal Spice Banquet"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Type</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Caterer">Caterer</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Grocery Store">Grocery Store</option>
                    <option value="Cafeteria">Campus Cafeteria</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Civil Lines, Ajmer"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {role === 'NGO' && (
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shelter / Trust Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="e.g. Helping Hands Shelter"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Capacity (Meals)</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    min={10}
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shelter Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Station Road, Ajmer"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {role === 'DRIVER' && (
            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Two-Wheeler (Bike/Scooter)">Two-Wheeler (Bike/Scooter)</option>
                    <option value="Three-Wheeler (Auto/Van)">Three-Wheeler (Auto/Van)</option>
                    <option value="Four-Wheeler (Car/Truck)">Four-Wheeler (Car/Truck)</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    required
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g. RJ-01-EA-4521"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
