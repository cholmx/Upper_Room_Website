import React, { useEffect, Suspense, lazy } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import StickyMobileBar from './components/StickyMobileBar';
import { AuthProvider, useAuth } from './auth';
import { SettingsProvider } from './settings';
import { PhotosProvider } from './photos';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const PlanYourVisit = lazy(() => import('./pages/PlanYourVisit'));
const About = lazy(() => import('./pages/About'));
const Beliefs = lazy(() => import('./pages/Beliefs'));
const CoreValues = lazy(() => import('./pages/CoreValues'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Messages = lazy(() => import('./pages/Messages'));
const MessageSeries = lazy(() => import('./pages/MessageSeries'));
const MessageDetail = lazy(() => import('./pages/MessageDetail'));
const NextSteps = lazy(() => import('./pages/NextSteps'));
const Ministries = lazy(() => import('./pages/Ministries'));
const Kids = lazy(() => import('./pages/Kids'));
const Youth = lazy(() => import('./pages/Youth'));
const TableGroups = lazy(() => import('./pages/TableGroups'));
const Serve = lazy(() => import('./pages/Serve'));
const Sozo = lazy(() => import('./pages/Sozo'));
const CarePortal = lazy(() => import('./pages/CarePortal'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const FAQPage = lazy(() => import('./pages/FAQ'));
const Give = lazy(() => import('./pages/Give'));
const Campaign = lazy(() => import('./pages/Campaign'));
const Contact = lazy(() => import('./pages/Contact'));
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
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main" tabIndex={-1} className="flex-grow outline-none">{children}</main>
      <Footer />
      <StickyMobileBar />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <MotionConfig reducedMotion="user">
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
          ['/', Home], ['/plan-your-visit', PlanYourVisit], ['/about', About], ['/beliefs', Beliefs], ['/core-values', CoreValues],
          ['/leadership', Leadership], ['/messages', Messages], ['/messages/series/:series', MessageSeries], ['/messages/:slug', MessageDetail],
          ['/next-steps', NextSteps], ['/ministries', Ministries], ['/kids', Kids], ['/youth', Youth], ['/table-groups', TableGroups],
          ['/serve', Serve], ['/sozo', Sozo], ['/careportal', CarePortal],
          ['/events', Events], ['/events/:id', EventDetail], ['/faq', FAQPage],
          ['/give', Give], ['/transforming-together', Campaign], ['/contact', Contact],
          ['/accessibility', Accessibility], ['/privacy', Privacy], ['/blog', Blog], ['/blog/:id', BlogPost], ['/p/:slug', CustomPage],
        ].map(([path, Page]) => (
          <Route key={path} path={path} element={<PublicLayout><Page /></PublicLayout>} />
        ))}

        {/* Old addresses still work */}
        <Route path="/visit" element={<Navigate to="/plan-your-visit" replace />} />
        <Route path="/sermons" element={<Navigate to="/messages" replace />} />
        <Route path="/sermons/:id" element={<SermonRedirect />} />
        <Route path="/team" element={<Navigate to="/leadership" replace />} />
        <Route path="/podcasts" element={<Navigate to="/messages" replace />} />
        <Route path="/worship-team" element={<Navigate to="/serve#worship" replace />} />
        <Route path="/outreach" element={<Navigate to="/ministries#outreach" replace />} />
        <Route path="/prayer" element={<Navigate to="/contact#prayer" replace />} />
        <Route path="/stories" element={<Navigate to="/about#stories" replace />} />
        <Route path="/connect" element={<Navigate to="/plan-your-visit#connect-card" replace />} />

        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
      </Suspense>
      </AuthProvider>
      </PhotosProvider>
      </SettingsProvider>
    </Router>
    </MotionConfig>
    </ErrorBoundary>
  );
}