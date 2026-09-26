import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Package,
  UploadCloud,
  ChevronUp,
  UserCog,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  X
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
import { CyberSafetyPage } from './components/CyberSafetyPage';

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
  const [currentView, setCurrentView] = useState<'home' | 'cyber-safety'>('home');
  const [showFirstVisitNotice, setShowFirstVisitNotice] = useState<boolean>(false);
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

  // Hash listener for direct #cyber-safety URL navigation
  useEffect(() => {
    if (window.location.hash === '#cyber-safety') {
      setCurrentView('cyber-safety');
    }

    const handleHashChange = () => {
      if (window.location.hash === '#cyber-safety') {
        setCurrentView('cyber-safety');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (window.location.hash === '' || window.location.hash === '#home') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // First-visit safety awareness notice check (once per browser)
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('alkhalil_safety_notice_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowFirstVisitNotice(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const dismissFirstVisitNotice = () => {
    setShowFirstVisitNotice(false);
    try {
      localStorage.setItem('alkhalil_safety_notice_dismissed', 'true');
    } catch {}
  };

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

  const handleNavigate = (id: string) => {
    if (id === 'cyber-safety') {
      setCurrentView('cyber-safety');
      window.location.hash = 'cyber-safety';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView !== 'home') {
      setCurrentView('home');
      if (window.location.hash === '#cyber-safety') {
        window.history.pushState(null, '', ' ');
      }
      setTimeout(() => {
        scrollToSection(id);
      }, 100);
      return;
    }

    scrollToSection(id);
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
        activeSection={currentView === 'cyber-safety' ? 'cyber-safety' : activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* 2. Real-Time Flash News Ticker */}
      <FlashNewsTicker
        news={news}
        onNewsClick={(link) => {
          if (link) handleNavigate(link.replace('#', ''));
        }}
      />

      {currentView === 'cyber-safety' ? (
        <CyberSafetyPage
          siteInfo={siteInfo}
          onBack={() => {
            setCurrentView('home');
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateSection={handleNavigate}
          onOpenAdmin={() => setShowAdminModal(true)}
        />
      ) : (
        <>
          {/* 3. Dynamic Hero Highlights Slider */}
          <div id="home">
            <HeroSlider banners={banners} onNavigate={handleNavigate} />
          </div>

          {/* 3.2. Homepage Cyber Fraud Safety Awareness Alert Card/Banner */}
          {siteInfo.showCyberSafetyBanner !== false && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-6 relative z-20">
              <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-amber-400 text-sm tracking-wide flex items-center gap-1.5">
                        🛡️ साइबर फ्रॉड से सावधान रहें
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        जनहित में जारी
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                      {siteInfo.safetyNoticeText ||
                        'OTP, UPI PIN, ATM PIN, Banking Password, Card PIN या CVV का गलत इस्तेमाल करके धोखाधड़ी की जा सकती है।'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => {
                      setCurrentView('cyber-safety');
                      window.location.hash = 'cyber-safety';
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cyber Safety Tips देखें</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3.5. Digital Notice Board / Flash Alerts Section */}
          <NoticeBoard
            notices={notices}
            onActionClick={handleNavigate}
          />

          {/* 4. Key Highlighted Services */}
          <ImportantServices
            services={services}
            siteInfo={siteInfo}
            onSelectService={(s) => setSelectedServiceModal(s)}
            onNavigate={handleNavigate}
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
            onNavigate={handleNavigate}
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
        </>
      )}

      {/* 12. Official Footer & Admin Link */}
      <Footer
        siteInfo={siteInfo}
        onNavigate={handleNavigate}
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
          FIRST-VISIT DISMISSIBLE SAFETY NOTICE
      ========================================================================= */}
      {showFirstVisitNotice && (
        <div className="fixed bottom-24 right-4 sm:right-6 max-w-sm sm:max-w-md bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-40 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  🛡️ आपकी सुरक्षा हमारी प्राथमिकता है
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  OTP केवल संबंधित सेवा और आपकी जानकारी/सहमति से ही उपयोग करें। UPI PIN, ATM PIN, CVV और Banking Password किसी के साथ साझा न करें।
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      dismissFirstVisitNotice();
                      setCurrentView('cyber-safety');
                      window.location.hash = 'cyber-safety';
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Safety Tips देखें
                  </button>
                  <button
                    onClick={dismissFirstVisitNotice}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={dismissFirstVisitNotice}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
