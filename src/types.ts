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
  slideDuration: number;
  active: boolean;
  order: number;
  bgColor?: string;
  createdAt?: string;
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
  trackingCode: string;
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

export interface DashboardStats {
  totalBanners: number;
  activeBanners: number;
  totalServices: number;
  totalCertificates: number;
  activeCertificates: number;
  totalJobs: number;
  pendingJobs: number;
  readyJobs: number;
  completedJobs: number;
  uploadedDocs: number;
  unreadMessages: number;
}
