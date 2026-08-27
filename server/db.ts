import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface SiteInfo {
  // Business Information
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cityState: string;
  pincode: string;
  openingHours: string;
  googleMapsUrl: string;
  websiteUrl?: string;
  aboutText: string;
  aboutHighlights: string[];
  upiId?: string;

  // Website Branding
  primaryLogoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;

  // SEO Settings
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  // Social Media Links
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;

  // General Website Settings & Toggles
  maintenanceMode?: boolean;
  showPhoneButton?: boolean;
  showWhatsAppButton?: boolean;
  showFlashNews?: boolean;
  showCertificates?: boolean;
  showServices?: boolean;
  showImportantServices?: boolean;
  showRateList?: boolean;
  showWorkTracker?: boolean;
  showDocUpload?: boolean;
  showAbout?: boolean;
  showContact?: boolean;
}

export interface CertificateItem {
  id: string;
  name: string;
  organization: string;
  certificateNumber?: string;
  issueDate?: string;
  description?: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FlashNewsItem {
  id: string;
  text: string;
  link?: string;
  badge?: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  slideDuration: number; // in seconds
  active: boolean;
  order: number;
  bgColor?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  category: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  requiredDocuments: string[];
  estimatedTime: string;
  priceStartingFrom: string;
  icon: string;
  isPopular: boolean;
  active: boolean;
  order: number;
}

export interface RateItem {
  id: string;
  category: string;
  serviceName: string;
  price: string;
  unit: string;
  notes?: string;
  active: boolean;
  order: number;
}

export type JobStatus = 'Received' | 'Processing' | 'Pending' | 'Ready' | 'Completed' | 'On Hold';

export interface WorkJob {
  id: string;
  trackingCode: string; // e.g. AK-94821
  customerName: string;
  customerMobile: string;
  serviceName: string;
  status: JobStatus;
  statusNotes: string;
  estimatedDelivery?: string;
  priceTotal?: string;
  amountPaid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocumentRecord {
  id: string;
  customerName: string;
  customerMobile: string;
  serviceRequested: string;
  note?: string;
  trackingCode: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
  status: 'New' | 'Reviewed' | 'In Progress' | 'Converted to Job' | 'Archived';
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  serviceInterest?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface AdminAuthData {
  pinHash: string;
  updatedAt: string;
  failedAttempts: number;
  lockoutUntil?: number;
}

export interface DatabaseSchema {
  siteInfo: SiteInfo;
  adminAuth: AdminAuthData;
  certificates: CertificateItem[];
  news: FlashNewsItem[];
  banners: BannerItem[];
  services: ServiceItem[];
  rates: RateItem[];
  jobs: WorkJob[];
  uploadedDocuments: UploadedDocumentRecord[];
  contactMessages: ContactMessage[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
export const BANNER_UPLOADS_DIR = path.join(UPLOADS_DIR, 'banners');
export const DOCS_UPLOADS_DIR = path.join(UPLOADS_DIR, 'docs');
export const CERTIFICATES_UPLOADS_DIR = path.join(UPLOADS_DIR, 'certificates');
export const BRANDING_UPLOADS_DIR = path.join(UPLOADS_DIR, 'branding');

// Ensure required directories exist
[DATA_DIR, UPLOADS_DIR, BANNER_UPLOADS_DIR, DOCS_UPLOADS_DIR, CERTIFICATES_UPLOADS_DIR, BRANDING_UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Default Salted Hash for default PIN '595213'
const DEFAULT_PIN = '595213';
const DEFAULT_PIN_HASH = bcrypt.hashSync(DEFAULT_PIN, 10);

const initialDatabase: DatabaseSchema = {
  siteInfo: {
    businessName: 'AL KHALIL CYBER CENTRE',
    tagline: 'Aapka Vishwas, Hamari Pehchan - All Online, CSC, Printing & Photography Services',
    phone: '9259837361',
    whatsapp: '9259837361',
    email: 'alkhalilcybercentre@gmail.com',
    address: 'Near Main Bus Stand, Station Road, AL KHALIL CYBER CENTRE',
    cityState: 'Uttar Pradesh, India',
    pincode: '243001',
    openingHours: 'Mon - Sat: 8:00 AM - 9:00 PM | Sunday: 9:00 AM - 5:00 PM',
    googleMapsUrl: 'https://maps.google.com/?q=Al+Khalil+Cyber+Centre',
    websiteUrl: 'https://alkhalilcybercentre.com',
    aboutText: 'AL KHALIL CYBER CENTRE is a premier authorized Digital Service & CSC Jan Seva Kendra providing high-speed digital documentation, online government scheme assistance, Aadhaar & PAN card processing, heavy-duty multi-color printing, custom wedding card offset printing, and high-definition 4K photography & videography. We are dedicated to delivering fast, accurate, and transparent services with complete customer satisfaction.',
    aboutHighlights: [
      '100% Authorized & Secure Processing',
      'Instant Work Tracking Token for Every Service',
      'State-of-the-Art High-Speed Printing & Lamination',
      'Cinematic 4K Wedding & Event Photography'
    ],
    upiId: '9259837361@upi',
    metaTitle: 'AL KHALIL CYBER CENTRE - Official Jan Seva Kendra, Printing & 4K Studio',
    metaDescription: 'Official Portal of AL KHALIL CYBER CENTRE. Aadhaar, PAN, Govt Schemes, High-Speed Color Printing, Custom Wedding Cards & 4K Drone Photography.',
    metaKeywords: 'AL KHALIL CYBER CENTRE, CSC Jan Seva Kendra, Aadhaar Card, PAN Card, Wedding Cards Printing, Flex Banner, Photography',
    ogTitle: 'AL KHALIL CYBER CENTRE - Official Website',
    ogDescription: 'Trusted and authorized CSC & Jan Seva Kendra services in Uttar Pradesh.',
    showPhoneButton: true,
    showWhatsAppButton: true,
    showFlashNews: true,
    showCertificates: true,
    showServices: true,
    showImportantServices: true,
    showRateList: true,
    showWorkTracker: true,
    showDocUpload: true,
    showAbout: true,
    showContact: true,
    maintenanceMode: false
  },
  adminAuth: {
    pinHash: DEFAULT_PIN_HASH,
    updatedAt: new Date().toISOString(),
    failedAttempts: 0
  },
  certificates: [
    {
      id: 'cert-1',
      name: 'CSC e-Governance Jan Seva Kendra Authorization',
      organization: 'CSC e-Governance Services India Limited / MeitY',
      certificateNumber: 'CSC-UP-243001-8842',
      issueDate: '2022-04-15',
      description: 'Authorized Village Level Entrepreneur (VLE) Center certified to deliver G2C (Government-to-Citizen) and B2C digital public services.',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&auto=format&fit=crop&q=80',
      displayOrder: 1,
      active: true,
      createdAt: new Date(Date.now() - 365 * 86400 * 1000).toISOString()
    },
    {
      id: 'cert-2',
      name: 'Authorized Digital Banking & AEPS Point Certificate',
      organization: 'National Payments Corporation of India (NPCI) & Banking Partner',
      certificateNumber: 'AEPS-CSP-992147',
      issueDate: '2023-01-10',
      description: 'Certified Aadhaar Enabled Payment System (AEPS), Micro-ATM Cash Withdrawal, Money Transfer & Balance Inquiry Point.',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80',
      displayOrder: 2,
      active: true,
      createdAt: new Date(Date.now() - 200 * 86400 * 1000).toISOString()
    },
    {
      id: 'cert-3',
      name: 'Trade License & Commercial Printing Establishment Authorization',
      organization: 'Directorate of Commercial Taxes & Municipal Authority',
      certificateNumber: 'TL-COMM-UP-77215',
      issueDate: '2021-08-20',
      description: 'Authorized commercial establishment for digital typesetting, multi-color offset printing, smart PVC card printing, and multimedia production.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80',
      displayOrder: 3,
      active: true,
      createdAt: new Date(Date.now() - 500 * 86400 * 1000).toISOString()
    }
  ],
  news: [
    {
      id: 'news-1',
      text: 'Aadhaar Card Update & New Enrollment Services Active Daily (8 AM - 9 PM)',
      badge: 'URGENT',
      link: '#services',
      active: true,
      order: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'news-2',
      text: 'Instant PAN Card via Biometric / e-KYC in Just 2 Hours',
      badge: 'POPULAR',
      link: '#services',
      active: true,
      order: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'news-3',
      text: 'All Central & State Govt Job & Scholarship Online Forms Filling Available',
      badge: 'NEW',
      link: '#services',
      active: true,
      order: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 'news-4',
      text: 'Wedding Card, Visiting Card & Flex Banner High-Definition Printing with Special Discounts',
      badge: 'OFFER',
      link: '#rates',
      active: true,
      order: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 'news-5',
      text: '4K Ultra HD Drone Shoot & Wedding Videography Bookings Open for Upcoming Season',
      badge: 'FEATURED',
      link: '#contact',
      active: true,
      order: 5,
      createdAt: new Date().toISOString()
    }
  ],
  banners: [
    {
      id: 'banner-1',
      title: 'Complete Digital & Jan Seva Kendra Services',
      subtitle: 'Aadhaar, PAN Card, Ayushman Card, Govt Schemes, Certificate Issuance & Fast Online Form Submission under one roof.',
      badgeText: 'GOVERNMENT & CITIZEN SERVICES',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'Explore CSC Services',
      buttonLink: '#services',
      secondaryButtonText: 'Track Your Work',
      secondaryButtonLink: '#track',
      slideDuration: 5,
      active: true,
      order: 1,
      bgColor: 'from-slate-900 via-blue-950 to-slate-900',
      createdAt: new Date().toISOString()
    },
    {
      id: 'banner-2',
      title: 'Premium Printing & Custom Wedding Cards',
      subtitle: 'High-Quality Digital Color Prints, Flex Banners, Posters, Visiting Cards, PVC ID Cards & Luxury Wedding Invitation Printing.',
      badgeText: 'PRINTING STUDIO',
      imageUrl: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'View Rate List',
      buttonLink: '#rates',
      secondaryButtonText: 'Send Documents',
      secondaryButtonLink: '#upload-docs',
      slideDuration: 5,
      active: true,
      order: 2,
      bgColor: 'from-slate-950 via-emerald-950 to-slate-900',
      createdAt: new Date().toISOString()
    },
    {
      id: 'banner-3',
      title: '4K Ultra HD Photography & Drone Videography',
      subtitle: 'Cinematic Wedding Shoots, Pre-Wedding, Birthday & Event Coverage, Drone Aerial Video Recording and Studio Portrait Editing.',
      badgeText: 'MEDIA & STUDIO',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80',
      buttonText: 'Book Photo/Video Shoot',
      buttonLink: '#contact',
      secondaryButtonText: 'Call 9259837361',
      secondaryButtonLink: 'tel:9259837361',
      slideDuration: 6,
      active: true,
      order: 3,
      bgColor: 'from-slate-950 via-purple-950 to-slate-900',
      createdAt: new Date().toISOString()
    }
  ],
  services: [
    // Jan Seva / CSC Services
    {
      id: 'srv-1',
      category: 'JAN SEVA / CSC SERVICES',
      title: 'Aadhaar Card Services',
      shortDescription: 'Biometric update, address correction, mobile number link, PVC smart card print & child enrollment assistance.',
      fullDescription: 'We provide prompt Aadhaar update assistance including demographic data modifications, photo/biometric update appointment booking, instant e-Aadhaar download, and durable waterproof PVC smart card printing.',
      requiredDocuments: ['Existing Aadhaar / Enrollment Slip', 'Proof of Identity / Address', 'Active Mobile for OTP verification'],
      estimatedTime: '15 - 30 Minutes',
      priceStartingFrom: '₹30',
      icon: 'ShieldCheck',
      isPopular: true,
      active: true,
      order: 1
    },
    {
      id: 'srv-2',
      category: 'JAN SEVA / CSC SERVICES',
      title: 'PAN Card Services (New / Correction)',
      shortDescription: 'Apply for fresh PAN card or corrections via NSDL / UTI with instant digital e-PAN generation.',
      fullDescription: 'Get a new PAN card or correct name, DOB, father name, and address. Available through instant biometric thumb impression or Aadhaar OTP verification. Physical card delivered to your home address.',
      requiredDocuments: ['Aadhaar Card', 'Passport size photo', 'Signature (if non-eKYC)'],
      estimatedTime: '2 Hours (e-PAN) / 7 Days (Physical)',
      priceStartingFrom: '₹150',
      icon: 'CreditCard',
      isPopular: true,
      active: true,
      order: 2
    },
    {
      id: 'srv-3',
      category: 'JAN SEVA / CSC SERVICES',
      title: 'Ayushman Bharat Golden Card',
      shortDescription: 'Free ₹5 Lakh health insurance scheme registration and immediate card download.',
      fullDescription: 'Check your family eligibility in the PMJAY / SECC list, complete biometric e-KYC, and get your authorized laminated Ayushman Card on the spot for cashless medical treatment across all empaneled hospitals.',
      requiredDocuments: ['Ration Card / PM Letter', 'Aadhaar Card of all family members', 'Active Mobile Number'],
      estimatedTime: '20 Minutes',
      priceStartingFrom: '₹30',
      icon: 'HeartPulse',
      isPopular: true,
      active: true,
      order: 3
    },
    {
      id: 'srv-4',
      category: 'JAN SEVA / CSC SERVICES',
      title: 'Birth, Death & Caste/Income Certificates',
      shortDescription: 'Official government revenue portal certificates (Jati, Aay, Niwas, Janam Praman Patra).',
      fullDescription: 'Complete filing and tracking for Income Certificate (Aay Praman Patra), Caste Certificate (Jati Praman Patra), Domicile/Residence Certificate (Niwas Praman Patra), and Birth/Death certificates with online verification barcode.',
      requiredDocuments: ['Aadhaar Card', 'Self Declaration Form (Swapr प्रमाणित)', 'Ration Card / Voter ID', 'Passport Photo'],
      estimatedTime: '3 - 7 Working Days',
      priceStartingFrom: '₹60',
      icon: 'FileCheck',
      isPopular: false,
      active: true,
      order: 4
    },
    {
      id: 'srv-5',
      category: 'JAN SEVA / CSC SERVICES',
      title: 'Online Govt Exam & Job Applications',
      shortDescription: 'Zero-error form filling for SSC, UPSC, Railway, Police, Army, Teacher (TET/CTET) & State exams.',
      fullDescription: 'Accurate online application submission with precise photo/signature dimension resizing, live camera verification capture, online fee payment, and multiple color printouts of the final confirmation page.',
      requiredDocuments: ['Educational Marksheets (10th/12th/Graduation)', 'Aadhaar Card', 'Caste/Domicile Certificate', 'Photo & Signature'],
      estimatedTime: '20 - 45 Minutes',
      priceStartingFrom: '₹50',
      icon: 'GraduationCap',
      isPopular: true,
      active: true,
      order: 5
    },
    {
      id: 'srv-6',
      category: 'JAN SEVA / CSC SERVICES',
      title: 'Train, Flight & Bus Ticket Booking',
      shortDescription: 'IRCTC authorized Tatkal & General train reservation, domestic flights, and sleeper bus ticketing.',
      fullDescription: 'Fast, confirmed ticket booking for all Indian Railways trains, flights, and state/private AC buses. Includes instant SMS confirmation and printout with seat details.',
      requiredDocuments: ['Passenger Names & Ages', 'Valid Govt ID Proof', 'Travel Dates & Destination'],
      estimatedTime: '10 Minutes',
      priceStartingFrom: '₹30',
      icon: 'Train',
      isPopular: false,
      active: true,
      order: 6
    },
    {
      id: 'srv-7',
      category: 'JAN SEVA / CSC SERVICES',
      title: 'Electricity & Utility Bill Payments',
      shortDescription: 'Instant BBPS bill payment for Bijli, Water, Fastag, Gas Cylinder, DTH & Mobile Recharges.',
      fullDescription: 'Pay power bills, water bills, LPG gas booking, broadband, and insurance premiums with instant payment receipt and digital ledger confirmation.',
      requiredDocuments: ['Consumer Number / Account ID / Mobile Number'],
      estimatedTime: '5 Minutes',
      priceStartingFrom: 'Free / ₹10',
      icon: 'Zap',
      isPopular: false,
      active: true,
      order: 7
    },

    // Loan Services
    {
      id: 'srv-8',
      category: 'LOAN SERVICES',
      title: 'Personal & Business Loan Assistance',
      shortDescription: 'End-to-end guidance, documentation check, CIBIL score report, and online loan filing.',
      fullDescription: 'We help small business owners, shopkeepers, and salaried individuals prepare document files for Mudra loans, MSME business credit, and personal loans across public and private banks.',
      requiredDocuments: ['PAN & Aadhaar', '6 Months Bank Statement', 'ITR / GST Details (if applicable)', 'Business Address Proof'],
      estimatedTime: '1 - 2 Days',
      priceStartingFrom: 'Consultation Free',
      icon: 'Coins',
      isPopular: true,
      active: true,
      order: 8
    },
    {
      id: 'srv-9',
      category: 'LOAN SERVICES',
      title: 'Kisan Credit Card (KCC) & Agriculture Loan',
      shortDescription: 'Assistance with Kisan credit schemes, PM Kisan Samman Nidhi e-KYC & land record verification.',
      fullDescription: 'Assisting farmers with KCC documentation, Khatauni/Khasra verification, PM Kisan registration corrections, Aadhaar-NPCI bank account seeding, and subsidy claims.',
      requiredDocuments: ['Land Khatauni / Khasra Copy', 'Aadhaar Card & Bank Passbook', 'PM Kisan Registration ID'],
      estimatedTime: '30 Minutes',
      priceStartingFrom: '₹50',
      icon: 'Tractor',
      isPopular: false,
      active: true,
      order: 9
    },

    // Printing Services
    {
      id: 'srv-10',
      category: 'PRINTING SERVICES',
      title: 'Wedding & Invitation Cards Printing',
      shortDescription: 'Exclusive designer Hindi, English & Urdu wedding cards, multi-color offset & foil stamping.',
      fullDescription: 'Choose from hundreds of premium card samples ranging from traditional royal wedding cards to modern laser-cut designs. High-speed accurate proofreading and bulk dispatch.',
      requiredDocuments: ['Event Details / Family Names / Program Timings'],
      estimatedTime: '2 - 4 Days',
      priceStartingFrom: '₹8 / Card',
      icon: 'MailOpen',
      isPopular: true,
      active: true,
      order: 10
    },
    {
      id: 'srv-11',
      category: 'PRINTING SERVICES',
      title: 'Flex Banner & Vinyl Poster Printing',
      shortDescription: 'Heavy-duty waterproof outdoor flex, glowing signboards, hoardings & event star-flex.',
      fullDescription: 'Custom graphic design, high-DPI solvent printing, and eyelet punch finishing for shops, political campaigns, exhibitions, schools, and marriage functions.',
      requiredDocuments: ['Text / Logo / Dimensions (in Feet)'],
      estimatedTime: 'Same Day / 24 Hours',
      priceStartingFrom: '₹12 / Sq.Ft.',
      icon: 'Image',
      isPopular: true,
      active: true,
      order: 11
    },
    {
      id: 'srv-12',
      category: 'PRINTING SERVICES',
      title: 'Visiting Cards & Corporate Stationery',
      shortDescription: 'Matte, gloss, velvet touch, embossed & metallic visiting cards with custom logo design.',
      fullDescription: 'Professional 350 GSM business cards, letterheads, bill books, receipt vouchers, brochures, and promotional pamphlets for businesses.',
      requiredDocuments: ['Business Name, Logo & Contact Details'],
      estimatedTime: '24 - 48 Hours',
      priceStartingFrom: '₹250 / 500 Cards',
      icon: 'Briefcase',
      isPopular: false,
      active: true,
      order: 12
    },
    {
      id: 'srv-13',
      category: 'PRINTING SERVICES',
      title: 'High-Speed Color & B/W Xerox / Lamination',
      shortDescription: 'Crisp digital photocopy, book printing, spiral binding & heavy-gauge plastic lamination.',
      fullDescription: 'Instant high-speed laser printing for office documents, school projects, legal stamp papers, certificates, and ID cards with crystal clear reproduction.',
      requiredDocuments: ['Hardcopy or Softcopy (PDF / WhatsApp / Email)'],
      estimatedTime: 'Instant',
      priceStartingFrom: '₹2 / Page',
      icon: 'Printer',
      isPopular: true,
      active: true,
      order: 13
    },
    {
      id: 'srv-14',
      category: 'PRINTING SERVICES',
      title: 'PVC Smart ID & Ayushman / Aadhaar Cards',
      shortDescription: 'High-gloss thermal PVC card printing with durable waterproof coating.',
      fullDescription: 'Convert soft copy Aadhaar, PAN, Driving License, Ayushman Card, Voter ID, and Employee badges into pocket-sized durable plastic cards.',
      requiredDocuments: ['Digital PDF / Original Card Copy'],
      estimatedTime: '5 Minutes',
      priceStartingFrom: '₹50 / Card',
      icon: 'IdCard',
      isPopular: true,
      active: true,
      order: 14
    },

    // Photography & Videography
    {
      id: 'srv-15',
      category: 'PHOTOGRAPHY & VIDEOGRAPHY',
      title: 'Wedding & Reception 4K Videography',
      shortDescription: 'Cinematic multi-camera setup, candid highlights, gimbal stabilization & master mixing.',
      fullDescription: 'Capture your memorable wedding moments in breathtaking 4K resolution. Full team coverage with professional Sony/Canon cinema cameras, lighting kits, and master pen drive delivery.',
      requiredDocuments: ['Event Dates & Venue Location'],
      estimatedTime: 'Booking Basis',
      priceStartingFrom: '₹12,000',
      icon: 'Video',
      isPopular: true,
      active: true,
      order: 15
    },
    {
      id: 'srv-16',
      category: 'PHOTOGRAPHY & VIDEOGRAPHY',
      title: 'Drone Aerial 4K Camera Shoot',
      shortDescription: 'Licensed high-altitude aerial drone video & panoramic photography for weddings & events.',
      fullDescription: 'Spectacular bird-eye cinematic views of barat entry, varmala stage, outdoor venues, and grand family gatherings with experienced drone pilots.',
      requiredDocuments: ['Event Schedule & Venue Clearance'],
      estimatedTime: 'Event Basis',
      priceStartingFrom: '₹4,000 / Event',
      icon: 'Camera',
      isPopular: true,
      active: true,
      order: 16
    },
    {
      id: 'srv-17',
      category: 'PHOTOGRAPHY & VIDEOGRAPHY',
      title: 'Passport Size Photos & Studio Portrait',
      shortDescription: 'Instant 8 / 16 / 32 copies with white / blue background as per official passport specs.',
      fullDescription: 'Fast portrait photography with beauty touch-up, background replacement, suit/tie addition, and 5-minute glossy photo sheet printing.',
      requiredDocuments: ['Walk-in at Centre'],
      estimatedTime: '5 Minutes',
      priceStartingFrom: '₹40 / 8 Photos',
      icon: 'UserCheck',
      isPopular: true,
      active: true,
      order: 17
    },

    // Digital Services
    {
      id: 'srv-18',
      category: 'DIGITAL SERVICES',
      title: 'Document Scanning & High-Res PDF Service',
      shortDescription: 'Multi-page OCR scanning, compression, legal merge, and encryption.',
      fullDescription: 'Digitize your land registry, property documents, certificates, books, and receipts into organized high-resolution search-enabled PDF files.',
      requiredDocuments: ['Original Documents to scan'],
      estimatedTime: 'Instant',
      priceStartingFrom: '₹5 / Page',
      icon: 'ScanLine',
      isPopular: false,
      active: true,
      order: 18
    },
    {
      id: 'srv-19',
      category: 'DIGITAL SERVICES',
      title: 'Photo Resize & Govt Portal Optimization',
      shortDescription: 'Exact pixel dimensions, DPI, file size (KB limit) adjustment for official portals.',
      fullDescription: 'Fix portal upload rejections instantly. We accurately optimize photos and signatures to match strict government guidelines (e.g. 20KB-50KB, 200x230 pixels, 300 DPI).',
      requiredDocuments: ['Photo / Signature file'],
      estimatedTime: 'Instant',
      priceStartingFrom: '₹20',
      icon: 'Sliders',
      isPopular: false,
      active: true,
      order: 19
    },
    {
      id: 'srv-20',
      category: 'DIGITAL SERVICES',
      title: 'Professional Resume / CV & Bio-Data Creation',
      shortDescription: 'Modern corporate resumes, job biodata, matrimonial profiles in Hindi & English.',
      fullDescription: 'Custom formatted ATS-friendly resumes for freshers, experienced professionals, teachers, and marriage bio-data with high-quality printing.',
      requiredDocuments: ['Personal, Academic & Work Experience Details'],
      estimatedTime: '30 Minutes',
      priceStartingFrom: '₹70',
      icon: 'FileText',
      isPopular: false,
      active: true,
      order: 20
    }
  ],
  rates: [
    { id: 'rate-1', category: 'Printing & Xerox', serviceName: 'Black & White Xerox / Print (Single Side)', price: '₹2', unit: 'per page (A4)', notes: 'High speed laser print', active: true, order: 1 },
    { id: 'rate-2', category: 'Printing & Xerox', serviceName: 'Black & White Print (Both Sides)', price: '₹3', unit: 'per sheet (A4)', notes: '75 GSM premium paper', active: true, order: 2 },
    { id: 'rate-3', category: 'Printing & Xerox', serviceName: 'Full Color Inkjet / Laser Print', price: '₹5 - ₹10', unit: 'per page', notes: 'Vibrant color reproduction', active: true, order: 3 },
    { id: 'rate-4', category: 'Printing & Xerox', serviceName: 'Heavy Glossy Photo Paper Print (A4)', price: '₹30', unit: 'per sheet', notes: '210 GSM high gloss photo paper', active: true, order: 4 },
    { id: 'rate-5', category: 'Lamination & Binding', serviceName: 'A4 Document Lamination', price: '₹15', unit: 'per page', notes: '125 Micron thick waterproof film', active: true, order: 5 },
    { id: 'rate-6', category: 'Lamination & Binding', serviceName: 'ID Card / Aadhaar Lamination', price: '₹10', unit: 'per card', notes: 'Pocket pouch lamination', active: true, order: 6 },
    { id: 'rate-7', category: 'Lamination & Binding', serviceName: 'Spiral Binding with Plastic Cover', price: '₹30 - ₹60', unit: 'per book', notes: 'Up to 200 pages', active: true, order: 7 },
    { id: 'rate-8', category: 'Smart Cards & IDs', serviceName: 'PVC Smart Card Print (Aadhaar / PAN / Ayushman)', price: '₹50', unit: 'per card', notes: 'Original thermal UV printed PVC', active: true, order: 8 },
    { id: 'rate-9', category: 'Smart Cards & IDs', serviceName: 'Passport Size Photos (Instant 8 Copies)', price: '₹40', unit: '8 Photos', notes: 'Ready in 5 minutes with retouching', active: true, order: 9 },
    { id: 'rate-10', category: 'Smart Cards & IDs', serviceName: 'Passport Size Photos (16 Copies)', price: '₹70', unit: '16 Photos', notes: 'Waterproof studio finish', active: true, order: 10 },
    { id: 'rate-11', category: 'Jan Seva & Govt Forms', serviceName: 'New PAN Card Application', price: '₹150', unit: 'Complete Filing', notes: 'Includes Govt fee & tracking', active: true, order: 11 },
    { id: 'rate-12', category: 'Jan Seva & Govt Forms', serviceName: 'Income / Caste / Domicile Certificate Filing', price: '₹60', unit: 'per certificate', notes: 'E-District UP authorized filing', active: true, order: 12 },
    { id: 'rate-13', category: 'Jan Seva & Govt Forms', serviceName: 'Online Competitive Exam Form Submission', price: '₹50 - ₹100', unit: 'per application', notes: 'Zero error guarantee with printout', active: true, order: 13 },
    { id: 'rate-14', category: 'Jan Seva & Govt Forms', serviceName: 'Ayushman Card Download & Lamination', price: '₹30', unit: 'per member', notes: 'Instant authorization check', active: true, order: 14 },
    { id: 'rate-15', category: 'Banners & Cards', serviceName: 'Wedding Invitation Cards (Classic)', price: '₹8 - ₹18', unit: 'per card', notes: 'Includes envelope & screen printing', active: true, order: 15 },
    { id: 'rate-16', category: 'Banners & Cards', serviceName: 'Premium Luxury Laser-Cut Wedding Cards', price: '₹25 - ₹75', unit: 'per card', notes: 'Foil embossing with butter paper', active: true, order: 16 },
    { id: 'rate-17', category: 'Banners & Cards', serviceName: 'Outdoor Flex Banner Printing', price: '₹12 - ₹18', unit: 'per sq. ft.', notes: 'Star flex with border eyelets', active: true, order: 17 },
    { id: 'rate-18', category: 'Banners & Cards', serviceName: 'Business Visiting Cards (500 Matte Laminated)', price: '₹450', unit: 'per box (500 pcs)', notes: '350 GSM double side print', active: true, order: 18 }
  ],
  jobs: [
    {
      id: 'job-1',
      trackingCode: 'AK-59124',
      customerName: 'Mohammad Imran',
      customerMobile: '9876543210',
      serviceName: 'Aadhaar Address Update & PVC Card Print',
      status: 'Ready',
      statusNotes: 'Your PVC Smart Card is printed and ready for pickup from our counter.',
      estimatedDelivery: 'Ready for Pickup',
      priceTotal: '₹80',
      amountPaid: '₹80',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 'job-2',
      trackingCode: 'AK-78210',
      customerName: 'Rajesh Kumar',
      customerMobile: '9837123456',
      serviceName: 'UP Police Constable Online Application Form',
      status: 'Completed',
      statusNotes: 'Form submitted successfully. Confirmation slip & fee receipt handed over.',
      estimatedDelivery: 'Completed',
      priceTotal: '₹100',
      amountPaid: '₹100',
      createdAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString()
    },
    {
      id: 'job-3',
      trackingCode: 'AK-39148',
      customerName: 'Arif Khan',
      customerMobile: '9259837361',
      serviceName: 'Wedding Card Printing (400 Units)',
      status: 'Processing',
      statusNotes: 'Printing under progress on offset machine. Binding & packing in progress.',
      estimatedDelivery: 'Tomorrow, 4:00 PM',
      priceTotal: '₹4,800',
      amountPaid: '₹2,000 Advance',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
    }
  ],
  uploadedDocuments: [
    {
      id: 'doc-1',
      customerName: 'Sanjay Sharma',
      customerMobile: '9123456780',
      serviceRequested: 'New PAN Card Application',
      note: 'Need urgent processing for bank loan purpose please.',
      trackingCode: 'AK-66192',
      fileName: 'sample_pan_docs.pdf',
      originalName: 'Aadhaar_Front_Back.pdf',
      fileSize: 142000,
      mimeType: 'application/pdf',
      filePath: path.join(DOCS_UPLOADS_DIR, 'sample_doc.pdf'),
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      status: 'New'
    }
  ],
  contactMessages: [
    {
      id: 'msg-1',
      name: 'Vipin Verma',
      phone: '9897001122',
      serviceInterest: 'Wedding Photography & Drone Shoot',
      message: 'Need quotation for 2 days wedding function in December.',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      isRead: false
    }
  ]
};

// In-Memory & File Persistence Manager
class DatabaseManager {
  private data: DatabaseSchema;
  private isLoaded: boolean = false;

  constructor() {
    this.data = initialDatabase;
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...initialDatabase,
          ...parsed,
          siteInfo: { ...initialDatabase.siteInfo, ...parsed.siteInfo },
          adminAuth: { ...initialDatabase.adminAuth, ...parsed.adminAuth },
          certificates: Array.isArray(parsed.certificates) ? parsed.certificates : initialDatabase.certificates
        };
      } else {
        this.save();
      }
      this.isLoaded = true;
    } catch (e) {
      console.error('Error loading db.json, using fallback initialized data', e);
      this.data = initialDatabase;
      this.save();
      this.isLoaded = true;
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json', e);
    }
  }

  // Getters
  public getSiteInfo(): SiteInfo {
    return this.data.siteInfo;
  }

  public updateSiteInfo(info: Partial<SiteInfo>): SiteInfo {
    this.data.siteInfo = { ...this.data.siteInfo, ...info };
    this.save();
    return this.data.siteInfo;
  }

  // Admin Auth & PIN
  public verifyPin(enteredPin: string): boolean {
    const auth = this.data.adminAuth;
    if (auth.lockoutUntil && Date.now() < auth.lockoutUntil) {
      const waitSeconds = Math.ceil((auth.lockoutUntil - Date.now()) / 1000);
      throw new Error(`Too many failed attempts. Account locked for ${waitSeconds} seconds.`);
    }

    const isValid = bcrypt.compareSync(enteredPin, auth.pinHash);
    if (!isValid) {
      auth.failedAttempts = (auth.failedAttempts || 0) + 1;
      if (auth.failedAttempts >= 5) {
        auth.lockoutUntil = Date.now() + 5 * 60 * 1000; // 5 minute lockout
      }
      this.save();
      return false;
    }

    // Reset failed counter on success
    auth.failedAttempts = 0;
    auth.lockoutUntil = undefined;
    this.save();
    return true;
  }

  public updatePin(newPin: string): boolean {
    if (!newPin || !/^\d{6,12}$/.test(newPin)) {
      throw new Error('PIN must be 6 to 12 numeric digits (0-9 only).');
    }
    this.data.adminAuth.pinHash = bcrypt.hashSync(newPin, 10);
    this.data.adminAuth.updatedAt = new Date().toISOString();
    this.data.adminAuth.failedAttempts = 0;
    this.data.adminAuth.lockoutUntil = undefined;
    this.save();
    return true;
  }

  // Certificates
  public getCertificates(activeOnly: boolean = false): CertificateItem[] {
    let list = [...(this.data.certificates || [])];
    if (activeOnly) {
      list = list.filter((c) => c.active);
    }
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  public getCertificateById(id: string): CertificateItem | undefined {
    return (this.data.certificates || []).find((c) => c.id === id);
  }

  public saveCertificate(
    item: Partial<CertificateItem> & { name: string; imageUrl: string }
  ): CertificateItem {
    if (!this.data.certificates) {
      this.data.certificates = [];
    }

    if (item.id) {
      const idx = this.data.certificates.findIndex((c) => c.id === item.id);
      if (idx !== -1) {
        const updated: CertificateItem = {
          ...this.data.certificates[idx],
          ...item,
          updatedAt: new Date().toISOString()
        };
        this.data.certificates[idx] = updated;
        this.save();
        return updated;
      }
    }

    const newCert: CertificateItem = {
      id: item.id || `cert-${Date.now()}`,
      name: item.name,
      organization: item.organization || '',
      certificateNumber: item.certificateNumber || '',
      issueDate: item.issueDate || '',
      description: item.description || '',
      imageUrl: item.imageUrl,
      displayOrder: item.displayOrder ?? (this.data.certificates.length + 1),
      active: item.active !== false,
      createdAt: new Date().toISOString()
    };

    this.data.certificates.push(newCert);
    this.save();
    return newCert;
  }

  public deleteCertificate(id: string): boolean {
    if (!this.data.certificates) return false;
    const initialLen = this.data.certificates.length;
    this.data.certificates = this.data.certificates.filter((c) => c.id !== id);
    if (this.data.certificates.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // News
  public getNews(activeOnly: boolean = false): FlashNewsItem[] {
    let list = [...this.data.news];
    if (activeOnly) {
      list = list.filter((n) => n.active);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  public saveNewsItem(item: Partial<FlashNewsItem> & { text: string }): FlashNewsItem {
    let saved: FlashNewsItem;
    if (item.id) {
      const idx = this.data.news.findIndex((n) => n.id === item.id);
      if (idx !== -1) {
        this.data.news[idx] = {
          ...this.data.news[idx],
          ...item
        };
        saved = this.data.news[idx];
      } else {
        saved = {
          id: item.id || `news-${Date.now()}`,
          text: item.text,
          link: item.link || '',
          badge: item.badge || '',
          active: item.active !== false,
          order: item.order || this.data.news.length + 1,
          createdAt: new Date().toISOString()
        };
        this.data.news.push(saved);
      }
    } else {
      saved = {
        id: `news-${Date.now()}`,
        text: item.text,
        link: item.link || '',
        badge: item.badge || '',
        active: item.active !== false,
        order: item.order || this.data.news.length + 1,
        createdAt: new Date().toISOString()
      };
      this.data.news.push(saved);
    }
    this.save();
    return saved;
  }

  public deleteNews(id: string): boolean {
    const initialLen = this.data.news.length;
    this.data.news = this.data.news.filter((n) => n.id !== id);
    if (this.data.news.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Banners
  public getBanners(activeOnly: boolean = false): BannerItem[] {
    let list = [...this.data.banners];
    if (activeOnly) {
      list = list.filter((b) => b.active);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  public saveBanner(banner: Partial<BannerItem> & { title: string; imageUrl: string }): BannerItem {
    let saved: BannerItem;
    if (banner.id) {
      const idx = this.data.banners.findIndex((b) => b.id === banner.id);
      if (idx !== -1) {
        this.data.banners[idx] = {
          ...this.data.banners[idx],
          ...banner
        };
        saved = this.data.banners[idx];
      } else {
        saved = {
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle || '',
          badgeText: banner.badgeText || '',
          imageUrl: banner.imageUrl,
          buttonText: banner.buttonText || 'Learn More',
          buttonLink: banner.buttonLink || '#services',
          secondaryButtonText: banner.secondaryButtonText,
          secondaryButtonLink: banner.secondaryButtonLink,
          slideDuration: banner.slideDuration || 5,
          active: banner.active !== false,
          order: banner.order || this.data.banners.length + 1,
          bgColor: banner.bgColor || 'from-slate-900 via-blue-950 to-slate-900',
          createdAt: new Date().toISOString()
        };
        this.data.banners.push(saved);
      }
    } else {
      saved = {
        id: `banner-${Date.now()}`,
        title: banner.title,
        subtitle: banner.subtitle || '',
        badgeText: banner.badgeText || '',
        imageUrl: banner.imageUrl,
        buttonText: banner.buttonText || 'Learn More',
        buttonLink: banner.buttonLink || '#services',
        secondaryButtonText: banner.secondaryButtonText,
        secondaryButtonLink: banner.secondaryButtonLink,
        slideDuration: banner.slideDuration || 5,
        active: banner.active !== false,
        order: banner.order || this.data.banners.length + 1,
        bgColor: banner.bgColor || 'from-slate-900 via-blue-950 to-slate-900',
        createdAt: new Date().toISOString()
      };
      this.data.banners.push(saved);
    }
    this.save();
    return saved;
  }

  public deleteBanner(id: string): boolean {
    const initialLen = this.data.banners.length;
    this.data.banners = this.data.banners.filter((b) => b.id !== id);
    if (this.data.banners.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Services
  public getServices(activeOnly: boolean = false): ServiceItem[] {
    let list = [...this.data.services];
    if (activeOnly) {
      list = list.filter((s) => s.active);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  public saveService(service: Partial<ServiceItem> & { title: string; category: string }): ServiceItem {
    let saved: ServiceItem;
    if (service.id) {
      const idx = this.data.services.findIndex((s) => s.id === service.id);
      if (idx !== -1) {
        this.data.services[idx] = {
          ...this.data.services[idx],
          ...service
        };
        saved = this.data.services[idx];
      } else {
        saved = {
          id: service.id,
          category: service.category,
          title: service.title,
          shortDescription: service.shortDescription || '',
          fullDescription: service.fullDescription || '',
          requiredDocuments: service.requiredDocuments || [],
          estimatedTime: service.estimatedTime || '1 - 2 Days',
          priceStartingFrom: service.priceStartingFrom || 'Contact for Price',
          icon: service.icon || 'FileText',
          isPopular: !!service.isPopular,
          active: service.active !== false,
          order: service.order || this.data.services.length + 1
        };
        this.data.services.push(saved);
      }
    } else {
      saved = {
        id: `srv-${Date.now()}`,
        category: service.category,
        title: service.title,
        shortDescription: service.shortDescription || '',
        fullDescription: service.fullDescription || '',
        requiredDocuments: service.requiredDocuments || [],
        estimatedTime: service.estimatedTime || '1 - 2 Days',
        priceStartingFrom: service.priceStartingFrom || 'Contact for Price',
        icon: service.icon || 'FileText',
        isPopular: !!service.isPopular,
        active: service.active !== false,
        order: service.order || this.data.services.length + 1
      };
      this.data.services.push(saved);
    }
    this.save();
    return saved;
  }

  public deleteService(id: string): boolean {
    const initialLen = this.data.services.length;
    this.data.services = this.data.services.filter((s) => s.id !== id);
    if (this.data.services.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Rates
  public getRates(activeOnly: boolean = false): RateItem[] {
    let list = [...this.data.rates];
    if (activeOnly) {
      list = list.filter((r) => r.active);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  public saveRate(rate: Partial<RateItem> & { category: string; serviceName: string; price: string; unit: string }): RateItem {
    let saved: RateItem;
    if (rate.id) {
      const idx = this.data.rates.findIndex((r) => r.id === rate.id);
      if (idx !== -1) {
        this.data.rates[idx] = {
          ...this.data.rates[idx],
          ...rate
        };
        saved = this.data.rates[idx];
      } else {
        saved = {
          id: rate.id,
          category: rate.category,
          serviceName: rate.serviceName,
          price: rate.price,
          unit: rate.unit,
          notes: rate.notes || '',
          active: rate.active !== false,
          order: rate.order || this.data.rates.length + 1
        };
        this.data.rates.push(saved);
      }
    } else {
      saved = {
        id: `rate-${Date.now()}`,
        category: rate.category,
        serviceName: rate.serviceName,
        price: rate.price,
        unit: rate.unit,
        notes: rate.notes || '',
        active: rate.active !== false,
        order: rate.order || this.data.rates.length + 1
      };
      this.data.rates.push(saved);
    }
    this.save();
    return saved;
  }

  public deleteRate(id: string): boolean {
    const initialLen = this.data.rates.length;
    this.data.rates = this.data.rates.filter((r) => r.id !== id);
    if (this.data.rates.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Work Tracking
  public getJobs(): WorkJob[] {
    return [...this.data.jobs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public findJobByCode(code: string): WorkJob | undefined {
    const clean = code.trim().toUpperCase();
    return this.data.jobs.find((j) => j.trackingCode.toUpperCase() === clean);
  }

  public saveJob(job: Partial<WorkJob> & { customerName: string; serviceName: string }): WorkJob {
    let saved: WorkJob;
    const now = new Date().toISOString();
    if (job.id) {
      const idx = this.data.jobs.findIndex((j) => j.id === job.id);
      if (idx !== -1) {
        this.data.jobs[idx] = {
          ...this.data.jobs[idx],
          ...job,
          updatedAt: now
        };
        saved = this.data.jobs[idx];
      } else {
        const trackingCode = job.trackingCode || `AK-${Math.floor(10000 + Math.random() * 90000)}`;
        saved = {
          id: job.id,
          trackingCode,
          customerName: job.customerName,
          customerMobile: job.customerMobile || '',
          serviceName: job.serviceName,
          status: job.status || 'Received',
          statusNotes: job.statusNotes || 'Work received and registered.',
          estimatedDelivery: job.estimatedDelivery || '1 - 2 Days',
          priceTotal: job.priceTotal || '',
          amountPaid: job.amountPaid || '',
          createdAt: now,
          updatedAt: now
        };
        this.data.jobs.unshift(saved);
      }
    } else {
      const trackingCode = job.trackingCode || `AK-${Math.floor(10000 + Math.random() * 90000)}`;
      saved = {
        id: `job-${Date.now()}`,
        trackingCode,
        customerName: job.customerName,
        customerMobile: job.customerMobile || '',
        serviceName: job.serviceName,
        status: job.status || 'Received',
        statusNotes: job.statusNotes || 'Work received and registered in system.',
        estimatedDelivery: job.estimatedDelivery || '1 - 2 Days',
        priceTotal: job.priceTotal || '',
        amountPaid: job.amountPaid || '',
        createdAt: now,
        updatedAt: now
      };
      this.data.jobs.unshift(saved);
    }
    this.save();
    return saved;
  }

  public deleteJob(idOrCode: string): boolean {
    const initialLen = this.data.jobs.length;
    const clean = idOrCode.trim().toLowerCase();
    this.data.jobs = this.data.jobs.filter(
      (j) => j.id.toLowerCase() !== clean && j.trackingCode.toLowerCase() !== clean
    );
    if (this.data.jobs.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Uploaded Documents
  public getUploadedDocuments(): UploadedDocumentRecord[] {
    return [...this.data.uploadedDocuments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getDocumentById(id: string): UploadedDocumentRecord | undefined {
    return this.data.uploadedDocuments.find((d) => d.id === id);
  }

  public addUploadedDocument(doc: Omit<UploadedDocumentRecord, 'id' | 'createdAt' | 'status'>): UploadedDocumentRecord {
    const record: UploadedDocumentRecord = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      status: 'New'
    };
    this.data.uploadedDocuments.unshift(record);

    // Also auto-create a tracking work order for customer convenience!
    this.saveJob({
      trackingCode: doc.trackingCode,
      customerName: doc.customerName,
      customerMobile: doc.customerMobile,
      serviceName: doc.serviceRequested,
      status: 'Received',
      statusNotes: `Online document received (${doc.originalName}). Under review by operator.`,
      estimatedDelivery: '1 - 2 Business Days'
    });

    this.save();
    return record;
  }

  public updateDocumentStatus(id: string, status: UploadedDocumentRecord['status']): boolean {
    const doc = this.data.uploadedDocuments.find((d) => d.id === id);
    if (doc) {
      doc.status = status;
      this.save();
      return true;
    }
    return false;
  }

  public deleteDocument(id: string): boolean {
    const doc = this.data.uploadedDocuments.find((d) => d.id === id);
    if (doc) {
      // Remove file from disk if exists
      try {
        if (doc.filePath && fs.existsSync(doc.filePath)) {
          fs.unlinkSync(doc.filePath);
        }
      } catch (e) {
        console.warn('Could not delete physical file', e);
      }
      this.data.uploadedDocuments = this.data.uploadedDocuments.filter((d) => d.id !== id);
      this.save();
      return true;
    }
    return false;
  }

  // Contact Messages
  public getContactMessages(): ContactMessage[] {
    return [...this.data.contactMessages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addContactMessage(msg: { name: string; phone: string; serviceInterest?: string; message: string }): ContactMessage {
    const record: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: msg.name,
      phone: msg.phone,
      serviceInterest: msg.serviceInterest || '',
      message: msg.message,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    this.data.contactMessages.unshift(record);
    this.save();
    return record;
  }

  public markMessageRead(id: string): boolean {
    const m = this.data.contactMessages.find((msg) => msg.id === id);
    if (m) {
      m.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public deleteContactMessage(id: string): boolean {
    const initialLen = this.data.contactMessages.length;
    this.data.contactMessages = this.data.contactMessages.filter((m) => m.id !== id);
    if (this.data.contactMessages.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Dashboard Stats
  public getStats() {
    const totalBanners = this.data.banners.length;
    const activeBanners = this.data.banners.filter((b) => b.active).length;
    const totalServices = this.data.services.length;
    const totalCertificates = (this.data.certificates || []).length;
    const activeCertificates = (this.data.certificates || []).filter((c) => c.active).length;
    const totalJobs = this.data.jobs.length;
    const pendingJobs = this.data.jobs.filter((j) => j.status === 'Received' || j.status === 'Processing' || j.status === 'Pending').length;
    const readyJobs = this.data.jobs.filter((j) => j.status === 'Ready').length;
    const completedJobs = this.data.jobs.filter((j) => j.status === 'Completed').length;
    const uploadedDocs = this.data.uploadedDocuments.length;
    const unreadMessages = this.data.contactMessages.filter((m) => !m.isRead).length;

    return {
      totalBanners,
      activeBanners,
      totalServices,
      totalCertificates,
      activeCertificates,
      totalJobs,
      pendingJobs,
      readyJobs,
      completedJobs,
      uploadedDocs,
      unreadMessages
    };
  }
}

export const db = new DatabaseManager();
