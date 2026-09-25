import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import {
  HeartHandshake,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Settings,
  PlusCircle,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { liveEvent } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch real notifications
  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [isAuthenticated, liveEvent]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'DONOR':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'NGO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DRIVER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none block">
                  Surplus<span className="text-emerald-600">ToShelter</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 block tracking-wider uppercase mt-0.5">
                  Real-Time Food Rescue Routing
                </span>
              </div>
            </Link>

            {/* Role indicator badge */}
            {isAuthenticated && (
              <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ml-3 ${getRoleBadgeColor()}`}>
                {role}
              </span>
            )}
          </div>

          {/* Navigation Links based on role */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                location.pathname === '/' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </Link>

            {role === 'DONOR' && (
              <>
                <Link
                  to="/donor"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/donor' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Donations
                </Link>
                <Link
                  to="/donor/post"
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1 shadow-sm shadow-emerald-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Post Surplus Food</span>
                </Link>
              </>
            )}

            {role === 'NGO' && (
              <Link
                to="/ngo"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/ngo' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shelter Dashboard
              </Link>
            )}

            {role === 'DRIVER' && (
              <Link
                to="/driver"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  location.pathname === '/driver' ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rescue Dispatches
              </Link>
            )}

            {role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    location.pathname === '/admin' ? 'text-purple-700 bg-purple-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin Center
                </Link>
                <Link
                  to="/donor"
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/donor') ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Donors
                </Link>
                <Link
                  to="/ngo"
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/ngo' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Shelters
                </Link>
                <Link
                  to="/driver"
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/driver' ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Drivers
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions: Notifications & Production User Account Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <span className="font-bold text-xs text-slate-800">Notifications ({unreadCount} new)</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-semibold text-emerald-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3.5 text-xs hover:bg-slate-50 transition-colors ${
                              !n.isRead ? 'bg-emerald-50/40 font-medium' : 'text-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Dropdown or Sign In CTA */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left mr-1">
                    <span className="block text-xs font-bold text-slate-800 leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight block">
                      {user?.profile?.organizationName || user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900">{user?.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor()}`}>
                        {role} Account
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    {role === 'DONOR' && (
                      <Link
                        to="/donor"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Donor Dashboard</span>
                      </Link>
                    )}

                    {role === 'NGO' && (
                      <Link
                        to="/ngo"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>Shelter Dashboard</span>
                      </Link>
                    )}

                    {role === 'DRIVER' && (
                      <Link
                        to="/driver"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Driver Dispatches</span>
                      </Link>
                    )}

                    {role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Admin Impact Hub</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-red-50 flex items-center space-x-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-200"
                >
                  Join the Mission
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
