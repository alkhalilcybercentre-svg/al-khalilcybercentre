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
  showNotices?: boolean;
  showTestimonials?: boolean;
  showCertificates?: boolean;
  showServices?: boolean;
  showImportantServices?: boolean;
  showRateList?: boolean;
  showWorkTracker?: boolean;
  showDocUpload?: boolean;
  showAbout?: boolean;
  showContact?: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal';
  badgeText?: string;
  actionUrl?: string;
  actionText?: string;
  isPinned?: boolean;
  pinned?: boolean;
  active: boolean;
  publishDate?: string;
  date?: string;
  expiryDate?: string;
  order: number;
  createdAt?: string;
}

export interface TestimonialItem {
  id: string;
  customerName: string;
  customerCity?: string;
  city?: string;
  rating: number; // 1 to 5
  serviceAvail?: string;
  serviceAvailed?: string;
  reviewText: string;
  customerMobile?: string;
  mobile?: string;
  isApproved: boolean;
  isFeatured?: boolean;
  responseFromAdmin?: string;
  adminReply?: string;
  adminReplyDate?: string;
  date?: string;
  order?: number;
  createdAt?: string;
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

export interface ServiceChargeItem {
  id: string;
  name: string;
  govtFee: number;
  centreCharge: number;
}

export interface ServiceItem {
  id: string;
  serviceCode?: string;
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
  chargeBreakdown?: ServiceChargeItem[];
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
  serviceCode?: string;
  serviceId?: string;
  govtFee?: number;
  centreCharges?: number;
  chargeBreakdown?: ServiceChargeItem[];
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

export interface BotFAQItem {
  id: string;
  category: string;
  question: string;
  keywords: string;
  answer: string;
  suggestedQuestions?: string[];
  actionUrl?: string;
  actionText?: string;
  active: boolean;
  order: number;
  createdAt?: string;
}

export interface ChatbotConfig {
  enabled: boolean;
  botName: string;
  botSubtitle: string;
  welcomeMessage: string;
  whatsappFallbackNumber: string;
  quickPrompts: string[];
  placeholderText: string;
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
  totalNotices?: number;
  activeNotices?: number;
  totalTestimonials?: number;
  pendingTestimonials?: number;
  approvedTestimonials?: number;
  averageRating?: number;
}

// ==========================================
// GOOGLE AI SUITE TYPES
// ==========================================

export interface AiVoiceOption {
  id: string;
  name: string;
  gender: string;
  description: string;
}

export interface VoiceConversionResponse {
  audioBase64: string;
  mimeType: string;
  transcribedText: string;
  targetVoice: string;
  modelUsed: string;
  notes: string;
}

export interface SearchAssistantSource {
  title: string;
  url: string;
}

export interface SearchAssistantResponse {
  answer: string;
  sources: SearchAssistantSource[];
  searchQueries?: string[];
  grounded: boolean;
  modelUsed: string;
}

export interface TranscriptionResponse {
  text: string;
  detectedLanguage?: string;
  durationSeconds?: number;
  wordCount: number;
  modelUsed: string;
}

export interface ImageToVideoStartResponse {
  operationName: string;
  model: string;
}

export interface ImageToVideoStatusResponse {
  done: boolean;
  videoUri?: string;
  error?: string;
}

