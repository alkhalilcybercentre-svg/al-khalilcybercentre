import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  Pin, 
  ChevronRight, 
  X,
  FileText,
  Clock,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { NoticeItem } from '../types';

interface NoticeBoardProps {
  notices: NoticeItem[];
  onActionClick?: (url: string) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices = [], onActionClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalNotice, setActiveModalNotice] = useState<NoticeItem | null>(null);

  const activeNotices = notices.filter(n => n.active !== false);

  if (activeNotices.length === 0) {
    return null;
  }

  // Get urgent or pinned notice for top flash banner
  const urgentNotice = activeNotices.find(n => n.priority === 'urgent' || n.isPinned) || activeNotices[0];

  const categories = ['all', 'Urgent Announcement', 'Govt Scheme Update', 'Holiday Notice', 'Exam & Jobs'];

  const filteredNotices = selectedCategory === 'all'
    ? activeNotices
    : activeNotices.filter(n => n.category === selectedCategory || (selectedCategory === 'Exam & Jobs' && n.category.includes('Exam')));

  const getPriorityStyle = (priority: NoticeItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
          border: 'border-red-500/30 hover:border-red-500/60',
          icon: 'text-red-400',
          glow: 'shadow-red-950/40'
        };
      case 'high':
        return {
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          border: 'border-amber-500/30 hover:border-amber-500/60',
          icon: 'text-amber-400',
          glow: 'shadow-amber-950/30'
        };
      default:
        return {
          badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
          border: 'border-cyan-500/20 hover:border-cyan-500/40',
          icon: 'text-cyan-400',
          glow: 'shadow-cyan-950/20'
        };
    }
  };

  const handleAction = (url?: string) => {
    if (!url) return;
    if (onActionClick) {
      onActionClick(url);
    } else if (url.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="notices" className="relative py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Flash Announcement Banner */}
        {urgentNotice && (
          <div 
            id="flash-urgent-alert"
            className="mb-10 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900/90 to-amber-950/80 border border-red-500/40 p-4 sm:p-5 shadow-xl shadow-red-950/30 backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <span className="relative flex h-3.5 w-3.5 mt-1 sm:mt-0 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {urgentNotice.badgeText || 'FLASH ALERT'}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">
                    {urgentNotice.category}
                  </span>
                </div>
              </div>

              <div className="flex-1 md:px-2">
                <h4 className="text-white font-semibold text-sm sm:text-base line-clamp-2 leading-snug">
                  {urgentNotice.title}
                </h4>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  id="view-urgent-notice-btn"
                  onClick={() => setActiveModalNotice(urgentNotice)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Read Full Notice
                </button>
                {urgentNotice.actionUrl && (
                  <button
                    id="urgent-notice-action-btn"
                    onClick={() => handleAction(urgentNotice.actionUrl)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {urgentNotice.actionText || 'Apply Now'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              Live Official Announcements
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Digital Notice Board & Scheme Updates
            </h2>
            <p className="mt-1 text-slate-400 text-sm sm:text-base max-w-2xl">
              Stay updated with government scholarship deadlines, newly launched public welfare schemes, centre timings, and recruitment announcements.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
            {categories.map((cat) => {
              const label = cat === 'all' ? 'All Notices' : cat;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`filter-notice-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-900/30' 
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotices.map((notice) => {
            const style = getPriorityStyle(notice.priority);
            return (
              <div
                key={notice.id}
                id={`notice-card-${notice.id}`}
                className={`group relative rounded-2xl bg-slate-900/80 border ${style.border} p-5 flex flex-col justify-between transition-all duration-300 hover:bg-slate-850 hover:shadow-xl ${style.glow} backdrop-blur-sm`}
              >
                {/* Pin indicator */}
                {notice.isPinned && (
                  <div className="absolute top-3 right-3 text-amber-400 flex items-center gap-1 text-[11px] font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Pin className="w-3 h-3 fill-amber-400" />
                    Pinned
                  </div>
                )}

                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center gap-2 mb-3 pr-16">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${style.badgeBg}`}>
                      {notice.badgeText || notice.priority.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-xs font-medium truncate">
                      {notice.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-base leading-snug mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {notice.title}
                  </h3>

                  {/* Description preview */}
                  <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                    {notice.description}
                  </p>
                </div>

                {/* Footer Info & Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{notice.publishDate || 'Recent'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-read-more-${notice.id}`}
                      onClick={() => setActiveModalNotice(notice)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {notice.actionUrl && (
                      <button
                        id={`btn-action-${notice.id}`}
                        onClick={() => handleAction(notice.actionUrl)}
                        className="px-2.5 py-1 rounded-md bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white font-medium transition-all flex items-center gap-1 cursor-pointer border border-cyan-500/30"
                      >
                        {notice.actionText || 'Apply'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice Detail Modal */}
        {activeModalNotice && (
          <div 
            id="notice-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            onClick={() => setActiveModalNotice(null)}
          >
            <div 
              id="notice-modal-content"
              className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 text-left overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                id="close-notice-modal-btn"
                onClick={() => setActiveModalNotice(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeModalNotice.category}
                </span>
                {activeModalNotice.badgeText && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeModalNotice.badgeText}
                  </span>
                )}
                {activeModalNotice.isPinned && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-red-400" />
                    Important
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
                {activeModalNotice.title}
              </h3>

              {/* Date & Center Reference */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-6 pb-4 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Published: {activeModalNotice.publishDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  AL KHALIL CYBER CENTRE Official Update
                </span>
              </div>

              {/* Full Description */}
              <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-3 mb-8 whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                {activeModalNotice.description}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  id="modal-dismiss-btn"
                  onClick={() => setActiveModalNotice(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Close
                </button>
                {activeModalNotice.actionUrl && (
                  <button
                    id="modal-primary-action-btn"
                    onClick={() => {
                      const url = activeModalNotice.actionUrl;
                      setActiveModalNotice(null);
                      handleAction(url);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {activeModalNotice.actionText || 'Proceed with Service'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
