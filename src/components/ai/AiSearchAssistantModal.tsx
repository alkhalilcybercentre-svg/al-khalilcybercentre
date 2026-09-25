import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  X,
  Send,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { askAiSearchAssistant } from '../../lib/api';
import { SearchAssistantResponse } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phone?: string;
  whatsapp?: string;
}

const QUICK_INQUIRIES = [
  'PAN Card apply karne ke liye kya documents chahiye?',
  'Aadhaar card mein mobile number update kaise karein?',
  'UP Scholarship 2026 application form documents and eligibility',
  'Voter ID card new online registration process',
  'Jan Seva Kendra se Domicile / Niwas Praman Patra kaise banta hai?',
  'Driving License online application procedure & test fees'
];

export const AiSearchAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  phone = '9259837361',
  whatsapp = '9259837361'
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SearchAssistantResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const handleSearch = async (textToSearch?: string) => {
    const q = (textToSearch || query).trim();
    if (!q) return;

    try {
      setLoading(true);
      setError('');
      setQuery(q);

      const res = await askAiSearchAssistant(q, history);
      setResult(res);

      setHistory(prev => [
        ...prev,
        { role: 'user', text: q },
        { role: 'assistant', text: res.answer }
      ]);
    } catch (err: any) {
      console.error('Search assistant error:', err);
      setError(err.message || 'Failed to fetch information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  Govt Scheme & Service Search Assistant <span className="text-blue-400">/ सर्च असिस्टेंट</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-400" /> Google Search Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Real-time official requirements, fees, portals, and CSC Jan Seva guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Search Input Bar */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: PAN, Aadhaar, Voter ID, Scholarship, UP eDistrict... (Hindi or English)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-11 pr-24 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              disabled={loading}
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Search</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* Quick Inquiry Pills */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Popular Inquiries / लोकप्रिय सवाल:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_INQUIRIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(item)}
                  disabled={loading}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors text-left flex items-center gap-1 group cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Grounding Search via Google & Gemini 3.5...
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verifying official portals, government fees, and document checklists
                </p>
              </div>
            </div>
          )}

          {/* Search Result Display */}
          {result && !loading && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Grounding Source Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-200">
                    Verified with Real-Time Google Search Grounding
                  </span>
                </div>
                <span className="text-[10px] font-mono text-blue-300 px-2 py-0.5 rounded bg-blue-900/50">
                  Model: {result.modelUsed}
                </span>
              </div>

              {/* Answer Content */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="prose prose-invert max-w-none text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                  {result.answer}
                </div>

                {/* Grounding Sources / Official Portals Links */}
                {result.sources && result.sources.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                      Official Government & Verification Sources / स्रोत:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-blue-300 hover:text-blue-200 border border-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                          <span className="truncate max-w-[200px]">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cyber Centre Direct Assistance Action Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase text-white block">
                      Need help applying? Visit AL KHALIL CYBER CENTRE
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Authorized CSC Jan Seva Kendra - Instant, error-free online form submission
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${phone}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Call {phone}
                  </a>
                  <a
                    href={`https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20have%20an%20inquiry%20regarding:%20${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
