import React from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  ShieldCheck,
  ChevronRight,
  UserCog,
  Heart
} from 'lucide-react';
import { SiteInfo } from '../types';

interface FooterProps {
  siteInfo: SiteInfo;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteInfo, onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-indigo-400/30 flex items-center justify-center text-white font-black text-lg shadow-md">
                AK
              </div>
              <div>
                <h3 className="font-black text-white text-base tracking-tight uppercase">
                  {siteInfo.businessName}
                </h3>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">
                  Authorized CSC Jan Seva Kendra
                </p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs font-medium">
              {siteInfo.tagline ||
                'Your premier authorized destination for all Digital Services, Jan Seva schemes, high-speed multi-color printing, custom wedding cards, and 4K wedding videography.'}
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Authorized & Secure Portal</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-black text-white uppercase text-xs tracking-widest border-b border-slate-800 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wide">
              {[
                { label: 'Home Page', id: 'home' },
                { label: 'AI Tools Suite', id: 'ai-tools' },
                { label: 'Services Catalog', id: 'services' },
                { label: 'Rate List & Prices', id: 'rates' },
                { label: 'Certificates & License', id: 'certificates' },
                { label: 'Track Work Online', id: 'track' },
                { label: 'Send Documents', id: 'upload-docs' },
                { label: 'Cyber Safety & Fraud Advisory', id: 'cyber-safety' },
                { label: 'About Centre', id: 'about' },
                { label: 'Contact & Location', id: 'contact' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Key Services */}
          <div className="space-y-3">
            <h4 className="font-black text-white uppercase text-xs tracking-widest border-b border-slate-800 pb-2">
              Major Services
            </h4>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              {[
                'Aadhaar & PAN Card Corrections',
                'Ayushman Golden Health Card',
                'Government Job & Exam Forms',
                'Wedding & Invitation Cards',
                'Flex Banner & Poster Printing',
                '4K Drone & Wedding Videography',
                'PVC Smart ID & Lamination'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Official Contact */}
          <div className="space-y-3">
            <h4 className="font-black text-white uppercase text-xs tracking-widest border-b border-slate-800 pb-2">
              Official Helpline
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <a href={`tel:${siteInfo.phone}`} className="hover:text-white font-black text-sm block tracking-tight">
                    {siteInfo.phone}
                  </a>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Official Mobile (Call & Dial)</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-300 font-black text-sm block text-emerald-400 tracking-tight"
                  >
                    {siteInfo.whatsapp}
                  </a>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">WhatsApp Online Desk</span>
                </div>
              </div>

              <div className="flex items-start gap-2 font-medium">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{siteInfo.address}</span>
              </div>

              <div className="flex items-start gap-2 font-medium">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{siteInfo.openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="font-medium">
            © {new Date().getFullYear()} <strong className="text-slate-300 font-black uppercase tracking-wider">{siteInfo.businessName}</strong>. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-widest"
            >
              <UserCog className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
