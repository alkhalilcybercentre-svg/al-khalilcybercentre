import React, { useState } from 'react';
import {
  Car,
  Truck,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  User,
  HeartHandshake
} from 'lucide-react';
import { SiteInfo } from '../types';
import { submitHomePickupRequest } from '../lib/api';

interface HomePickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteInfo: SiteInfo;
  onNavigateToTrack?: (trackingToken: string) => void;
  onSuccess?: () => void;
}

const COMMON_SERVICES = [
  'Aadhaar Biometric Update (Fingerprint / Iris)',
  'Aadhaar Correction (Name, DOB, Address)',
  'Aadhaar New Enrollment (Child / Fresh)',
  'Income / Caste / Domicile Certificate (e-District)',
  'PAN Card Application / Correction',
  'Ration Card Member Add / Correction',
  'Khatauni / Land Records Download',
  'Bijli / Water Utility Bill Payment',
  'Wedding Cards / Commercial Printing',
  'Other Digital / Government Service'
];

export const HomePickupModal: React.FC<HomePickupModalProps> = ({
  isOpen,
  onClose,
  siteInfo,
  onNavigateToTrack,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    address: '',
    villageArea: '',
    requiredService: 'Aadhaar Biometric Update (Fingerprint / Iris)',
    customService: '',
    preferredDate: '',
    preferredTime: 'Morning (9:00 AM - 1:00 PM)',
    seniorCitizen: true,
    specialRequirement: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    requestId: string;
    customerName: string;
    mobile: string;
    requiredService: string;
    address: string;
    villageArea: string;
    seniorCitizen: boolean;
    preferredDate?: string;
    preferredTime?: string;
  } | null>(null);

  const [copiedToken, setCopiedToken] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Dynamically calculate visual progress bar percentage based on active step and field completion
  const calculateProgress = () => {
    if (successData) return 100;
    if (currentStep === 1) {
      let p = 15;
      if (formData.customerName.trim().length > 1) p += 10;
      if (/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) p += 10;
      return p;
    }
    // Step 2
    let p = 50;
    if (formData.address.trim().length > 3) p += 15;
    if (formData.villageArea.trim().length > 1) p += 15;
    return p;
  };

  const handleNextStep = () => {
    const cleanName = formData.customerName.trim();
    const cleanMobile = formData.mobile.trim();
    if (!cleanName || !cleanMobile) {
      setErrorMessage('कृपया पहले अपना नाम और मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!/^\d{10}$/.test(cleanMobile.replace(/\D/g, ''))) {
      setErrorMessage('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(2);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = formData.customerName.trim();
    const cleanMobile = formData.mobile.trim();
    const cleanAddress = formData.address.trim();
    const cleanVillage = formData.villageArea.trim();
    const cleanService =
      formData.requiredService === 'Other' && formData.customService.trim()
        ? formData.customService.trim()
        : formData.requiredService;

    if (!cleanName || !cleanMobile) {
      setCurrentStep(1);
      setErrorMessage('कृपया पहले अपना नाम और 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!/^\d{10}$/.test(cleanMobile.replace(/\D/g, ''))) {
      setCurrentStep(1);
      setErrorMessage('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!cleanAddress || !cleanVillage || !cleanService) {
      setCurrentStep(2);
      setErrorMessage('कृपया सभी आवश्यक जानकारी भरें (पूरा पता, गाँव/क्षेत्र, और आवश्यक सेवा)।');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitHomePickupRequest({
        customerName: cleanName,
        mobile: cleanMobile,
        address: cleanAddress,
        villageArea: cleanVillage,
        requiredService: cleanService,
        preferredDate: formData.preferredDate || undefined,
        preferredTime: formData.preferredTime || undefined,
        seniorCitizen: formData.seniorCitizen,
        specialRequirement: formData.specialRequirement.trim() || undefined
      });

      setSuccessData({
        requestId: response.requestId,
        customerName: cleanName,
        mobile: cleanMobile,
        requiredService: cleanService,
        address: cleanAddress,
        villageArea: cleanVillage,
        seniorCitizen: formData.seniorCitizen,
        preferredDate: formData.preferredDate || undefined,
        preferredTime: formData.preferredTime || undefined
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Home Pickup Request submission error:', err);
      setErrorMessage(err.message || 'रिक्वेस्ट सबमिट करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (successData?.requestId) {
      navigator.clipboard.writeText(successData.requestId);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleOpenWhatsAppConfirmation = () => {
    if (!successData) return;
    const helpline = siteInfo.whatsapp || '9259837361';
    const text = `नमस्ते 🙏\nAl Khalil Cyber Centre में Home Pickup & Drop Service के लिए आपकी request प्राप्त हो गई है।\n\n*Request ID:* ${successData.requestId}\n*नाम:* ${successData.customerName}\n*मोबाइल:* ${successData.mobile}\n*गाँव/क्षेत्र:* ${successData.villageArea}\n*सेवा:* ${successData.requiredService}\n*Senior Citizen:* ${successData.seniorCitizen ? 'YES (FREE Pickup)' : 'NO'}\n\nहमारी टीम जल्द ही आपसे संपर्क करेगी और Pickup का समय/उपलब्धता confirm करेगी।\n\n📞 सहायता: +91 9259837361\n\nधन्यवाद।\nAl Khalil Cyber Centre`;
    window.open(`https://wa.me/91${helpline.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        id="home-pickup-modal"
        className="home-pickup-modal bg-slate-900 border-2 border-amber-500/50 text-white rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-md">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              DOORSTEP ASSISTANCE
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
              🚗 Request Home Pickup & Drop
            </h3>
            <p className="text-sm sm:text-base text-slate-200 font-semibold leading-relaxed mt-1">
              घर से Pickup, सेंटर पर काम और घर वापस Drop की सुरक्षित सुविधा।
            </p>
          </div>
        </div>

        {/* =========================================================================
            DYNAMIC 3-STEP VISUAL PROGRESS BAR
        ========================================================================= */}
        <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-amber-500/30 p-3.5 sm:p-4 shadow-lg space-y-3 mb-5">
          {/* Progress Header with Dynamic Percentage & Step Info */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${successData ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400">
                {successData
                  ? '🎉 स्टेप 3 का 3: अनुरोध स्वीकृत (Request Confirmed)'
                  : currentStep === 1
                  ? 'स्टेप 1 का 3: ग्राहक व सेवा विवरण (Customer & Service)'
                  : 'स्टेप 2 का 3: पिकअप पता व समय (Pickup Address & Schedule)'}
              </span>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300">
              {calculateProgress()}% पूरा (Progress)
            </span>
          </div>

          {/* The Visual Progress Track */}
          <div className="w-full bg-slate-950 rounded-full h-3 sm:h-3.5 p-0.5 border border-slate-700/80 shadow-inner relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 shadow-md relative"
              style={{ width: `${calculateProgress()}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>

          {/* 3 Step Interactive / Visual Nodes */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            {/* Step 1 Node */}
            <button
              type="button"
              onClick={() => !successData && setCurrentStep(1)}
              disabled={!!successData}
              className={`relative rounded-2xl p-2 sm:p-3 border text-center transition-all flex flex-col items-center justify-between ${
                !successData ? 'cursor-pointer hover:border-amber-400/80' : 'cursor-default'
              } ${
                successData || currentStep > 1
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : currentStep === 1
                  ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div className="relative mb-1.5 sm:mb-2">
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-inner ${
                  successData || currentStep > 1
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : currentStep === 1
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {successData || currentStep > 1 ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  ) : (
                    <div className="flex items-center justify-center gap-0.5">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                      <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 -ml-1" />
                    </div>
                  )}
                </div>
                <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs font-black flex items-center justify-center shadow-sm ${
                  successData || currentStep > 1
                    ? 'bg-emerald-500 text-slate-950'
                    : currentStep === 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {successData || currentStep > 1 ? '✓' : '1'}
                </span>
              </div>
              <strong className="text-[11px] sm:text-xs md:text-sm font-black text-white block leading-tight">
                1. हमें संपर्क करें
              </strong>
              <span className="text-[9px] sm:text-[11px] text-indigo-200 font-semibold block mt-0.5 leading-tight">
                Phone या WhatsApp
              </span>
              <div className="mt-1 sm:mt-1.5">
                {successData || currentStep > 1 ? (
                  <span className="text-[9px] sm:text-[10px] bg-emerald-900/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    पूर्ण ✓
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full animate-pulse">
                    चालू
                  </span>
                )}
              </div>
            </button>

            {/* Step 2 Node */}
            <button
              type="button"
              onClick={() => {
                if (successData) return;
                if (currentStep === 1) {
                  handleNextStep();
                }
              }}
              disabled={!!successData}
              className={`relative rounded-2xl p-2 sm:p-3 border text-center transition-all flex flex-col items-center justify-between ${
                !successData ? 'cursor-pointer hover:border-amber-400/80' : 'cursor-default'
              } ${
                successData
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : currentStep === 2
                  ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div className="relative mb-1.5 sm:mb-2">
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-inner ${
                  successData
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : currentStep === 2
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {successData ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  ) : (
                    <Car className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  )}
                </div>
                <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs font-black flex items-center justify-center shadow-sm ${
                  successData
                    ? 'bg-emerald-500 text-slate-950'
                    : currentStep === 2
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {successData ? '✓' : '2'}
                </span>
              </div>
              <strong className="text-[11px] sm:text-xs md:text-sm font-black text-white block leading-tight">
                2. घर से पिकअप
              </strong>
              <span className="text-[9px] sm:text-[11px] text-amber-200 font-semibold block mt-0.5 leading-tight">
                सेंटर तक सुरक्षित आगमन
              </span>
              <div className="mt-1 sm:mt-1.5">
                {successData ? (
                  <span className="text-[9px] sm:text-[10px] bg-emerald-900/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    शेड्यूल्ड ✓
                  </span>
                ) : currentStep === 2 ? (
                  <span className="text-[9px] sm:text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full animate-pulse">
                    चालू
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    अगला
                  </span>
                )}
              </div>
            </button>

            {/* Step 3 Node */}
            <div
              className={`relative rounded-2xl p-2 sm:p-3 border text-center transition-all flex flex-col items-center justify-between ${
                successData
                  ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 opacity-70'
              }`}
            >
              <div className="relative mb-1.5 sm:mb-2">
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-inner ${
                  successData
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${successData ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs font-black flex items-center justify-center shadow-sm ${
                  successData
                    ? 'bg-emerald-400 text-slate-950 font-black'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  3
                </span>
              </div>
              <strong className="text-[11px] sm:text-xs md:text-sm font-black text-white block leading-tight">
                3. काम और वापस ड्रॉप
              </strong>
              <span className="text-[9px] sm:text-[11px] text-emerald-200 font-semibold block mt-0.5 leading-tight">
                सुरक्षित घर वापसी
              </span>
              <div className="mt-1 sm:mt-1.5">
                {successData ? (
                  <span className="text-[9px] sm:text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    पुष्टि ✓
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    अंतिम
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Direct Helpline Shortcut */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm bg-slate-950 p-2.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-800">
            <span className="text-slate-200 font-bold text-center sm:text-left">
              फोन पर तुरंत बात करें (Direct Helpline):
            </span>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${siteInfo.phone || '9259837361'}`}
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-black transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{siteInfo.phone || '9259837361'}</span>
              </a>
              <span className="text-slate-600">•</span>
              <a
                href={`https://wa.me/91${(siteInfo.whatsapp || '9259837361').replace(/\D/g, '')}?text=${encodeURIComponent('नमस्ते, मुझे Home Pickup & Drop Service के बारे में सहायता चाहिए।')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-black transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {successData ? (
          /* =========================================================================
              LOTTIE-STYLE CELEBRATORY SUCCESS STATE
          ========================================================================= */
          <div className="space-y-6 text-center py-2 animate-in fade-in duration-300">
            {/* Scoped CSS Keyframes for authentic 60fps Lottie-style Vector & Confetti Animation */}
            <style>{`
              @keyframes lottie-circle-draw {
                0% {
                  stroke-dashoffset: 140;
                  transform: rotate(-90deg) scale(0.65);
                  opacity: 0;
                }
                55% {
                  stroke-dashoffset: 0;
                  transform: rotate(-90deg) scale(1.06);
                  opacity: 1;
                }
                80% {
                  transform: rotate(-90deg) scale(0.97);
                }
                100% {
                  stroke-dashoffset: 0;
                  transform: rotate(-90deg) scale(1);
                  opacity: 1;
                }
              }

              @keyframes lottie-check-draw {
                0% {
                  stroke-dashoffset: 45;
                  opacity: 0;
                }
                35% {
                  opacity: 0;
                }
                65% {
                  opacity: 1;
                }
                100% {
                  stroke-dashoffset: 0;
                  opacity: 1;
                }
              }

              @keyframes lottie-scale-pop {
                0% {
                  transform: scale(0.25);
                  opacity: 0;
                }
                60% {
                  transform: scale(1.15);
                  opacity: 1;
                }
                80% {
                  transform: scale(0.95);
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }

              @keyframes lottie-glow-pulse {
                0%, 100% {
                  opacity: 0.35;
                  transform: scale(0.92);
                }
                50% {
                  opacity: 0.85;
                  transform: scale(1.25);
                }
              }

              @keyframes lottie-confetti {
                0% {
                  transform: translate(0, 0) scale(0) rotate(0deg);
                  opacity: 0;
                }
                20% {
                  opacity: 1;
                }
                80% {
                  opacity: 1;
                  transform: translate(var(--dx), var(--dy)) scale(1) rotate(var(--rot));
                }
                100% {
                  transform: translate(calc(var(--dx) * 1.35), calc(var(--dy) * 1.35)) scale(0.4) rotate(calc(var(--rot) * 1.6));
                  opacity: 0;
                }
              }

              @keyframes lottie-sparkle-float {
                0%, 100% {
                  transform: translateY(0px) rotate(0deg) scale(0.9);
                  opacity: 0.7;
                }
                50% {
                  transform: translateY(-8px) rotate(20deg) scale(1.15);
                  opacity: 1;
                }
              }

              @keyframes celebratory-shimmer {
                0% {
                  background-position: -200% 0;
                }
                100% {
                  background-position: 200% 0;
                }
              }
            `}</style>

            {/* Lottie-style Animated Checkmark Icon with Confetti & Glow */}
            <div className="relative flex items-center justify-center pt-2 pb-1">
              {/* Radiant Ambient Glow Rings */}
              <div
                className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-emerald-500/25 blur-xl pointer-events-none"
                style={{ animation: 'lottie-glow-pulse 2.4s ease-in-out infinite' }}
              />
              <div
                className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-amber-400/20 blur-lg pointer-events-none"
                style={{ animation: 'lottie-glow-pulse 2.8s ease-in-out 0.4s infinite' }}
              />

              {/* Bursting Confetti Particles Array */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                {[
                  { dx: '0px', dy: '-58px', rot: '45deg', color: '#10b981', delay: '0.2s', size: 'w-2.5 h-2.5 rounded-full' },
                  { dx: '44px', dy: '-44px', rot: '90deg', color: '#fbbf24', delay: '0.25s', size: 'w-2 h-3.5 rounded-xs' },
                  { dx: '62px', dy: '0px', rot: '120deg', color: '#34d399', delay: '0.3s', size: 'w-3 h-3 rounded-full' },
                  { dx: '44px', dy: '44px', rot: '60deg', color: '#f59e0b', delay: '0.35s', size: 'w-2.5 h-2.5 rotate-45' },
                  { dx: '0px', dy: '60px', rot: '180deg', color: '#6ee7b7', delay: '0.22s', size: 'w-2 h-3.5 rounded-xs' },
                  { dx: '-44px', dy: '44px', rot: '-45deg', color: '#fbbf24', delay: '0.28s', size: 'w-3 h-3 rounded-full' },
                  { dx: '-62px', dy: '0px', rot: '-90deg', color: '#10b981', delay: '0.32s', size: 'w-2.5 h-2.5 rotate-45' },
                  { dx: '-44px', dy: '-44px', rot: '-135deg', color: '#fcd34d', delay: '0.26s', size: 'w-2 h-3.5 rounded-xs' },
                  { dx: '26px', dy: '-64px', rot: '15deg', color: '#38bdf8', delay: '0.34s', size: 'w-2 h-2 rounded-full' },
                  { dx: '-26px', dy: '-64px', rot: '-25deg', color: '#a78bfa', delay: '0.36s', size: 'w-2 h-2 rounded-full' },
                  { dx: '64px', dy: '-22px', rot: '75deg', color: '#f43f5e', delay: '0.38s', size: 'w-1.5 h-3 rounded-xs' },
                  { dx: '-64px', dy: '-22px', rot: '-75deg', color: '#34d399', delay: '0.4s', size: 'w-2 h-2 rotate-45' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`absolute ${item.size} shadow-xs`}
                    style={{
                      backgroundColor: item.color,
                      // @ts-ignore
                      '--dx': item.dx,
                      '--dy': item.dy,
                      '--rot': item.rot,
                      animation: `lottie-confetti 1.9s cubic-bezier(0.2, 0.9, 0.3, 1) ${item.delay} forwards`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>

              {/* Floating Sparkles Icons */}
              <div
                className="absolute -top-2 -right-3 sm:-right-5 text-amber-300 pointer-events-none"
                style={{ animation: 'lottie-sparkle-float 2.2s ease-in-out infinite' }}
              >
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400/40 text-amber-300" />
              </div>
              <div
                className="absolute -bottom-1 -left-3 sm:-left-5 text-emerald-400 pointer-events-none"
                style={{ animation: 'lottie-sparkle-float 2.6s ease-in-out 0.5s infinite' }}
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-emerald-400/40 text-emerald-400" />
              </div>

              {/* Lottie-style Vector Checkmark Badge */}
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-500/50 flex items-center justify-center ring-4 ring-emerald-400/30"
                style={{ animation: 'lottie-scale-pop 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
              >
                {/* Inner Dark Background */}
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/25 to-emerald-950/70" />

                  {/* SVG Animated Circle & Check Path */}
                  <svg
                    className="w-14 h-14 sm:w-16 sm:h-16 relative z-10"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background Circle Track */}
                    <circle
                      cx="26"
                      cy="26"
                      r="22"
                      stroke="#064e3b"
                      strokeWidth="3.5"
                      fill="none"
                      opacity="0.6"
                    />
                    {/* Animated Dynamic Circle Stroke */}
                    <circle
                      cx="26"
                      cy="26"
                      r="22"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      style={{
                        strokeDasharray: 140,
                        strokeDashoffset: 140,
                        transformOrigin: '26px 26px',
                        animation: 'lottie-circle-draw 0.75s cubic-bezier(0.65, 0, 0.45, 1) forwards',
                      }}
                    />
                    {/* Animated Vector Checkmark */}
                    <path
                      d="M16 27 L23 34 L36 19"
                      stroke="#ffffff"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      style={{
                        strokeDasharray: 45,
                        strokeDashoffset: 45,
                        animation: 'lottie-check-draw 0.55s cubic-bezier(0.65, 0, 0.45, 1) 0.35s forwards',
                      }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Celebratory Message & Header */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-300 px-4 py-1.5 rounded-full border border-emerald-500/60 shadow-lg shadow-emerald-950/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>🎉 अनुरोध स्वीकृत • REQUEST CONFIRMED</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                बधाई हो! आपकी Home Pickup Request दर्ज हो गई है
              </h3>
              
              <p className="text-xs sm:text-base text-slate-200 font-medium max-w-lg mx-auto leading-relaxed">
                अल-खलील साइबर सेन्टर को आपकी पिकअप रिक्वेस्ट प्राप्त हो गई है। हमारी टीम जल्द ही आपसे संपर्क करके पिकअप का समय और विवरण कन्फर्म करेगी।
              </p>
            </div>

            {/* Request Tracking Token Box */}
            <div className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xl space-y-3 text-left max-w-lg mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 block">
                    Your Tracking Token (ट्रैकिंग कोड)
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                    {successData.requestId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 text-xs font-bold transition-all cursor-pointer border border-slate-700 shadow-md"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-black">Copied! ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Customer & Booking Summary Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">ग्राहक का नाम:</span>
                  <strong className="text-white font-extrabold">{successData.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">मोबाइल नंबर:</span>
                  <strong className="text-white font-mono font-bold">{successData.mobile}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">सेवा:</span>
                  <span className="text-emerald-300 font-bold">{successData.requiredService}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">गाँव / क्षेत्र:</span>
                  <span className="text-slate-200 font-medium">{successData.villageArea} ({successData.address})</span>
                </div>
                {successData.preferredDate && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">पसंदीदा तारीख:</span>
                    <span className="text-slate-200 font-medium">{successData.preferredDate}</span>
                  </div>
                )}
                {successData.preferredTime && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">पसंदीदा समय:</span>
                    <span className="text-slate-200 font-medium">{successData.preferredTime}</span>
                  </div>
                )}
              </div>

              {/* Senior Citizen Free Pickup Highlight */}
              {successData.seniorCitizen && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center gap-2.5 text-emerald-300 text-xs sm:text-sm shadow-inner">
                  <span className="text-xl shrink-0">👴</span>
                  <div>
                    <strong className="font-extrabold block text-emerald-200">
                      Senior Citizen (वरिष्ठ नागरिक): 100% FREE Pickup & Drop
                    </strong>
                    <span className="text-[11px] text-emerald-400 block">
                      बुजुर्गों के लिए यह सेवा पूरी तरह निःशुल्क है।
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* What Happens Next? (Roadmap for Rural & Elderly Customers) */}
            <div className="bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-left max-w-lg mx-auto space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                📋 अगला कदम क्या होगा? (What Happens Next):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>1. फोन पुष्टि</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    हमारी टीम 5-15 मिनट में आपके नंबर पर कॉल करेगी।
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Car className="w-3.5 h-3.5" />
                    <span>2. घर से पिकअप</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    हमारा एजेंट घर आकर ओरिजिनल/फोटोकॉपी प्राप्त करेगा।
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>3. सुरक्षित होम ड्रॉप</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    सेंटर पर काम पूर्ण होने पर आपके पते पर डिलीवरी।
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-lg mx-auto">
              {/* WhatsApp Confirmation Button */}
              <button
                type="button"
                onClick={handleOpenWhatsAppConfirmation}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer min-h-[48px]"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp पर पुष्टि देखें</span>
              </button>

              {/* Call Helpline Button */}
              <a
                href={`tel:${siteInfo.phone || '9259837361'}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-700 transition-all min-h-[48px]"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>हेल्पलाइन: {siteInfo.phone || '9259837361'}</span>
              </a>

              {/* Track Status Button if available */}
              {onNavigateToTrack && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTrack(successData.requestId);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer min-h-[48px]"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Close / Dismiss Action Button */}
            <div className="pt-1 max-w-lg mx-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-slate-300 hover:text-white font-extrabold text-xs uppercase tracking-wider border border-slate-800 transition-colors cursor-pointer"
              >
                ✓ ठीक है, विंडो बंद करें (Done & Close)
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              REQUEST FORM
          ========================================================================= */
          <div className="space-y-4">
            {/* Senior Citizen FREE Banner Indicator */}
            {formData.seniorCitizen ? (
              <div className="p-3.5 sm:p-4 bg-emerald-950/50 rounded-2xl border-2 border-emerald-700/80 flex items-center gap-3.5 text-xs sm:text-sm text-emerald-300 shadow-md">
                <span className="text-2xl sm:text-3xl shrink-0">👴</span>
                <div>
                  <strong className="font-black uppercase tracking-wider block text-emerald-300 text-sm sm:text-base">
                    Senior Citizen — Pickup & Drop FREE
                  </strong>
                  <span className="text-xs sm:text-sm text-emerald-100 font-semibold block mt-0.5 leading-relaxed">
                    बुजुर्गों के लिए Home Pickup & Drop Service पूरी तरह निःशुल्क (FREE) है।
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 font-medium">
                Pickup availability and applicable charges will be confirmed by the centre.
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/90 rounded-xl border border-rose-800 text-xs sm:text-sm text-rose-200 flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Form with Step 1 and Step 2 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ==========================================
                  STEP 1: CUSTOMER & SERVICE DETAILS
              ========================================== */}
              <div className={currentStep === 1 ? 'space-y-4' : 'hidden'}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* 1. Customer Name */}
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                      Customer Name (नाम) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="उदा. राम लाल / शबाना परवीन"
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden min-h-[46px]"
                    />
                  </div>

                  {/* 2. Mobile Number */}
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                      Mobile Number (मोबाइल नंबर) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="10 अंकों का मोबाइल नंबर"
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden min-h-[46px]"
                    />
                  </div>

                  {/* 3. Senior Citizen Option */}
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                      Senior Citizen? (क्या ग्राहक बुजुर्ग हैं?) *
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, seniorCitizen: true })}
                        className={`px-3 py-3 rounded-xl text-xs sm:text-sm font-black uppercase transition-all cursor-pointer min-h-[46px] flex items-center justify-center ${
                          formData.seniorCitizen
                            ? 'bg-emerald-500 text-slate-950 border-2 border-emerald-300 shadow-md'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        👴 YES (FREE)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, seniorCitizen: false })}
                        className={`px-3 py-3 rounded-xl text-xs sm:text-sm font-black uppercase transition-all cursor-pointer min-h-[46px] flex items-center justify-center ${
                          !formData.seniorCitizen
                            ? 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-md'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        NO (सामान्य)
                      </button>
                    </div>
                  </div>

                  {/* 4. Required Service */}
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                      Required Service (कौन सा काम कराना है?) *
                    </label>
                    <select
                      value={formData.requiredService}
                      onChange={(e) => setFormData({ ...formData, requiredService: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden min-h-[46px]"
                    >
                      {COMMON_SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="Other">अन्य सेवा (Other Service)</option>
                    </select>

                    {formData.requiredService === 'Other' && (
                      <input
                        type="text"
                        required
                        value={formData.customService}
                        onChange={(e) => setFormData({ ...formData, customService: e.target.value })}
                        placeholder="कृपया काम का नाम लिखें..."
                        className="w-full mt-2 px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base min-h-[46px]"
                      />
                    )}
                  </div>
                </div>

                {/* Step 1 Next Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-400/30 border-2 border-amber-200 transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2.5 min-h-[52px]"
                  >
                    <span>आगे बढ़ें: पिकअप पता व समय (Next: Pickup Address & Time)</span>
                    <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* ==========================================
                  STEP 2: PICKUP ADDRESS & SCHEDULING
              ========================================== */}
              <div className={currentStep === 2 ? 'space-y-4' : 'hidden'}>
                {/* Step 1 Quick Summary Pill */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                  <div className="text-slate-200 font-medium truncate pr-2">
                    <span className="font-bold text-white">{formData.customerName || 'Customer'}</span> ({formData.mobile}) • <span className="text-amber-400 font-bold">{formData.requiredService}</span>
                    {formData.seniorCitizen && <span className="ml-1.5 text-emerald-400 font-black">👴 FREE</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-indigo-400 hover:text-indigo-300 font-black underline cursor-pointer text-xs shrink-0"
                  >
                    बदलें (Edit)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Village / Area */}
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                      Village / Area (गाँव या मोहल्ला) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.villageArea}
                      onChange={(e) => setFormData({ ...formData, villageArea: e.target.value })}
                      placeholder="उदा. Dhokpuri / Tanda Bazar / Rampur"
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden min-h-[46px]"
                    />
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                      Preferred Date (पसंदीदा तारीख)
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden min-h-[46px]"
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                    Full Address / Landmark (पूरा पता व पहचान) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="मकान नंबर, गली, पास का प्रसिद्ध स्थान या मस्जिद/मंदिर"
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden min-h-[46px]"
                  />
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                    Preferred Time Slot (समय)
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden min-h-[46px]"
                  >
                    <option value="Morning (9:00 AM - 1:00 PM)">सुबह / Morning (9:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)">दोपहर / Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="Evening (5:00 PM - 8:00 PM)">शाम / Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>

                {/* Special Requirement / Message */}
                <div>
                  <label className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wide block mb-1.5">
                    Special Requirement / Message (कोई विशेष सूचना)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.specialRequirement}
                    onChange={(e) => setFormData({ ...formData, specialRequirement: e.target.value })}
                    placeholder="उदा. चलने में असमर्थ हैं, व्हीलचेयर या सहारे की आवश्यकता है..."
                    className="w-full px-3.5 sm:px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-medium focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                {/* Step 2 Buttons: Back and Submit */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>पिछला स्टेप (Back)</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-4 sm:py-4.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-400/30 border-2 border-amber-200 transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 min-h-[52px]"
                  >
                    {isSubmitting ? (
                      <span className="font-black text-sm sm:text-base text-slate-950">रिक्वेस्ट भेजी जा रही है...</span>
                    ) : (
                      <>
                        <Car className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                        <span className="font-black text-sm sm:text-base text-slate-950">🚗 मुझे घर से Pickup चाहिए (Submit Request)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Backwards-compatible export alias for any components importing AadhaarPickupDropModal
export const AadhaarPickupDropModal = HomePickupModal;
