import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { WorkJob, JobStatus, SiteInfo } from '../types';
import { trackWorkJob } from '../lib/api';

interface WorkTrackerSectionProps {
  siteInfo: SiteInfo;
}

export const WorkTrackerSection: React.FC<WorkTrackerSectionProps> = ({ siteInfo }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedJob, setTrackedJob] = useState<WorkJob | null>(null);

  const handleTrack = async (e?: React.FormEvent, codeToUse?: string) => {
    if (e) e.preventDefault();
    const code = (codeToUse || tokenInput).trim();
    if (!code) {
      setError('Please enter your Tracking Token (e.g., AK-59124)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await trackWorkJob(code);
      setTrackedJob(data);
    } catch (err: any) {
      setError(err.message || 'Work token not found. Please verify the ID.');
      setTrackedJob(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'Received':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600' };
      case 'Processing':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-600' };
      case 'Pending':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-600' };
      case 'Ready':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-600' };
      case 'Completed':
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-700' };
      case 'On Hold':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-600' };
      default:
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-600' };
    }
  };

  const steps: JobStatus[] = ['Received', 'Processing', 'Ready', 'Completed'];

  const getStepIndex = (status: JobStatus) => {
    if (status === 'Received') return 0;
    if (status === 'Processing' || status === 'Pending') return 1;
    if (status === 'Ready') return 2;
    if (status === 'Completed') return 3;
    return 0;
  };

  return (
    <section id="track" className="py-16 sm:py-20 bg-slate-950 text-white scroll-mt-20 relative overflow-hidden border-b border-slate-800">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>REAL-TIME STATUS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
            Track Your Work Online
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Enter the unique Tracking ID (Token) provided on your receipt or SMS to check your work status live.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-2xl mx-auto">
          <form onSubmit={(e) => handleTrack(e)} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  placeholder="Enter Tracking Token (e.g., AK-59124)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-base font-bold tracking-wider placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 border border-indigo-400/30"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Track Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Tokens */}
            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap pt-1 font-bold">
              <span className="uppercase tracking-wider text-[11px]">Try Demo ID:</span>
              {['AK-59124', 'AK-78210', 'AK-39148'].map((sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => {
                    setTokenInput(sample);
                    handleTrack(undefined, sample);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold text-xs cursor-pointer transition-colors border border-slate-700"
                >
                  {sample}
                </button>
              ))}
            </div>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider">{error}</p>
                <p className="text-rose-300/80 mt-1">
                  Need help? Call our official desk at <strong>{siteInfo.phone}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Tracked Job Results Box */}
          {trackedJob && (
            <div className="mt-8 pt-8 border-t border-slate-800 space-y-6 animate-in fade-in duration-300">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                      {trackedJob.trackingCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      Registered: {new Date(trackedJob.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mt-1">
                    {trackedJob.serviceName}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Customer: <strong className="text-white font-bold">{trackedJob.customerName}</strong></span>
                  </p>
                </div>

                <div className="sm:text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                      getStatusColor(trackedJob.status).bg
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-ping ${
                        getStatusColor(trackedJob.status).dot
                      }`}
                    />
                    <span>{trackedJob.status.toUpperCase()}</span>
                  </div>
                  {trackedJob.estimatedDelivery && (
                    <p className="text-xs text-slate-400 mt-1 font-bold">
                      Est. Delivery: <strong className="text-slate-200">{trackedJob.estimatedDelivery}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Steps Visualizer */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {steps.map((st, i) => {
                    const currentIdx = getStepIndex(trackedJob.status);
                    const isDone = i <= currentIdx;
                    const isCurrent = i === currentIdx;

                    return (
                      <div key={st} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span
                          className={`font-black uppercase tracking-wider text-[11px] ${
                            isCurrent ? 'text-indigo-400' : isDone ? 'text-slate-200' : 'text-slate-500'
                          }`}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Remarks */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-black text-indigo-400 uppercase tracking-widest text-[10px]">
                    Operator Status Note:
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Last Updated: {new Date(trackedJob.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {trackedJob.statusNotes || 'Your job is currently in processing queue.'}
                </p>
              </div>

              {/* Pricing & Support Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {trackedJob.priceTotal && (
                  <div className="text-slate-300 font-bold">
                    Total Amount: <strong className="text-emerald-400 font-black">{trackedJob.priceTotal}</strong>
                    {trackedJob.amountPaid && <span> (Paid: {trackedJob.amountPaid})</span>}
                  </div>
                )}

                <a
                  href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20have%20an%20inquiry%20regarding%20Token%20${trackedJob.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-black uppercase tracking-wider text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire about this Token on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
