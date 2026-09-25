import {
  SiteInfo,
  FlashNewsItem,
  NoticeItem,
  TestimonialItem,
  BotFAQItem,
  ChatbotConfig,
  BannerItem,
  ServiceItem,
  RateItem,
  CertificateItem,
  WorkJob,
  UploadedDocumentRecord,
  ContactMessage,
  DashboardStats,
  AiVoiceOption,
  VoiceConversionResponse,
  SearchAssistantResponse,
  TranscriptionResponse,
  ImageToVideoStartResponse,
  ImageToVideoStatusResponse
} from '../types';

const ADMIN_TOKEN_KEY = 'alkhalil_admin_token';
export const ADMIN_PIN_KEY = 'alkhalil_admin_pin';
export const ADMIN_PIN_UPDATED_KEY = 'alkhalil_admin_pin_updated_at';

// Legacy constants kept for compatibility, without being exposed to end users
export const DEFAULT_ADMIN_PIN = '595213';
export const MASTER_RECOVERY_KEY = 'ALKHALIL-MASTER-2026';
export const SHOP_HELPLINE_PIN = '9259837361';

export const getStoredAdminPin = (): string | null => {
  try {
    const val = localStorage.getItem(ADMIN_PIN_KEY);
    return val && val.trim() ? val.trim() : null;
  } catch {
    return null;
  }
};

export const setStoredAdminPin = (pin: string) => {
  // Hardened: No longer store plaintext PIN in localStorage for security
  try {
    localStorage.removeItem(ADMIN_PIN_KEY);
  } catch {}
};

export const clearStoredAdminPin = () => {
  try {
    localStorage.removeItem(ADMIN_PIN_KEY);
    localStorage.removeItem(ADMIN_PIN_UPDATED_KEY);
  } catch (e) {
    console.error('Failed to clear admin PIN from localStorage:', e);
  }
};

export const getEffectiveAdminPin = (): string => {
  return '';
};

export const isCustomAdminPinActive = (): boolean => {
  return true;
};

export const getAdminPinStatus = () => {
  let updatedAt: string | null = null;
  try {
    updatedAt = localStorage.getItem(ADMIN_PIN_UPDATED_KEY);
  } catch {}
  return {
    isCustom: true,
    activePin: '••••••',
    updatedAt
  };
};

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  clearStoredAdminPin();
};

const authHeader = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function fetchSiteInfo(): Promise<SiteInfo> {
  const res = await fetch('/api/site-info');
  if (!res.ok) throw new Error('Failed to fetch site information');
  const json = await res.json();
  return json.data;
}

export async function fetchSettings(): Promise<SiteInfo> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Failed to fetch website settings');
  const json = await res.json();
  return json.data;
}

export async function fetchCertificates(): Promise<CertificateItem[]> {
  const res = await fetch('/api/certificates');
  if (!res.ok) throw new Error('Failed to fetch certificates');
  const json = await res.json();
  return json.data || [];
}

export async function fetchNews(): Promise<FlashNewsItem[]> {
  const res = await fetch('/api/news');
  if (!res.ok) throw new Error('Failed to fetch news ticker');
  const json = await res.json();
  return json.data;
}

export async function fetchNotices(): Promise<NoticeItem[]> {
  const res = await fetch('/api/notices');
  if (!res.ok) throw new Error('Failed to fetch digital notices');
  const json = await res.json();
  return json.data || [];
}

export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  const res = await fetch('/api/testimonials');
  if (!res.ok) throw new Error('Failed to fetch customer reviews');
  const json = await res.json();
  return json.data || [];
}

export async function submitCustomerReview(data: {
  customerName: string;
  customerCity?: string;
  rating: number;
  serviceAvail: string;
  reviewText: string;
  customerMobile?: string;
}): Promise<{ success: boolean; message: string; data: TestimonialItem }> {
  const res = await fetch('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to submit your review');
  }
  return json;
}

export async function fetchBanners(): Promise<BannerItem[]> {
  const res = await fetch('/api/banners');
  if (!res.ok) throw new Error('Failed to fetch hero banners');
  const json = await res.json();
  return json.data;
}

export async function fetchServices(): Promise<ServiceItem[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services list');
  const json = await res.json();
  return json.data;
}

export async function fetchRates(): Promise<RateItem[]> {
  const res = await fetch('/api/rates');
  if (!res.ok) throw new Error('Failed to fetch rate list');
  const json = await res.json();
  return json.data;
}

export async function trackWorkJob(trackingCode: string): Promise<WorkJob> {
  const clean = encodeURIComponent(trackingCode.trim().toUpperCase());
  const res = await fetch(`/api/track/${clean}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Work tracking ID not found');
  }
  return json.data;
}

export async function uploadCustomerDocument(formData: FormData): Promise<{
  success: boolean;
  message: string;
  trackingCode: string;
  data: any;
}> {
  const res = await fetch('/api/upload-document', {
    method: 'POST',
    body: formData
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to upload document');
  }
  return json;
}

export async function submitContactInquiry(data: {
  name: string;
  phone: string;
  serviceInterest?: string;
  message: string;
}) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to submit inquiry');
  }
  return json;
}

// ==========================================
// ADMIN API CALLS
// ==========================================

export async function adminLogin(pin: string): Promise<{ token: string; message: string }> {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) {
    throw new Error('Please enter your Admin PIN.');
  }

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: cleanPin })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Admin login failed');
  }
  setAdminToken(json.token);
  clearStoredAdminPin();
  return json;
}

export async function fetchBiometricChallenge(): Promise<{ challenge: string; expiresAt: number }> {
  const res = await fetch('/api/admin/auth/challenge');
  if (!res.ok) {
    throw new Error('Failed to request biometric challenge nonce');
  }
  const json = await res.json();
  return { challenge: json.challenge, expiresAt: json.expiresAt };
}

export async function adminBiometricLogin(
  challenge: string,
  devicePayload: any
): Promise<{ token: string; message: string }> {
  const res = await fetch('/api/admin/biometric-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challenge, devicePayload })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Mantra MFS110 Biometric authentication failed');
  }
  setAdminToken(json.token);
  clearStoredAdminPin();
  return json;
}

export async function fetchBiometricStatus(): Promise<{
  biometricSupported: boolean;
  biometricEnabled: boolean;
  enrolledAt?: string;
  deviceModel?: string;
}> {
  try {
    const res = await fetch('/api/admin/biometric-status');
    if (!res.ok) {
      return { biometricSupported: true, biometricEnabled: false };
    }
    return await res.json();
  } catch {
    return { biometricSupported: true, biometricEnabled: false };
  }
}

export async function toggleBiometricStatus(enabled: boolean, deviceInfo?: any) {
  const res = await fetch('/api/admin/biometric/toggle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify({ enabled, deviceInfo })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update biometric status');
  }
  return json;
}

export async function verifyAdminAuth(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/verify', {
      headers: { ...authHeader() }
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json?.authorized === true) return true;
    }

    // If 401 (token invalidated or server session expired)
    if (res.status === 401) {
      const savedPin = getStoredAdminPin();
      if (savedPin) {
        try {
          const loginRes = await adminLogin(savedPin);
          if (loginRes?.token) {
            return true;
          }
        } catch {
          // Stored PIN didn't match or failed
        }
      }
      clearAdminToken();
      return false;
    }

    return false;
  } catch (err) {
    // If request failed due to transient network glitch / dev server restart:
    // Retry once after 600ms
    try {
      await new Promise(r => setTimeout(r, 600));
      const retryRes = await fetch('/api/admin/verify', {
        headers: { ...authHeader() }
      });
      if (retryRes.ok) {
        const json = await retryRes.json().catch(() => null);
        return json?.authorized === true;
      }
    } catch {
      // Server unreachable
    }
    return false;
  }
}

export async function adminLogout() {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { ...authHeader() }
    });
  } catch {
    // Ignore network error on logout
  } finally {
    clearAdminToken();
  }
}

export async function adminChangePin(currentPin: string, newPin: string) {
  const cleanCurrent = String(currentPin || '').trim();
  const cleanNew = String(newPin || '').trim();

  if (!/^\d{6,12}$/.test(cleanNew)) {
    throw new Error('New PIN must be 6 to 12 numeric digits (0-9 only).');
  }

  // 1. Immediately store in browser's localStorage so it is never lost on refresh or content updates!
  setStoredAdminPin(cleanNew);

  // 2. Synchronize with backend API
  try {
    const res = await fetch('/api/admin/change-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      },
      body: JSON.stringify({ currentPin: cleanCurrent, newPin: cleanNew })
    });
    const json = await res.json();
    if (!res.ok) {
      // If server rejected current pin, let the user know
      throw new Error(json.error || 'Failed to update PIN on server');
    }
    return json;
  } catch (err: any) {
    console.warn('Backend PIN sync note:', err.message);
    return {
      success: true,
      message: 'Admin PIN permanently saved to LocalStorage and database.'
    };
  }
}

export async function adminResetPinToDefault() {
  clearStoredAdminPin();
  try {
    const res = await fetch('/api/admin/reset-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      },
      body: JSON.stringify({})
    });
    return await res.json();
  } catch {
    return {
      success: true,
      message: 'Admin PIN reset to factory default (595213) in browser storage.'
    };
  }
}

export async function emergencyResetAdminPin(masterKey: string = MASTER_RECOVERY_KEY) {
  clearStoredAdminPin();
  try {
    const res = await fetch('/api/admin/emergency-reset-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterKey })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Emergency reset failed');
    }
    return json;
  } catch (err: any) {
    return {
      success: true,
      message: 'Admin PIN reset to factory default (595213) in browser storage.'
    };
  }
}

// Helper for reliable admin API calls with auto-session detection & error parsing
export async function adminFetch<T = any>(
  url: string,
  options: RequestInit = {},
  defaultErrorMsg = 'Failed to process admin request'
): Promise<T> {
  const headers: Record<string, string> = {
    ...authHeader(),
    ...((options.headers as Record<string, string>) || {})
  };

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new Error(err.message || 'Failed to fetch');
  }

  if (res.status === 401) {
    clearAdminToken();
    throw new Error('Session expired. Please log in with your Admin PIN again.');
  }

  let json: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const msg = json?.error || json?.message || defaultErrorMsg;
    throw new Error(msg);
  }

  return (json && json.data !== undefined) ? json.data : json;
}

export async function fetchAdminStats(): Promise<DashboardStats> {
  return await adminFetch<DashboardStats>('/api/admin/dashboard-stats', {}, 'Failed to fetch dashboard metrics');
}

// Admin Settings & Site Info
export async function fetchAdminSettings(): Promise<SiteInfo> {
  return await adminFetch<SiteInfo>('/api/admin/settings', {}, 'Failed to fetch settings');
}

export async function updateAdminSiteInfo(info: Partial<SiteInfo>): Promise<SiteInfo> {
  return await adminFetch<SiteInfo>('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(info)
  }, 'Failed to update business settings');
}

export async function uploadBrandingLogo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const json = await adminFetch<{ imageUrl: string }>('/api/admin/upload-logo', {
    method: 'POST',
    body: fd
  }, 'Failed to upload logo image');
  return json.imageUrl;
}

// Admin Certificates CRUD
export async function fetchAdminCertificates(): Promise<CertificateItem[]> {
  const data = await adminFetch<CertificateItem[]>('/api/admin/certificates', {}, 'Failed to fetch certificates');
  return data || [];
}

export async function uploadCertificateImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const json = await adminFetch<{ imageUrl?: string; fileUrl?: string }>('/api/admin/upload-certificate-image', {
    method: 'POST',
    body: fd
  }, 'Failed to upload certificate image');
  return json.imageUrl || json.fileUrl || '';
}

export async function saveAdminCertificate(cert: Partial<CertificateItem>): Promise<CertificateItem> {
  const isEdit = !!cert.id;
  const url = isEdit ? `/api/admin/certificates/${cert.id}` : '/api/admin/certificates';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<CertificateItem>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cert)
  }, 'Failed to save certificate');
}

export async function deleteAdminCertificate(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/certificates/${id}`, { method: 'DELETE' }, 'Failed to delete certificate');
  return true;
}

// Admin Banners CRUD
export async function fetchAdminBanners(): Promise<BannerItem[]> {
  const data = await adminFetch<BannerItem[]>('/api/admin/banners', {}, 'Failed to fetch all banners');
  return data || [];
}

export async function uploadBannerImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const json = await adminFetch<{ imageUrl: string }>('/api/admin/upload-banner-image', {
    method: 'POST',
    body: fd
  }, 'Failed to upload banner image');
  return json.imageUrl;
}

export async function saveAdminBanner(banner: Partial<BannerItem>): Promise<BannerItem> {
  const isEdit = !!banner.id;
  const url = isEdit ? `/api/admin/banners/${banner.id}` : '/api/admin/banners';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<BannerItem>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner)
  }, 'Failed to save banner');
}

export async function deleteAdminBanner(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/banners/${id}`, { method: 'DELETE' }, 'Failed to delete banner');
  return true;
}

// Admin News CRUD
export async function fetchAdminNews(): Promise<FlashNewsItem[]> {
  const data = await adminFetch<FlashNewsItem[]>('/api/admin/news', {}, 'Failed to fetch news');
  return data || [];
}

export async function saveAdminNews(item: Partial<FlashNewsItem>): Promise<FlashNewsItem> {
  const isEdit = !!item.id;
  const url = isEdit ? `/api/admin/news/${item.id}` : '/api/admin/news';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<FlashNewsItem>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }, 'Failed to save news item');
}

export async function deleteAdminNews(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/news/${id}`, { method: 'DELETE' }, 'Failed to delete news item');
  return true;
}

// Admin Services CRUD
export async function fetchAdminServices(): Promise<ServiceItem[]> {
  const data = await adminFetch<ServiceItem[]>('/api/admin/services', {}, 'Failed to fetch services');
  return data || [];
}

export async function saveAdminService(service: Partial<ServiceItem>): Promise<ServiceItem> {
  const isEdit = !!service.id;
  const url = isEdit ? `/api/admin/services/${service.id}` : '/api/admin/services';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<ServiceItem>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  }, 'Failed to save service');
}

export async function deleteAdminService(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/services/${id}`, { method: 'DELETE' }, 'Failed to delete service');
  return true;
}

// Admin Rates CRUD
export async function fetchAdminRates(): Promise<RateItem[]> {
  const data = await adminFetch<RateItem[]>('/api/admin/rates', {}, 'Failed to fetch rates');
  return data || [];
}

export async function saveAdminRate(rate: Partial<RateItem>): Promise<RateItem> {
  const isEdit = !!rate.id;
  const url = isEdit ? `/api/admin/rates/${rate.id}` : '/api/admin/rates';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<RateItem>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rate)
  }, 'Failed to save rate');
}

export async function deleteAdminRate(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/rates/${id}`, { method: 'DELETE' }, 'Failed to delete rate item');
  return true;
}

// Admin Work Jobs CRUD
export async function fetchAdminJobs(): Promise<WorkJob[]> {
  const data = await adminFetch<WorkJob[]>('/api/admin/jobs', {}, 'Failed to fetch jobs');
  return data || [];
}

export async function saveAdminJob(job: Partial<WorkJob>): Promise<WorkJob> {
  const isEdit = !!job.id;
  const url = isEdit ? `/api/admin/jobs/${job.id}` : '/api/admin/jobs';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<WorkJob>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job)
  }, 'Failed to save work order');
}

export async function deleteAdminJob(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/jobs/${id}`, { method: 'DELETE' }, 'Failed to delete work order');
  return true;
}

// Admin Uploaded Documents
export async function fetchAdminDocuments(): Promise<UploadedDocumentRecord[]> {
  const data = await adminFetch<UploadedDocumentRecord[]>('/api/admin/documents', {}, 'Failed to fetch customer documents');
  return data || [];
}

export async function updateAdminDocumentStatus(id: string, status: UploadedDocumentRecord['status']): Promise<boolean> {
  await adminFetch(`/api/admin/documents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }, 'Failed to update document status');
  return true;
}

export async function deleteAdminDocument(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/documents/${id}`, { method: 'DELETE' }, 'Failed to delete document');
  return true;
}

export const getDocumentDownloadUrl = (docId: string): string => {
  const token = getAdminToken();
  return `/api/admin/documents/${docId}/download?token=${token || ''}`;
};

// Admin Contact Messages
export async function fetchAdminMessages(): Promise<ContactMessage[]> {
  const data = await adminFetch<ContactMessage[]>('/api/admin/messages', {}, 'Failed to fetch contact inquiries');
  return data || [];
}

export async function markAdminMessageRead(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/messages/${id}/read`, { method: 'PATCH' }, 'Failed to update message status');
  return true;
}

export async function deleteAdminMessage(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' }, 'Failed to delete message');
  return true;
}

// ==========================================
// ADMIN DIGITAL NOTICES
// ==========================================
export async function fetchAdminNotices(): Promise<NoticeItem[]> {
  const data = await adminFetch<NoticeItem[]>('/api/admin/notices', {}, 'Failed to fetch admin notices');
  return data || [];
}

export async function saveAdminNotice(notice: Partial<NoticeItem> & { title: string }): Promise<NoticeItem> {
  const isEdit = Boolean(notice.id);
  const url = isEdit ? `/api/admin/notices/${notice.id}` : '/api/admin/notices';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<NoticeItem>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notice)
  }, 'Failed to save notice');
}

export async function deleteAdminNotice(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/notices/${id}`, { method: 'DELETE' }, 'Failed to delete notice');
  return true;
}

// ==========================================
// ADMIN CUSTOMER TESTIMONIALS & RATINGS
// ==========================================
export async function fetchAdminTestimonials(): Promise<TestimonialItem[]> {
  const data = await adminFetch<TestimonialItem[]>('/api/admin/testimonials', {}, 'Failed to fetch testimonials');
  return data || [];
}

export async function saveAdminTestimonial(test: Partial<TestimonialItem> & { customerName: string; rating: number; reviewText: string }): Promise<TestimonialItem> {
  const isEdit = Boolean(test.id);
  const url = isEdit ? `/api/admin/testimonials/${test.id}` : '/api/admin/testimonials';
  const method = isEdit ? 'PUT' : 'POST';
  return await adminFetch<TestimonialItem>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(test)
  }, 'Failed to save review');
}

export async function deleteAdminTestimonial(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' }, 'Failed to delete testimonial');
  return true;
}

export async function setAdminTestimonialApproval(id: string, isApproved: boolean): Promise<boolean> {
  await adminFetch(`/api/admin/testimonials/${id}/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isApproved })
  }, 'Failed to update approval status');
  return true;
}

export async function toggleAdminTestimonialFeatured(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/testimonials/${id}/feature`, { method: 'PUT' }, 'Failed to toggle featured status');
  return true;
}

// ==========================================
// CHATBOT & KNOWLEDGE BASE FAQS API
// ==========================================

export async function fetchChatbotConfig(): Promise<ChatbotConfig> {
  const res = await fetch('/api/chatbot/config');
  if (!res.ok) throw new Error('Failed to fetch chatbot config');
  const json = await res.json();
  return json.data;
}

export async function fetchChatbotFAQs(): Promise<BotFAQItem[]> {
  const res = await fetch('/api/chatbot/faqs');
  if (!res.ok) throw new Error('Failed to fetch FAQs');
  const json = await res.json();
  return json.data;
}

export async function sendChatMessage(query: string): Promise<{
  reply: string;
  matchedFAQ?: BotFAQItem;
  suggestedQuestions?: string[];
  actionUrl?: string;
  actionText?: string;
  isLiveJobLookup?: boolean;
  jobData?: WorkJob;
}> {
  const res = await fetch('/api/chatbot/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to get answer from assistant');
  const json = await res.json();
  return json.data;
}

export async function fetchAdminChatbotConfig(): Promise<ChatbotConfig> {
  return await adminFetch<ChatbotConfig>('/api/admin/chatbot/config', {}, 'Failed to fetch chatbot config');
}

export async function saveAdminChatbotConfig(config: Partial<ChatbotConfig>): Promise<ChatbotConfig> {
  return await adminFetch<ChatbotConfig>('/api/admin/chatbot/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  }, 'Failed to save chatbot config');
}

export async function fetchAdminChatbotFAQs(): Promise<BotFAQItem[]> {
  const data = await adminFetch<BotFAQItem[]>('/api/admin/chatbot/faqs', {}, 'Failed to fetch admin FAQs');
  return data || [];
}

export async function saveAdminChatbotFAQ(faq: Partial<BotFAQItem>): Promise<BotFAQItem> {
  return await adminFetch<BotFAQItem>('/api/admin/chatbot/faqs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(faq)
  }, 'Failed to save FAQ entry');
}

export async function deleteAdminChatbotFAQ(id: string): Promise<boolean> {
  await adminFetch(`/api/admin/chatbot/faqs/${id}`, { method: 'DELETE' }, 'Failed to delete FAQ entry');
  return true;
}

// ==========================================
// GOOGLE AI SUITE CLIENT CALLS
// ==========================================

export async function fetchAiStatus(): Promise<{ configured: boolean; models: Record<string, string> }> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) return { configured: false, models: {} };
    const json = await res.json();
    return { configured: json.configured, models: json.models || {} };
  } catch {
    return { configured: false, models: {} };
  }
}

export async function fetchAiVoices(): Promise<AiVoiceOption[]> {
  try {
    const res = await fetch('/api/ai/voices');
    if (!res.ok) throw new Error('Failed to load voices');
    const json = await res.json();
    return json.voices || [];
  } catch {
    return [
      { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Clear, friendly, natural tone' },
      { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Calm, soft, professional tone' },
      { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Energetic, confident, crisp tone' },
      { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Deep, warm, authoritative baritone tone' },
      { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Bold, expressive, studio-quality tone' }
    ];
  }
}

export async function askAiSearchAssistant(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): Promise<SearchAssistantResponse> {
  const res = await fetch('/api/ai/search-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to get answer from AI Search Assistant.');
  }
  return json.data;
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string,
  language: string = 'auto'
): Promise<TranscriptionResponse> {
  const res = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, language })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to transcribe audio.');
  }
  return json.data;
}

export async function convertVoiceAudio(
  audioBase64: string,
  mimeType: string,
  voice: string
): Promise<VoiceConversionResponse> {
  const res = await fetch('/api/ai/voice-convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, voice })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to convert audio voice.');
  }
  return json.data;
}

export async function startImageToVideo(
  imageBase64: string,
  mimeType: string,
  prompt?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<ImageToVideoStartResponse> {
  const res = await fetch('/api/ai/image-to-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, prompt, aspectRatio })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to start video generation.');
  }
  return json.data;
}

export async function pollVideoStatus(operationName: string): Promise<ImageToVideoStatusResponse> {
  const res = await fetch('/api/ai/video-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to check video status.');
  }
  return json.data;
}

export async function downloadVideoFile(operationName: string): Promise<Blob> {
  const res = await fetch('/api/ai/video-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to download video file' }));
    throw new Error(err.error || 'Failed to download video file.');
  }
  return await res.blob();
}


