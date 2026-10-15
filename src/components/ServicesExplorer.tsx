import React, { useState, useMemo, useRef } from 'react';
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
  ChevronLeft,
  ShieldAlert,
  ArrowUpRight,
  Receipt,
  Truck,
  ShieldCheck,
  Fingerprint,
  FileCheck,
  CreditCard,
  ShoppingBag,
  Zap,
  Coins,
  Printer,
  Camera,
  RotateCcw
} from 'lucide-react';
import { ServiceItem, SiteInfo } from '../types';
import { ServiceVisual } from './ServiceVisual';

interface ServicesExplorerProps {
  services: ServiceItem[];
  siteInfo: SiteInfo;
  selectedServiceModal: ServiceItem | null;
  onSelectServiceModal: (service: ServiceItem | null) => void;
  onOpenPickupDrop?: () => void;
}

interface CategoryTabDefinition {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  matcher: (service: ServiceItem) => boolean;
}

const PREDEFINED_TABS: CategoryTabDefinition[] = [
  {
    id: 'ALL',
    label: 'All Services',
    shortLabel: 'All',
    icon: Layers,
    description: 'Complete master catalogue of official CSC Jan Seva, Aadhaar, government certificates, bill payments, printing and media services.',
    matcher: () => true
  },
  {
    id: 'AADHAAR',
    label: 'Aadhaar Services',
    shortLabel: 'Aadhaar',
    icon: Fingerprint,
    description: 'UIDAI new enrollment, biometric updates, demographic corrections, and Aadhaar doorstep pickup & PVC card delivery facility.',
    matcher: (s) =>
      (s.serviceCode && s.serviceCode.startsWith('AAD-')) ||
      (s.subcategory && s.subcategory.toLowerCase().includes('aadhaar')) ||
      s.title.toLowerCase().includes('aadhaar')
  },
  {
    id: 'EDISTRICT',
    label: 'E-District & Certificates',
    shortLabel: 'E-District',
    icon: FileCheck,
    description: 'Authorized UP e-District revenue certificates: Income, Caste, Domicile, EWS, Haisiyat, UDID Disability & Marriage Registration.',
    matcher: (s) =>
      (s.serviceCode && (s.serviceCode.startsWith('ED-') || s.serviceCode.startsWith('GOV-'))) ||
      (s.subcategory &&
        (s.subcategory.toLowerCase().includes('district') ||
          s.subcategory.toLowerCase().includes('certificate') ||
          s.subcategory.toLowerCase().includes('marriage'))) ||
      s.title.toLowerCase().includes('certificate') ||
      s.title.toLowerCase().includes('praman patra')
  },
  {
    id: 'PAN',
    label: 'PAN Card Services',
    shortLabel: 'PAN Card',
    icon: CreditCard,
    description: 'Authorized NSDL & UTI new PAN card application, e-PAN generation, demographic corrections and physical PVC card reprints.',
    matcher: (s) =>
      (s.serviceCode && s.serviceCode.startsWith('PAN-')) ||
      s.title.toLowerCase().includes('pan card') ||
      (s.subcategory && s.subcategory.toLowerCase().includes('pan'))
  },
  {
    id: 'RATION',
    label: 'Ration Card Services',
    shortLabel: 'Ration Card',
    icon: ShoppingBag,
    description: 'UP FCS Food & Civil Supplies portal: New Antyodaya/Patra Grihasti ration cards, member addition/deletion & unit corrections.',
    matcher: (s) =>
      (s.serviceCode && s.serviceCode.startsWith('RATION-')) ||
      /\bration\b/i.test(s.title) ||
      /\bration\b/i.test(s.subcategory || '')
  },
  {
    id: 'LAND',
    label: 'Land & Revenue Records',
    shortLabel: 'Land Records',
    icon: FileText,
    description: 'Digital Bhulekh land records: Certified Khatauni copy, land ownership verification and Kutumb family register extract.',
    matcher: (s) =>
      (s.serviceCode && s.serviceCode.startsWith('LAND-')) ||
      (s.subcategory && s.subcategory.toLowerCase().includes('land')) ||
      s.title.toLowerCase().includes('khatauni') ||
      s.title.toLowerCase().includes('family register')
  },
  {
    id: 'BILLS',
    label: 'Bill Payments & Digital',
    shortLabel: 'Bill Payments',
    icon: Zap,
    description: 'Instant BBPS utility bill settlement: Bijli power bills, Jal Sansthan water, FASTag wallet top-up & LPG gas booking.',
    matcher: (s) =>
      s.category.toLowerCase().includes('bill') ||
      (s.serviceCode && (s.serviceCode.startsWith('BILL-') || s.serviceCode.startsWith('DIGI-'))) ||
      (s.subcategory && s.subcategory.toLowerCase().includes('recharge'))
  },
  {
    id: 'LOANS',
    label: 'Loans & Financial',
    shortLabel: 'Loans',
    icon: Coins,
    description: 'End-to-end documentation assistance: Personal loans, MSME business credit, Home loans, Vehicle financing & Loan Against Property (LAP).',
    matcher: (s) =>
      s.category.toLowerCase().includes('loan') ||
      (s.serviceCode && s.serviceCode.startsWith('LOAN-')) ||
      (s.subcategory && s.subcategory.toLowerCase().includes('loan'))
  },
  {
    id: 'PRINTING',
    label: 'Printing & Cards Studio',
    shortLabel: 'Printing',
    icon: Printer,
    description: 'Commercial printing press: Custom designer wedding invitation cards, heavy-duty flex banners, 350 GSM visiting cards & smart PVC cards.',
    matcher: (s) =>
      s.category.toLowerCase().includes('printing') ||
      (s.serviceCode && s.serviceCode.startsWith('PRINT-')) ||
      (s.subcategory && s.subcategory.toLowerCase().includes('printing'))
  },
  {
    id: 'MEDIA',
    label: 'Photography & Drone',
    shortLabel: 'Photo & Drone',
    icon: Camera,
    description: 'Cinematic photo & video studio: 4K multi-camera wedding videography, high-altitude aerial drone shoots & instant studio passport photos.',
    matcher: (s) =>
      s.category.toLowerCase().includes('photo') ||
      s.category.toLowerCase().includes('video') ||
      (s.serviceCode && s.serviceCode.startsWith('MEDIA-')) ||
      (s.subcategory && (s.subcategory.toLowerCase().includes('photo') || s.subcategory.toLowerCase().includes('video')))
  }
];

export const ServicesExplorer: React.FC<ServicesExplorerProps> = ({
  services,
  siteInfo,
  selectedServiceModal,
  onSelectServiceModal,
  onOpenPickupDrop
}) => {
  const [selectedTabId, setSelectedTabId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const activeServices = useMemo(() => {
    return services.filter((s) => s.active);
  }, [services]);

  // Build the complete list of tabs, including any dynamic categories not covered by predefined tabs
  const categoryTabs = useMemo(() => {
    // Check if any active service isn't covered by non-ALL predefined tabs
    const specificTabs = PREDEFINED_TABS.slice(1);
    const uncovered = activeServices.filter((s) => !specificTabs.some((tab) => tab.matcher(s)));

    const dynamicTabs: CategoryTabDefinition[] = [];
    if (uncovered.length > 0) {
      const uncoveredCategories = Array.from(new Set<string>(uncovered.map((s) => s.category).filter((c): c is string => Boolean(c))));
      uncoveredCategories.forEach((catName) => {
        dynamicTabs.push({
          id: `DYN_${catName}`,
          label: catName,
          shortLabel: catName,
          icon: Tag,
          description: `Services under ${catName}`,
          matcher: (s) => s.category === catName
        });
      });
    }

    return [...PREDEFINED_TABS, ...dynamicTabs];
  }, [activeServices]);

  // Compute item count per tab (for badge indicators)
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryTabs.forEach((tab) => {
      counts[tab.id] = activeServices.filter((s) => tab.matcher(s)).length;
    });
    return counts;
  }, [categoryTabs, activeServices]);

  // Currently active tab definition
  const currentTab = useMemo(() => {
    return categoryTabs.find((t) => t.id === selectedTabId) || categoryTabs[0];
  }, [categoryTabs, selectedTabId]);

  // Filtered services based on selected tab and search query
  const filteredServices = useMemo(() => {
    return activeServices.filter((s) => {
      const matchesTab = currentTab.matcher(s);
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.subcategory && s.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.serviceCode && s.serviceCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.requiredDocuments && s.requiredDocuments.some((doc) => doc.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesTab && matchesSearch;
    });
  }, [activeServices, currentTab, searchQuery]);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      tabsContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-950 text-slate-100 border-b border-slate-800 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>EXPANDED OFFICIAL CATALOG</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Official Services & Solutions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Authorized Jan Seva Kendra, Aadhaar doorstep pickup & drop facility, fast government applications, commercial printing studio, and premium 4K photography.
          </p>
        </div>

        {/* =========================================================================
            AADHAAR PICKUP & DROP CONVENIENCE FACILITY BANNER CARD
        ========================================================================= */}
        <div className="mb-10 bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/70 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
                    NEW CONVENIENCE FACILITY
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    Doorstep Service in Rampur & Tanda Area
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                  Aadhaar Doorstep Pickup & Drop Facility
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-normal">
                  Doorstep collection of physical documents/copies and home delivery of durable waterproof PVC smart cards. Specially designed for senior citizens, homemakers, and busy families.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold mt-2.5 flex-wrap">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Waterproof PVC Card Delivery
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Document Pickup for Online Forms
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    UIDAI Compliant & Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {onOpenPickupDrop && (
                <button
                  onClick={onOpenPickupDrop}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Truck className="w-4 h-4" />
                  <span>Book Pickup & Drop</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <a
                href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20want%20to%20inquire%20about%20Aadhaar%20Pickup%20and%20Drop%20service.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider border border-slate-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Quick WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SEARCH & TABBED FILTERING SYSTEM
        ========================================================================= */}
        <div className="space-y-5 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in catalogue (e.g. Aadhaar, Income, PAN, Ration, Khatauni, Flex, Drone)..."
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

          {/* Interactive Category Tab Navigation Bar */}
          <div className="relative">
            {/* Scroll navigation arrows for desktop / wide viewports */}
            <button
              onClick={() => handleScrollTabs('left')}
              className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 items-center justify-center shadow-lg transition-all"
              aria-label="Scroll tabs left"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScrollTabs('right')}
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 items-center justify-center shadow-lg transition-all"
              aria-label="Scroll tabs right"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Horizontal Scrollable Tabs Track */}
            <div
              ref={tabsContainerRef}
              role="tablist"
              aria-label="Service Category Tabs"
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md"
            >
              {categoryTabs.map((tab) => {
                const isSelected = selectedTabId === tab.id;
                const TabIcon = tab.icon;
                const count = tabCounts[tab.id] || 0;

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isSelected}
                    aria-controls="services-grid"
                    onClick={() => {
                      setSelectedTabId(tab.id);
                    }}
                    className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer min-h-[42px] select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 ring-1 ring-indigo-400/30'
                        : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/90 border border-slate-800/80'
                    }`}
                  >
                    <TabIcon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isSelected ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300'
                      }`}
                    />
                    <span>{tab.shortLabel}</span>
                    <span
                      className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Context Bar & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                {React.createElement(currentTab.icon, { className: 'w-4 h-4' })}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white uppercase tracking-wider">{currentTab.label}</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                    {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] truncate mt-0.5 font-normal">
                  {currentTab.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Search</span>
                </button>
              )}
              {selectedTabId !== 'ALL' && (
                <button
                  onClick={() => setSelectedTabId('ALL')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>View All Categories</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter / Status line */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-6 px-1">
          <span>
            Displaying <strong className="text-white font-black">{filteredServices.length}</strong> {filteredServices.length === 1 ? 'service' : 'services'}
            {searchQuery && <span> matching "<span className="text-indigo-400 lowercase">{searchQuery}</span>"</span>}
          </span>
          {searchQuery && (
            <span className="text-[11px] text-slate-400 normal-case font-medium">
              Searching within {currentTab.label}
            </span>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-3xl border border-dashed border-slate-800 p-8 max-w-md mx-auto">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase tracking-tight text-white">No Services Found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
              {searchQuery
                ? `No service in "${currentTab.label}" matched "${searchQuery}".`
                : `No services currently available under "${currentTab.label}".`}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider border border-slate-700"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTabId('ALL');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Show All 33 Services
              </button>
            </div>
          </div>
        ) : (
          <div id="services-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-indigo-500/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header with Dynamic Visual (Custom image or default category-specific Lucide icon) */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <ServiceVisual
                      service={service}
                      size="md"
                      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            {service.category}
                          </span>
                          {service.serviceCode && (
                            <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              {service.serviceCode}
                            </span>
                          )}
                        </div>
                        {service.priceStartingFrom && (
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/60 shrink-0">
                            {service.priceStartingFrom}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {service.title}
                      </h3>
                    </div>
                  </div>

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

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => onSelectServiceModal(service)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer border border-slate-700"
                  >
                    <span>Full Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>

                  {(service.serviceCode === 'HOME-PICKUP-001' || service.serviceCode === 'ADH-PICKUP') && onOpenPickupDrop ? (
                    <button
                      onClick={onOpenPickupDrop}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Book Pickup</span>
                    </button>
                  ) : (
                    <a
                      href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20want%20to%20apply/inquire%20for:%20${encodeURIComponent(
                        service.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Request Service</span>
                    </a>
                  )}
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
              <div className="flex items-start gap-4">
                <ServiceVisual service={selectedServiceModal} size="hero" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-md border border-indigo-500/30">
                      {selectedServiceModal.category}
                    </span>
                    {selectedServiceModal.serviceCode && (
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {selectedServiceModal.serviceCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">
                    {selectedServiceModal.title}
                  </h3>
                </div>
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
                {selectedServiceModal.serviceCode === 'ADH-PICKUP' && onOpenPickupDrop ? (
                  <button
                    onClick={() => {
                      onSelectServiceModal(null);
                      onOpenPickupDrop();
                    }}
                    className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase tracking-wider text-xs shadow-lg transition-colors cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Book Pickup & Drop</span>
                  </button>
                ) : (
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
                )}

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
