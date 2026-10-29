import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Experiences from './pages/Experiences';
import ExperienceDetail from './pages/ExperienceDetail';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="experiences" element={<Experiences />} />
        <Route path="experiences/:slug" element={<ExperienceDetail />} />
        <Route path="packages" element={<Packages />} />
        <Route path="packages/:slug" element={<PackageDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin/*" element={<Suspense fallback={<p className="admin-loading">Loading…</p>}><AdminApp /></Suspense>} />
    </Routes>
  );
}
