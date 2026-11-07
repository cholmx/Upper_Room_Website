import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import StickyMobileBar from './components/StickyMobileBar';
import { AuthProvider, useAuth } from './auth';
import { SettingsProvider } from './settings';
import { PhotosProvider } from './photos';
import Amen from './components/Amen';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const PlanYourVisit = lazy(() => import('./pages/PlanYourVisit'));
const About = lazy(() => import('./pages/About'));
const CoreValues = lazy(() => import('./pages/CoreValues'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Discipleship = lazy(() => import('./pages/Discipleship'));
const Messages = lazy(() => import('./pages/Messages'));
const MessageSeries = lazy(() => import('./pages/MessageSeries'));
const MessageDetail = lazy(() => import('./pages/MessageDetail'));
const Sozo = lazy(() => import('./pages/Sozo'));
const Give = lazy(() => import('./pages/Give'));
const Contact = lazy(() => import('./pages/Contact'));
const Connect = lazy(() => import('./pages/Connect'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const CustomPage = lazy(() => import('./pages/CustomPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));

// New pages open at the top, unless the link points at a section (for example /next-steps#baptism).
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function SermonRedirect() {
  const { id } = useParams();
  return <Navigate to={`/messages/${id}`} replace />;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      <div className="w-10 h-10 border-4 border-[#eaa235] border-t-transparent rounded-full animate-spin"></div>
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
    <div className="public-site min-h-screen flex flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main" tabIndex={-1} className="flex-grow outline-none">{children}</main>
      <Footer />
      <StickyMobileBar />
      <Amen />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <Router>
      <SettingsProvider>
      <PhotosProvider>
      <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
      <Routes>
        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Public Routes */}
        {[
          ['/', Home], ['/plan-your-visit', PlanYourVisit], ['/about', About], ['/core-values', CoreValues],
          ['/leadership', Leadership], ['/messages', Messages], ['/messages/series/:series', MessageSeries], ['/messages/:slug', MessageDetail],
          ['/discipleship', Discipleship], ['/sozo', Sozo],
          ['/give', Give], ['/contact', Contact], ['/connect', Connect],
          ['/accessibility', Accessibility], ['/privacy', Privacy], ['/blog', Blog], ['/blog/:id', BlogPost], ['/p/:slug', CustomPage],
        ].map(([path, Page]) => (
          <Route key={path} path={path} element={<PublicLayout><Page /></PublicLayout>} />
        ))}

        {/* Old addresses still work */}
        <Route path="/new-here" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/visit" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/next-steps" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/faq" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/about-us" element={<Navigate to="/about" replace />} />
        <Route path="/beliefs" element={<Navigate to="/about#beliefs" replace />} />
        <Route path="/stories" element={<Navigate to="/about" replace />} />
        <Route path="/sermons" element={<Navigate to="/messages" replace />} />
        <Route path="/podcasts" element={<Navigate to="/messages" replace />} />
        <Route path="/prayer" element={<Navigate to="/contact" replace />} />
        <Route path="/events" element={<Navigate to="/" replace />} />
        <Route path="/careportal" element={<Navigate to="/" replace />} />
        <Route path="/ministries" element={<Navigate to="/discipleship" replace />} />
        <Route path="/kids" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/youth" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/table-groups" element={<Navigate to="/discipleship" replace />} />
        <Route path="/worship-team" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/serve" element={<Navigate to="/discipleship" replace />} />
        <Route path="/outreach" element={<Navigate to="/" replace />} />
        <Route path="/transforming-together" element={<Navigate to="/give" replace />} />
        <Route path="/team" element={<Navigate to="/leadership" replace />} />
        <Route path="/sermons/:id" element={<SermonRedirect />} />
        <Route path="/events/:id" element={<Navigate to="/" replace />} />

        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
      </Suspense>
      </AuthProvider>
      </PhotosProvider>
      </SettingsProvider>
    </Router>
    </ErrorBoundary>
  );
}