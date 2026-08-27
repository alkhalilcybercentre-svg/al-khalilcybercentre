import {
  SiteInfo,
  FlashNewsItem,
  BannerItem,
  ServiceItem,
  RateItem,
  CertificateItem,
  WorkJob,
  UploadedDocumentRecord,
  ContactMessage,
  DashboardStats
} from '../types';

const ADMIN_TOKEN_KEY = 'alkhalil_admin_token';

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
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
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Admin login failed');
  }
  setAdminToken(json.token);
  return json;
}

export async function verifyAdminAuth(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/admin/verify', {
      headers: { ...authHeader() }
    });
    if (!res.ok) {
      clearAdminToken();
      return false;
    }
    const json = await res.json();
    return json.authorized === true;
  } catch {
    return false;
  }
}

export async function adminLogout() {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { ...authHeader() }
    });
  } finally {
    clearAdminToken();
  }
}

export async function adminChangePin(currentPin: string, newPin: string) {
  const res = await fetch('/api/admin/change-pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify({ currentPin, newPin })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to change PIN');
  }
  return json;
}

export async function fetchAdminStats(): Promise<DashboardStats> {
  const res = await fetch('/api/admin/dashboard-stats', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  const json = await res.json();
  return json.data;
}

// Admin Settings & Site Info
export async function fetchAdminSettings(): Promise<SiteInfo> {
  const res = await fetch('/api/admin/settings', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  const json = await res.json();
  return json.data;
}

export async function updateAdminSiteInfo(info: Partial<SiteInfo>): Promise<SiteInfo> {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(info)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update business settings');
  return json.data;
}

export async function uploadBrandingLogo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/admin/upload-logo', {
    method: 'POST',
    headers: { ...authHeader() },
    body: fd
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to upload logo image');
  return json.imageUrl;
}

// Admin Certificates CRUD
export async function fetchAdminCertificates(): Promise<CertificateItem[]> {
  const res = await fetch('/api/admin/certificates', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch certificates');
  const json = await res.json();
  return json.data || [];
}

export async function uploadCertificateImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload-certificate-image', {
    method: 'POST',
    headers: { ...authHeader() },
    body: fd
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to upload certificate image');
  return json.imageUrl || json.fileUrl;
}

export async function saveAdminCertificate(cert: Partial<CertificateItem>): Promise<CertificateItem> {
  const isEdit = !!cert.id;
  const url = isEdit ? `/api/admin/certificates/${cert.id}` : '/api/admin/certificates';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(cert)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save certificate');
  return json.data;
}

export async function deleteAdminCertificate(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/certificates/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete certificate');
  return true;
}

// Admin Banners CRUD
export async function fetchAdminBanners(): Promise<BannerItem[]> {
  const res = await fetch('/api/admin/banners', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch all banners');
  const json = await res.json();
  return json.data;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/admin/upload-banner-image', {
    method: 'POST',
    headers: { ...authHeader() },
    body: fd
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to upload banner image');
  return json.imageUrl;
}

export async function saveAdminBanner(banner: Partial<BannerItem>): Promise<BannerItem> {
  const isEdit = !!banner.id;
  const url = isEdit ? `/api/admin/banners/${banner.id}` : '/api/admin/banners';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(banner)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save banner');
  return json.data;
}

export async function deleteAdminBanner(id: string) {
  const res = await fetch(`/api/admin/banners/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete banner');
  return true;
}

// Admin News CRUD
export async function fetchAdminNews(): Promise<FlashNewsItem[]> {
  const res = await fetch('/api/admin/news', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch news');
  const json = await res.json();
  return json.data;
}

export async function saveAdminNews(item: Partial<FlashNewsItem>): Promise<FlashNewsItem> {
  const isEdit = !!item.id;
  const url = isEdit ? `/api/admin/news/${item.id}` : '/api/admin/news';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(item)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save news item');
  return json.data;
}

export async function deleteAdminNews(id: string) {
  const res = await fetch(`/api/admin/news/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete news item');
  return true;
}

// Admin Services CRUD
export async function fetchAdminServices(): Promise<ServiceItem[]> {
  const res = await fetch('/api/admin/services', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch services');
  const json = await res.json();
  return json.data;
}

export async function saveAdminService(service: Partial<ServiceItem>): Promise<ServiceItem> {
  const isEdit = !!service.id;
  const url = isEdit ? `/api/admin/services/${service.id}` : '/api/admin/services';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(service)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save service');
  return json.data;
}

export async function deleteAdminService(id: string) {
  const res = await fetch(`/api/admin/services/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete service');
  return true;
}

// Admin Rates CRUD
export async function fetchAdminRates(): Promise<RateItem[]> {
  const res = await fetch('/api/admin/rates', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch rates');
  const json = await res.json();
  return json.data;
}

export async function saveAdminRate(rate: Partial<RateItem>): Promise<RateItem> {
  const isEdit = !!rate.id;
  const url = isEdit ? `/api/admin/rates/${rate.id}` : '/api/admin/rates';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(rate)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save rate');
  return json.data;
}

export async function deleteAdminRate(id: string) {
  const res = await fetch(`/api/admin/rates/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete rate item');
  return true;
}

// Admin Work Jobs CRUD
export async function fetchAdminJobs(): Promise<WorkJob[]> {
  const res = await fetch('/api/admin/jobs', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch jobs');
  const json = await res.json();
  return json.data;
}

export async function saveAdminJob(job: Partial<WorkJob>): Promise<WorkJob> {
  const isEdit = !!job.id;
  const url = isEdit ? `/api/admin/jobs/${job.id}` : '/api/admin/jobs';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(job)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save work order');
  return json.data;
}

export async function deleteAdminJob(id: string) {
  const res = await fetch(`/api/admin/jobs/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete work order');
  return true;
}

// Admin Uploaded Documents
export async function fetchAdminDocuments(): Promise<UploadedDocumentRecord[]> {
  const res = await fetch('/api/admin/documents', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch customer documents');
  const json = await res.json();
  return json.data;
}

export async function updateAdminDocumentStatus(id: string, status: UploadedDocumentRecord['status']) {
  const res = await fetch(`/api/admin/documents/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update document status');
  return true;
}

export async function deleteAdminDocument(id: string) {
  const res = await fetch(`/api/admin/documents/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete document');
  return true;
}

export const getDocumentDownloadUrl = (docId: string): string => {
  const token = getAdminToken();
  return `/api/admin/documents/${docId}/download?token=${token || ''}`;
};

// Admin Contact Messages
export async function fetchAdminMessages(): Promise<ContactMessage[]> {
  const res = await fetch('/api/admin/messages', {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to fetch contact inquiries');
  const json = await res.json();
  return json.data || [];
}

export async function markAdminMessageRead(id: string) {
  const res = await fetch(`/api/admin/messages/${id}/read`, {
    method: 'PATCH',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to update message status');
  return true;
}

export async function deleteAdminMessage(id: string) {
  const res = await fetch(`/api/admin/messages/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Failed to delete message');
  return true;
}
