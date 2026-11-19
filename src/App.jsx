import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Hosts from './pages/Hosts';
import HostProfile from './pages/HostProfile';
import Community from './pages/Community';
import Join from './pages/Join';
import Me from './pages/Me';
import HostApply from './pages/HostApply';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import Umwimerere from './pages/Umwimerere';
import About from './pages/About';
import Contact from './pages/Contact';
import BookingResult from './pages/BookingResult';
import NotFound from './pages/NotFound';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function PublicLayout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main"><ErrorBoundary key={pathname}><Outlet /></ErrorBoundary></main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="trips" element={<Trips />} />
        <Route path="trips/:slug" element={<TripDetail />} />
        <Route path="hosts" element={<Hosts />} />
        <Route path="hosts/:id" element={<HostProfile />} />
        <Route path="community" element={<Community />} />
        <Route path="join" element={<Join />} />
        <Route path="me" element={<Me />} />
        <Route path="host" element={<HostApply />} />
        <Route path="stories" element={<Stories />} />
        <Route path="stories/:slug" element={<StoryDetail />} />
        <Route path="umwimerere" element={<Umwimerere />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="booking/success" element={<BookingResult />} />
        {/* Old addresses from the first site */}
        <Route path="experiences" element={<Navigate to="/trips" replace />} />
        <Route path="experiences/umwimerere" element={<Navigate to="/umwimerere" replace />} />
        <Route path="experiences/:slug" element={<Navigate to="/trips" replace />} />
        <Route path="packages/*" element={<Navigate to="/trips" replace />} />
        <Route path="reels/*" element={<Navigate to="/stories" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin/*" element={<ErrorBoundary><Suspense fallback={<p className="container section">Loading…</p>}><AdminApp /></Suspense></ErrorBoundary>} />
    </Routes>
  );
}
