import React, { useEffect, Suspense, lazy } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './auth';
import { SettingsProvider } from './settings';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Sermons = lazy(() => import('./pages/Sermons'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const Blog = lazy(() => import('./pages/Blog'));
const Events = lazy(() => import('./pages/Events'));
const Visit = lazy(() => import('./pages/Visit'));
const SermonDetail = lazy(() => import('./pages/SermonDetail'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Team = lazy(() => import('./pages/Team'));
const Contact = lazy(() => import('./pages/Contact'));
const Ministries = lazy(() => import('./pages/Ministries'));
const CustomPage = lazy(() => import('./pages/CustomPage'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      <div className="w-10 h-10 border-4 border-[#A6790F] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  if (checking) return <Loading />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col pt-0">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-grow outline-none">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <MotionConfig reducedMotion="user">
    <Router>
      <SettingsProvider>
      <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
      <Routes>
        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/sermons" element={<PublicLayout><Sermons /></PublicLayout>} />
        <Route path="/sermons/:id" element={<PublicLayout><SermonDetail /></PublicLayout>} />
        <Route path="/podcasts" element={<PublicLayout><Podcasts /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:id" element={<PublicLayout><BlogPost /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/events/:id" element={<PublicLayout><EventDetail /></PublicLayout>} />
        <Route path="/team" element={<PublicLayout><Team /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/visit" element={<PublicLayout><Visit /></PublicLayout>} />
        <Route path="/ministries" element={<PublicLayout><Ministries /></PublicLayout>} />
        <Route path="/p/:slug" element={<PublicLayout><CustomPage /></PublicLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Suspense>
      </AuthProvider>
      </SettingsProvider>
    </Router>
    </MotionConfig>
    </ErrorBoundary>
  );
}