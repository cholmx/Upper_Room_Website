import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Sermons from './pages/Sermons';
import Podcasts from './pages/Podcasts';
import Blog from './pages/Blog';
import Events from './pages/Events';
import Visit from './pages/Visit';
import CustomPage from './pages/CustomPage';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('urf_admin_auth') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col pt-0">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/sermons" element={<PublicLayout><Sermons /></PublicLayout>} />
        <Route path="/podcasts" element={<PublicLayout><Podcasts /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/visit" element={<PublicLayout><Visit /></PublicLayout>} />
        <Route path="/p/:slug" element={<PublicLayout><CustomPage /></PublicLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}