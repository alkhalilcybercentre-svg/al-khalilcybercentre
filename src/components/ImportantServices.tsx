import React from 'react';
import {
  ArrowRight,
  Sparkles,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { ServiceItem, SiteInfo } from '../types';
import { ServiceVisual } from './ServiceVisual';

interface ImportantServicesProps {
  services: ServiceItem[];
  siteInfo: SiteInfo;
  onSelectService: (service: ServiceItem) => void;
  onNavigate: (sectionId: string) => void;
}

export const ImportantServices: React.FC<ImportantServicesProps> = ({
  services,
  siteInfo,
  onSelectService,
  onNavigate
}) => {
  // Get popular services or fallback to top 6
  const popularServices = services
    .filter((s) => s.active && s.isPopular)
    .slice(0, 6);

  const displayList = popularServices.length >= 4 ? popularServices : services.filter((s) => s.active).slice(0, 6);

  return (
    <section className="py-14 sm:py-20 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>KEY HIGHLIGHTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
              Important Business Services
            </h2>
            <p className="text-slate-400 mt-1.5 text-xs sm:text-sm font-medium max-w-2xl">
              Most requested government, citizen, printing, and digital documentation services at AL KHALIL CYBER CENTRE.
            </p>
          </div>

          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-black text-xs uppercase tracking-wider group cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((service) => {
            return (
              <div
                key={service.id}
                className="group relative bg-slate-800 hover:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-700 hover:border-indigo-500/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Dynamic Visual Header (Custom image or default category-specific Lucide icon) */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <ServiceVisual
                      service={service}
                      size="md"
                      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
                    />
                    {service.priceStartingFrom && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-900 text-emerald-400 border border-slate-700 shadow-sm shrink-0">
                        {service.priceStartingFrom}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">
                    {service.category}
                  </span>

                  <h3 className="text-base sm:text-lg font-black text-white mt-1 mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectService(service)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-slate-300 hover:text-white uppercase tracking-wider cursor-pointer"
                  >
                    <span>Check Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20want%20to%20inquire%20about:%20${encodeURIComponent(
                      service.title
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl text-emerald-400 bg-emerald-950/60 hover:bg-emerald-600 hover:text-white border border-emerald-800 transition-colors"
                    title="Inquire on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instant Action Banner */}
        <div className="mt-12 rounded-3xl bg-indigo-600 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 text-white px-2.5 py-1 rounded">FAST RESPONSE</span>
            <h4 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Need Instant Aadhaar, PAN, or Printing Assistance?
            </h4>
            <p className="text-indigo-100 text-xs sm:text-sm font-medium">
              Visit our centre directly or connect with our official operator right now on call.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center relative z-10">
            <a
              href={`tel:${siteInfo.phone}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer w-full sm:w-auto"
            >
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              <span>Call {siteInfo.phone}</span>
            </a>
            <button
              onClick={() => onNavigate('upload-docs')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer w-full sm:w-auto"
            >
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
