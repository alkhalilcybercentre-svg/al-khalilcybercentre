import React from 'react';
import {
  Phone,
  MessageCircle,
  Truck,
  Car,
  Home,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Users,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { SiteInfo } from '../types';

interface HomePickupSectionProps {
  siteInfo: SiteInfo;
  onRequestPickup: () => void;
  onNavigateService?: (serviceCode: string) => void;
}

export const HomePickupSection: React.FC<HomePickupSectionProps> = ({
  siteInfo,
  onRequestPickup,
  onNavigateService
}) => {
  const helplinePhone = siteInfo.phone || '9259837361';
  const whatsappNumber = siteInfo.whatsapp || '9259837361';
  const cleanPhone = helplinePhone.replace(/\D/g, '');
  const cleanWhatsapp = whatsappNumber.replace(/\D/g, '');

  const whatsappMessage = encodeURIComponent(
    'Namaste Al Khalil Cyber Centre, mujhe Home Pickup & Drop Service ke baare mein jankari chahiye.'
  );

  return (
    <section id="home-pickup" className="py-12 sm:py-16 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 relative overflow-hidden scroll-mt-20">
      {/* Background Ambient Glows */}
      <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Banner Container */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/40 rounded-3xl border border-amber-500/30 p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Top Badge & Headline Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AL KHALIL SPECIAL DOORSTEP ASSISTANCE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              🏠 अब सेंटर आने की परेशानी नहीं!
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
              अगर आप बुजुर्ग हैं, महिला हैं या किसी कारण से सेंटर तक आने में दिक्कत होती है, तो हमें फोन करें। हमारी टीम Home Pickup & Drop Service के बारे में आपकी मदद करेगी।
            </p>

            {/* Senior Citizen Free Highlight Banner */}
            <div className="inline-block pt-2">
              <div className="bg-gradient-to-r from-amber-600/30 via-orange-500/30 to-amber-600/30 border border-amber-400/50 rounded-2xl px-5 py-2.5 shadow-lg backdrop-blur-sm">
                <span className="text-amber-200 text-sm sm:text-base font-extrabold tracking-wide flex items-center justify-center gap-2 flex-wrap">
                  <span>👴</span>
                  <span>Senior Citizens के लिए Home Pickup & Drop —</span>
                  <span className="text-emerald-400 uppercase font-black underline decoration-2 underline-offset-4">
                    बिल्कुल FREE*
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Visual Showcase on Left + Steps and Actions on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Dedicated Service Photograph with Overlays */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-950 aspect-[16/10] sm:aspect-[16/9] group">
                <img
                  src="/src/assets/images/home_pickup_service_1790884351690.jpg"
                  alt="Al Khalil Cyber Centre Home Pickup and Drop Service"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Floating Service Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                        Al Khalil Assistance Vehicle
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Safe & respectful doorstep travel facility
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 shrink-0">
                    Verified Staff
                  </span>
                </div>
              </div>

              {/* Direct Helpline Strip under image */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Phone className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                      Direct Helpline Number
                    </span>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="text-lg sm:text-xl font-black text-white hover:text-emerald-400 transition-colors font-mono"
                    >
                      📞 +91 {helplinePhone}
                    </a>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  Rampur, Dhokpuri, Tanda Bazar & Rural Area
                </span>
              </div>
            </div>

            {/* Right: 3-Step Simple Visual + Action Buttons */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* 3-Step Simple Visual Flow */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3 आसान स्टेप्स में सेवा (Simple 3-Step Flow)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 relative hover:border-amber-500/50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xs mb-2">
                      ①
                    </div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>हमें फोन/WhatsApp करें</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      अपनी आवश्यकता, पता व समय बताएं।
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 relative hover:border-amber-500/50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs mb-2">
                      ②
                    </div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>घर से Pickup → Centre पर काम</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      टीम आपको सेंटर लाएगी और कार्य कराएगी।
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 relative hover:border-amber-500/50 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs mb-2">
                      ③
                    </div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>घर वापस Drop</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      काम पूरा होने पर सुरक्षित घर वापस छोड़ेंगे।
                    </p>
                  </div>
                </div>
              </div>

              {/* Three Main Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Button 1: Call Now */}
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider border border-slate-700 shadow-md transition-all hover:scale-105 active:scale-95 text-center"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>📞 Call Now</span>
                </a>

                {/* Button 2: WhatsApp Karein */}
                <a
                  href={`https://wa.me/91${cleanWhatsapp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 WhatsApp करें</span>
                </a>

                {/* Button 3: Mujhe Ghar Se Pickup Chahiye */}
                <button
                  type="button"
                  onClick={onRequestPickup}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-600/40 transition-all cursor-pointer hover:scale-105 active:scale-95 text-center"
                >
                  <Car className="w-4 h-4" />
                  <span>🚗 मुझे घर से Pickup चाहिए</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Section: किन लोगों के लिए? & कौन-कौन से काम? */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* किन लोगों के लिए */}
                <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>किन लोगों के लिए?</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="text-base">👴</span>
                      <span>बुजुर्गों के लिए (Senior Citizens)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-base">👩</span>
                      <span>महिलाओं के लिए (Women Convenience)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-base">♿</span>
                      <span>जिनको सेंटर आने में परेशानी है</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-base">🏠</span>
                      <span>दूर-दराज ग्रामीण क्षेत्रों के ग्राहकों के लिए</span>
                    </li>
                  </ul>
                </div>

                {/* कौन-कौन से काम */}
                <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>कौन-कौन से काम?</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      Aadhaar Biometric Update
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      Aadhaar Correction
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      Aadhaar Enrollment
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      e-District Services
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      Government Forms
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      PAN Services
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      Printing / Scanning
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                      Other Digital Services
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
