import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  Clock,
  Menu,
  X,
  ShieldCheck,
  Search,
  Upload,
  UserCog,
  MapPin,
  ChevronRight,
  ChevronDown,
  Languages,
  Layers,
  IndianRupee,
  Info,
  Home,
  Compass,
  BellRing,
  Sparkles,
  Award,
  ShieldAlert
} from 'lucide-react';
import { ThemeToggleIcon } from './ThemeToggleIcon';
import { SiteInfo } from '../types';
import { useTheme, ThemeMode } from '../lib/theme';
import { useLanguage, Language, TRANSLATIONS } from '../lib/language';

interface NavbarProps {
  siteInfo: SiteInfo;
  onOpenAdmin: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  language?: Language;
  onToggleLanguage?: (lang?: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteInfo,
  onOpenAdmin,
  activeSection,
  onNavigate,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const [internalTheme, internalToggleTheme] = useTheme();
  const [internalLang, internalToggleLang] = useLanguage();

  const currentTheme: ThemeMode = theme || internalTheme;
  const handleToggleTheme = onToggleTheme || internalToggleTheme;

  const currentLanguage: Language = language || internalLang;
  const handleToggleLanguage = onToggleLanguage || internalToggleLang;
  const t = TRANSLATIONS[currentLanguage];

  // Primary key sections identified by user: Services, Rates, Track, About, Contact
  const keySections = [
    {
      id: 'services',
      label: t.nav.services,
      icon: Layers,
      description: currentLanguage === 'hi' ? 'सीएससी व जन सेवा' : 'CSC & Jan Seva',
      badge: 'CSC'
    },
    {
      id: 'rates',
      label: t.nav.rates,
      icon: IndianRupee,
      description: currentLanguage === 'hi' ? 'सरकारी व प्रिंटिंग दर सूची' : 'Official Price Chart',
      badge: '₹'
    },
    {
      id: 'track',
      label: t.nav.track,
      icon: Search,
      description: currentLanguage === 'hi' ? 'लाइव कार्य स्थिति' : 'Live Status Token',
      badge: 'LIVE'
    },
    {
      id: 'about',
      label: t.nav.about,
      icon: Info,
      description: currentLanguage === 'hi' ? 'केन्द्र परिचय व स्टूडियो' : 'Centre & Studio Profile',
      badge: null
    },
    {
      id: 'contact',
      label: t.nav.contact,
      icon: MapPin,
      description: currentLanguage === 'hi' ? 'हेल्पडेस्क व लोकेशन' : 'Desk, Hours & Location',
      badge: null
    }
  ];

  // Secondary portal links for the "More Portals" dropdown & mobile drawer
  const secondaryPortals = [
    { id: 'notices', label: t.nav.notices, icon: BellRing, badge: 'Alerts' },
    { id: 'ai-tools', label: t.nav.aiTools, icon: Sparkles, badge: 'AI' },
    { id: 'certificates', label: t.nav.certificates, icon: Award, badge: 'Govt' },
    { id: 'upload-docs', label: t.nav.sendDocs, icon: Upload, badge: 'Online' },
    { id: 'cyber-safety', label: t.nav.cyberSafety, icon: ShieldAlert, badge: 'Safety' },
  ];

  // Scrollspy: detect active section when scrolling smoothly
  const [spiedSection, setSpiedSection] = useState<string>(activeSection || 'home');

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['home', 'services', 'rates', 'track', 'about', 'contact'];
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 96;
      const scrollPos = window.scrollY + headerHeight + 50;

      if (window.scrollY < 260) {
        setSpiedSection('home');
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setSpiedSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activeSection) {
      setSpiedSection(activeSection);
    }
  }, [activeSection]);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    if (moreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreDropdownOpen]);

  // Smooth scroll anchor navigation handler
  const handleNavClick = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setSpiedSection(id);

    // Call app-level navigator
    onNavigate(id);

    // Precise fallback smooth scroll with sticky header height compensation
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const elem = document.getElementById(id);
      if (elem) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 96;
        const elemPosition = elem.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: Math.max(0, elemPosition - headerHeight - 14),
          behavior: 'smooth'
        });
      }
    }

    // Keep URL hash updated cleanly for accessibility & shareability
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      const newHash = id === 'home' ? '' : `#${id}`;
      window.history.pushState(null, '', newHash || window.location.pathname);
    }
  };

  const isCurrentActive = (id: string) => {
    return spiedSection === id || activeSection === id;
  };

  return (
    <header className={`w-full sticky top-0 z-40 backdrop-blur-md border-b shadow-md transition-colors ${
      currentTheme === 'dark'
        ? 'bg-slate-900/95 border-slate-800 text-slate-100'
        : 'bg-white/95 border-slate-200 text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <div className={`text-xs py-2 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        currentTheme === 'dark'
          ? 'bg-slate-950 text-slate-300 border-slate-800/80'
          : 'bg-slate-100 text-slate-700 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className={`flex items-center gap-1.5 ${currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
                {siteInfo.openingHours || (currentLanguage === 'hi' ? 'सोम - शनि: 8:00 AM - 9:00 PM' : 'Mon - Sat: 8:00 AM - 9:00 PM')}
              </span>
            </div>
            <div className={`hidden md:flex items-center gap-1.5 ${currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate max-w-xs text-[11px] sm:text-xs uppercase tracking-wider">{siteInfo.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap justify-end">
            <div className="text-right hidden sm:block">
              <span className={`text-[9px] uppercase tracking-widest font-bold block ${
                currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>{t.topBar.officialSupport}</span>
              <a
                href={`tel:${siteInfo.phone}`}
                className={`inline-flex items-center gap-1 font-black text-xs transition-colors tracking-tight ${
                  currentTheme === 'dark' ? 'text-white hover:text-indigo-300' : 'text-slate-900 hover:text-indigo-600'
                }`}
              >
                <Phone className="w-3 h-3 text-indigo-500" />
                <span>+91 {siteInfo.phone}</span>
              </a>
            </div>

            <span className={currentTheme === 'dark' ? 'text-slate-700 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>

            <a
              href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20need%20information%20regarding%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-full font-black text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-3 h-3 shrink-0" />
              <span>{t.topBar.whatsapp}</span>
            </a>

            <span className={currentTheme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>|</span>

            {/* Quick Top Bar Language Switcher Button */}
            <button
              onClick={() => handleToggleLanguage()}
              aria-label={t.topBar.langToggleTitle}
              title={t.topBar.langToggleTitle}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                currentTheme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700 hover:border-indigo-400/40 shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-indigo-700 border-slate-300 shadow-xs'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{currentLanguage === 'en' ? 'हिंदी' : 'ENGLISH'}</span>
            </button>

            <span className={currentTheme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>|</span>

            {/* Quick Top Bar Theme Switcher */}
            <button
              onClick={handleToggleTheme}
              aria-label={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              title={currentTheme === 'dark' ? 'Switch to Light Mode (लाइट मोड)' : 'Switch to Dark Mode (डार्क मोड)'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                currentTheme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/40 shadow-xs'
                  : 'bg-white hover:bg-slate-200 text-indigo-700 border-slate-300 shadow-xs'
              }`}
            >
              <ThemeToggleIcon
                mode={currentTheme === 'dark' ? 'sun' : 'moon'}
                className="w-3.5 h-3.5 shrink-0"
                sunColor="#fbbf24"
                moonColor="#4f46e5"
              />
              <span className="hidden md:inline">
                {currentTheme === 'dark' ? t.topBar.lightMode : t.topBar.darkMode}
              </span>
            </button>

            <span className={currentTheme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>|</span>

            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center gap-1 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                currentTheme === 'dark'
                  ? 'text-slate-300 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 border-slate-700'
                  : 'text-slate-700 hover:text-amber-600 bg-white hover:bg-slate-100 border-slate-300'
              }`}
              title="Admin Portal Login"
            >
              <UserCog className="w-3 h-3 text-amber-500" />
              <span>{t.topBar.admin}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & Brand Identity */}
          <div
            onClick={(e) => handleNavClick('home', e)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl italic text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200 border border-indigo-400/30">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-base sm:text-lg font-black tracking-tight uppercase transition-colors whitespace-nowrap ${
                  currentTheme === 'dark'
                    ? 'text-white group-hover:text-indigo-400'
                    : 'text-slate-900 group-hover:text-indigo-600'
                }`}>
                  AL KHALIL <span className="text-indigo-500">CYBER CENTRE</span>
                </h1>
                <span className={`hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${
                  currentTheme === 'dark'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-indigo-500" /> CSC
                </span>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${
                currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {siteInfo.tagline || t.brand.subtitle}
              </p>
            </div>
          </div>

          {/* =========================================================================
              SMOOTH SCROLLING ANCHOR NAVIGATION MENU (SERVICES, RATES, TRACK, ABOUT, CONTACT)
          ========================================================================= */}
          <nav
            aria-label="Key Sections Navigation"
            className={`hidden lg:flex items-center p-1 rounded-2xl border transition-colors shadow-xs ${
              currentTheme === 'dark'
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-100/90 border-slate-200/90'
            }`}
          >
            {/* Home Anchor Link */}
            <a
              href="#home"
              onClick={(e) => handleNavClick('home', e)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isCurrentActive('home')
                  ? 'text-white'
                  : currentTheme === 'dark'
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-indigo-600'
              }`}
              aria-current={isCurrentActive('home') ? 'page' : undefined}
            >
              {isCurrentActive('home') && (
                <motion.span
                  layoutId="navbar-active-indicator"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>{t.nav.home}</span>
              </span>
            </a>

            {/* Key Anchor Sections: Services, Rates, Track, About, Contact */}
            {keySections.map((item) => {
              const isActive = isCurrentActive(item.id);
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(item.id, e)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'text-white'
                      : currentTheme === 'dark'
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-700 hover:text-indigo-600'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={`${item.label} (${item.description})`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-indicator"
                      className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                    <span>{item.label}</span>
                  </span>
                </a>
              );
            })}

            {/* Secondary "More Portals" Dropdown Menu */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                  moreDropdownOpen
                    ? currentTheme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900'
                    : currentTheme === 'dark'
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
                aria-label="More Services and Portals"
              >
                <span>{t.nav.more}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-64 rounded-2xl p-2 shadow-2xl border backdrop-blur-xl z-50 ${
                      currentTheme === 'dark'
                        ? 'bg-slate-900/98 border-slate-700/80 text-slate-200'
                        : 'bg-white/98 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="px-3 py-1.5 mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800/40">
                      {currentLanguage === 'hi' ? 'अतिरिक्त सरकारी व डिजिटल सेवाएं' : 'Additional Digital Services'}
                    </div>
                    <div className="space-y-1">
                      {secondaryPortals.map((portal) => {
                        const Icon = portal.icon;
                        const isPortalActive = isCurrentActive(portal.id);
                        return (
                          <a
                            key={portal.id}
                            href={`#${portal.id}`}
                            onClick={(e) => handleNavClick(portal.id, e)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-colors ${
                              isPortalActive
                                ? 'bg-indigo-600 text-white'
                                : currentTheme === 'dark'
                                  ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                  : 'hover:bg-slate-100 text-slate-700 hover:text-indigo-600'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{portal.label}</span>
                            </span>
                            {portal.badge && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                isPortalActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {portal.badge}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Desktop Right Action Hub (Language Segment, Theme Switcher & Direct CTA) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Language Segmented Control */}
            <div
              className={`inline-flex items-center p-0.5 rounded-xl border text-xs font-black transition-all ${
                currentTheme === 'dark'
                  ? 'bg-slate-800/90 border-slate-700'
                  : 'bg-slate-100 border-slate-300'
              }`}
              title={t.topBar.langToggleTitle}
            >
              <button
                onClick={() => handleToggleLanguage('en')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  currentLanguage === 'en'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : currentTheme === 'dark'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Switch site content to English"
              >
                <span>EN</span>
              </button>
              <button
                onClick={() => handleToggleLanguage('hi')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  currentLanguage === 'hi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : currentTheme === 'dark'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="साइट सामग्री हिंदी में बदलें"
              >
                <span>हिंदी</span>
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              aria-label={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              title={currentTheme === 'dark' ? 'Switch to Light Mode (लाइट मोड)' : 'Switch to Dark Mode (डार्क मोड)'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                currentTheme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/50 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-slate-300 shadow-sm'
              }`}
            >
              <ThemeToggleIcon
                mode={currentTheme === 'dark' ? 'sun' : 'moon'}
                className="w-4 h-4 shrink-0"
                sunColor="#fbbf24"
                moonColor="#4f46e5"
              />
              <span className={`hidden xl:inline text-[11px] font-bold ${currentTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                {currentTheme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Direct Quick Action: Track Work */}
            <a
              href="#track"
              onClick={(e) => handleNavClick('track', e)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                currentTheme === 'dark'
                  ? 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700'
                  : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{t.cta.trackWork}</span>
            </a>

            {/* Direct Quick Action: Send Documents */}
            <a
              href="#upload-docs"
              onClick={(e) => handleNavClick('upload-docs', e)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:shadow-indigo-600/50 shrink-0"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>{t.cta.sendDocuments}</span>
            </a>
          </div>

          {/* Mobile Header Quick Actions & Menu Toggle */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {/* Quick Language Switcher on Mobile Header */}
            <button
              onClick={() => handleToggleLanguage()}
              aria-label={t.topBar.langToggleTitle}
              title={t.topBar.langToggleTitle}
              className={`p-2 rounded-xl transition-colors cursor-pointer border flex items-center gap-1 ${
                currentTheme === 'dark'
                  ? 'text-indigo-300 hover:text-indigo-200 bg-slate-800 border-slate-700'
                  : 'text-indigo-600 hover:text-indigo-700 bg-slate-100 border-slate-300'
              }`}
            >
              <Languages className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-black uppercase">{currentLanguage === 'en' ? 'हिं' : 'EN'}</span>
            </button>

            {/* Quick Theme Toggle on Mobile Header */}
            <button
              onClick={handleToggleTheme}
              aria-label={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              title={currentTheme === 'dark' ? 'Switch to Light Mode (लाइट मोड)' : 'Switch to Dark Mode (डार्क मोड)'}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                currentTheme === 'dark'
                  ? 'text-amber-400 hover:text-amber-300 bg-slate-800 border-slate-700'
                  : 'text-indigo-600 hover:text-indigo-700 bg-slate-100 border-slate-300'
              }`}
            >
              <ThemeToggleIcon
                mode={currentTheme === 'dark' ? 'sun' : 'moon'}
                className="w-5 h-5"
                sunColor="#fbbf24"
                moonColor="#4f46e5"
              />
            </button>

            {/* Mobile Quick Track Anchor */}
            <a
              href="#track"
              onClick={(e) => handleNavClick('track', e)}
              className={`p-2 rounded-xl transition-colors border ${
                currentTheme === 'dark'
                  ? 'text-slate-300 hover:text-indigo-400 bg-slate-800 border-slate-700'
                  : 'text-slate-700 hover:text-indigo-600 bg-slate-100 border-slate-300'
              }`}
              title={t.cta.trackWork}
            >
              <Search className="w-5 h-5" />
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl focus:outline-hidden transition-colors border ${
                currentTheme === 'dark'
                  ? 'text-slate-300 hover:text-white bg-slate-800 border-slate-700'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 border-slate-300'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE DRAWER: KEY SECTIONS SMOOTH SCROLL ANCHORS & DIRECTORY
      ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden border-t px-4 pt-3 pb-6 shadow-2xl overflow-hidden transition-colors ${
              currentTheme === 'dark'
                ? 'border-slate-800 bg-slate-900 text-slate-100'
                : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            {/* Mobile Drawer Language Switcher Row */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 mb-2.5 transition-colors ${
              currentTheme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentTheme === 'dark'
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                }`}>
                  <Languages className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide">
                    {currentLanguage === 'en' ? 'Language: English' : 'भाषा: हिंदी (Hindi)'}
                  </div>
                  <div className={`text-[10px] ${currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentLanguage === 'en' ? 'Tap हिंदी to switch content' : 'अंग्रेजी के लिए EN दबाएं'}
                  </div>
                </div>
              </div>
              <div className={`inline-flex items-center p-0.5 rounded-xl border ${
                currentTheme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                <button
                  onClick={() => handleToggleLanguage('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    currentLanguage === 'en'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : currentTheme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleToggleLanguage('hi')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    currentLanguage === 'hi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : currentTheme === 'dark'
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Mobile Drawer Theme Switcher Row */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 mb-4 transition-colors ${
              currentTheme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  currentTheme === 'dark'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                }`}>
                  <ThemeToggleIcon
                    mode={currentTheme === 'dark' ? 'sun' : 'moon'}
                    className="w-5 h-5"
                    sunColor="#fbbf24"
                    moonColor="#4f46e5"
                  />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wide">
                    {currentTheme === 'dark' ? t.mobile.themeDarkText : t.mobile.themeLightText}
                  </div>
                  <div className={`text-[10px] ${currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentTheme === 'dark' ? t.mobile.themeSubtitleDark : t.mobile.themeSubtitleLight}
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleTheme}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  currentTheme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={currentTheme === 'dark'}
                aria-label="Toggle theme switch"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                    currentTheme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  <ThemeToggleIcon
                    mode={currentTheme === 'dark' ? 'moon' : 'sun'}
                    className="w-3.5 h-3.5"
                    sunColor="#d97706"
                    moonColor="#4338ca"
                  />
                </span>
              </button>
            </div>

            {/* KEY SECTIONS SMOOTH SCROLL ANCHORS CONTAINER */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  {t.nav.keySections}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {currentLanguage === 'hi' ? 'त्वरित स्क्रॉल' : 'Smooth Scroll'}
                </span>
              </div>

              <div className="space-y-1.5">
                {/* Home Anchor */}
                <a
                  href="#home"
                  onClick={(e) => handleNavClick('home', e)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                    isCurrentActive('home')
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : currentTheme === 'dark'
                        ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrentActive('home')
                        ? 'bg-white/20 text-white'
                        : currentTheme === 'dark'
                          ? 'bg-slate-700/80 text-indigo-400'
                          : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide">{t.nav.home}</div>
                      <div className={`text-[10px] ${isCurrentActive('home') ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {currentLanguage === 'hi' ? 'शीर्ष पर वापस जाएं' : 'Back to Top'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrentActive('home') ? 'text-white' : 'text-slate-400'}`} />
                </a>

                {/* Key Anchors: Services, Rates, Track, About, Contact */}
                {keySections.map((section) => {
                  const isActive = isCurrentActive(section.id);
                  const Icon = section.icon;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => handleNavClick(section.id, e)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : currentTheme === 'dark'
                            ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : currentTheme === 'dark'
                              ? 'bg-slate-700/80 text-indigo-400'
                              : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wide">{section.label}</span>
                            {section.badge && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
                              }`}>
                                {section.badge}
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {section.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* ADDITIONAL DIGITAL PORTALS IN MOBILE */}
            <div className="mb-4 pt-2 border-t border-slate-800/60 dark:border-slate-800">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 px-1">
                {t.nav.more}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {secondaryPortals.map((portal) => {
                  const Icon = portal.icon;
                  const isActive = isCurrentActive(portal.id);
                  return (
                    <a
                      key={portal.id}
                      href={`#${portal.id}`}
                      onClick={(e) => handleNavClick(portal.id, e)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold uppercase transition-colors border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : currentTheme === 'dark'
                            ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{portal.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className={`pt-3 border-t grid grid-cols-2 gap-2 ${
              currentTheme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <a
                href={`tel:${siteInfo.phone}`}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black uppercase tracking-wider text-xs transition-colors border ${
                  currentTheme === 'dark'
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border-slate-700'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-300'
                }`}
              >
                <Phone className="w-4 h-4 text-indigo-500" />
                <span>{t.mobile.callNow}</span>
              </a>
              <a
                href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20need%20service%20help.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-wider text-xs hover:bg-emerald-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.mobile.whatsapp}</span>
              </a>
            </div>

            {/* Admin Portal Button */}
            <div className="mt-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer ${
                  currentTheme === 'dark'
                    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <UserCog className="w-4 h-4 text-amber-500" />
                <span>{t.mobile.adminLogin}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
