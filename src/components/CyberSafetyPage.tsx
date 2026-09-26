import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Phone,
  PhoneCall,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  KeyRound,
  CreditCard,
  Smartphone,
  FileText,
  UserCheck,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Laptop,
  QrCode,
  Briefcase,
  Gift,
  Share2,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { SiteInfo } from '../types';

interface CyberSafetyPageProps {
  siteInfo: SiteInfo;
  onBack: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const CyberSafetyPage: React.FC<CyberSafetyPageProps> = ({
  siteInfo,
  onBack,
  onNavigateSection,
  onOpenAdmin
}) => {
  const officialPhone = siteInfo.otpVerificationPhone || siteInfo.phone || '9259837361';

  const safetyCards = [
    {
      code: 'A',
      title: 'OTP Safety',
      titleHindi: 'ओटीपी सुरक्षा',
      icon: KeyRound,
      color: 'amber',
      points: [
        'OTP केवल आपकी जानकारी और स्पष्ट सहमति से संबंधित अधिकृत कार्य के लिए ही उपयोग करें।',
        'अज्ञात व्यक्ति या किसी कॉल पर कभी भी बिना कारण OTP साझा न करें।',
        'OTP मैसेज में हमेशा देखें कि वह किस वेबसाइट, बैंक या सर्विस के लिए आया है।'
      ]
    },
    {
      code: 'B',
      title: 'UPI Payment Safety',
      titleHindi: 'यूपीआई भुगतान सुरक्षा',
      icon: CreditCard,
      color: 'sky',
      points: [
        'UPI PIN केवल पैसे भेजने (Debit) के लिए उपयोग होता है, पैसे प्राप्त (Credit) करने के लिए कभी UPI PIN की आवश्यकता नहीं होती।',
        'किसी भी अनजाने "Collect Request" या "Pay" प्रॉम्प्ट को अप्रूव न करें।',
        'भुगतान करने से पहले प्राप्तकर्ता का नाम और UPI ID अवश्य चेक करें।'
      ]
    },
    {
      code: 'C',
      title: 'Fake Customer Care Calls',
      titleHindi: 'फर्जी कस्टमर केयर कॉल्स',
      icon: PhoneCall,
      color: 'rose',
      points: [
        'गूगल सर्च या सोशल मीडिया पर मिले कस्टमर केयर नंबरों पर सीधे भरोसा न करें।',
        'हमेशा आधिकारिक ऐप या संबंधित कंपनी की वेरीफाइड वेबसाइट से ही हेल्पडेस्क नंबर लें।',
        'कस्टमर केयर कभी भी आपसे पासवर्ड, PIN या रिमोट ऐप डाउनलोड करने को नहीं कहता।'
      ]
    },
    {
      code: 'D',
      title: 'Fake KYC Calls',
      titleHindi: 'फर्जी केवाईसी कॉल्स',
      icon: UserCheck,
      color: 'purple',
      points: [
        'सिम बंद होने, बैंक खाता ब्लॉक होने या बिजली कटने का डर दिखाकर KYC अपडेट कराने का झांसा दिया जाता है।',
        'ऐसे संदेशों में दिए गए फोन नंबरों पर कॉल न करें और न ही किसी लिंक पर क्लिक करें।',
        'केवाईसी सत्यापन हमेशा अपनी नजदीकी बैंक शाखा या अधिकृत CSC केंद्र पर स्वयं जाकर कराएं।'
      ]
    },
    {
      code: 'E',
      title: 'Fake Bank Calls',
      titleHindi: 'फर्जी बैंक अधिकारी कॉल्स',
      icon: Lock,
      color: 'blue',
      points: [
        'बैंक कभी भी कॉल करके आपसे ATM PIN, CVV, Card Number या नेट बैंकिंग पासवर्ड नहीं पूछता।',
        'यदि कोई व्यक्ति खुद को बैंक मैनेजर बताकर गोपनीय जानकारी मांगे, तो तुरंत कॉल काट दें।',
        'अपने बैंक की आधिकारिक शाखा या पासबुक पर लिखे हेल्पलाइन पर स्वयं पुष्टि करें।'
      ]
    },
    {
      code: 'F',
      title: 'Fake Government Calls',
      titleHindi: 'फर्जी सरकारी योजना कॉल्स',
      icon: ShieldAlert,
      color: 'emerald',
      points: [
        'पीएम आवास, फ्री सोलर योजना, छात्रवृत्ति या सरकारी लॉटरी के नाम पर रजिस्ट्रेशन फीस मांगने वाले फर्जी होते हैं।',
        'सरकारी योजनाओं के आवेदन केवल आधिकारिक सरकारी पोर्टल्स (.gov.in / .nic.in) या अधिकृत जन सेवा केंद्र से ही करें।',
        'सब्सिडी का पैसा सीधे आपके आधार से जुड़े बैंक खाते में आता है, इसके लिए कोई एडवांस चार्ज न दें।'
      ]
    },
    {
      code: 'G',
      title: 'Fake WhatsApp Messages',
      titleHindi: 'व्हाट्सएप पर फर्जी संदेश',
      icon: Smartphone,
      color: 'teal',
      points: [
        'व्हाट्सएप पर "बिजली आज रात कट जाएगी", "लॉटरी जीत गए", या "पार्ट-टाइम जॉब" के फर्जी संदेश भेजे जाते हैं।',
        'किसी भी अनजाने नंबर से आई APK फाइल या संदेहास्पद लिंक को न खोलें।',
        'व्हाट्सएप का 6-अंकों वाला रजिस्ट्रेशन कोड कभी भी किसी अन्य व्यक्ति से साझा न करें।'
      ]
    },
    {
      code: 'H',
      title: 'Fake Links / Phishing',
      titleHindi: 'फर्जी वेबसाइट लिंक्स व फिशिंग',
      icon: ExternalLink,
      color: 'indigo',
      points: [
        'बैंक या सरकारी पोर्टल जैसी दिखने वाली हूबहू नकली वेबसाइटें बनाकर पासवर्ड चुराए जाते हैं।',
        'ब्राउज़र के एड्रेस बार में वेबसाइट का स्पेलिंग और सुरक्षित "https://" कनेक्शन अवश्य जांचें।',
        'SMS या ईमेल में आए संदेहास्पद शॉर्ट-लिंक्स (bit.ly आदि) पर कभी अपनी संवेदनशील जानकारी न भरें।'
      ]
    },
    {
      code: 'I',
      title: 'QR Code Scams',
      titleHindi: 'क्यूआर कोड स्कैनिंग फ्रॉड',
      icon: QrCode,
      color: 'orange',
      points: [
        'QR Code स्कैन करने का अर्थ होता है आपके बैंक खाते से पैसे का कटना।',
        'पैसे प्राप्त करने के लिए किसी भी QR कोड को स्कैन करने या PIN दर्ज करने की आवश्यकता नहीं होती।',
        'OLX या सामान बेचने के बहाने खरीदार बनकर QR कोड भेजने वाले ठगों से सतर्क रहें।'
      ]
    },
    {
      code: 'J',
      title: 'Remote Access / Screen Sharing Scams',
      titleHindi: 'स्क्रीन शेयरिंग / रिमोट एक्सेस फ्रॉड',
      icon: Laptop,
      color: 'rose',
      points: [
        'किसी अज्ञात व्यक्ति या कॉलर के कहने पर कभी भी AnyDesk, TeamViewer, RustDesk या QuickSupport ऐप इंस्टॉल न करें।',
        'ये ऐप्स आपके फोन या कंप्यूटर की स्क्रीन कॉलर को दिखा देते हैं और वह आपके बैंक से पैसे निकाल सकता है।',
        'यदि गलती से इंस्टॉल हो गया हो, तो तुरंत इंटरनेट बंद करें और ऐप को अनइंस्टॉल करें।'
      ]
    },
    {
      code: 'K',
      title: 'Fake Job Offers',
      titleHindi: 'घर बैठे कमाई / फर्जी जॉब टास्क',
      icon: Briefcase,
      color: 'cyan',
      points: [
        'टेलीग्राम या व्हाट्सएप पर यूट्यूब वीडियो लाइक करने, गूगल रिव्यू देने या रेटिंग करने के नाम पर टास्क फ्रॉड तेजी से बढ़ रहे हैं।',
        'शुरुआत में छोटा मुनाफा देकर बाद में लाखों रुपये का निवेश कराकर ब्लॉक कर दिया जाता है।',
        'असली कंपनिया कभी भी नौकरी देने के लिए पैसे या टास्क डिपॉजिट नहीं मांगती।'
      ]
    },
    {
      code: 'L',
      title: 'Fake Loan Offers',
      titleHindi: 'तुरंत लोन देने वाले फर्जी ऐप्स',
      icon: DollarSign,
      color: 'emerald',
      points: [
        'बिना दस्तावेज के 5 मिनट में तुरंत लोन देने वाले अनधिकृत चीनी/फर्जी लोन ऐप्स से बचें।',
        'ये ऐप्स आपके फोन के कॉन्टैक्ट्स और गैलरी का एक्सेस लेकर ब्लैकमेल करते हैं।',
        'केवल RBI द्वारा अधिकृत बैंकों या गैर-बैंकिंग वित्तीय कंपनियों (NBFC) से ही ऋण लें।'
      ]
    },
    {
      code: 'M',
      title: 'Fake Prize / Lottery Messages',
      titleHindi: 'लॉटरी या इनाम के फर्जी संदेश',
      icon: Gift,
      color: 'pink',
      points: [
        'केबीसी (KBC), लकी ड्रॉ, या कार जीतने के फर्जी पत्र और ऑडियो संदेश भेजकर प्रोसेसिंग फीस मांगी जाती है।',
        'याद रखें: जब आपने किसी लॉटरी का टिकट ही नहीं खरीदा, तो आप कैसे जीत सकते हैं?',
        'इनाम के बदले कोई भी टैक्स या डिलीवरी चार्ज किसी अज्ञात खाते में न भेजें।'
      ]
    },
    {
      code: 'N',
      title: 'Document & Aadhaar / PAN Safety',
      titleHindi: 'दस्तावेज व पहचान सुरक्षा',
      icon: FileText,
      color: 'amber',
      points: [
        'आधार कार्ड, पैन कार्ड, पासपोर्ट और बैंक पासबुक की प्रतियां केवल अधिकृत कार्य के लिए ही दें।',
        'सार्वजनिक सोशल मीडिया ग्रुप्स पर अपने पहचान पत्र कभी पोस्ट न करें।',
        'संभव हो तो मास्क्ड आधार (Masked Aadhaar) का उपयोग करें जिसमें केवल अंतिम 4 अंक दिखते हैं।'
      ]
    },
    {
      code: 'O',
      title: 'Social Media Safety',
      titleHindi: 'सोशल मीडिया सुरक्षा',
      icon: Share2,
      color: 'violet',
      points: [
        'फेसबुक या इंस्टाग्राम पर दोस्तों/रिश्तेदारों के फर्जी अकाउंट बनाकर इमरजेंसी के नाम पर पैसे मांगे जाते हैं।',
        'पैसे भेजने से पहले उस परिचित को फोन कॉल करके व्यक्तिगत रूप से पुष्टि करें।',
        'सोशल मीडिया पर मजबूत पासवर्ड रखें और टू-फैक्टर ऑथेंटिकेशन (2FA) अवश्य चालू रखें।'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header / Breadcrumb Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 hover:border-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Back to Homepage / मुख्य पृष्ठ</span>
          </button>

          <div className="flex items-center gap-2.5 ml-auto flex-wrap">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              title="Call National Cyber Fraud Helpline 1930"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>हेल्पलाइन: 1930</span>
            </a>

            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800 py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Official Cyber Safety & Fraud Awareness Advisory</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Cyber Safety & Fraud Awareness
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 mt-2">
                साइबर सुरक्षा एवं फ्रॉड से बचाव
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              डिजिटल दुनिया में सतर्कता ही आपकी सबसे बड़ी सुरक्षा है। Al-Khalil Cyber Centre द्वारा जनहित में जारी यह आधिकारिक दिशानिर्देश आपको और आपके परिवार को ऑनलाइन धोखाधड़ी, फर्जी कॉल्स एवं साइबर फ्रॉड से सुरक्षित रखने के लिए तैयार किया गया है।
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* =========================================================================
            1. EMERGENCY CYBER FRAUD SECTION (HIGHLY VISIBLE)
        ========================================================================= */}
        <section className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-rose-950/40 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-rose-500">
            <AlertTriangle className="w-64 h-64" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-rose-600/30">
                🚨
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  अगर आपके साथ साइबर फ्रॉड हो गया है
                </h2>
                <p className="text-xs text-rose-300 font-bold uppercase tracking-wider mt-0.5">
                  Emergency Action Steps & Government Reporting Channels
                </p>
              </div>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              यदि आपके साथ किसी भी प्रकार का financial cyber fraud (ऑनलाइन पैसों की धोखाधड़ी) हुआ है, तो <strong>पहले 2-3 घंटे (Golden Hours) अत्यंत महत्वपूर्ण हैं</strong>। तत्काल official government reporting channels का उपयोग करें ताकि संदिग्ध बैंक खाते को समय रहते फ्रीज कराया जा सके।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Helpline 1930 Card */}
              <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                    National Helpline
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300">
                    24x7 Active
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">1930</div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    राष्ट्रीय साइबर वित्तीय धोखाधड़ी रिपोर्टिंग हेल्पलाइन
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  बिना किसी देरी के अपने मोबाइल से तुरंत 1930 डायल करें और बैंक खाता नंबर व फ्रॉड की जानकारी दें।
                </p>
                <a
                  href="tel:1930"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>1930 सहायता</span>
                </a>
              </div>

              {/* National Cyber Crime Reporting Portal Card */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                    Official Portal
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300">
                    Govt. of India
                  </span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight break-all">
                    cybercrime.gov.in
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    National Cyber Crime Reporting Portal (MHA)
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  गृह मंत्रालय, भारत सरकार का आधिकारिक राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल।
                </p>
                <a
                  href="https://cybercrime.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>Report Cyber Crime</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">महत्वपूर्ण सूचना:</strong> Al-Khalil Cyber Centre केवल जन-जागरूकता संबंधी जानकारी प्रदान करता है। Al-Khalil Cyber Centre कोई सरकारी साइबर क्राइम जांच प्राधिकरण नहीं है। Cyber crime की आधिकारिक जांच व कानूनी रिपोर्टिंग के लिए संबंधित सरकारी माध्यमों (1930 अथवा cybercrime.gov.in) का ही उपयोग करें।
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. AL-KHALIL CUSTOMER SAFETY PROMISE
        ========================================================================= */}
        <section className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30">
              🛡️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Al-Khalil Cyber Centre Customer Safety Promise
              </h2>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                हमारी आधिकारिक ग्राहक सुरक्षा प्रतिबद्धता
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>सहमति व पारदर्शिता</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                “हम अपने ग्राहकों की ऑनलाइन सेवाओं में सहायता करते समय उनकी जानकारी और सहमति का सम्मान करते हैं।”
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>केवल अधिकृत सेवा सत्यापन</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                “जहाँ किसी सरकारी या ऑनलाइन सेवा में OTP verification आवश्यक हो, वहाँ OTP केवल ग्राहक की जानकारी और अनुरोधित सेवा के उद्देश्य से verification प्रक्रिया में उपयोग किया जाएगा।”
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>गोपनीय बैंकिंग डेटा वर्जित</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                “हम ग्राहक से UPI PIN, ATM PIN, Card PIN, CVV, Banking Password या अन्य confidential banking authentication credentials मांगने के लिए अधिकृत नहीं हैं।”
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. VERY IMPORTANT — OTP POLICY FOR AL-KHALIL CYBER CENTRE
        ========================================================================= */}
        <section className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  🔐 OTP Safety — Al-Khalil Cyber Centre
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Business OTP Policy
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                हमारी सेवा प्रक्रिया में OTP का सुरक्षित और प्रामाणिक उपयोग
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              कुछ सरकारी एवं ऑनलाइन सेवाओं (जैसे आधार ई-केवाईसी, पैन कार्ड संशोधन, छात्रवृत्ति, राशन कार्ड या सरकारी भर्ती फॉर्म) की प्रक्रिया पूरी करने के लिए <strong>OTP verification आवश्यक हो सकता है</strong>।
            </p>

            <div className="space-y-2 border-l-2 border-amber-500 pl-4 py-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Al-Khalil Cyber Centre में OTP केवल:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-200 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>ग्राहक की जानकारी और स्पष्ट सहमति से</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>ग्राहक द्वारा अनुरोधित संबंधित सेवा के लिए</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>ग्राहक की उपस्थिति/जानकारी में</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>अधिकृत Centre Owner/Authorized Person द्वारा</span>
                </li>
              </ul>
              <p className="text-xs text-amber-300/90 font-bold pt-1">
                ही verification प्रक्रिया में उपयोग किया जाएगा।
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-amber-950/30 p-3 rounded-xl border border-amber-500/20">
              💡 <strong>ग्राहक के लिए महत्वपूर्ण सलाह:</strong> ग्राहक को OTP देने या दर्ज कराने से पहले यह अवश्य देखना चाहिए कि OTP किस वेबसाइट, सेवा या उद्देश्य के लिए आया है।
            </p>
          </div>

          {/* Confidential credentials we NEVER ask for */}
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
              <XCircle className="w-4 h-4" />
              <span>ये गोपनीय जानकारियां Al-Khalil Cyber Centre द्वारा कभी भी नहीं मांगी जाएंगी:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-bold text-slate-200">
              {[
                'UPI PIN',
                'ATM PIN',
                'Debit/Credit Card PIN',
                'CVV (कार्ड के पीछे 3 अंक)',
                'Internet Banking Password',
                'UPI Password / Passcode',
                'Bank Login Password',
                'WhatsApp Verification Code'
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/20 flex items-center gap-2 text-rose-200"
                >
                  <span className="text-rose-500 font-black">✕</span>
                  <span className="text-[11px] leading-tight">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-rose-300 font-medium pt-1">
              These confidential credentials must NEVER be requested by Al-Khalil Cyber Centre. यदि कोई व्यक्ति हमारे नाम से भी ये विवरण मांगे, तो वह धोखाधड़ी है।
            </p>
          </div>
        </section>

        {/* =========================================================================
            4. OWNER / AUTHORIZED OTP CALL WARNING & CONTACT VERIFICATION
        ========================================================================= */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                📞 OTP Verification Call Safety
              </h2>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider mt-0.5">
                अधिकृत कॉलिंग प्रक्रिया व पहचान सत्यापन
              </p>
            </div>
          </div>

          <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              “यदि किसी ऑनलाइन/सरकारी सेवा की प्रक्रिया में OTP verification के लिए ग्राहक से संपर्क करना आवश्यक हो, तो केवल Al-Khalil Cyber Centre के Owner/Authorized Person द्वारा अधिकृत संपर्क माध्यम का उपयोग किया जाएगा।”
            </div>

            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 font-semibold">
              “किसी अन्य व्यक्ति द्वारा Al-Khalil Cyber Centre का नाम लेकर OTP मांगने पर OTP साझा न करें।”
            </div>

            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200">
              ⚠️ <strong>कॉलर आईडी चेतावनी:</strong> “Caller ID पर केवल नाम/नंबर देखकर किसी व्यक्ति की पहचान पर भरोसा न करें (क्योंकि कॉलर आईडी स्पूफिंग संभव है)। संदेह होने पर Al-Khalil Cyber Centre के official website पर दिए गए contact details से स्वयं पुष्टि करें।”
            </div>
          </div>

          {/* Official Verification Phone Desk */}
          <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
                Official OTP / Customer Verification Helpline
              </span>
              <div className="text-2xl font-black text-white tracking-tight font-mono">
                +91 {officialPhone}
              </div>
              <span className="text-xs text-slate-400 block">
                केवल इसी आधिकारिक नंबर अथवा केंद्र पर प्रत्यक्ष उपस्थित व्यक्ति से पुष्टि करें।
              </span>
            </div>

            <a
              href={`tel:${officialPhone}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline / स्वयं पुष्टि करें</span>
            </a>
          </div>
        </section>

        {/* =========================================================================
            5. BANKING, UPI & REMOTE ACCESS SAFETY GUIDELINES
        ========================================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Banking & UPI Safety */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">UPI & Banking Safety Checklist</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">बैंकिंग सुरक्षा</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Never share UPI PIN:</strong> UPI PIN का उपयोग केवल पैसे भेजने या बैलेंस चेक करने के लिए होता है, पैसे रिसीव करने के लिए नहीं।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Never share ATM/Card PIN & CVV:</strong> अपने कार्ड की जानकारी किसी भी व्यक्ति या फोन कॉल पर कभी न बताएं।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Verify collect requests:</strong> किसी अनजान व्यक्ति के पेमेंट या कलेक्ट रिक्वेस्ट को कभी अप्रूव न करें।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Be careful with QR Codes:</strong> किसी अनजान QR कोड को स्कैन करने से बचें।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span><strong>Official Apps Only:</strong> हमेशा बैंक की आधिकारिक ऐप (Play Store / App Store से सत्यापित) का ही उपयोग करें।</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Remote Access Scams */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Remote Access Scams Warning</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">स्क्रीन शेयरिंग फ्रॉड</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p className="bg-rose-950/30 p-3.5 rounded-xl border border-rose-800/40 text-rose-200">
                ⚠️ <strong>कड़ा अलर्ट:</strong> Never install an unknown remote-access application because a caller claims to be from a bank, government department, company or customer-care service.
              </p>
              <p>
                फ्रॉड करने वाले अक्सर <strong>AnyDesk, TeamViewer, QuickSupport, RustDesk</strong> जैसे ऐप्स डाउनलोड करने को कहते हैं और 9-अंकों का कोड मांगते हैं।
              </p>
              <p className="font-semibold text-white">
                Never allow an unknown person to control your phone or computer remotely. ऐसा करने से आपके मोबाइल की स्क्रीन उनके पास चली जाती है और बैंक से रुपये ट्रांसफर हो सकते हैं।
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. DOCUMENT & IDENTITY SAFETY
        ========================================================================= */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">Document & Identity Safety Advisory</h3>
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                दस्तावेजों व पहचान पत्रों की सुरक्षा
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            चूँकि <strong>Al-Khalil Cyber Centre</strong> विभिन्न सरकारी योजनाओं, प्रमाण पत्रों व ऑनलाइन फॉर्म से जुड़ी सेवाएं प्रदान करता है, इसलिए अपने संवेदनशील दस्तावेजों की सुरक्षा का विशेष ध्यान रखें:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
            {[
              'Aadhaar Card',
              'PAN Card',
              'Passport',
              'Driving Licence',
              'Certificates',
              'Bank Documents',
              'Identity Cards'
            ].map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs font-bold text-slate-200"
              >
                {doc}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            🛡️ <strong>दस्तावेज सुरक्षा नियम:</strong> केवल अपनी वास्तविक अनुरोधित सेवा के लिए ही अधिकृत केंद्र पर दस्तावेज प्रस्तुत करें। संवेदनशील दस्तावेजों की फोटो या स्कैन कॉपी किसी भी अज्ञात व्हाट्सएप ग्रुप, सार्वजनिक सोशल मीडिया या गैर-सत्यापित व्यक्ति के साथ साझा न करें।
          </div>
        </section>

        {/* =========================================================================
            7. COMPREHENSIVE 15 SAFETY RULES (CARDS A TO O)
        ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              15 Comprehensive Safety Rules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              साइबर ठगी के सभी 15 प्रमुख तरीकों से बचने के आसान और सटीक नियम
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {safetyCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.code}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all shadow-md flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-mono font-black text-xs flex items-center justify-center">
                        {card.code}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs text-indigo-400 font-bold mt-0.5">
                        {card.titleHindi}
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      {card.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA / Return Button */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Homepage / मुख्य पृष्ठ पर जाएं</span>
          </button>

          <p className="text-xs text-slate-500 text-center sm:text-right">
            AL KHALIL CYBER CENTRE & PRINTING PRESS • Authorized Jan Seva Kendra
          </p>
        </div>
      </div>
    </div>
  );
};
