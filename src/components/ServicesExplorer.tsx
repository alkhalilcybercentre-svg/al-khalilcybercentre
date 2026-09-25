import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Tag,
  MessageCircle,
  X,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { ServiceItem, SiteInfo } from '../types';

interface ServicesExplorerProps {
  services: ServiceItem[];
  siteInfo: SiteInfo;
  selectedServiceModal: ServiceItem | null;
  onSelectServiceModal: (service: ServiceItem | null) => void;
}

export const ServicesExplorer: React.FC<ServicesExplorerProps> = ({
  services,
  siteInfo,
  selectedServiceModal,
  onSelectServiceModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeServices = services.filter((s) => s.active);

  // Extract unique categories dynamically from database
  const categories = useMemo(() => {
    const set = new Set<string>();
    activeServices.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [activeServices]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return activeServices.filter((s) => {
      const matchCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeServices, selectedCategory, searchQuery]);

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-950 text-slate-100 border-b border-slate-800 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>COMPLETE CATALOG</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Our Official Services Portfolio
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Authorized Jan Seva Kendra, fast online government applications, commercial printing studio, and premium 4K photography services.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4 mb-10">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service (e.g., Aadhaar, PAN, Wedding Card, Drone, Xerox)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-400 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Services' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-6 px-1">
          <span>
            Showing <strong className="text-white font-black">{filteredServices.length}</strong> services available
          </span>
          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="text-indigo-400 hover:text-indigo-300 font-black cursor-pointer uppercase"
            >
              Reset Category
            </button>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-3xl border border-dashed border-slate-800 p-8 max-w-md mx-auto">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase tracking-tight text-white">No Services Found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              We could not find anything matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Show All Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                        {service.category}
                      </span>
                      {service.serviceCode && (
                        <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {service.serviceCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {service.chargeBreakdown && service.chargeBreakdown.length > 0 && (
                        <span className="text-[9px] font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/80">
                          Fee Itemized
                        </span>
                      )}
                      {service.priceStartingFrom && (
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                          {service.priceStartingFrom}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {service.shortDescription}
                  </p>

                  {/* Estimated Time Badge */}
                  {service.estimatedTime && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-3">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Duration: <strong className="text-slate-200">{service.estimatedTime}</strong></span>
                    </div>
                  )}

                  {/* Key Required Docs Bullet preview */}
                  {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                    <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800/80 space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        Required Documents:
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {service.requiredDocuments.slice(0, 2).map((doc, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{doc}</span>
                          </li>
                        ))}
                        {service.requiredDocuments.length > 2 && (
                          <li className="text-[10px] text-indigo-400 font-black tracking-wider pl-5 uppercase">
                            +{service.requiredDocuments.length - 2} more documents...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectServiceModal(service)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700"
                  >
                    <span>Full Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>

                  <a
                    href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20want%20to%20apply/inquire%20for:%20${encodeURIComponent(
                      service.title
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Details Modal / Drawer */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700 relative my-8 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => onSelectServiceModal(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-md border border-indigo-500/30">
                  {selectedServiceModal.category}
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-2">
                  {selectedServiceModal.title}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-sm text-slate-300">
                <p className="leading-relaxed font-normal">
                  {selectedServiceModal.fullDescription || selectedServiceModal.shortDescription}
                </p>
              </div>

              {/* Specs & Time */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] block">Estimated Time</span>
                  <strong className="text-white font-black text-sm block mt-0.5">
                    {selectedServiceModal.estimatedTime || 'Fast Processing'}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px] block">Standard Rate</span>
                  <strong className="text-emerald-300 font-black text-sm block mt-0.5">
                    {selectedServiceModal.priceStartingFrom || 'Transparent Rate'}
                  </strong>
                </div>
              </div>

              {/* Transparent Fee & Charge Breakdown if present */}
              {selectedServiceModal.chargeBreakdown && selectedServiceModal.chargeBreakdown.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Official Fee & Charge Breakdown:</span>
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      Transparent Rates
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[340px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] uppercase font-black text-slate-400">
                          <th className="py-1.5 px-2">Work / Service Item</th>
                          <th className="py-1.5 px-2 text-right">Govt Fee</th>
                          <th className="py-1.5 px-2 text-right">Centre Charge</th>
                          <th className="py-1.5 px-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-[11px]">
                        {selectedServiceModal.chargeBreakdown.map((row, idx) => {
                          const g = Number(row.govtFee) || 0;
                          const c = Number(row.centreCharge) || 0;
                          return (
                            <tr key={idx} className="text-slate-300 hover:bg-slate-900/40">
                              <td className="py-2 px-2 font-medium text-white">{row.name}</td>
                              <td className="py-2 px-2 text-right font-mono text-blue-300">₹{g.toLocaleString('en-IN')}</td>
                              <td className="py-2 px-2 text-right font-mono text-indigo-300">₹{c.toLocaleString('en-IN')}</td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">
                                ₹{(g + c).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Breakdown Totals Footer */}
                    {(() => {
                      const rows = selectedServiceModal.chargeBreakdown || [];
                      const gTotal = rows.reduce((s, r) => s + (Number(r.govtFee) || 0), 0);
                      const cTotal = rows.reduce((s, r) => s + (Number(r.centreCharge) || 0), 0);
                      const grand = gTotal + cTotal;
                      return (
                        <div className="pt-2 mt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-[10px] font-bold">
                          <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-900/40 text-center">
                            <span className="text-blue-400 block text-[9px] uppercase">Govt Fee</span>
                            <strong className="text-white font-mono text-xs">₹{gTotal.toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-900/40 text-center">
                            <span className="text-indigo-400 block text-[9px] uppercase">Centre Charge</span>
                            <strong className="text-white font-mono text-xs">₹{cTotal.toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
                            <span className="text-emerald-400 block text-[9px] uppercase">Grand Total</span>
                            <strong className="text-emerald-300 font-mono text-xs">₹{grand.toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Required Documents List */}
              {selectedServiceModal.requiredDocuments && selectedServiceModal.requiredDocuments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Documents Required from Customer:</span>
                  </h4>
                  <ul className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                    {selectedServiceModal.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20want%20to%20apply%20for:%20${encodeURIComponent(
                    selectedServiceModal.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider text-xs shadow-lg transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp</span>
                </a>

                <a
                  href={`tel:${siteInfo.phone}`}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider text-xs shadow-lg transition-colors cursor-pointer border border-indigo-400/30"
                >
                  <span>Call {siteInfo.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
