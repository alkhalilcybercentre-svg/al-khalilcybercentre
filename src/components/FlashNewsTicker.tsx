import React, { useState } from 'react';
import { Flame, Sparkles, ExternalLink, Pause, Play } from 'lucide-react';
import { FlashNewsItem } from '../types';

interface FlashNewsTickerProps {
  news: FlashNewsItem[];
  onNewsClick?: (link?: string) => void;
}

export const FlashNewsTicker: React.FC<FlashNewsTickerProps> = ({ news, onNewsClick }) => {
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  const activeNews = news
    .filter((item) => item.active)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (activeNews.length === 0) return null;

  // Duplicate items 4 times to guarantee a wide, gapless seamless scrolling loop on all screen sizes
  const repeatedNews = [...activeNews, ...activeNews, ...activeNews, ...activeNews];

  const getBadgeStyle = (badge?: string) => {
    const b = badge?.toUpperCase().trim();
    if (b === 'URGENT' || b === 'EMERGENCY' || b === 'ALERT') {
      return 'bg-yellow-400 text-slate-950 font-black shadow-xs';
    }
    if (b === 'NEW' || b === 'LIVE') {
      return 'bg-emerald-400 text-slate-950 font-black shadow-xs';
    }
    if (b === 'OFFER' || b === 'DISCOUNT') {
      return 'bg-amber-300 text-slate-950 font-black shadow-xs';
    }
    if (b === 'IMPORTANT' || b === 'CSC') {
      return 'bg-white text-red-700 font-black shadow-xs';
    }
    return 'bg-slate-950/40 text-white border border-white/30 font-bold';
  };

  const handleItemClick = (item: FlashNewsItem) => {
    if (item.link && onNewsClick) {
      onNewsClick(item.link);
    }
  };

  return (
    <div
      id="flash-news-ticker-container"
      className="group-marquee w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white border-b border-red-700/80 shadow-md relative z-20 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center h-10 sm:h-11 px-3 sm:px-4">
        {/* Fixed "Latest Update" Badge on the left */}
        <div
          id="ticker-header-badge"
          className="shrink-0 z-10 flex items-center gap-1.5 bg-white text-red-700 px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wider shadow-md mr-2 sm:mr-3 border border-red-200/50"
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-500 opacity-75"></span>
            <Flame className="relative w-3.5 h-3.5 fill-red-600 text-red-600" />
          </div>
          <span className="hidden sm:inline">LATEST UPDATES</span>
          <span className="sm:hidden font-extrabold">UPDATES</span>
        </div>

        {/* Marquee Track Container with subtle fade gradient edges */}
        <div className="grow min-w-0 relative h-full flex items-center overflow-hidden">
          {/* Left subtle fade */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-red-600 to-transparent z-10 pointer-events-none hidden sm:block" />

          {/* Right subtle fade */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-red-600 to-transparent z-10 pointer-events-none hidden sm:block" />

          {/* Continuous Right-to-Left Scrolling Track */}
          <div
            id="marquee-scroll-track"
            className="animate-marquee-smooth flex items-center whitespace-nowrap cursor-pointer py-1"
            style={{
              animationPlayState: isManuallyPaused ? 'paused' : undefined
            }}
          >
            {repeatedNews.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => handleItemClick(item)}
                className="inline-flex items-center gap-2.5 px-4 text-xs sm:text-sm font-bold tracking-wide hover:text-amber-200 transition-colors group/item"
              >
                {/* News Badge if present */}
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${getBadgeStyle(
                      item.badge
                    )}`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* News Content */}
                <span className="text-white group-hover/item:text-amber-200 group-hover/item:underline underline-offset-2 transition-colors">
                  {item.text}
                </span>

                {/* External link indicator if link exists */}
                {item.link && (
                  <ExternalLink className="w-3 h-3 text-red-200 opacity-75 group-hover/item:opacity-100 shrink-0" />
                )}

                {/* Sparkling / Dot separator between items */}
                <span className="inline-flex items-center text-red-200/80 px-2 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300 opacity-90" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Play/Pause Control Button on the Right */}
        <div className="shrink-0 z-10 pl-2 hidden sm:flex items-center">
          <button
            type="button"
            id="btn-toggle-ticker-pause"
            onClick={() => setIsManuallyPaused(!isManuallyPaused)}
            title={isManuallyPaused ? 'Resume scrolling' : 'Pause scrolling'}
            aria-label={isManuallyPaused ? 'Resume scrolling' : 'Pause scrolling'}
            className="p-1 rounded-md bg-red-700/80 hover:bg-red-800 text-red-100 hover:text-white border border-red-500/50 transition-colors cursor-pointer"
          >
            {isManuallyPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-current" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
