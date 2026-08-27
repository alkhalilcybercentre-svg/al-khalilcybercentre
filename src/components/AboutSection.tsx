import React from 'react';
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Printer,
  Camera,
  MapPin,
  FileCheck
} from 'lucide-react';
import { SiteInfo } from '../types';

interface AboutSectionProps {
  siteInfo: SiteInfo;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ siteInfo }) => {
  const stats = [
    { label: 'Citizens Served', value: '15,000+', icon: Users },
    { label: 'Authorized CSC Services', value: '100+', icon: ShieldCheck },
    { label: 'Printed Wedding Cards', value: '50,000+', icon: Printer },
    { label: '4K Cinematic Events', value: '350+', icon: Camera },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 bg-slate-900 text-slate-100 border-b border-slate-800 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story & Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>ABOUT AL KHALIL CYBER CENTRE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
              Your Trusted Digital, CSC & Creative Media Partner
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              {siteInfo.aboutText ||
                'AL KHALIL CYBER CENTRE is your dedicated one-stop digital hub offering authorized CSC Jan Seva Kendra services, instant government certificates, professional multi-color offset and digital printing, flex banners, and 4K Ultra HD wedding photography & videography.'}
            </p>

            <div className="space-y-3 pt-2">
              {(siteInfo.aboutHighlights || [
                '100% Authorized & Secure Government Portal Integration',
                'Live Work Tracking Token System for Transparency',
                'State-of-the-Art High-Speed Multi-Color Laser Printers & Lamination',
                'Full 4K Cinema Wedding Photography & Drone Aerial Videography'
              ]).map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center gap-3 text-xs sm:text-sm text-slate-300">
              <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <strong className="text-white uppercase tracking-wider">Official Physical Address:</strong> {siteInfo.address} ({siteInfo.cityState} - {siteInfo.pincode})
              </div>
            </div>
          </div>

          {/* Right Column: Visual Trust Bento Box */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-xl flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {stat.value}
                    </span>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
