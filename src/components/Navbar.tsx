import React, { useState } from 'react';
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
  Sun,
  Moon,
  Languages
} from 'lucide-react';
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
  const [internalTheme, internalToggleTheme] = useTheme();
  const [internalLang, internalToggleLang] = useLanguage();

  const currentTheme: ThemeMode = theme || internalTheme;
  const handleToggleTheme = onToggleTheme || internalToggleTheme;

  const currentLanguage: Language = language || internalLang;
  const handleToggleLanguage = onToggleLanguage || internalToggleLang;
  const t = TRANSLATIONS[currentLanguage];

  const navLinks = [
    { label: t.nav.home, id: 'home' },
    { label: t.nav.notices, id: 'notices' },
    { label: t.nav.aiTools, id: 'ai-tools' },
    { label: t.nav.services, id: 'services' },
    { label: t.nav.rates, id: 'rates' },
    { label: t.nav.reviews, id: 'testimonials' },
    { label: t.nav.certificates, id: 'certificates' },
    { label: t.nav.track, id: 'track' },
    { label: t.nav.sendDocs, id: 'upload-docs' },
    { label: t.nav.cyberSafety, id: 'cyber-safety' },
    { label: t.nav.about, id: 'about' },
    { label: t.nav.contact, id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
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
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">{t.topBar.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">{t.topBar.darkMode}</span>
                </>
              )}
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
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl italic text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200 border border-indigo-400/30">
              AK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-lg sm:text-xl font-black tracking-tighter uppercase transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-white group-hover:text-indigo-400'
                    : 'text-slate-900 group-hover:text-indigo-600'
                }`}>
                  AL KHALIL <span className="text-indigo-500">CYBER CENTRE</span>
                </h1>
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${
                  currentTheme === 'dark'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-indigo-500" /> CSC
                </span>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${
                currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {siteInfo.tagline || t.brand.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/20'
                      : currentTheme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                        : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Direct CTA Buttons & Desktop Theme / Language Switcher */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Language Switcher Segmented Control */}
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

            {/* Theme Toggle Button (Desktop CTA) */}
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
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden 2xl:inline text-[11px] font-bold text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="hidden 2xl:inline text-[11px] font-bold text-slate-700">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleNavClick('track')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                currentTheme === 'dark'
                  ? 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700'
                  : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{t.cta.trackWork}</span>
            </button>

            <button
              onClick={() => handleNavClick('upload-docs')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:shadow-indigo-600/50 shrink-0"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>{t.cta.sendDocuments}</span>
            </button>
          </div>

          {/* Mobile Header Buttons */}
          <div className="flex items-center gap-1.5 xl:hidden">
            {/* Direct Language Switcher on Mobile Header */}
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

            {/* Direct Theme Toggle on Mobile Header */}
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
              {currentTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('track')}
              className={`p-2 rounded-xl transition-colors ${
                currentTheme === 'dark'
                  ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
              }`}
              title={t.cta.trackWork}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl focus:outline-hidden transition-colors ${
                currentTheme === 'dark'
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`xl:hidden border-t px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 duration-200 transition-colors ${
          currentTheme === 'dark'
            ? 'border-slate-800 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}>
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
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 mb-3 transition-colors ${
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
                {currentTheme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
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
                {currentTheme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-700" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </span>
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wider text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-black shadow-md'
                      : currentTheme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              );
            })}
          </div>

          <div className={`mt-4 pt-4 border-t grid grid-cols-2 gap-2 ${
            currentTheme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <a
              href={`tel:${siteInfo.phone}`}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black uppercase tracking-wider text-xs transition-colors border ${
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
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-wider text-xs hover:bg-emerald-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.mobile.whatsapp}</span>
            </a>
          </div>

          <div className="mt-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold uppercase tracking-wider text-xs transition-colors ${
                currentTheme === 'dark'
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <UserCog className="w-4 h-4 text-amber-500" />
              <span>{t.mobile.adminLogin}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
