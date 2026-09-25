import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import PostDonationPage from './pages/donor/PostDonationPage';
import DonationDetailPage from './pages/donor/DonationDetailPage';

// NGO Pages
import NgoDashboard from './pages/ngo/NgoDashboard';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverActiveDeliveryPage from './pages/driver/DriverActiveDeliveryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own role dashboard
    switch (user.role) {
      case 'DONOR':
        return <Navigate to="/donor" replace />;
      case 'NGO':
        return <Navigate to="/ngo" replace />;
      case 'DRIVER':
        return <Navigate to="/driver" replace />;
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Donor Module */}
                <Route
                  path="/donor"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/post"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                      <PostDonationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/donation/:id"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR', 'ADMIN', 'NGO', 'DRIVER']}>
                      <DonationDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* NGO Module */}
                <Route
                  path="/ngo"
                  element={
                    <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                      <NgoDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Driver Module */}
                <Route
                  path="/driver"
                  element={
                    <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
                      <DriverDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/driver/active"
                  element={
                    <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
                      <DriverActiveDeliveryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Module */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Platform Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>
                  Surplus-to-Shelter &bull; Real-Time Food Rescue Routing &bull; AmiHacks 2024
                </span>
                <span className="text-slate-400">
                  Ajmer, Rajasthan Logistics Grid &bull; OpenStreetMap Routing
                </span>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
