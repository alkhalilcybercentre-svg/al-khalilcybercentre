import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Clock,
  Menu,
  X,
  ShieldCheck,
  Search,
  FileText,
  Upload,
  UserCog,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { SiteInfo } from '../types';

interface NavbarProps {
  siteInfo: SiteInfo;
  onOpenAdmin: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteInfo,
  onOpenAdmin,
  activeSection,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Services', id: 'services' },
    { label: 'Rate List', id: 'rates' },
    { label: 'Certificates', id: 'certificates' },
    { label: 'Track Work', id: 'track' },
    { label: 'Send Documents', id: 'upload-docs' },
    { label: 'About Us', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Top Header Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-[11px] sm:text-xs uppercase tracking-wider">{siteInfo.openingHours || 'Mon - Sat: 8:00 AM - 9:00 PM'}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-xs text-[11px] sm:text-xs uppercase tracking-wider">{siteInfo.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Official Support</span>
              <a
                href={`tel:${siteInfo.phone}`}
                className="inline-flex items-center gap-1 text-white hover:text-indigo-300 font-black text-xs transition-colors tracking-tight"
              >
                <Phone className="w-3 h-3 text-indigo-400" />
                <span>+91 {siteInfo.phone}</span>
              </a>
            </div>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a
              href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20need%20information%20regarding%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WHATSAPP</span>
            </a>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700"
              title="Admin Portal Login"
            >
              <UserCog className="w-3 h-3 text-amber-400" />
              <span>ADMIN</span>
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
                <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase text-white group-hover:text-indigo-400 transition-colors">
                  AL KHALIL <span className="text-indigo-400">CYBER CENTRE</span>
                </h1>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" /> CSC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                Digital Services • Printing Studio • 4K Photography
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Direct CTA Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => handleNavClick('track')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Track Work</span>
            </button>

            <button
              onClick={() => handleNavClick('upload-docs')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:shadow-indigo-600/50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Send Documents</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleNavClick('track')}
              className="p-2 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded-lg"
              title="Track Work"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 duration-200">
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
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
            <a
              href={`tel:${siteInfo.phone}`}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 text-white font-black uppercase tracking-wider text-xs hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>Call Now</span>
            </a>
            <a
              href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20need%20service%20help.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-wider text-xs hover:bg-emerald-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="mt-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-xs hover:bg-slate-700"
            >
              <UserCog className="w-4 h-4 text-amber-400" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
