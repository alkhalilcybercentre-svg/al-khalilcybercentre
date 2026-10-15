import React, { useState } from 'react';
import {
  Printer,
  CreditCard,
  Truck,
  Fingerprint,
  HeartPulse,
  FileCheck,
  GraduationCap,
  Train,
  Plane,
  Bus,
  Zap,
  Coins,
  Tractor,
  MailOpen,
  Image as ImageIcon,
  Briefcase,
  IdCard,
  Video,
  Camera,
  UserCheck,
  ScanLine,
  Sliders,
  FileText,
  BookOpen,
  Vote,
  Car,
  ShoppingBag,
  Landmark,
  Users,
  Sprout,
  UtensilsCrossed,
  Building2,
  BadgeCheck,
  Shield,
  Radio,
  HardHat,
  FileBadge,
  Sparkles,
  Wallet,
  ShieldCheck,
  Laptop,
  Palette,
  Droplets,
  Scale,
  Home,
  HeartHandshake,
  Tv,
  Smartphone
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceVisualProps {
  service: ServiceItem;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

/**
 * Dynamically resolves a service-specific icon from lucide-react based on category, title, or configured icon.
 * Ensures default icons follow domain rules:
 * - Printer for printing services
 * - CreditCard for banking and financial services
 * - Fingerprint for Aadhaar services
 * - Truck for pickup & drop facility
 * - and respective icons for all categories.
 */
export const getCategoryDefaultIcon = (category: string = '', title: string = '', explicitIcon: string = '') => {
  const cat = (category || '').toLowerCase().trim();
  const t = (title || '').toLowerCase().trim();
  const ic = (explicitIcon || '').toLowerCase().trim();

  // 1. Explicit icon check if user/admin specifically selected one (and not generic fallback)
  if (ic && ic !== 'shieldcheck') {
    if (ic === 'aadhaar') return Fingerprint;
    if (ic === 'certificate') return FileCheck;
    if (ic === 'home') return Home;
    if (ic === 'property') return Building2;
    if (ic === 'disability') return HeartPulse;
    if (ic === 'land' || ic === 'document') return FileText;
    if (ic === 'family') return Users;
    if (ic === 'mobile') return Smartphone;
    if (ic === 'tv') return Tv;
    if (ic === 'electricity') return Zap;
    if (ic === 'water') return Droplets;
    if (ic === 'vehicle') return Car;
    if (ic === 'loan') return Coins;
    if (ic === 'business') return Building2;
    if (ic === 'marriage') return HeartHandshake;
    if (ic === 'wedding card' || ic === 'weddingcard' || ic === 'wedding') return MailOpen;
    if (ic === 'printing') return Printer;
    if (ic === 'drone') return Camera;
    if (ic === 'photo') return Camera;
    if (ic === 'printer') return Printer;
    if (ic === 'creditcard' || ic === 'credit-card') return CreditCard;
    if (ic === 'truck') return Truck;
    if (ic === 'fingerprint') return Fingerprint;
    if (ic === 'heartpulse') return HeartPulse;
    if (ic === 'filecheck') return FileCheck;
    if (ic === 'graduationcap') return GraduationCap;
    if (ic === 'train') return Train;
    if (ic === 'plane') return Plane;
    if (ic === 'bus') return Bus;
    if (ic === 'zap') return Zap;
    if (ic === 'coins') return Coins;
    if (ic === 'tractor') return Tractor;
    if (ic === 'mailopen') return MailOpen;
    if (ic === 'image') return ImageIcon;
    if (ic === 'briefcase') return Briefcase;
    if (ic === 'idcard') return IdCard;
    if (ic === 'video') return Video;
    if (ic === 'camera') return Camera;
    if (ic === 'usercheck') return UserCheck;
    if (ic === 'scanline') return ScanLine;
    if (ic === 'sliders') return Sliders;
    if (ic === 'filetext') return FileText;
    if (ic === 'bookopen') return BookOpen;
    if (ic === 'vote') return Vote;
    if (ic === 'car') return Car;
    if (ic === 'shoppingbag' || ic === 'shopping-bag') return ShoppingBag;
    if (ic === 'landmark') return Landmark;
    if (ic === 'users') return Users;
    if (ic === 'sprout') return Sprout;
    if (ic === 'utensilscrossed' || ic === 'utilensilscrossed') return UtensilsCrossed;
    if (ic === 'building2') return Building2;
    if (ic === 'badgecheck') return BadgeCheck;
    if (ic === 'shield') return Shield;
    if (ic === 'radio') return Radio;
    if (ic === 'hardhat') return HardHat;
    if (ic === 'palette') return Palette;
    if (ic === 'droplets') return Droplets;
    if (ic === 'scale') return Scale;
    if (ic === 'laptop') return Laptop;
    if (ic === 'wallet') return Wallet;
  }

  // 2. Doorstep Pickup & Drop Facility Check
  if (
    cat.includes('pickup') ||
    cat.includes('drop') ||
    t.includes('pickup') ||
    t.includes('drop') ||
    t.includes('doorstep')
  ) {
    return Truck;
  }

  // 3. Printing Services (e.g., printer for printing)
  if (
    cat.includes('print') ||
    cat.includes('photocopy') ||
    cat.includes('xerox') ||
    cat.includes('lamination') ||
    cat.includes('press')
  ) {
    if (t.includes('wedding card') || t.includes('invitation')) return MailOpen;
    if (t.includes('banner') || t.includes('flex')) return ImageIcon;
    if (t.includes('pvc') || t.includes('smart card')) return IdCard;
    if (t.includes('visiting card') || t.includes('stationery')) return Briefcase;
    return Printer;
  }

  // 4. Banking & Financial Services (e.g., credit-card for banking)
  if (
    cat.includes('bank') ||
    cat.includes('financial') ||
    cat.includes('bc point') ||
    cat.includes('dmt') ||
    cat.includes('aeps')
  ) {
    return CreditCard;
  }

  // 5. Loan Services
  if (cat.includes('loan')) {
    if (t.includes('kisan') || t.includes('kcc') || t.includes('agri')) return Sprout;
    return Coins;
  }

  // 6. Aadhaar Services
  if (cat.includes('aadhaar')) {
    return Fingerprint;
  }

  // 7. PAN Card Services
  if (cat.includes('pan') || t.includes('pan card')) {
    return CreditCard;
  }

  // 8. Voter ID Services
  if (cat.includes('voter') || t.includes('voter') || t.includes('nvsp') || t.includes('epic')) {
    return Vote;
  }

  // 9. Passport Services
  if (cat.includes('passport') || t.includes('passport')) {
    return BookOpen;
  }

  // 10. Ayushman Bharat / Health
  if (cat.includes('ayushman') || cat.includes('health') || t.includes('ayushman')) {
    return HeartPulse;
  }

  // 11. Food License / FSSAI
  if (cat.includes('food') || cat.includes('fssai') || t.includes('fssai')) {
    return UtensilsCrossed;
  }

  // 12. Photography, Videography & Drone
  if (
    cat.includes('photo') ||
    cat.includes('video') ||
    cat.includes('drone') ||
    cat.includes('studio') ||
    cat.includes('media')
  ) {
    if (t.includes('video') || t.includes('film')) return Video;
    if (t.includes('drone')) return Camera;
    if (t.includes('passport size') || t.includes('portrait')) return UserCheck;
    return Camera;
  }

  // 13. Wedding Card Printing
  if (cat.includes('wedding')) {
    if (t.includes('photo')) return Camera;
    if (t.includes('video')) return Video;
    return MailOpen;
  }

  // 14. Graphic Design & Media Editing
  if (cat.includes('graphic') || cat.includes('design')) return Palette;
  if (cat.includes('edit')) return Sliders;
  if (cat.includes('flex') || cat.includes('banner')) return ImageIcon;

  // 15. Computer & Digital Services
  if (cat.includes('computer') || cat.includes('digital')) {
    if (t.includes('scan')) return ScanLine;
    if (t.includes('resize') || t.includes('dimension')) return Sliders;
    if (t.includes('resume') || t.includes('cv') || t.includes('bio-data')) return FileText;
    return Laptop;
  }

  // 16. Education & Scholarships
  if (
    cat.includes('education') ||
    cat.includes('admission') ||
    cat.includes('scholarship') ||
    t.includes('scholarship') ||
    t.includes('exam')
  ) {
    return GraduationCap;
  }

  // 17. Employment / Job Services
  if (cat.includes('employment') || cat.includes('job')) {
    return Briefcase;
  }

  // 18. Transport / RTO Services
  if (cat.includes('transport') || cat.includes('rto')) {
    if (t.includes('fastag')) return Radio;
    return Car;
  }

  // 19. Travel, Railway, Bus, Flight
  if (cat.includes('travel') || cat.includes('railway') || cat.includes('ticket')) {
    if (t.includes('flight') || t.includes('airplane')) return Plane;
    if (t.includes('bus')) return Bus;
    return Train;
  }

  // 20. Recharge & Bill Payment / Utility
  if (cat.includes('recharge') || cat.includes('bill')) {
    return Zap;
  }
  if (cat.includes('utility')) {
    if (t.includes('water')) return Droplets;
    return Zap;
  }

  // 21. Insurance Services
  if (cat.includes('insurance') || t.includes('insurance')) {
    return Shield;
  }

  // 22. Tax, GST, Business, MSME, Udyam
  if (
    cat.includes('tax') ||
    cat.includes('gst') ||
    cat.includes('business') ||
    cat.includes('compliance') ||
    cat.includes('udyam') ||
    cat.includes('msme')
  ) {
    return Building2;
  }

  // 23. Legal / Documentation Assistance
  if (cat.includes('legal')) {
    return Scale;
  }

  // 24. Certificates / e-District / Praman Patra
  if (
    cat.includes('certificate') ||
    cat.includes('e-district') ||
    t.includes('certificate') ||
    t.includes('praman patra')
  ) {
    if (t.includes('police') || t.includes('charitra')) return BadgeCheck;
    return FileCheck;
  }

  // 25. Online Govt Forms
  if (cat.includes('form')) {
    return FileText;
  }

  // 26. Agriculture / Farmer
  if (cat.includes('agri') || cat.includes('kisan') || t.includes('kisan') || t.includes('farmer')) {
    return Sprout;
  }

  // 27. CSC / Jan Seva Category Title checks
  if (cat.includes('csc') || cat.includes('jan seva')) {
    if (t.includes('aadhaar')) return Fingerprint;
    if (t.includes('pan card') || t.includes('pan')) return CreditCard;
    if (t.includes('ayushman') || t.includes('health')) return HeartPulse;
    if (t.includes('voter') || t.includes('election')) return Vote;
    if (t.includes('ration') || t.includes('nfsa')) return ShoppingBag;
    if (t.includes('pension')) return Users;
    if (t.includes('exam') || t.includes('job') || t.includes('admission')) return GraduationCap;
    if (t.includes('train') || t.includes('irctc') || t.includes('ticket')) return Train;
    if (t.includes('bill') || t.includes('bijli') || t.includes('electricity')) return Zap;
    if (t.includes('police') || t.includes('charitra')) return BadgeCheck;
    if (t.includes('shram') || t.includes('labour') || t.includes('majdoor')) return HardHat;
    if (t.includes('certificate') || t.includes('praman')) return FileCheck;
    return ShieldCheck;
  }

  // Fallback
  return ShieldCheck;
};

// Color Theme by Service Category/Type
export const getCategoryTheme = (category: string = '', title: string = '') => {
  const cat = (category || '').toLowerCase();
  const t = (title || '').toLowerCase();

  if (t.includes('pickup') || t.includes('drop') || cat.includes('pickup')) {
    return {
      bg: 'from-amber-500/20 via-orange-500/20 to-amber-600/30',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-500/10'
    };
  }
  if (cat.includes('aadhaar') || t.includes('aadhaar')) {
    return {
      bg: 'from-cyan-500/20 via-blue-500/20 to-indigo-600/30',
      text: 'text-cyan-300',
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/10'
    };
  }
  if (cat.includes('bank') || cat.includes('financial') || t.includes('bank') || t.includes('money transfer')) {
    return {
      bg: 'from-emerald-500/20 via-teal-500/20 to-emerald-600/30',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/10'
    };
  }
  if (cat.includes('print') || t.includes('wedding')) {
    return {
      bg: 'from-fuchsia-500/20 via-pink-500/20 to-rose-600/30',
      text: 'text-pink-400',
      border: 'border-pink-500/40',
      glow: 'shadow-pink-500/10'
    };
  }
  if (cat.includes('photo') || cat.includes('video') || t.includes('drone')) {
    return {
      bg: 'from-violet-500/20 via-purple-500/20 to-indigo-600/30',
      text: 'text-purple-300',
      border: 'border-purple-500/40',
      glow: 'shadow-purple-500/10'
    };
  }
  if (cat.includes('passport') || cat.includes('travel') || t.includes('train') || t.includes('flight')) {
    return {
      bg: 'from-sky-500/20 via-blue-500/20 to-indigo-600/30',
      text: 'text-sky-400',
      border: 'border-sky-500/40',
      glow: 'shadow-sky-500/10'
    };
  }
  if (cat.includes('business') || cat.includes('tax') || cat.includes('gst')) {
    return {
      bg: 'from-blue-500/20 via-indigo-500/20 to-violet-600/30',
      text: 'text-indigo-400',
      border: 'border-indigo-500/40',
      glow: 'shadow-indigo-500/10'
    };
  }
  if (cat.includes('education') || cat.includes('scholarship')) {
    return {
      bg: 'from-amber-500/20 via-yellow-500/20 to-orange-600/30',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-500/10'
    };
  }
  if (cat.includes('health') || cat.includes('ayushman')) {
    return {
      bg: 'from-rose-500/20 via-red-500/20 to-rose-600/30',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      glow: 'shadow-rose-500/10'
    };
  }

  // Default Jan Seva / CSC
  return {
    bg: 'from-indigo-500/20 via-blue-500/20 to-slate-800/40',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/10'
  };
};

export const ServiceVisual: React.FC<ServiceVisualProps> = ({
  service,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const IconComp = getCategoryDefaultIcon(service.category, service.title, service.icon);
  const theme = getCategoryTheme(service.category, service.title);

  // Responsive size variations across mobile, tablet, and desktop screens
  const sizeMap = {
    sm: {
      wrapper: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl',
      icon: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
      img: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl'
    },
    md: {
      wrapper: 'w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl',
      icon: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7',
      img: 'w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl'
    },
    lg: {
      wrapper: 'w-13 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl',
      icon: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
      img: 'w-13 h-13 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl'
    },
    hero: {
      wrapper: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl',
      icon: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12',
      img: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl'
    }
  };

  const dims = sizeMap[size];

  const isPickupService =
    service.serviceCode === 'HOME-PICKUP-001' ||
    service.serviceCode === 'ADH-PICKUP' ||
    (service.title && service.title.toLowerCase().includes('pickup'));

  const effectiveImageUrl = service.imageUrl || (isPickupService ? '/src/assets/images/home_pickup_service_1790884351690.jpg' : undefined);

  // If custom image is configured and loaded without error: render responsive image
  if (effectiveImageUrl && !imageError) {
    return (
      <div
        className={`${dims.wrapper} relative overflow-hidden border ${theme.border} bg-slate-900 shadow-md ${theme.glow} shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
      >
        <img
          src={effectiveImageUrl}
          alt={service.title}
          className={`${dims.img} object-cover w-full h-full transition-transform duration-500 group-hover:scale-110`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // If no custom image exists for service: apply default service-specific icon from lucide-react based on category
  return (
    <div
      className={`${dims.wrapper} bg-gradient-to-br ${theme.bg} border ${theme.border} ${theme.text} flex items-center justify-center shrink-0 shadow-lg ${theme.glow} transition-transform duration-300 group-hover:scale-105 ${className}`}
      title={service.title}
    >
      <IconComp className={dims.icon} />
    </div>
  );
};

