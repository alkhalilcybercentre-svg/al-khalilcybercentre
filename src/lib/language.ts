import { useState, useEffect, useCallback } from 'react';
import { SiteInfo } from '../types';

export type Language = 'en' | 'hi';

export const LANGUAGE_STORAGE_KEY = 'alkhalil_language';

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
    const browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('hi')) return 'hi';
  } catch {
    // ignore
  }
  return 'en';
}

export function setStoredLanguage(lang: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    window.dispatchEvent(new CustomEvent('alkhalil-language-change', { detail: lang }));
  } catch {
    // ignore
  }
}

/**
 * Returns an updated SiteInfo state customized for the selected language.
 * This directly updates the site content state for all components displaying
 * business name, tagline, about text, highlights, emergency alert, safety text, etc.
 */
export function getLocalizedSiteInfo(base: SiteInfo, lang: Language): SiteInfo {
  if (lang === 'hi') {
    return {
      ...base,
      language: 'hi',
      businessName: 'AL KHALIL CYBER CENTRE (अल खलील साइबर सेन्टर)',
      tagline: 'डिजिटल सेवाएं • सीएससी जन सेवा केंद्र • प्रिंटिंग प्रेस • 4K फोटोग्राफी एवं वीडियोग्राफी',
      openingHours: 'सोम - शनि: प्रातः 8:00 से रात्रि 9:00 | रवि: प्रातः 9:00 से दोपहर 3:00',
      address: 'निकट मुख्य बाजार, सर्विस कॉम्प्लेक्स, उत्तर प्रदेश',
      cityState: 'उत्तर प्रदेश, भारत',
      aboutText:
        'अल खलील साइबर सेन्टर आपका अधिकृत सीएससी जन सेवा केंद्र और प्रमुख डिजिटल सेवा स्टूडियो है। हम सरकारी योजनाओं के त्वरित ऑनलाइन आवेदन, मूल निवास व जाति प्रमाण पत्र, व्यावसायिक प्रिंटिंग व शादी कार्ड छपाई, और हाई-डेफिनिशन 4K ड्रोन वेडिंग फोटोग्राफी की उत्कृष्ट सेवाएं प्रदान करते हैं।',
      aboutHighlights: [
        'अधिकृत सीएससी जन सेवा केंद्र - सरकारी पोर्टल्स द्वारा 100% सत्यापित',
        'रीयल-टाइम लाइव कार्य ट्रैकिंग टोकन सिस्टम',
        'हाई-स्पीड कलर लेजर प्रिंटिंग, लेमिनेशन और पीवीसी स्मार्ट कार्ड',
        'सिनेमैटिक 4K ड्रोन वेडिंग फोटोग्राफी एवं वीडियो एडिटिंग'
      ],
      safetyNoticeText:
        'सावधान: OTP, UPI PIN, ATM PIN, नेट बैंकिंग पासवर्ड या कार्ड विवरण किसी भी अनजान कॉल या लिंक पर साझा न करें। जनहित में जारी।'
    };
  }

  // English fallback / default
  return {
    ...base,
    language: 'en',
    businessName: 'AL KHALIL CYBER CENTRE',
    tagline: 'Digital Services • Jan Seva • Printing • 4K Photography & Videography',
    openingHours: 'Mon - Sat: 8:00 AM - 9:00 PM | Sun: 9:00 AM - 3:00 PM',
    address: 'Near Main Market, Service Complex, Uttar Pradesh',
    cityState: 'Uttar Pradesh, India',
    aboutText:
      'AL KHALIL CYBER CENTRE is your authorized Jan Seva Kendra and premier digital solution studio offering instant government application processing, fast online certificates, commercial offset & digital printing, and cinematic 4K wedding photography & videography.',
    aboutHighlights: [
      'Authorized CSC Jan Seva Kendra with Verified Govt Portals',
      'Real-Time Live Work Tracking Token System',
      'High-Speed Color Laser Printing, Lamination & PVC Smart Cards',
      'Cinema 4K Drone Wedding Photography & Video Editing'
    ],
    safetyNoticeText:
      'Beware of cyber fraud! Never share your OTP, UPI PIN, ATM PIN, Banking Password or CVV with anyone over phone or suspicious links.'
  };
}

export const TRANSLATIONS = {
  en: {
    nav: {
      home: 'Home',
      notices: 'Notices',
      aiTools: 'AI Tools',
      services: 'Services',
      rates: 'Rate List',
      reviews: 'Reviews',
      certificates: 'Certificates',
      track: 'Track Work',
      sendDocs: 'Send Documents',
      cyberSafety: 'Cyber Safety',
      about: 'About Us',
      contact: 'Contact',
      more: 'More Portals',
      keySections: 'Key Sections',
    },
    topBar: {
      officialSupport: 'Official Support',
      admin: 'ADMIN',
      callNow: 'Call Now',
      whatsapp: 'WHATSAPP',
      lightMode: 'LIGHT',
      darkMode: 'DARK',
      langCode: 'EN',
      langName: 'English',
      switchTargetName: 'हिंदी',
      langToggleTitle: 'Switch site content to Hindi (हिंदी में बदलें)',
    },
    cta: {
      trackWork: 'Track Work',
      sendDocuments: 'Send Documents',
      pickupDrop: 'Pickup & Drop',
    },
    brand: {
      subtitle: 'Digital Services • Printing Studio • 4K Photography',
    },
    mobile: {
      themeTitle: 'Theme Mode',
      themeDarkText: 'Theme: Dark Mode',
      themeLightText: 'Theme: Light Mode',
      themeSubtitleDark: 'Tap switch for Light view',
      themeSubtitleLight: 'Tap switch for Dark cyber view',
      langTitle: 'Site Language / भाषा',
      langActiveDesc: 'Currently displaying site in English',
      callNow: 'Call Now',
      whatsapp: 'WhatsApp',
      adminLogin: 'Admin Portal Login',
    },
    safetyBanner: {
      title: 'Beware of Cyber Fraud',
      badge: 'Public Notice',
      button: 'View Cyber Safety Tips',
    }
  },
  hi: {
    nav: {
      home: 'मुख्य पृष्ठ',
      notices: 'सूचनाएं',
      aiTools: 'AI टूल्स',
      services: 'सेवाएं',
      rates: 'रेट लिस्ट',
      reviews: 'समीक्षाएं',
      certificates: 'प्रमाण पत्र',
      track: 'काम ट्रैक करें',
      sendDocs: 'दस्तावेज भेजें',
      cyberSafety: 'साइबर सुरक्षा',
      about: 'हमारे बारे में',
      contact: 'संपर्क करें',
      more: 'अन्य पोर्टल',
      keySections: 'मुख्य अनुभाग',
    },
    topBar: {
      officialSupport: 'आधिकारिक सहायता',
      admin: 'व्यवस्थापक',
      callNow: 'कॉल करें',
      whatsapp: 'व्हाट्सएप',
      lightMode: 'लाइट',
      darkMode: 'डार्क',
      langCode: 'हिं',
      langName: 'हिंदी',
      switchTargetName: 'English',
      langToggleTitle: 'Switch site content to English (अंग्रेजी में बदलें)',
    },
    cta: {
      trackWork: 'काम ट्रैक करें',
      sendDocuments: 'दस्तावेज भेजें',
      pickupDrop: 'पिकअप और ड्रॉप',
    },
    brand: {
      subtitle: 'डिजिटल सेवाएं • प्रिंटिंग स्टूडियो • 4K फोटोग्राफी',
    },
    mobile: {
      themeTitle: 'थीम मोड',
      themeDarkText: 'थीम: डार्क मोड (डार्क)',
      themeLightText: 'थीम: लाइट मोड (लाइट)',
      themeSubtitleDark: 'लाइट मोड के लिए स्विच दबाएं',
      themeSubtitleLight: 'डार्क मोड के लिए स्विच दबाएं',
      langTitle: 'साइट भाषा / Language',
      langActiveDesc: 'वर्तमान में सामग्री हिंदी में प्रदर्शित है',
      callNow: 'कॉल करें',
      whatsapp: 'व्हाट्सएप',
      adminLogin: 'व्यवस्थापक पोर्टल लॉगिन',
    },
    safetyBanner: {
      title: 'साइबर फ्रॉड से सावधान रहें',
      badge: 'जनहित में जारी',
      button: 'Cyber Safety Tips देखें',
    }
  }
} as const;

export type TranslationType = typeof TRANSLATIONS['en'];

export function useLanguage(): [Language, (explicit?: Language) => void, TranslationType] {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail && (customEvent.detail === 'en' || customEvent.detail === 'hi')) {
        setLanguageState(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && (e.newValue === 'en' || e.newValue === 'hi')) {
        setLanguageState(e.newValue);
      }
    };

    window.addEventListener('alkhalil-language-change', handleCustomChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('alkhalil-language-change', handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  const toggleLanguage = useCallback((explicit?: Language) => {
    setLanguageState(prev => {
      const next = explicit || (prev === 'en' ? 'hi' : 'en');
      setStoredLanguage(next);
      return next;
    });
  }, []);

  const t = TRANSLATIONS[language];

  return [language, toggleLanguage, t];
}
