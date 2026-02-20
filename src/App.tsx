import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';

// Core lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/RegisterFixed'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/ProfileFixed'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const AISettings = lazy(() => import('./pages/AISettings'));
const AddProduct = lazy(() => import('./pages/AddProductFixed'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const About = lazy(() => import('./pages/About'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// Scroll to Top on Route Change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Application initialization on mount
const useAppInitialization = () => {
  useEffect(() => {
    // Log app initialization
    console.log('QuickMela app initialized');

    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Production-specific setup
    if (import.meta.env.PROD) {
      // Production console message
      console.log('%c🚀 QuickMela Platform', 'color: #2563eb; font-size: 14px; font-weight: bold;');
    }
  }, []);
};

function App() {
  console.log("Rendering App");
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* FIX R-01: Protected routes with redirect to /login if not authenticated */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
      <Route path="/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
      
      {/* FIX R-02: Role-based route protection for seller-only routes */}
      <Route 
        path="/add-product" 
        element={
          <ProtectedRoute allowedRoles={['seller', 'admin', 'superadmin']}>
            <AddProduct />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin-only routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Public pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/auctions" element={<div>Auctions Page</div>} />
      <Route path="/sell" element={<div>Sell Page</div>} />
      <Route path="/how-it-works" element={<div>How It Works</div>} />
      <Route path="/pricing" element={<div>Pricing</div>} />
      <Route path="/careers" element={<div>Careers</div>} />
      <Route path="/press" element={<div>Press</div>} />
      <Route path="/help" element={<div>Help Center</div>} />
      <Route path="/security" element={<div>Security</div>} />
      
      {/* FIX R-08: Branded 404 page for all unknown routes */}
      <Route path="*" element={<NotFoundPage message="Page not found" />} />
    </Routes>
    </Suspense>
  );
}

export default App;


