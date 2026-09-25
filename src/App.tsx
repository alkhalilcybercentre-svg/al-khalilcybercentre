import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Package,
  UploadCloud,
  ChevronUp,
  UserCog,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  SiteInfo,
  FlashNewsItem,
  BannerItem,
  ServiceItem,
  RateItem,
  NoticeItem,
  TestimonialItem
} from './types';
import {
  fetchSiteInfo,
  fetchNews,
  fetchBanners,
  fetchServices,
  fetchRates,
  fetchNotices,
  fetchTestimonials
} from './lib/api';

import { Navbar } from './components/Navbar';
import { FlashNewsTicker } from './components/FlashNewsTicker';
import { HeroSlider } from './components/HeroSlider';
import { NoticeBoard } from './components/NoticeBoard';
import { ImportantServices } from './components/ImportantServices';
import { AiToolsSection } from './components/AiToolsSection';
import { ServicesExplorer } from './components/ServicesExplorer';
import { RateListSection } from './components/RateListSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CertificatesSection } from './components/CertificatesSection';
import { WorkTrackerSection } from './components/WorkTrackerSection';
import { DocumentUploadSection } from './components/DocumentUploadSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { ChatAssistant } from './components/ChatAssistant';

export function App() {
  // Public Data State
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    businessName: 'AL KHALIL CYBER CENTRE',
    tagline: 'Digital Services • Jan Seva • Printing • 4K Photography & Videography',
    phone: '9259837361',
    whatsapp: '9259837361',
    email: 'alkhalilcybercentre@gmail.com',
    address: 'Near Main Market, Service Complex',
    cityState: 'Uttar Pradesh',
    pincode: '250002',
    openingHours: 'Mon - Sat: 8:00 AM - 9:00 PM | Sun: 9:00 AM - 3:00 PM',
    aboutText:
      'AL KHALIL CYBER CENTRE is your authorized Jan Seva Kendra and premier digital solution studio offering instant government application processing, fast online certificates, commercial offset & digital printing, and cinematic 4K wedding photography & videography.',
    aboutHighlights: [
      'Authorized CSC Jan Seva Kendra with Verified Govt Portals',
      'Real-Time Live Work Tracking Token System',
      'High-Speed Color Laser Printing, Lamination & PVC Smart Cards',
      'Cinema 4K Drone Wedding Photography & Video Editing'
    ]
  });

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [news, setNews] = useState<FlashNewsItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [rates, setRates] = useState<RateItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  // Navigation & Modals
  const [activeSection, setActiveSection] = useState<string>('home');
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Load Public Data
  const loadData = async () => {
    try {
      const [info, bannersData, newsData, servicesData, ratesData, noticesData, testimonialsData] = await Promise.all([
        fetchSiteInfo(),
        fetchBanners(),
        fetchNews(),
        fetchServices(),
        fetchRates(),
        fetchNotices(),
        fetchTestimonials()
      ]);

      if (info) setSiteInfo(info);
      if (bannersData) setBanners(bannersData);
      if (newsData) setNews(newsData);
      if (servicesData) setServices(servicesData);
      if (ratesData) setRates(ratesData);
      if (noticesData) setNotices(noticesData);
      if (testimonialsData) setTestimonials(testimonialsData);
    } catch (err) {
      console.error('Error fetching site data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Scroll listener for back-to-top button
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTrackWithToken = (token: string) => {
    scrollToSection('track');
    // Pre-fill tracking token if field exists
    setTimeout(() => {
      const input = document.querySelector('input[placeholder*="AK-"]') as HTMLInputElement;
      if (input) {
        input.value = token;
        input.focus();
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-indigo-600 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Emergency Alert Banner if Enabled in Admin Settings */}
      {siteInfo.enableEmergencyAlert && siteInfo.emergencyAlertText && (
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white px-4 py-2 text-xs font-black text-center flex items-center justify-center gap-2 shadow-lg tracking-wide uppercase">
          <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
          <span>{siteInfo.emergencyAlertText}</span>
        </div>
      )}

      {/* 1. Official Header & Navigation */}
      <Navbar
        siteInfo={siteInfo}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* 2. Real-Time Flash News Ticker */}
      <FlashNewsTicker
        news={news}
        onNewsClick={(link) => {
          if (link) scrollToSection(link.replace('#', ''));
        }}
      />

      {/* 3. Dynamic Hero Highlights Slider */}
      <div id="home">
        <HeroSlider banners={banners} onNavigate={scrollToSection} />
      </div>

      {/* 3.5. Digital Notice Board / Flash Alerts Section */}
      <NoticeBoard
        notices={notices}
        onActionClick={scrollToSection}
      />

      {/* 4. Key Highlighted Services */}
      <ImportantServices
        services={services}
        siteInfo={siteInfo}
        onSelectService={(s) => setSelectedServiceModal(s)}
        onNavigate={scrollToSection}
      />

      {/* 4.5. Official AI-Powered Suite (Voice Converter, Search Assistant, Image-to-Video, Transcription) */}
      <AiToolsSection siteInfo={siteInfo} />

      {/* 5. Complete Services Explorer (Category Tabs + Search + Details Modal) */}
      <ServicesExplorer
        services={services}
        siteInfo={siteInfo}
        selectedServiceModal={selectedServiceModal}
        onSelectServiceModal={setSelectedServiceModal}
      />

      {/* 6. Official Rate List & Price Chart */}
      <RateListSection
        rates={rates}
        siteInfo={siteInfo}
        onNavigate={scrollToSection}
      />

      {/* 6.5. Customer Testimonials & Star Ratings Section */}
      <TestimonialsSection
        testimonials={testimonials}
        onReviewSubmitted={loadData}
      />

      {/* 7. Official Certificates & Authorizations Showcase */}
      <CertificatesSection siteInfo={siteInfo} />

      {/* 8. Live Customer Work Tracking System */}
      <WorkTrackerSection siteInfo={siteInfo} />

      {/* 9. Send Documents Online (with Instant Token Generation) */}
      <DocumentUploadSection
        siteInfo={siteInfo}
        onNavigateToTrack={scrollToTrackWithToken}
      />

      {/* 10. About AL KHALIL CYBER CENTRE */}
      <AboutSection siteInfo={siteInfo} />

      {/* 11. Official Contact Desk & Google Maps */}
      <ContactSection siteInfo={siteInfo} />

      {/* 12. Official Footer & Admin Link */}
      <Footer
        siteInfo={siteInfo}
        onNavigate={scrollToSection}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* =========================================================================
          FLOATING QUICK-ACTION HUB (CALL NOW + WHATSAPP ON LEFT)
      ========================================================================= */}
      <div className="fixed bottom-5 left-4 sm:left-6 z-40 flex flex-col items-start gap-2.5">
        {/* Floating Call Button */}
        <a
          href={`tel:${siteInfo.phone}`}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-wider group border border-indigo-400/30"
          title={`Call ${siteInfo.phone}`}
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">CALL {siteInfo.phone}</span>
        </a>

        {/* Floating WhatsApp Button */}
        <a
          href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20have%20an%20inquiry.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-wider border border-emerald-400/30"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WHATSAPP</span>
        </a>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-5 z-40 p-3 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white shadow-lg border border-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Back to top"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* =========================================================================
          FLOATING AI CHATBOT & 24/7 SMART ASSISTANT WIDGET
      ========================================================================= */}
      <ChatAssistant />

      {/* =========================================================================
          ADMIN PANEL MODAL OVERLAY (PIN AUTHENTICATED)
      ========================================================================= */}
      {showAdminModal && (
        <AdminPanel
          siteInfo={siteInfo}
          onClose={() => setShowAdminModal(false)}
          onRefreshPublicData={loadData}
        />
      )}
    </div>
  );
}

export default App;
