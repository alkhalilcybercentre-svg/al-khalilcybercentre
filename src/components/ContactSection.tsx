import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { SiteInfo } from '../types';
import { submitContactInquiry } from '../lib/api';

interface ContactSectionProps {
  siteInfo: SiteInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteInfo }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceInterest, setServiceInterest] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in Name, Phone, and your message.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await submitContactInquiry({
        name: name.trim(),
        phone: phone.trim(),
        serviceInterest,
        message: message.trim()
      });
      setSubmitted(true);
      setName('');
      setPhone('');
      setServiceInterest('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-slate-950 text-white scroll-mt-20 relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
            <span>DIRECT HELPLINE & LOCATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Contact AL KHALIL CYBER CENTRE
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Reach out via direct phone call, instant WhatsApp chat, or visit our centre during opening hours.
          </p>
        </div>

        {/* Prominent Quick Action Cards (Call Now & WhatsApp) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
          {/* Call Now Card */}
          <a
            href={`tel:${siteInfo.phone}`}
            className="flex items-center justify-between p-6 rounded-3xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-xl shadow-indigo-900/40 transition-all transform hover:-translate-y-1 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">
                  Official Phone Call
                </span>
                <strong className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {siteInfo.phone}
                </strong>
                <p className="text-xs text-indigo-100 font-medium mt-0.5">Click to Open Phone Dialer</p>
              </div>
            </div>
          </a>

          {/* WhatsApp Chat Card */}
          <a
            href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20want%20to%20connect.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 shadow-xl shadow-emerald-950/40 transition-all transform hover:-translate-y-1 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest block">
                  Official WhatsApp Desk
                </span>
                <strong className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {siteInfo.whatsapp}
                </strong>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">Instant Chat & Document Sharing</p>
              </div>
            </div>
          </a>
        </div>

        {/* Detailed Info & Inquiry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Business Location & Timings */}
          <div className="lg:col-span-5 space-y-5 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-black uppercase tracking-tight text-white border-b border-slate-800 pb-3">
              Centre Location & Timings
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-xs font-black">Address</strong>
                  <p className="text-slate-300 text-xs sm:text-sm mt-0.5 leading-relaxed font-medium">
                    {siteInfo.address}, {siteInfo.cityState} - {siteInfo.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-xs font-black">Opening Hours</strong>
                  <p className="text-slate-300 text-xs sm:text-sm mt-0.5 leading-relaxed font-medium">
                    {siteInfo.openingHours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                <div>
                  <strong className="text-white block uppercase tracking-wider text-xs font-black">Email</strong>
                  <p className="text-slate-300 text-xs sm:text-sm mt-0.5 font-medium">
                    {siteInfo.email || 'alkhalilcybercentre@gmail.com'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href={siteInfo.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(siteInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider transition-colors border border-slate-700"
              >
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Open in Google Maps / Get Directions</span>
              </a>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="lg:col-span-7 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              Send an Online Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
              Have questions about loan assistance, wedding photography dates, or bulk printing? Drop your details below.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-black uppercase tracking-tight text-white">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-emerald-200">
                  Our operator will contact you at <strong>{siteInfo.phone}</strong> or on WhatsApp soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10 digit phone number"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    Service of Interest (Optional)
                  </label>
                  <input
                    type="text"
                    value={serviceInterest}
                    onChange={(e) => setServiceInterest(e.target.value)}
                    placeholder="e.g. Wedding Photography, Bulk Flex Banner, Aadhaar Card"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Message / Question *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message or inquiry here..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium placeholder:text-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 border border-indigo-400/30"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
