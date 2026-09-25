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
  Sparkles,
  ChevronDown,
  Compass,
  CheckCircle,
  Truck,
  Building2,
  ShieldAlert,
  PlusCircle
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, quickSwitchRole, isAuthenticated } = useAuth();
  const { liveEvent } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Fetch notifications
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

  const handleRoleSwitch = async (targetRole, targetPath) => {
    setShowRoleMenu(false);
    await quickSwitchRole(targetRole);
    navigate(targetPath);
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
                  Real-Time Rescue Routing
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
              Home
            </Link>

            {role === 'DONOR' && (
              <>
                <Link
                  to="/donor"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/donor' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
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
              <>
                <Link
                  to="/ngo"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/ngo' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Shelter Dashboard
                </Link>
              </>
            )}

            {role === 'DRIVER' && (
              <>
                <Link
                  to="/driver"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/driver' ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rescue Dispatches
                </Link>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === '/admin' ? 'text-purple-700 bg-purple-50' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin Impact Center
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions: Persona Switcher, Notifications, Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Persona Switcher for Hackathon Judges */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 hover:from-amber-500/20 hover:to-emerald-500/20 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Switch role instantly to test all workflows"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-scale-up">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Judge Persona Quick-Switch
                    </span>
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('DONOR', '/donor')}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                      🍲
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Food Donor</div>
                      <div className="text-[11px] text-slate-400">Chef Rajesh (Royal Spice)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('NGO', '/ngo')}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      🏠
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">NGO / Shelter</div>
                      <div className="text-[11px] text-slate-400">Helping Hands Shelter</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('DRIVER', '/driver')}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      🛵
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Volunteer Driver</div>
                      <div className="text-[11px] text-slate-400">Vikram Singh (RJ-01)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('ADMIN', '/admin')}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      📊
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">System Admin</div>
                      <div className="text-[11px] text-slate-400">Impact & Monitoring Hub</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
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

            {/* User Profile or Login CTA */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-bold text-slate-800 leading-none">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                    {user?.profile?.organizationName || user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
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
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
