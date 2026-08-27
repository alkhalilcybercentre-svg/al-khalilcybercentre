import React, { useState, useMemo } from 'react';
import {
  Tag,
  Search,
  Printer,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { RateItem, SiteInfo } from '../types';

interface RateListSectionProps {
  rates: RateItem[];
  siteInfo: SiteInfo;
  onNavigate: (sectionId: string) => void;
}

export const RateListSection: React.FC<RateListSectionProps> = ({ rates, siteInfo, onNavigate }) => {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [rateSearch, setRateSearch] = useState<string>('');

  const activeRates = rates.filter((r) => r.active);

  const categories = useMemo(() => {
    const set = new Set<string>();
    activeRates.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [activeRates]);

  const filteredRates = useMemo(() => {
    return activeRates.filter((r) => {
      const matchCat = selectedCat === 'ALL' || r.category === selectedCat;
      const matchSearch =
        rateSearch.trim() === '' ||
        r.serviceName.toLowerCase().includes(rateSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(rateSearch.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(rateSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeRates, selectedCat, rateSearch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="rates" className="py-16 sm:py-20 bg-slate-900 text-slate-100 border-b border-slate-800 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>TRANSPARENT PRICING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
              Official Rate List & Price Chart
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 max-w-2xl">
              100% fair and transparent rates with no hidden charges. All government and printing services priced affordably.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Print Rate List</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={rateSearch}
              onChange={(e) => setRateSearch(e.target.value)}
              placeholder="Search rate (e.g., Xerox, Lamination, PAN, PVC)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'All Rates' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rate List Table / Cards */}
        <div className="overflow-hidden rounded-3xl border border-slate-700 shadow-xl bg-slate-800">
          <div className="hidden sm:grid grid-cols-12 bg-slate-950 text-slate-300 text-xs font-black uppercase tracking-wider py-4 px-6 border-b border-slate-700">
            <div className="col-span-3">Category</div>
            <div className="col-span-5">Service / Product Name</div>
            <div className="col-span-2 text-right">Standard Rate</div>
            <div className="col-span-2 text-right">Unit / Remarks</div>
          </div>

          <div className="divide-y divide-slate-700/80">
            {filteredRates.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                No rates found matching your query.
              </div>
            ) : (
              filteredRates.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center py-4 px-5 sm:px-6 hover:bg-slate-700/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-850' : 'bg-slate-800'
                  }`}
                >
                  {/* Category */}
                  <div className="col-span-3 mb-1 sm:mb-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                      {item.category}
                    </span>
                  </div>

                  {/* Service Name */}
                  <div className="col-span-5 pr-2">
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">
                      {item.serviceName}
                    </h4>
                    {item.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{item.notes}</span>
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="col-span-2 sm:text-right mt-2 sm:mt-0 flex sm:block items-center gap-2">
                    <span className="sm:hidden text-[10px] uppercase font-bold text-slate-400">Rate:</span>
                    <span className="text-base font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md sm:bg-transparent sm:p-0">
                      {item.price}
                    </span>
                  </div>

                  {/* Unit */}
                  <div className="col-span-2 sm:text-right text-xs text-slate-300 font-bold uppercase tracking-wider mt-1 sm:mt-0">
                    <span>{item.unit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note / Disclaimer */}
        <div className="mt-6 flex items-start gap-2.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 uppercase tracking-wider font-bold">Important Note:</strong> Bulk printing (wedding cards, visiting cards, flex banners) receives special promotional discounts based on volume. Custom photography packages are finalized based on event hours & venue requirements.
          </div>
        </div>
      </div>
    </section>
  );
};
