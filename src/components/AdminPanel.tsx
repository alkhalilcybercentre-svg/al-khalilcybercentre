import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  LayoutDashboard,
  Image,
  Flame,
  Layers,
  Tag,
  Package,
  FileText,
  Settings,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  UploadCloud,
  X,
  ExternalLink,
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
  Save,
  MessageSquare,
  Sparkles,
  Phone,
  MessageCircle,
  Clock,
  ArrowLeft,
  Award,
  Globe,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Palette,
  Share2,
  Building2,
  Bell,
  Star,
  Pin,
  Quote,
  ThumbsUp,
  Check,
  Bot,
  RotateCcw,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Printer,
  Receipt,
  FileSpreadsheet,
  Fingerprint,
  Radio,
  Laptop,
  Monitor
} from 'lucide-react';
import { AdminChatbotTab } from './admin/AdminChatbotTab';
import {
  discoverMantraDevice,
  captureMantraFingerprint,
  MantraDeviceStatus
} from '../lib/mantraService';
import {
  isPasskeySupported,
  authenticateWithPasskey,
  registerPasskey,
  fetchRegisteredPasskeys,
  deleteRegisteredPasskey
} from '../lib/passkeyService';
import {
  SiteInfo,
  FlashNewsItem,
  BannerItem,
  ServiceItem,
  ServiceChargeItem,
  RateItem,
  CertificateItem,
  NoticeItem,
  TestimonialItem,
  WorkJob,
  UploadedDocumentRecord,
  ContactMessage,
  DashboardStats,
  JobStatus
} from '../types';
import {
  adminLogin,
  verifyAdminAuth,
  adminLogout,
  adminChangePin,
  adminResetPinToDefault,
  emergencyResetAdminPin,
  getStoredAdminPin,
  setStoredAdminPin,
  clearStoredAdminPin,
  getEffectiveAdminPin,
  isCustomAdminPinActive,
  getAdminPinStatus,
  DEFAULT_ADMIN_PIN,
  MASTER_RECOVERY_KEY,
  SHOP_HELPLINE_PIN,
  fetchBiometricChallenge,
  adminBiometricLogin,
  fetchBiometricStatus,
  toggleBiometricStatus,
  fetchAdminStats,
  fetchAdminBanners,
  saveAdminBanner,
  deleteAdminBanner,
  uploadBannerImage,
  fetchAdminNews,
  saveAdminNews,
  deleteAdminNews,
  fetchAdminNotices,
  saveAdminNotice,
  deleteAdminNotice,
  fetchAdminTestimonials,
  saveAdminTestimonial,
  deleteAdminTestimonial,
  setAdminTestimonialApproval,
  toggleAdminTestimonialFeatured,
  fetchAdminServices,
  saveAdminService,
  deleteAdminService,
  fetchAdminRates,
  saveAdminRate,
  deleteAdminRate,
  fetchAdminCertificates,
  saveAdminCertificate,
  deleteAdminCertificate,
  uploadCertificateImage,
  fetchAdminJobs,
  saveAdminJob,
  deleteAdminJob,
  fetchAdminDocuments,
  updateAdminDocumentStatus,
  deleteAdminDocument,
  fetchAdminSettings,
  updateAdminSiteInfo,
  uploadBrandingLogo,
  getDocumentDownloadUrl
} from '../lib/api';

interface AdminPanelProps {
  siteInfo: SiteInfo;
  onClose: () => void;
  onRefreshPublicData: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'software'
  | 'notices'
  | 'testimonials'
  | 'chatbot'
  | 'banners'
  | 'news'
  | 'services'
  | 'rates'
  | 'certificates'
  | 'jobs'
  | 'documents'
  | 'settings'
  | 'security';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  siteInfo,
  onClose,
  onRefreshPublicData
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState<'business' | 'branding' | 'seo' | 'social' | 'toggles'>('business');

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [news, setNews] = useState<FlashNewsItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [rates, setRates] = useState<RateItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [jobs, setJobs] = useState<WorkJob[]>([]);
  const [documents, setDocuments] = useState<UploadedDocumentRecord[]>([]);
  const [businessSettings, setBusinessSettings] = useState<SiteInfo>(siteInfo);

  // Software & Online Services state (Admin-Only)
  const [softwareUrl, setSoftwareUrl] = useState<string>(
    siteInfo.managementSoftwareUrl || 'https://smartdesk-al-khalil-cyber-centre-desk.ai.studio'
  );
  const [softwareUrlError, setSoftwareUrlError] = useState<string | null>(null);
  const [savingSoftwareUrl, setSavingSoftwareUrl] = useState<boolean>(false);

  // General loading/error
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  // Modals state
  const [bannerModal, setBannerModal] = useState<Partial<BannerItem> | null>(null);
  const [newsModal, setNewsModal] = useState<Partial<FlashNewsItem> | null>(null);
  const [noticeModal, setNoticeModal] = useState<Partial<NoticeItem> | null>(null);
  const [testimonialModal, setTestimonialModal] = useState<Partial<TestimonialItem> | null>(null);
  const [replyModal, setReplyModal] = useState<{ id: string; customerName: string; reviewText: string; reply: string } | null>(null);
  const [serviceModal, setServiceModal] = useState<Partial<ServiceItem> | null>(null);
  const [rateModal, setRateModal] = useState<Partial<RateItem> | null>(null);
  const [certModal, setCertModal] = useState<Partial<CertificateItem> | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
  const [jobModal, setJobModal] = useState<Partial<WorkJob> | null>(null);
  const [selectedJobInvoice, setSelectedJobInvoice] = useState<WorkJob | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
    subtitle?: string;
    type: 'job' | 'banner' | 'news' | 'notice' | 'testimonial' | 'service' | 'rate' | 'cert' | 'doc';
  } | null>(null);

  // Filter & Search states
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('ALL');
  const [docSearch, setDocSearch] = useState('');
  const [certSearch, setCertSearch] = useState('');
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState('ALL');
  const [testimonialSearch, setTestimonialSearch] = useState('');
  const [testimonialFilter, setTestimonialFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'FEATURED'>('ALL');

  // Security PIN states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeLoading, setPinChangeLoading] = useState(false);
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinStatus, setPinStatus] = useState(getAdminPinStatus());
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyKeyInput, setEmergencyKeyInput] = useState('');
  const [emergencyResetLoading, setEmergencyResetLoading] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState<string | null>(null);
  const [emergencyError, setEmergencyError] = useState<string | null>(null);
  const [resetDefaultModal, setResetDefaultModal] = useState(false);

  // Biometric & Multi-Method Auth states
  const [loginTab, setLoginTab] = useState<'pin' | 'biometric' | 'passkey'>('pin');
  const [mantraStatus, setMantraStatus] = useState<MantraDeviceStatus | null>(null);
  const [checkingMantra, setCheckingMantra] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<{
    biometricSupported: boolean;
    biometricEnabled: boolean;
    enrolledAt?: string;
    deviceModel?: string;
  } | null>(null);

  // Passkey / Windows Hello states
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [registeredPasskeys, setRegisteredPasskeys] = useState<Array<{ id: string; name: string; createdAt: string }>>([]);

  // Probe Mantra MFS110 on local PC
  const checkMantraDevice = async () => {
    setCheckingMantra(true);
    try {
      const status = await discoverMantraDevice();
      setMantraStatus(status);
    } catch {
      setMantraStatus({
        detected: false,
        serviceType: null,
        protocol: 'http',
        port: 8003,
        model: 'Mantra MFS110',
        serialNumber: '',
        statusText: 'Mantra service not detected on this machine',
        isReady: false
      });
    } finally {
      setCheckingMantra(false);
    }
  };

  // Check Auth & Biometric on Mount
  useEffect(() => {
    const check = async () => {
      const auth = await verifyAdminAuth();
      setIsAuthenticated(auth);
      if (auth) {
        loadAllData();
      }
    };
    check();
    checkMantraDevice();
    fetchBiometricStatus().then(st => setBiometricStatus(st)).catch(() => {});
    isPasskeySupported().then(supp => {
      setPasskeySupported(supp);
    }).catch(() => {});
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setActionError(null);
    let sessionExpired = false;

    const safeFetch = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn();
      } catch (err: any) {
        if (err?.message && (err.message.includes('Session expired') || err.message.includes('Unauthorized'))) {
          sessionExpired = true;
        }
        console.warn('Admin load item note:', err?.message || err);
        return fallback;
      }
    };

    try {
      const [
        statsData,
        bannersData,
        newsData,
        noticesData,
        testimonialsData,
        servicesData,
        ratesData,
        certsData,
        jobsData,
        docsData,
        settingsData
      ] = await Promise.all([
        safeFetch(() => fetchAdminStats(), null),
        safeFetch(() => fetchAdminBanners(), []),
        safeFetch(() => fetchAdminNews(), []),
        safeFetch(() => fetchAdminNotices(), []),
        safeFetch(() => fetchAdminTestimonials(), []),
        safeFetch(() => fetchAdminServices(), []),
        safeFetch(() => fetchAdminRates(), []),
        safeFetch(() => fetchAdminCertificates(), []),
        safeFetch(() => fetchAdminJobs(), []),
        safeFetch(() => fetchAdminDocuments(), []),
        safeFetch(() => fetchAdminSettings(), null)
      ]);

      if (sessionExpired) {
        setIsAuthenticated(false);
        setLoginError('Your admin session has expired. Please enter your PIN to continue.');
        return;
      }

      if (statsData) setStats(statsData);
      if (bannersData?.length) setBanners(bannersData);
      if (newsData?.length) setNews(newsData);
      if (noticesData?.length) setNotices(noticesData);
      if (testimonialsData?.length) setTestimonials(testimonialsData);
      if (servicesData?.length) setServices(servicesData);
      if (ratesData?.length) setRates(ratesData);
      if (certsData?.length) setCertificates(certsData);
      if (jobsData?.length) setJobs(jobsData);
      if (docsData?.length) setDocuments(docsData);
      if (settingsData) {
        setBusinessSettings(settingsData);
        if (settingsData.managementSoftwareUrl) {
          setSoftwareUrl(settingsData.managementSoftwareUrl);
        }
      }
      fetchRegisteredPasskeys().then(res => setRegisteredPasskeys(res.passkeys)).catch(() => {});

      const hasAnyData = Boolean(statsData || servicesData?.length || ratesData?.length || settingsData);
      if (!hasAnyData) {
        setActionError('Unable to connect to server. Please check your network connection.');
      }
    } catch (e: any) {
      console.warn('Admin load warning:', e?.message || e);
      if (e?.message && (e.message.includes('Session expired') || e.message.includes('Unauthorized'))) {
        setIsAuthenticated(false);
        setLoginError('Your admin session has expired. Please enter your PIN to continue.');
      } else {
        setActionError('Unable to load admin data. Click "Retry" to try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
    onRefreshPublicData();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin) {
      setLoginError('Please enter your Admin PIN.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    try {
      await adminLogin(cleanPin);
      setIsAuthenticated(true);
      setPinInput('');
      setPinStatus(getAdminPinStatus());
      loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Incorrect PIN.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricScanning(true);
    setLoginError(null);
    try {
      let dev = mantraStatus;
      if (!dev || !dev.detected) {
        dev = await discoverMantraDevice();
        setMantraStatus(dev);
      }
      if (!dev || !dev.detected) {
        throw new Error(
          'Mantra MFS110 service was not found on this computer. Please connect your Mantra USB scanner and ensure the service is running, or switch to PIN Login.'
        );
      }

      // 1. Get challenge nonce from server
      const { challenge } = await fetchBiometricChallenge();

      // 2. Capture biometric from physical Mantra MFS110
      const scanResult = await captureMantraFingerprint(dev, challenge);

      // 3. Authenticate with backend
      await adminBiometricLogin(challenge, scanResult.payload);
      setIsAuthenticated(true);
      setPinInput('');
      loadAllData();
      fetchBiometricStatus().then(st => setBiometricStatus(st)).catch(() => {});
    } catch (err: any) {
      setLoginError(err.message || 'Mantra Biometric verification failed.');
    } finally {
      setBiometricScanning(false);
    }
  };

  const handleToggleBiometric = async (enable: boolean) => {
    try {
      await toggleBiometricStatus(enable, {
        model: mantraStatus?.model || 'Mantra MFS110',
        serial: mantraStatus?.serialNumber || ''
      });
      const updated = await fetchBiometricStatus();
      setBiometricStatus(updated);
      showSuccess(enable ? 'Mantra MFS110 Biometric Login Enabled!' : 'Biometric Login Disabled.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to update biometric status');
    }
  };

  // WebAuthn / Passkey Login Handler
  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setLoginError(null);
    try {
      await authenticateWithPasskey();
      setIsAuthenticated(true);
      setPinInput('');
      loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Passkey / Windows Hello verification failed.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  // WebAuthn / Passkey Registration Handler (Protected)
  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setActionError(null);
    try {
      const devName = navigator.userAgent.includes('Windows')
        ? 'Windows Hello Device'
        : navigator.userAgent.includes('Macintosh')
        ? 'Apple Touch ID / Platform Key'
        : 'Platform Authenticator';
      await registerPasskey(devName);
      const res = await fetchRegisteredPasskeys();
      setRegisteredPasskeys(res.passkeys);
      showSuccess('Windows Hello / Passkey registered successfully on this device!');
    } catch (err: any) {
      setActionError(err.message || 'Failed to register Passkey.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Delete Passkey Handler (Protected)
  const handleDeletePasskey = async (id: string) => {
    try {
      await deleteRegisteredPasskey(id);
      const res = await fetchRegisteredPasskeys();
      setRegisteredPasskeys(res.passkeys);
      showSuccess('Passkey removed successfully.');
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove Passkey.');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
  };

  // PIN Change Handler (6 to 12 digits)
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCurrent = currentPin.trim();
    const cleanNew = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    const pinRegex = /^\d{6,12}$/;
    if (!pinRegex.test(cleanNew)) {
      setActionError('New PIN must be between 6 and 12 numeric digits (0-9 only).');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setActionError('New PIN and Confirm PIN do not match.');
      return;
    }

    setPinChangeLoading(true);
    setActionError(null);
    try {
      await adminChangePin(cleanCurrent, cleanNew);
      setPinStatus(getAdminPinStatus());
      showSuccess('Admin PIN successfully updated and permanently saved to Browser LocalStorage & Database!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to change PIN.');
    } finally {
      setPinChangeLoading(false);
    }
  };

  // Reset PIN to Default Factory PIN (595213)
  const handleResetPinToDefault = async () => {
    setPinChangeLoading(true);
    setActionError(null);
    try {
      await adminResetPinToDefault();
      setPinStatus(getAdminPinStatus());
      showSuccess(`Admin PIN has been reset back to default (${DEFAULT_ADMIN_PIN}) in LocalStorage & Database.`);
      setResetDefaultModal(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to reset PIN.');
    } finally {
      setPinChangeLoading(false);
    }
  };

  // Emergency Master Reset Handler
  const handleEmergencyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmergencyResetLoading(true);
    setEmergencyError(null);
    setEmergencySuccess(null);
    try {
      const key = emergencyKeyInput.trim() || MASTER_RECOVERY_KEY;
      await emergencyResetAdminPin(key);
      setPinStatus(getAdminPinStatus());
      setEmergencySuccess(`PIN reset to default (${DEFAULT_ADMIN_PIN}) successfully! You can now log in using ${DEFAULT_ADMIN_PIN}.`);
      setPinInput(DEFAULT_ADMIN_PIN);
      setTimeout(() => {
        setShowEmergencyModal(false);
        setEmergencySuccess(null);
        setEmergencyKeyInput('');
      }, 2500);
    } catch (err: any) {
      setEmergencyError(err.message || 'Emergency recovery failed. Please verify Master Key.');
    } finally {
      setEmergencyResetLoading(false);
    }
  };

  // Comprehensive Settings Save Handler
  const handleSaveSoftwareUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSoftwareUrlError(null);
    const clean = softwareUrl.trim();
    if (!clean) {
      setSoftwareUrlError('Please enter a valid URL.');
      return;
    }
    try {
      const parsed = new URL(clean);
      if (parsed.protocol !== 'https:') {
        setSoftwareUrlError('URL must use secure HTTPS protocol (e.g. https://...).');
        return;
      }
    } catch {
      setSoftwareUrlError('Invalid URL format. Please enter a valid HTTPS web address.');
      return;
    }

    setSavingSoftwareUrl(true);
    try {
      await updateAdminSiteInfo({ managementSoftwareUrl: clean });
      setBusinessSettings(prev => ({ ...prev, managementSoftwareUrl: clean }));
      showSuccess('Management Software URL successfully updated and saved!');
    } catch (err: any) {
      setSoftwareUrlError(err.message || 'Failed to update software URL.');
    } finally {
      setSavingSoftwareUrl(false);
    }
  };

  const handleSaveAllSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setActionError(null);
    try {
      const updated = await updateAdminSiteInfo(businessSettings);
      setBusinessSettings(updated);
      showSuccess('All Website Settings saved and deployed successfully!');
    } catch (err: any) {
      setActionError(err.message || 'Failed to update website settings.');
    } finally {
      setLoading(false);
    }
  };

  // Upload Logo for Branding
  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true);
    setActionError(null);
    try {
      const url = await uploadBrandingLogo(file);
      const updatedSettings = { ...businessSettings, logoUrl: url };
      setBusinessSettings(updatedSettings);
      await updateAdminSiteInfo(updatedSettings);
      showSuccess('Official Logo uploaded and updated successfully!');
    } catch (err: any) {
      setActionError(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload Favicon for Branding
  const handleUploadFavicon = async (file: File) => {
    setUploadingFavicon(true);
    setActionError(null);
    try {
      const url = await uploadBrandingLogo(file);
      const updatedSettings = { ...businessSettings, faviconUrl: url };
      setBusinessSettings(updatedSettings);
      await updateAdminSiteInfo(updatedSettings);
      showSuccess('Website Favicon uploaded and updated successfully!');
    } catch (err: any) {
      setActionError(err.message || 'Failed to upload favicon.');
    } finally {
      setUploadingFavicon(false);
    }
  };

  // Certificate Save Handler
  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certModal) return;
    setLoading(true);
    setActionError(null);
    try {
      await saveAdminCertificate(certModal);
      showSuccess(certModal.id ? 'Certificate updated successfully.' : 'New certificate added successfully.');
      setCertModal(null);
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save certificate.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Certificate Handler
  const handleDeleteCertificate = (id: string, name: string) => {
    setDeleteConfirm({
      id,
      title: name,
      subtitle: 'Government Certificate / License Record',
      type: 'cert'
    });
  };

  // Universal In-App Delete Handler
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    setActionError(null);
    try {
      if (deleteConfirm.type === 'job') {
        await deleteAdminJob(deleteConfirm.id);
        showSuccess(`Work order token ${deleteConfirm.title} deleted successfully.`);
        if (jobModal && (jobModal.id === deleteConfirm.id || jobModal.trackingCode === deleteConfirm.title)) {
          setJobModal(null);
        }
      } else if (deleteConfirm.type === 'notice') {
        await deleteAdminNotice(deleteConfirm.id);
        showSuccess(`Notice "${deleteConfirm.title}" deleted.`);
        if (noticeModal && noticeModal.id === deleteConfirm.id) setNoticeModal(null);
      } else if (deleteConfirm.type === 'testimonial') {
        await deleteAdminTestimonial(deleteConfirm.id);
        showSuccess(`Review by "${deleteConfirm.title}" deleted.`);
        if (testimonialModal && testimonialModal.id === deleteConfirm.id) setTestimonialModal(null);
      } else if (deleteConfirm.type === 'banner') {
        await deleteAdminBanner(deleteConfirm.id);
        showSuccess('Banner deleted successfully.');
        if (bannerModal && bannerModal.id === deleteConfirm.id) setBannerModal(null);
      } else if (deleteConfirm.type === 'news') {
        await deleteAdminNews(deleteConfirm.id);
        showSuccess('News ticker item deleted.');
        if (newsModal && newsModal.id === deleteConfirm.id) setNewsModal(null);
      } else if (deleteConfirm.type === 'service') {
        await deleteAdminService(deleteConfirm.id);
        showSuccess('Service item deleted.');
        if (serviceModal && serviceModal.id === deleteConfirm.id) setServiceModal(null);
      } else if (deleteConfirm.type === 'rate') {
        await deleteAdminRate(deleteConfirm.id);
        showSuccess('Rate item deleted.');
        if (rateModal && rateModal.id === deleteConfirm.id) setRateModal(null);
      } else if (deleteConfirm.type === 'cert') {
        await deleteAdminCertificate(deleteConfirm.id);
        showSuccess(`Certificate "${deleteConfirm.title}" deleted.`);
        if (certModal && certModal.id === deleteConfirm.id) setCertModal(null);
      } else if (deleteConfirm.type === 'doc') {
        await deleteAdminDocument(deleteConfirm.id);
        showSuccess('Document record deleted permanently.');
      }
      setDeleteConfirm(null);
      await loadAllData();
      onRefreshPublicData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete record.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Certificate Active Status
  const handleToggleCertActive = async (cert: CertificateItem) => {
    try {
      const updated = { ...cert, active: !cert.active };
      await saveAdminCertificate(updated);
      showSuccess(`Certificate ${updated.active ? 'activated' : 'deactivated'}.`);
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update certificate status.');
    }
  };

  // Upload Certificate File
  const handleUploadCertFile = async (file: File) => {
    if (!certModal) return;
    setUploadingCert(true);
    setActionError(null);
    try {
      const url = await uploadCertificateImage(file);
      setCertModal({ ...certModal, imageUrl: url });
      showSuccess('Certificate image/proof uploaded successfully!');
    } catch (err: any) {
      setActionError(err.message || 'Failed to upload certificate image.');
    } finally {
      setUploadingCert(false);
    }
  };

  // Toggle Notice Active
  const handleToggleNoticeActive = async (notice: NoticeItem) => {
    try {
      const updated = { ...notice, active: !notice.active };
      await saveAdminNotice(updated);
      showSuccess(`Notice "${notice.title.slice(0, 25)}..." ${updated.active ? 'activated' : 'deactivated'}.`);
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update notice.');
    }
  };

  // Toggle Notice Pinned
  const handleToggleNoticePinned = async (notice: NoticeItem) => {
    try {
      const updated = { ...notice, pinned: !notice.pinned };
      await saveAdminNotice(updated);
      showSuccess(`Notice ${updated.pinned ? 'pinned to top' : 'unpinned'}.`);
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update notice pin status.');
    }
  };

  // Toggle Testimonial Approval
  const handleToggleTestimonialApproval = async (item: TestimonialItem) => {
    try {
      const newStatus = !item.isApproved;
      await setAdminTestimonialApproval(item.id, newStatus);
      showSuccess(`Review by ${item.customerName} ${newStatus ? 'Approved & Published' : 'Unapproved / Hidden'}.`);
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update review approval.');
    }
  };

  // Toggle Testimonial Featured
  const handleToggleTestimonialFeatured = async (item: TestimonialItem) => {
    try {
      await toggleAdminTestimonialFeatured(item.id);
      showSuccess(`Review by ${item.customerName} ${!item.isFeatured ? 'featured on homepage' : 'unfeatured'}.`);
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle featured status.');
    }
  };

  // Save Admin Reply on Review
  const handleSaveAdminReply = async (id: string, replyText: string) => {
    try {
      const target = testimonials.find((t) => t.id === id);
      if (!target) return;
      const updated: TestimonialItem = {
        ...target,
        adminReply: replyText.trim() || undefined,
        adminReplyDate: replyText.trim() ? new Date().toISOString().split('T')[0] : undefined
      };
      await saveAdminTestimonial(updated);
      showSuccess('Admin official reply saved successfully.');
      setReplyModal(null);
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save admin reply.');
    }
  };

  // =========================================================================
  // LOGIN SCREEN (Dual Method: Secure PIN + Mantra MFS110 Biometrics)
  // =========================================================================
  if (isAuthenticated === false || isAuthenticated === null) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-white relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-700 flex items-center justify-center mx-auto text-white shadow-lg shadow-sky-900/40">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-400">
              AL KHALIL CYBER CENTRE Official Management System
            </p>
          </div>

          {/* Authentication Method Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginTab('pin');
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                loginTab === 'pin'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PIN Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginTab('passkey');
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                loginTab === 'passkey'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Passkey</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginTab('biometric');
                setLoginError(null);
                if (!mantraStatus?.detected) {
                  checkMantraDevice();
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                loginTab === 'biometric'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>MFS110</span>
              {mantraStatus?.detected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="MFS110 Detected" />
              )}
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* TAB 1: SECURE PIN LOGIN */}
          {loginTab === 'pin' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Enter Admin PIN
                  </label>
                  <span className="text-[10px] text-sky-400 font-medium">Encrypted & Secure</span>
                </div>

                <div className="relative">
                  <input
                    type={showLoginPin ? 'text' : 'password'}
                    autoFocus
                    maxLength={12}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Enter authorized PIN"
                    className="w-full px-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xl tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPin(!showLoginPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                    title={showLoginPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                  <span>Enter your assigned 6 to 12 digit security PIN.</span>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(true)}
                    className="text-sky-400 hover:text-sky-300 font-semibold hover:underline"
                  >
                    Forgot PIN?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying PIN...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Unlock Admin Panel</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: MANTRA MFS110 BIOMETRIC LOGIN */}
          {loginTab === 'biometric' && (
            <div className="space-y-4">
              {/* Device Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold text-white">Mantra MFS-110 Biometrics</span>
                  </div>
                  <button
                    type="button"
                    onClick={checkMantraDevice}
                    disabled={checkingMantra || biometricScanning}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Re-check Mantra device connection"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingMantra ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {checkingMantra ? (
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Probing Mantra L1 RD Service ports (11100-11120)...</span>
                  </div>
                ) : mantraStatus?.detected ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/50">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <div className="leading-tight">
                        <div className="font-semibold text-emerald-300">{mantraStatus.model} Ready</div>
                        <div className="text-[10px] text-emerald-400/80">L1 RD Service active on port {mantraStatus.port} ({mantraStatus.protocol.toUpperCase()})</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div className="leading-tight">
                        <div className="font-semibold text-amber-300">Mantra MFS-110 Not Detected</div>
                        <div className="text-[10px] text-amber-400/80 mt-0.5">RD Service not responding on local ports (11100-11120)</div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-slate-400 space-y-1 border border-slate-800">
                      <div className="font-semibold text-slate-300">Verification Steps:</div>
                      <div>1. Ensure Mantra MFS-110 USB cable is securely connected.</div>
                      <div>2. Verify "Mantra L1 RD Service" is running in Windows Services.</div>
                      <div>3. Or switch to the <strong>PIN Login</strong> tab to log in immediately.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fingerprint Capture Button / Active Scanner */}
              {biometricScanning ? (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/40 to-slate-950 border border-sky-500/40 text-center space-y-3 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-400/30 shadow-lg shadow-sky-500/20">
                    <Fingerprint className="w-9 h-9 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Place Finger on MFS-110 Scanner</div>
                    <div className="text-xs text-sky-300 mt-1">Optical prism active. Waiting for finger placement...</div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={biometricScanning}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{mantraStatus?.detected ? 'Scan Fingerprint on MFS-110' : 'Detect & Scan MFS-110'}</span>
                </button>
              )}

              <p className="text-[11px] text-slate-500 text-center">
                Strict privacy: Biometric template matching occurs locally. Zero raw biometric images are stored on our servers.
              </p>
            </div>
          )}

          {/* TAB 3: PASSKEY / WINDOWS HELLO LOGIN */}
          {loginTab === 'passkey' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-bold text-white">Passkey / Windows Hello</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sign in quickly and securely using your device's built-in platform authenticator:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Windows Hello Face / PIN</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Laptop Fingerprint</span>
                  </div>
                </div>
              </div>

              {passkeyLoading ? (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/40 to-slate-950 border border-sky-500/40 text-center space-y-3 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-400/30 shadow-lg shadow-sky-500/20">
                    <Laptop className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Verifying with Windows Hello...</div>
                    <div className="text-xs text-sky-300 mt-1">Please confirm the prompt on your screen.</div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={passkeyLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Laptop className="w-4 h-4" />
                  <span>Sign in with Passkey / Windows Hello</span>
                </button>
              )}

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Standard WebAuthn: Your biometrics never leave your physical device. Zero face images or fingerprints are stored or sent to the server.
              </p>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="hover:text-slate-200 transition-colors"
            >
              ← Return to Public Website
            </button>
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset PIN</span>
            </button>
          </div>
        </div>

        {/* Emergency Reset & Recovery Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Emergency PIN Recovery</h3>
                    <p className="text-[11px] text-slate-400">Restore factory default or use Master Recovery</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setEmergencyError(null);
                    setEmergencySuccess(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emergencySuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{emergencySuccess}</span>
                </div>
              )}

              {emergencyError && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{emergencyError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    <span>Option 1: Instant Reset to Factory Default</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Clears any custom PIN and resets administrator credentials back to standard default.
                  </p>
                  <button
                    type="button"
                    disabled={emergencyResetLoading}
                    onClick={() => handleEmergencyReset({ preventDefault: () => {} } as any)}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {emergencyResetLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Reset Credentials</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Option 2: Master Recovery Passcode</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enter authorized shop master recovery passcode or helpline number to verify identity.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emergencyKeyInput}
                      onChange={(e) => setEmergencyKeyInput(e.target.value)}
                      placeholder="Enter recovery passcode"
                      className="grow px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      disabled={emergencyResetLoading}
                      onClick={(e) => handleEmergencyReset(e)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEmergencyModal(false);
                  setEmergencyError(null);
                  setEmergencySuccess(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // MAIN ADMIN DASHBOARD & MANAGEMENT INTERFACE
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col overflow-hidden text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Admin Top Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold font-serif text-sm">
            AK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-white tracking-tight">
                {siteInfo.businessName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Admin Mode
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Helpline: {siteInfo.phone}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onRefreshPublicData();
              loadAllData();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">View Public Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Global Alerts in Admin */}
      {actionSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => loadAllData()}
            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-rose-800 hover:bg-rose-700 active:bg-rose-900 text-white rounded text-[11px] font-medium border border-rose-500/50 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Admin Layout: Sidebar + Main Content */}
      <div className="flex grow overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-60 lg:w-64 bg-slate-900/90 border-r border-slate-800 p-3 space-y-1 overflow-y-auto shrink-0 hidden md:block">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Website Controls
          </div>

          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'software', label: 'Software & Online Services', icon: Monitor },
            { id: 'notices', label: 'Notice Board / Alerts', icon: Bell, badge: notices.filter(n => n.active).length },
            { id: 'testimonials', label: 'Customer Reviews', icon: Star, badge: testimonials.filter(t => !t.isApproved).length },
            { id: 'chatbot', label: 'AI Chatbot & FAQs', icon: Bot },
            { id: 'banners', label: 'Hero Banner Slider', icon: Image, badge: banners.length },
            { id: 'news', label: 'Flash News Ticker', icon: Flame, badge: news.filter(n => n.active).length },
            { id: 'services', label: 'Services Catalog', icon: Layers, badge: services.length },
            { id: 'rates', label: 'Rate List & Prices', icon: Tag, badge: rates.length },
            { id: 'certificates', label: 'Certificates & Proofs', icon: Award, badge: certificates.length },
            { id: 'jobs', label: 'Customer Work Tracker', icon: Package, badge: jobs.filter(j => j.status !== 'Completed').length },
            { id: 'documents', label: 'Customer Uploads', icon: FileText, badge: documents.filter(d => d.status === 'New').length },
            { id: 'settings', label: 'Manage All Settings', icon: Settings },
            { id: 'security', label: 'Security & PIN', icon: Lock }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white text-sky-700' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Horizontal Tabs */}
        <div className="md:hidden w-full bg-slate-900 border-b border-slate-800 p-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'software', label: 'Software' },
            { id: 'notices', label: 'Notices' },
            { id: 'testimonials', label: 'Reviews' },
            { id: 'chatbot', label: 'AI Bot & FAQs' },
            { id: 'banners', label: 'Banners' },
            { id: 'news', label: 'News' },
            { id: 'services', label: 'Services' },
            { id: 'rates', label: 'Rates' },
            { id: 'certificates', label: 'Certificates' },
            { id: 'jobs', label: 'Jobs' },
            { id: 'documents', label: 'Docs' },
            { id: 'settings', label: 'Settings' },
            { id: 'security', label: 'Security' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                activeTab === item.id ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Work Area */}
        <main className="grow bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* =========================================================================
              TAB: SOFTWARE & ONLINE SERVICES (ADMIN-ONLY SUITE)
          ========================================================================= */}
          {activeTab === 'software' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Monitor className="w-6 h-6 text-sky-400" />
                    <span>Software & Online Services</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Admin-only management suite for internal business software and cloud portals.
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Only Access</span>
                </span>
              </div>

              {/* Main Software Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-6">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                      Internal Software Entry #1
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Al-Khalil Cyber Centre Management Software
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Cloud desk application for token management, customer invoices, offline task tracking, and counter operations.
                    </p>
                  </div>

                  <a
                    href={softwareUrl || 'https://smartdesk-al-khalil-cyber-centre-desk.ai.studio'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-sky-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  >
                    <span>Open Software</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* URL Edit Form */}
                <form onSubmit={handleSaveSoftwareUrl} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Software Web Address (HTTPS URL) *
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="url"
                        required
                        value={softwareUrl}
                        onChange={(e) => {
                          setSoftwareUrl(e.target.value);
                          setSoftwareUrlError(null);
                        }}
                        placeholder="https://..."
                        className="grow px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:border-sky-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={savingSoftwareUrl}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingSoftwareUrl ? 'Saving...' : 'Save URL'}</span>
                      </button>
                    </div>

                    {softwareUrlError && (
                      <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{softwareUrlError}</span>
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 mt-2">
                      Current target: <span className="font-mono text-slate-400 break-all">{softwareUrl}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-300 font-medium">Strict HTTPS Protocol Enforced</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-slate-300 font-medium">Hidden from Public Website</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-slate-300 font-medium">Opens in Isolated New Tab</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: DASHBOARD OVERVIEW
          ========================================================================= */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Admin Dashboard Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Control public content, manage customer jobs, update prices and view submitted documents.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setNoticeModal({ active: true, priority: 'urgent', category: 'Scheme', pinned: true, order: 1 })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Flash Alert</span>
                  </button>
                  <button
                    onClick={() => setTestimonialModal({ rating: 5, isApproved: true, isFeatured: true, order: 1 })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Review</span>
                  </button>
                  <button
                    onClick={() => setBannerModal({ slideDuration: 5, active: true, order: banners.length + 1 })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Banner</span>
                  </button>
                  <button
                    onClick={() => setServiceModal({ active: true, order: services.length + 1, isPopular: true })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                  <button
                    onClick={() => setJobModal({ status: 'Received', trackingCode: `AK-${Math.floor(10000 + Math.random() * 90000)}` })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Job Token</span>
                  </button>
                  <button
                    onClick={() => setCertModal({ active: true, order: certificates.length + 1 })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certificate</span>
                  </button>
                </div>
              </div>

              {/* Metric Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                <div
                  onClick={() => setActiveTab('notices')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Notices / Alerts</span>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    {stats.activeNotices ?? notices.filter(n => n.active).length}
                  </div>
                  <span className="text-[10px] text-rose-400/80 font-semibold">{notices.length} Total Notices</span>
                </div>

                <div
                  onClick={() => setActiveTab('testimonials')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Reviews / Stars</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {stats.approvedReviews ?? testimonials.filter(t => t.isApproved).length}
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-semibold">{stats.averageRating ? `${stats.averageRating} ★ avg` : '5.0 ★ avg'}</span>
                </div>

                <div
                  onClick={() => setActiveTab('banners')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-sky-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Banners</span>
                  <div className="text-2xl font-black text-white mt-1 group-hover:text-sky-400">
                    {stats.totalBanners}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">{stats.activeBanners} Active on Home</span>
                </div>

                <div
                  onClick={() => setActiveTab('services')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Services</span>
                  <div className="text-2xl font-black text-white mt-1 group-hover:text-indigo-400">
                    {stats.totalServices}
                  </div>
                  <span className="text-[10px] text-slate-400">In Catalog</span>
                </div>

                <div
                  onClick={() => setActiveTab('certificates')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Certificates</span>
                  <div className="text-2xl font-black text-teal-400 mt-1">
                    {stats.totalCertificates ?? certificates.length}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">{stats.activeCertificates ?? certificates.filter(c => c.active).length} Active</span>
                </div>

                <div
                  onClick={() => setActiveTab('jobs')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Pending Work</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {stats.pendingJobs}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Active in Queue</span>
                </div>

                <div
                  onClick={() => setActiveTab('jobs')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Ready / Pickup</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {stats.readyJobs}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">For Customer</span>
                </div>

                <div
                  onClick={() => setActiveTab('documents')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Uploaded Docs</span>
                  <div className="text-2xl font-black text-purple-400 mt-1">
                    {stats.uploadedDocs}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Customer Files</span>
                </div>
              </div>

              {/* Quick Jump Modules */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Pending Work Orders */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-sky-400" />
                      <span>Recent Customer Jobs In Progress</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className="text-xs text-sky-400 hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {jobs.slice(0, 4).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sky-400">{job.trackingCode}</span>
                            <span className="text-slate-300 font-semibold">{job.customerName}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{job.serviceName}</p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            job.status === 'Ready'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : job.status === 'Completed'
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Uploaded Files Quick View */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>Recent Customer Document Submissions</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="text-xs text-purple-400 hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {documents.slice(0, 4).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-400">{doc.trackingCode}</span>
                            <span className="text-slate-200 font-semibold">{doc.customerName}</span>
                            <span className="text-slate-500">({doc.customerMobile})</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{doc.serviceRequested}</p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'New'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: NOTICES & FLASH ALERTS MANAGEMENT
          ========================================================================= */}
          {activeTab === 'notices' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Bell className="w-6 h-6 text-rose-500" />
                    <span>Digital Notice Board & Flash Alerts</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Post urgent notices, new government schemes, exam dates, or holiday announcements with one click.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setNoticeModal({
                      title: '',
                      category: 'Scheme',
                      priority: 'urgent',
                      badgeText: 'GOVT SCHEME',
                      description: '',
                      actionText: 'Apply Now',
                      actionUrl: '#services',
                      active: true,
                      pinned: true,
                      order: notices.length + 1
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Notice / Alert</span>
                </button>
              </div>

              {/* Notice Filtering and Search Toolbar */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={noticeSearch}
                    onChange={(e) => setNoticeSearch(e.target.value)}
                    placeholder="Search notices by title, category, scheme..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                  {noticeSearch && (
                    <button
                      onClick={() => setNoticeSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
                    Category:
                  </span>
                  {['ALL', 'Scheme', 'Alert', 'Exam', 'Holiday', 'JanSeva', 'General'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNoticeCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                        noticeCategoryFilter === cat
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notices List */}
              {(() => {
                const filteredNotices = notices.filter((n) => {
                  const matchSearch =
                    !noticeSearch ||
                    n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
                    n.description.toLowerCase().includes(noticeSearch.toLowerCase()) ||
                    n.category.toLowerCase().includes(noticeSearch.toLowerCase()) ||
                    (n.badgeText && n.badgeText.toLowerCase().includes(noticeSearch.toLowerCase()));
                  const matchCategory =
                    noticeCategoryFilter === 'ALL' || n.category.toLowerCase() === noticeCategoryFilter.toLowerCase();
                  return matchSearch && matchCategory;
                });

                if (filteredNotices.length === 0) {
                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Bell className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-white">No notices found</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {noticeSearch || noticeCategoryFilter !== 'ALL'
                          ? 'No notices match your current filters. Try changing search keywords or category.'
                          : 'You haven\'t posted any notices yet. Create your first flash notice above to display on the homepage!'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNotices.map((notice) => {
                      const isUrgent = notice.priority === 'urgent';
                      const isHigh = notice.priority === 'high';

                      return (
                        <div
                          key={notice.id}
                          className={`bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                            isUrgent
                              ? 'border-rose-800/80 bg-gradient-to-b from-rose-950/20 to-slate-900 shadow-lg shadow-rose-950/20'
                              : isHigh
                              ? 'border-amber-800/60 bg-gradient-to-b from-amber-950/10 to-slate-900'
                              : 'border-slate-800'
                          } ${!notice.active ? 'opacity-60 grayscale-[40%]' : ''}`}
                        >
                          <div className="space-y-3">
                            {/* Top Badge Row */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                    isUrgent
                                      ? 'bg-rose-500 text-white animate-pulse'
                                      : isHigh
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  }`}
                                >
                                  {notice.priority}
                                </span>

                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  {notice.category}
                                </span>

                                {notice.pinned && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                                    <Pin className="w-2.5 h-2.5" />
                                    Pinned
                                  </span>
                                )}
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  notice.active
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {notice.active ? 'LIVE ON SITE' : 'HIDDEN'}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <div>
                              <div className="text-[11px] text-slate-400 font-mono mb-1">
                                {notice.date} {notice.badgeText && `• ${notice.badgeText}`}
                              </div>
                              <h3 className="text-base font-bold text-white leading-snug">
                                {notice.title}
                              </h3>
                              <p className="text-xs text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                                {notice.description}
                              </p>
                            </div>

                            {/* Action Link info */}
                            {notice.actionText && (
                              <div className="text-[11px] text-sky-400 bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                                <span className="font-semibold">Button: "{notice.actionText}"</span>
                                <span className="text-slate-500 font-mono truncate max-w-[140px]">
                                  {notice.actionUrl || '#'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleNoticeActive(notice)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  notice.active
                                    ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                                title="Toggle live visibility on website"
                              >
                                {notice.active ? 'Disable' : 'Publish'}
                              </button>

                              <button
                                onClick={() => handleToggleNoticePinned(notice)}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  notice.pinned
                                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                                title={notice.pinned ? 'Unpin from top' : 'Pin to top of notice board'}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setNoticeModal(notice)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit notice details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    id: notice.id,
                                    title: notice.title,
                                    subtitle: `Category: ${notice.category} • Date: ${notice.date}`,
                                    type: 'notice'
                                  })
                                }
                                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 border border-rose-900/40 transition-colors cursor-pointer"
                                title="Delete notice permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* =========================================================================
              TAB: CUSTOMER REVIEWS & TESTIMONIALS MANAGEMENT
          ========================================================================= */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span>Customer Reviews & Ratings Management</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Approve visitor-submitted reviews, add client testimonials, feature top feedback, and post official replies.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setTestimonialModal({
                      customerName: '',
                      city: 'Meerut, UP',
                      rating: 5,
                      serviceAvailed: 'Jan Seva Kendra / Certificate',
                      reviewText: '',
                      isApproved: true,
                      isFeatured: true,
                      order: testimonials.length + 1
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Testimonial</span>
                </button>
              </div>

              {/* Pending Moderation Banner */}
              {testimonials.some((t) => !t.isApproved) && (
                <div className="bg-gradient-to-r from-amber-950/80 to-amber-900/40 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-200">
                        {testimonials.filter((t) => !t.isApproved).length} Review(s) Waiting For Moderation
                      </h4>
                      <p className="text-[11px] text-amber-300/80">
                        Visitors submitted reviews on the website. Click "Approve & Publish" on the reviews below to make them visible to public visitors.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setTestimonialFilter('PENDING')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shrink-0 cursor-pointer"
                  >
                    View Pending
                  </button>
                </div>
              )}

              {/* Testimonials Filtering and Search Toolbar */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={testimonialSearch}
                    onChange={(e) => setTestimonialSearch(e.target.value)}
                    placeholder="Search reviews by customer, city, text..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  {testimonialSearch && (
                    <button
                      onClick={() => setTestimonialSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
                    Status:
                  </span>
                  {[
                    { id: 'ALL', label: `All (${testimonials.length})` },
                    { id: 'APPROVED', label: `Approved (${testimonials.filter((t) => t.isApproved).length})` },
                    { id: 'PENDING', label: `Pending (${testimonials.filter((t) => !t.isApproved).length})` },
                    { id: 'FEATURED', label: `Featured (${testimonials.filter((t) => t.isFeatured).length})` }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTestimonialFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                        testimonialFilter === filter.id
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              {(() => {
                const filteredReviews = testimonials.filter((item) => {
                  const matchSearch =
                    !testimonialSearch ||
                    item.customerName.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
                    item.reviewText.toLowerCase().includes(testimonialSearch.toLowerCase()) ||
                    (item.city && item.city.toLowerCase().includes(testimonialSearch.toLowerCase())) ||
                    (item.serviceAvailed && item.serviceAvailed.toLowerCase().includes(testimonialSearch.toLowerCase()));

                  let matchFilter = true;
                  if (testimonialFilter === 'APPROVED') matchFilter = item.isApproved;
                  if (testimonialFilter === 'PENDING') matchFilter = !item.isApproved;
                  if (testimonialFilter === 'FEATURED') matchFilter = !!item.isFeatured;

                  return matchSearch && matchFilter;
                });

                if (filteredReviews.length === 0) {
                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Star className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-white">No reviews found</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {testimonialSearch || testimonialFilter !== 'ALL'
                          ? 'No reviews match your selected filter.'
                          : 'No reviews logged yet. You can add one manually using the button above!'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredReviews.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                          !item.isApproved
                            ? 'border-amber-700/80 bg-gradient-to-b from-amber-950/20 to-slate-900 shadow-md shadow-amber-950/20'
                            : item.isFeatured
                            ? 'border-indigo-800/80 bg-gradient-to-b from-indigo-950/20 to-slate-900'
                            : 'border-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top Row: Stars + Status Badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= item.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-mono font-bold text-amber-300 ml-1.5">
                                {item.rating}.0
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.isFeatured && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                  Featured
                                </span>
                              )}

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.isApproved
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                }`}
                              >
                                {item.isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
                              </span>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>{item.customerName}</span>
                                {item.city && (
                                  <span className="text-xs font-normal text-slate-400">
                                    • {item.city}
                                  </span>
                                )}
                              </h3>
                              {item.serviceAvailed && (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 border border-slate-800 text-sky-400 mt-1">
                                  {item.serviceAvailed}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {item.date}
                            </span>
                          </div>

                          {/* Customer Review Quote */}
                          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed italic relative">
                            <Quote className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5 opacity-50" />
                            "{item.reviewText}"
                          </div>

                          {/* Admin Official Reply */}
                          {item.adminReply && (
                            <div className="bg-sky-950/30 border border-sky-800/50 p-3 rounded-xl text-xs space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-sky-300">
                                <span>Official Response from Al Khalil Cyber Centre</span>
                                {item.adminReplyDate && (
                                  <span className="text-slate-500 font-mono">{item.adminReplyDate}</span>
                                )}
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                {item.adminReply}
                              </p>
                            </div>
                          )}

                          {/* Private Contact phone if logged */}
                          {item.mobile && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              Contact Mobile (Admin Only): <span className="text-slate-400 font-semibold">{item.mobile}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleTestimonialApproval(item)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                item.isApproved
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              }`}
                            >
                              {item.isApproved ? 'Unapprove' : 'Approve & Publish'}
                            </button>

                            <button
                              onClick={() => handleToggleTestimonialFeatured(item)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                item.isFeatured
                                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                              title={item.isFeatured ? 'Unpin from homepage' : 'Feature on homepage top carousel'}
                            >
                              {item.isFeatured ? 'Featured ★' : 'Feature'}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                setReplyModal({
                                  id: item.id,
                                  customerName: item.customerName,
                                  reviewText: item.reviewText,
                                  reply: item.adminReply || ''
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-xs font-semibold border border-sky-800 transition-colors cursor-pointer flex items-center gap-1"
                              title="Write official business reply"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{item.adminReply ? 'Edit Reply' : 'Reply'}</span>
                            </button>

                            <button
                              onClick={() => setTestimonialModal(item)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit review details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  id: item.id,
                                  title: item.customerName,
                                  subtitle: `Rating: ${item.rating} Stars • Service: ${item.serviceAvailed || 'General'}`,
                                  type: 'testimonial'
                                })
                              }
                              className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 border border-rose-900/40 transition-colors cursor-pointer"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* =========================================================================
              TAB: AI CHATBOT & KNOWLEDGE BASE FAQS
          ========================================================================= */}
          {activeTab === 'chatbot' && (
            <div className="max-w-6xl mx-auto">
              <AdminChatbotTab onRefreshPublicData={onRefreshPublicData} />
            </div>
          )}

          {/* =========================================================================
              TAB: BANNERS MANAGEMENT
          ========================================================================= */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Home Page Hero Banner Management
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add, edit, replace image, change slide duration or reorder website hero sliders.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setBannerModal({
                      title: '',
                      subtitle: '',
                      badgeText: '',
                      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
                      buttonText: 'Learn More',
                      buttonLink: '#services',
                      slideDuration: 5,
                      active: true,
                      order: banners.length + 1
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Banner</span>
                </button>
              </div>

              {/* Banners List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview */}
                      <div
                        className="h-40 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${banner.imageUrl})` }}
                      >
                        <div className="absolute inset-0 bg-slate-950/40" />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              banner.active
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {banner.active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-sky-400">
                            Order: #{banner.order} • {banner.slideDuration}s
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        {banner.badgeText && (
                          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                            {banner.badgeText}
                          </span>
                        )}
                        <h4 className="text-base font-bold text-white leading-snug">
                          {banner.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {banner.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        CTA: <strong className="text-slate-300">{banner.buttonText}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBannerModal(banner)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirm({
                              id: banner.id,
                              title: banner.title || `Banner #${banner.order}`,
                              subtitle: `Hero Slide #${banner.order}`,
                              type: 'banner'
                            });
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-400 transition-colors cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: FLASH NEWS TICKER
          ========================================================================= */}
          {activeTab === 'news' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Flash News / Breaking Updates Ticker
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage real-time updates scrolling at the top of the official website.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setNewsModal({
                      text: '',
                      badge: 'NEW',
                      link: '#services',
                      active: true,
                      order: news.length + 1
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Flash News</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{item.order}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-sm font-medium text-white">
                        {item.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {item.active ? 'ACTIVE' : 'OFF'}
                      </span>

                      <button
                        onClick={() => setNewsModal(item)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirm({
                            id: item.id,
                            title: item.text,
                            subtitle: item.badge ? `Tag: ${item.badge}` : 'News update',
                            type: 'news'
                          });
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-400 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: SERVICES CATALOG
          ========================================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Services Catalog Management
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add new categories, create services, configure required documents and starting rates.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setServiceModal({
                      category: 'JAN SEVA / CSC SERVICES',
                      serviceCode: '',
                      title: '',
                      shortDescription: '',
                      fullDescription: '',
                      requiredDocuments: ['Aadhaar Card'],
                      estimatedTime: 'Same Day',
                      priceStartingFrom: '₹50',
                      isPopular: true,
                      active: true,
                      order: services.length + 1,
                      chargeBreakdown: []
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-900">
                            {srv.category}
                          </span>
                          {srv.serviceCode && (
                            <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                              {srv.serviceCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {srv.chargeBreakdown && srv.chargeBreakdown.length > 0 && (
                            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                              Breakdown ({srv.chargeBreakdown.length})
                            </span>
                          )}
                          <span className="text-xs font-bold text-emerald-400">
                            {srv.priceStartingFrom}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white">{srv.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{srv.shortDescription}</p>

                      <div className="mt-3 text-[11px] text-slate-500">
                        Duration: <strong className="text-slate-300">{srv.estimatedTime}</strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          srv.active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {srv.active ? 'ACTIVE' : 'HIDDEN'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setServiceModal({
                              ...srv,
                              serviceCode: srv.serviceCode || '',
                              chargeBreakdown: srv.chargeBreakdown ? [...srv.chargeBreakdown] : []
                            })
                          }
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirm({
                              id: srv.id,
                              title: srv.title,
                              subtitle: `${srv.category} • ${srv.priceStartingFrom}`,
                              type: 'service'
                            });
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-400 cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: RATE LIST
          ========================================================================= */}
          {activeTab === 'rates' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Official Rate List Manager
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Transparent price chart displayed on website. Keep rates updated without code edits.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setRateModal({
                      category: 'Printing & Xerox',
                      serviceName: '',
                      price: '₹5',
                      unit: 'per page',
                      notes: '',
                      active: true,
                      order: rates.length + 1
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Rate Item</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {rates.map((rate) => (
                  <div
                    key={rate.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded">
                          {rate.category}
                        </span>
                        <h4 className="text-sm font-bold text-white">{rate.serviceName}</h4>
                      </div>
                      {rate.notes && <p className="text-xs text-slate-400 mt-0.5">{rate.notes}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-400">{rate.price}</span>
                        <span className="text-xs text-slate-400 block">{rate.unit}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRateModal(rate)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirm({
                              id: rate.id,
                              title: rate.serviceName,
                              subtitle: `${rate.category} • ${rate.price} ${rate.unit}`,
                              type: 'rate'
                            });
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-400 cursor-pointer"
                          title="Delete Rate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: WORK ORDERS & TRACKING MANAGEMENT
          ========================================================================= */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Customer Work Tracking & Orders
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage walk-in and online customer jobs, update status and progress remarks live.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setJobModal({
                      trackingCode: `AK-${Math.floor(10000 + Math.random() * 90000)}`,
                      customerName: '',
                      customerMobile: '',
                      serviceName: 'Aadhaar / PAN Card Service',
                      status: 'Received',
                      statusNotes: 'Document received and entered into processing queue.',
                      estimatedDelivery: '1 - 2 Days',
                      priceTotal: '₹100',
                      amountPaid: '₹100'
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Work Order Token</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search by Token, Name, Mobile..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['ALL', 'Received', 'Processing', 'Ready', 'Completed', 'On Hold'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setJobStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                        jobStatusFilter === st
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jobs Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {jobs
                  .filter((j) => {
                    const matchSt = jobStatusFilter === 'ALL' || j.status === jobStatusFilter;
                    const matchQ =
                      jobSearch.trim() === '' ||
                      j.trackingCode.toLowerCase().includes(jobSearch.toLowerCase()) ||
                      j.customerName.toLowerCase().includes(jobSearch.toLowerCase()) ||
                      j.customerMobile.includes(jobSearch);
                    return matchSt && matchQ;
                  })
                  .map((job) => (
                    <div
                      key={job.id}
                      className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-850"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-sky-950 text-sky-400 font-mono font-bold text-xs border border-sky-800">
                            {job.trackingCode}
                          </span>
                          <strong className="text-white text-sm">{job.customerName}</strong>
                          {job.customerMobile && (
                            <span className="text-slate-400 text-xs">({job.customerMobile})</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-medium">
                          {job.serviceName}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          Status Remarks: <span className="text-slate-200">{job.statusNotes}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end lg:self-auto">
                        <div className="text-right text-xs">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] block ${
                              job.status === 'Ready'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : job.status === 'Completed'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {job.status}
                          </span>
                          {job.estimatedDelivery && (
                            <span className="text-[11px] text-slate-500 mt-1 block">
                              {job.estimatedDelivery}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedJobInvoice(job)}
                            className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/80 transition-colors cursor-pointer"
                            title="View / Print Official Invoice Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setJobModal(job)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 cursor-pointer transition-colors"
                            title="Update Status / Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirm({
                                id: job.id,
                                title: job.trackingCode,
                                subtitle: `${job.customerName} • ${job.serviceName}`,
                                type: 'job'
                              });
                            }}
                            className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800/80 hover:border-rose-600 transition-colors cursor-pointer"
                            title="Delete Work Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: CUSTOMER UPLOADED DOCUMENTS (PRIVATE STORAGE)
          ========================================================================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Customer Uploaded Documents (Secure Vault)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Private files submitted by customers online. Stream or download files securely.
                </p>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {documents.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    No documents uploaded yet.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                            {doc.trackingCode}
                          </span>
                          <strong className="text-white text-sm">{doc.customerName}</strong>
                          <span className="text-slate-400 text-xs">({doc.customerMobile})</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300">
                          Purpose: <strong>{doc.serviceRequested}</strong>
                        </p>

                        <p className="text-xs text-slate-400">
                          File: <strong className="text-slate-200">{doc.originalName}</strong> ({Math.round(doc.fileSize / 1024)} KB)
                        </p>

                        {doc.note && (
                          <p className="text-xs text-amber-300/90 italic">
                            Customer Note: "{doc.note}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto">
                        {/* Download Document Link */}
                        <a
                          href={getDocumentDownloadUrl(doc.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </a>

                        {/* Status Switcher */}
                        <select
                          value={doc.status}
                          onChange={async (e) => {
                            await updateAdminDocumentStatus(doc.id, e.target.value as any);
                            showSuccess('Status updated.');
                            loadAllData();
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
                        >
                          <option value="New">New</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Converted to Job">Converted to Job</option>
                          <option value="Archived">Archived</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirm({
                              id: doc.id,
                              title: doc.trackingCode,
                              subtitle: `${doc.customerName} (${doc.customerMobile}) • ${doc.serviceRequested}`,
                              type: 'doc'
                            });
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-400 cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: CERTIFICATES & AUTHORIZATIONS MANAGEMENT
          ========================================================================= */}
          {activeTab === 'certificates' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Award className="w-6 h-6 text-amber-400" />
                    <span>Government Certificates & Authorizations</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage official CSC, Digital India, Banking BC, and Service Provider licenses displayed on your homepage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search certificates..."
                      value={certSearch}
                      onChange={(e) => setCertSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs w-48 focus:w-64 transition-all"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setCertModal({
                        title: '',
                        titleHindi: '',
                        issuingAuthority: '',
                        registrationNumber: '',
                        description: '',
                        imageUrl: '',
                        issueDate: '',
                        expiryDate: '',
                        order: certificates.length + 1,
                        active: true
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Certificate</span>
                  </button>
                </div>
              </div>

              {/* Certificates Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certificates
                  .filter((c) => {
                    if (!certSearch.trim()) return true;
                    const q = certSearch.toLowerCase();
                    return (
                      c.title.toLowerCase().includes(q) ||
                      (c.titleHindi && c.titleHindi.toLowerCase().includes(q)) ||
                      c.issuingAuthority.toLowerCase().includes(q) ||
                      c.registrationNumber.toLowerCase().includes(q)
                    );
                  })
                  .map((cert) => (
                    <div
                      key={cert.id}
                      className={`bg-slate-900 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                        cert.active ? 'border-slate-800 hover:border-amber-500/50' : 'border-slate-800/40 opacity-60'
                      }`}
                    >
                      <div>
                        {/* Certificate Image Preview */}
                        <div className="relative h-44 bg-slate-950 flex items-center justify-center p-3 border-b border-slate-800 overflow-hidden group">
                          {cert.imageUrl ? (
                            <img
                              src={cert.imageUrl}
                              alt={cert.title}
                              className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-600">
                              <Award className="w-12 h-12 stroke-[1.5]" />
                              <span className="text-[11px] font-bold mt-1">No Image Uploaded</span>
                            </div>
                          )}

                          {cert.imageUrl && (
                            <button
                              onClick={() => setPreviewCert(cert)}
                              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-amber-400" />
                              <span>View Full Proof</span>
                            </button>
                          )}

                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                cert.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {cert.active ? 'Active' : 'Hidden'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 text-[10px] font-mono border border-slate-700">
                              #{cert.order}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2.5">
                          <div>
                            <h3 className="text-sm font-black text-white leading-snug">{cert.title}</h3>
                            {cert.titleHindi && (
                              <p className="text-xs text-amber-300/90 font-medium">{cert.titleHindi}</p>
                            )}
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Issuing Authority:</span>
                              <span className="text-slate-200 font-bold">{cert.issuingAuthority}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400 font-mono">
                              <span>Reg / ID:</span>
                              <span className="text-amber-400 font-bold">{cert.registrationNumber}</span>
                            </div>
                            {cert.issueDate && (
                              <div className="flex items-center justify-between text-slate-400">
                                <span>Issue Date:</span>
                                <span className="text-slate-300">{cert.issueDate}</span>
                              </div>
                            )}
                          </div>

                          {cert.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {cert.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleCertActive(cert)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            cert.active
                              ? 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                              : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {cert.active ? 'Hide from Public' : 'Show on Public'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCertModal(cert)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                            title="Edit Certificate"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id, cert.title)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-400 cursor-pointer"
                            title="Delete Certificate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {certificates.length === 0 && (
                <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 space-y-4">
                  <Award className="w-12 h-12 text-amber-400 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">No Certificates Added Yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Add your CSC VLE ID, Bank BC authorization, or Digital Seva certificates to establish customer trust.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setCertModal({
                        title: 'CSC E-Governance Services India',
                        titleHindi: 'सीएससी ई-गवर्नेंस प्राधिकृत केंद्र',
                        issuingAuthority: 'Ministry of Electronics & IT',
                        registrationNumber: 'VLE-UP-9259837361',
                        order: 1,
                        active: true
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                  >
                    Add Sample CSC Certificate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB: MANAGE ALL SETTINGS (COMPREHENSIVE MULTI-TAB PORTAL)
          ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Settings className="w-6 h-6 text-sky-400" />
                    <span>Manage All Website Settings</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Centralized management for Business Info, Branding & Logos, SEO Meta Tags, Social Links & System Controls.
                  </p>
                </div>

                <button
                  onClick={() => handleSaveAllSettings()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-950 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Apply All</span>
                </button>
              </div>

              {/* Settings Sub-Navigation Tabs */}
              <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: 'business', label: 'Business & Contacts', icon: Building2 },
                  { id: 'branding', label: 'Branding & Identity', icon: Palette },
                  { id: 'seo', label: 'SEO & Meta Tags', icon: Globe },
                  { id: 'social', label: 'Social & Map Links', icon: Share2 },
                  { id: 'toggles', label: 'System & Feature Controls', icon: Sliders }
                ].map((st) => {
                  const Icon = st.icon;
                  const isActive = settingsSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSettingsSubTab(st.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SubTab 1: Business Profile & Contact Info */}
              {settingsSubTab === 'business' && (
                <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white">Business Information</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Core business identity displayed across header, hero, and footer.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Official Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessSettings.businessName}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Hindi Business Name
                      </label>
                      <input
                        type="text"
                        value={businessSettings.businessNameHindi || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, businessNameHindi: e.target.value })}
                        placeholder="अल खलील साइबर सेन्टर"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={businessSettings.tagline}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Primary Phone (Call Now) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={businessSettings.phone}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono font-bold text-sky-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Secondary / Alternate Phone
                      </label>
                      <input
                        type="tel"
                        value={businessSettings.alternatePhone || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, alternatePhone: e.target.value })}
                        placeholder="+91..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Official WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={businessSettings.whatsapp}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, whatsapp: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono font-bold text-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Cyber Safety Verification Helpline setting */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      Official OTP / Customer Verification Helpline Number
                    </label>
                    <input
                      type="tel"
                      value={businessSettings.otpVerificationPhone || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, otpVerificationPhone: e.target.value })}
                      placeholder={businessSettings.phone || '9259837361'}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono font-bold text-amber-400"
                    />
                    <span className="text-[11px] text-slate-400 block leading-relaxed">
                      Displayed on the dedicated "Cyber Safety & Fraud Awareness" page for customers to verify genuine service calls. If left empty, primary phone (+91 {businessSettings.phone}) is used.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Official Email
                      </label>
                      <input
                        type="email"
                        value={businessSettings.email}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Opening Hours
                      </label>
                      <input
                        type="text"
                        value={businessSettings.openingHours}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, openingHours: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Physical Address
                      </label>
                      <input
                        type="text"
                        value={businessSettings.address}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={businessSettings.pincode}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, pincode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      About Centre Story
                    </label>
                    <textarea
                      rows={4}
                      value={businessSettings.aboutText}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, aboutText: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveAllSettings()}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Business Details</span>
                  </button>
                </div>
              )}

              {/* SubTab 2: Branding & Identity */}
              {settingsSubTab === 'branding' && (
                <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white">Branding, Logo & Visual Identity</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customize your brand logo, website favicon, watermark text, and copyright.</p>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Official Brand Logo
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                        {businessSettings.logoUrl ? (
                          <img src={businessSettings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Shield className="w-10 h-10 text-indigo-400" />
                        )}
                      </div>

                      <div className="space-y-2 grow w-full">
                        <input
                          type="text"
                          value={businessSettings.logoUrl || ''}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, logoUrl: e.target.value })}
                          placeholder="Logo image URL or upload below"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition-colors">
                            <UploadCloud className="w-4 h-4 text-sky-400" />
                            <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File (PNG/JPG/SVG)'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingLogo}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleUploadLogo(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          {businessSettings.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setBusinessSettings({ ...businessSettings, logoUrl: '' })}
                              className="text-xs text-rose-400 hover:underline font-bold"
                            >
                              Remove Custom Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload Section */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Website Favicon (Browser Tab Icon)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                        {businessSettings.faviconUrl ? (
                          <img src={businessSettings.faviconUrl} alt="Favicon" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Globe className="w-6 h-6 text-sky-400" />
                        )}
                      </div>

                      <div className="space-y-2 grow w-full">
                        <input
                          type="text"
                          value={businessSettings.faviconUrl || ''}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, faviconUrl: e.target.value })}
                          placeholder="Favicon image URL or upload below"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition-colors">
                          <UploadCloud className="w-4 h-4 text-sky-400" />
                          <span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon File (ICO/PNG)'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingFavicon}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadFavicon(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Watermark / Security Print Text
                      </label>
                      <input
                        type="text"
                        value={businessSettings.watermarkText || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, watermarkText: e.target.value })}
                        placeholder="AL KHALIL CYBER CENTRE OFFICIAL"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Footer Copyright Text
                      </label>
                      <input
                        type="text"
                        value={businessSettings.footerCopyright || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, footerCopyright: e.target.value })}
                        placeholder="© 2026 AL KHALIL CYBER CENTRE. All Rights Reserved."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveAllSettings()}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Branding Details</span>
                  </button>
                </div>
              )}

              {/* SubTab 3: SEO & Meta Tags */}
              {settingsSubTab === 'seo' && (
                <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white">Search Engine Optimization (SEO) & Social Graph</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Control how Google Search and WhatsApp show previews of your website link.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Meta Page Title *
                    </label>
                    <input
                      type="text"
                      value={businessSettings.metaTitle || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, metaTitle: e.target.value })}
                      placeholder="AL KHALIL CYBER CENTRE | Official Online Cyber & CSC Seva Kendra"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Meta Description (Search & Social Previews)
                    </label>
                    <textarea
                      rows={3}
                      value={businessSettings.metaDescription || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, metaDescription: e.target.value })}
                      placeholder="Official website of AL KHALIL CYBER CENTRE. CSC Seva, Passport, PAN Card, Online Form, Aadhaar Print, Banking BC & Fast Online Work."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Meta Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={businessSettings.metaKeywords || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, metaKeywords: e.target.value })}
                      placeholder="Cyber Cafe, CSC Kendra, Online Form, PAN Card, Passport, Bill Payment"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        OpenGraph Share Image URL
                      </label>
                      <input
                        type="text"
                        value={businessSettings.ogImageUrl || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, ogImageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Canonical Website URL
                      </label>
                      <input
                        type="text"
                        value={businessSettings.canonicalUrl || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, canonicalUrl: e.target.value })}
                        placeholder="https://alkhalilcyber.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveAllSettings()}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save SEO Configuration</span>
                  </button>
                </div>
              )}

              {/* SubTab 4: Social & Map Links */}
              {settingsSubTab === 'social' && (
                <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white">Social Media & Navigation Links</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Link your official social pages and Google Maps location.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Facebook Page URL
                      </label>
                      <input
                        type="url"
                        value={businessSettings.facebookUrl || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={businessSettings.instagramUrl || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        YouTube Channel URL
                      </label>
                      <input
                        type="url"
                        value={businessSettings.youtubeUrl || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/@..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Telegram Channel / Group URL
                      </label>
                      <input
                        type="url"
                        value={businessSettings.telegramUrl || ''}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, telegramUrl: e.target.value })}
                        placeholder="https://t.me/..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Google Maps Location Embed URL
                    </label>
                    <input
                      type="text"
                      value={businessSettings.googleMapsEmbedUrl || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, googleMapsEmbedUrl: e.target.value })}
                      placeholder="https://www.google.com/maps/embed?..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveAllSettings()}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Social Links</span>
                  </button>
                </div>
              )}

              {/* SubTab 5: System Toggles & Feature Controls */}
              {settingsSubTab === 'toggles' && (
                <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white">System Controls, Emergency Banners & Toggles</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Turn specific modules on or off with instant live switching.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Emergency Alert Banner */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-rose-400" />
                            <span>Top Urgent Alert Bar</span>
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Displays a high-contrast emergency notification bar at the very top of the homepage.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={businessSettings.enableEmergencyAlert ?? false}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, enableEmergencyAlert: e.target.checked })}
                          className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                        />
                      </div>

                      {businessSettings.enableEmergencyAlert && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Urgent Alert Text (English / Hindi)
                          </label>
                          <input
                            type="text"
                            value={businessSettings.emergencyAlertText || ''}
                            onChange={(e) => setBusinessSettings({ ...businessSettings, emergencyAlertText: e.target.value })}
                            placeholder="⚠️ UPP Constable 2026 Form Fill Up Started! Visit Centre Today."
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                          />
                        </div>
                      )}
                    </div>

                    {/* Cyber Safety Awareness Alert Banner Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            <span>Cyber Safety & Fraud Awareness Alert Banner on Homepage</span>
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Displays a non-intrusive safety awareness card on the homepage with a button linking to the Cyber Safety page.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={businessSettings.showCyberSafetyBanner ?? true}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, showCyberSafetyBanner: e.target.checked })}
                          className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>

                      {businessSettings.showCyberSafetyBanner !== false && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Homepage Cyber Safety Alert Text
                          </label>
                          <input
                            type="text"
                            value={businessSettings.safetyNoticeText || ''}
                            onChange={(e) => setBusinessSettings({ ...businessSettings, safetyNoticeText: e.target.value })}
                            placeholder="OTP, UPI PIN, ATM PIN, Banking Password, Card PIN या CVV का गलत इस्तेमाल करके धोखाधड़ी की जा सकती है।"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Online Document Upload Portal Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-purple-400" />
                          <span>Online Document Upload Portal</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Allows customers to upload documents (PDF/JPG) from their phone with instant tracking token generation.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={businessSettings.enableOnlineUpload ?? true}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, enableOnlineUpload: e.target.checked })}
                        className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                      />
                    </div>

                    {/* Work Tracking System Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Package className="w-4 h-4 text-sky-400" />
                          <span>Customer Work Order Tracker</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Enables live tracking lookup by tracking code (e.g. AK-10293) on the public homepage.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={businessSettings.enableWorkTracker ?? true}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, enableWorkTracker: e.target.checked })}
                        className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                      />
                    </div>

                    {/* Floating WhatsApp Quick Action Button */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span>Floating Quick-Action Buttons (Call + WhatsApp)</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Shows floating quick-tap Call and WhatsApp buttons at the bottom-right corner of the website.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={businessSettings.enableFloatingWhatsApp ?? true}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, enableFloatingWhatsApp: e.target.checked })}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            <span>Maintenance Mode Notice</span>
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Show a scheduled maintenance notice if services are temporarily halted.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={businessSettings.maintenanceMode ?? false}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, maintenanceMode: e.target.checked })}
                          className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>

                      {businessSettings.maintenanceMode && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Custom Maintenance Notice Message
                          </label>
                          <input
                            type="text"
                            value={businessSettings.maintenanceNotice || ''}
                            onChange={(e) => setBusinessSettings({ ...businessSettings, maintenanceNotice: e.target.value })}
                            placeholder="Website server maintenance in progress. For urgent inquiries call 9259837361."
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveAllSettings()}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save System Controls & Toggles</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB: SECURITY & PIN MANAGEMENT
          ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Security & Admin PIN
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permanent browser LocalStorage & Database authentication management.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    pinStatus.isCustom
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  }`}>
                    {pinStatus.isCustom ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Custom PIN Active</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Default PIN (595213)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Status & Storage Information Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-white text-sm">Permanent Multi-Layer PIN Storage</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Whenever you update your Admin PIN, it is permanently saved in two places:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 pt-1 font-mono text-[11px]">
                      <li><strong className="text-sky-300">Browser LocalStorage:</strong> Key <code className="text-amber-300">alkhalil_admin_pin</code> (survives page refreshes & site updates)</li>
                      <li><strong className="text-emerald-300">Server Encrypted DB:</strong> 10-round salted bcrypt hash in <code className="text-amber-300">data/db.json</code> & backup <code className="text-amber-300">data/admin_pin.json</code></li>
                    </ul>
                    {pinStatus.updatedAt && (
                      <p className="text-[11px] text-slate-500 pt-1">
                        Last changed: {new Date(pinStatus.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Change PIN Form */}
              <form onSubmit={handleChangePin} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-400" />
                    <span>Change Admin PIN</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set a new 6 to 12 digit numeric PIN to unlock the portal.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Current PIN *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      required
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder={pinStatus.isCustom ? "Enter your current PIN" : "Current PIN (e.g. 595213)"}
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                      title={showCurrentPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    New PIN (6 to 12 Numeric Digits) *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      required
                      minLength={6}
                      maxLength={12}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter new 6+ digit PIN"
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                      title={showNewPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New PIN *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      required
                      minLength={6}
                      maxLength={12}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Re-enter new PIN"
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                      title={showConfirmPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pinChangeLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {pinChangeLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Admin PIN...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Save & Update Admin PIN</span>
                    </>
                  )}
                </button>
              </form>

              {/* Mantra MFS110 Biometric Hardware Integration Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Mantra MFS110 Biometric Scanner</span>
                        {biometricStatus?.biometricEnabled ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">Disabled</span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Authenticate securely via your connected Mantra MFS110 optical USB fingerprint device.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => checkMantraDevice()}
                      disabled={checkingMantra}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                      title="Probe local Mantra ports"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checkingMantra ? 'animate-spin' : ''}`} />
                      <span>Detect Scanner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBiometric(!biometricStatus?.biometricEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        biometricStatus?.biometricEnabled
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>{biometricStatus?.biometricEnabled ? 'Disable Biometrics' : 'Enable Biometrics'}</span>
                    </button>
                  </div>
                </div>

                {/* Local device status readout */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Local Hardware Status:</span>
                    {mantraStatus?.detected ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected ({mantraStatus.model} on port {mantraStatus.port})</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Not Detected on this browser/PC</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Uses official Mantra Client Service (port 8003) and UIDAI RD Service (ports 11100-11105). Zero raw fingerprint images are stored on our servers.
                  </div>
                </div>
              </div>

              {/* Passkey / Windows Hello Hardware Authenticator Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Passkey / Windows Hello Enrollment</span>
                        {registeredPasskeys.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                            {registeredPasskeys.length} Registered
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                            Not Enrolled
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Log in with Windows Hello Face, Fingerprint, or PIN on this computer using standard WebAuthn.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegisterPasskey}
                    disabled={passkeyLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{passkeyLoading ? 'Registering...' : '+ Enroll This Device'}</span>
                  </button>
                </div>

                {registeredPasskeys.length > 0 ? (
                  <div className="space-y-2">
                    {registeredPasskeys.map((pk) => (
                      <div
                        key={pk.id}
                        className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-white">{pk.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Enrolled: {new Date(pk.createdAt).toLocaleDateString()} {new Date(pk.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePasskey(pk.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 text-xs transition-colors"
                          title="Remove Passkey"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Click "+ Enroll This Device" to enable instant one-touch login with Windows Hello on your PC.</span>
                  </div>
                )}
              </div>

              {/* Reset to Factory Default PIN Section */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>Reset Admin PIN to Default</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Clear your customized PIN and revert back to standard system credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetDefaultModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-600/20 text-amber-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset PIN</span>
                  </button>
                </div>
              </div>

              {/* Confirmation Modal for Reset to Default */}
              {resetDefaultModal && (
                <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-black text-white">Reset PIN to Default?</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        This will reset the authorized login credentials to the default system configuration.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setResetDefaultModal(false)}
                        className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleResetPinToDefault}
                        disabled={pinChangeLoading}
                        className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                      >
                        Confirm Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODALS: NOTICE ADD/EDIT
      ========================================================================= */}
      {noticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {noticeModal.id ? 'Edit Flash Alert / Notice' : 'Post New Notice / Scheme Alert'}
                </h3>
              </div>
              <button
                onClick={() => setNoticeModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminNotice(noticeModal);
                  showSuccess('Notice saved and updated successfully.');
                  setNoticeModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message || 'Failed to save notice.');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">Notice Title / Scheme Name *</label>
                <input
                  type="text"
                  required
                  value={noticeModal.title || ''}
                  onChange={(e) => setNoticeModal({ ...noticeModal, title: e.target.value })}
                  placeholder="e.g. PM Kisan 17th Installment Date Released"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={noticeModal.category || 'Scheme'}
                    onChange={(e) => setNoticeModal({ ...noticeModal, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Scheme">Scheme</option>
                    <option value="Alert">Urgent Alert</option>
                    <option value="Exam">Exam / Admit Card</option>
                    <option value="Holiday">Holiday Notice</option>
                    <option value="JanSeva">Jan Seva Kendra</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={noticeModal.priority || 'urgent'}
                    onChange={(e) => setNoticeModal({ ...noticeModal, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="urgent">Urgent (Red Pulse)</option>
                    <option value="high">High (Amber)</option>
                    <option value="normal">Normal (Sky)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={noticeModal.badgeText || ''}
                    onChange={(e) => setNoticeModal({ ...noticeModal, badgeText: e.target.value })}
                    placeholder="e.g. NEW SCHEME"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Summary / Description *</label>
                <textarea
                  required
                  rows={3}
                  value={noticeModal.description || ''}
                  onChange={(e) => setNoticeModal({ ...noticeModal, description: e.target.value })}
                  placeholder="Enter key details: eligibility, last date, required documents, or office hours..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Action Button Text (Optional)</label>
                  <input
                    type="text"
                    value={noticeModal.actionText || ''}
                    onChange={(e) => setNoticeModal({ ...noticeModal, actionText: e.target.value })}
                    placeholder="e.g. Apply Now / Check Status"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Action Button URL / Link</label>
                  <input
                    type="text"
                    value={noticeModal.actionUrl || ''}
                    onChange={(e) => setNoticeModal({ ...noticeModal, actionUrl: e.target.value })}
                    placeholder="e.g. #services or #contact or https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Date</label>
                  <input
                    type="text"
                    value={noticeModal.date || ''}
                    onChange={(e) => setNoticeModal({ ...noticeModal, date: e.target.value })}
                    placeholder="YYYY-MM-DD or Today"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="text"
                    value={noticeModal.expiryDate || ''}
                    onChange={(e) => setNoticeModal({ ...noticeModal, expiryDate: e.target.value })}
                    placeholder="e.g. 2026-12-31"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Order</label>
                  <input
                    type="number"
                    value={noticeModal.order ?? 1}
                    onChange={(e) => setNoticeModal({ ...noticeModal, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noticeActiveCheck"
                    checked={noticeModal.active !== false}
                    onChange={(e) => setNoticeModal({ ...noticeModal, active: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                  />
                  <label htmlFor="noticeActiveCheck" className="font-bold text-slate-200 cursor-pointer">
                    Display Live on Website
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noticePinnedCheck"
                    checked={!!noticeModal.pinned}
                    onChange={(e) => setNoticeModal({ ...noticeModal, pinned: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <label htmlFor="noticePinnedCheck" className="font-bold text-slate-200 cursor-pointer">
                    Pin as Top Alert
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-md cursor-pointer mt-2"
              >
                {noticeModal.id ? 'Save Changes' : 'Publish Notice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: TESTIMONIAL ADD/EDIT
      ========================================================================= */}
      {testimonialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {testimonialModal.id ? 'Edit Customer Review' : 'Add New Customer Review'}
                </h3>
              </div>
              <button
                onClick={() => setTestimonialModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminTestimonial(testimonialModal);
                  showSuccess('Review saved successfully.');
                  setTestimonialModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message || 'Failed to save review.');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={testimonialModal.customerName || ''}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, customerName: e.target.value })}
                    placeholder="e.g. Mohd Tariq"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">City / Area</label>
                  <input
                    type="text"
                    value={testimonialModal.city || ''}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, city: e.target.value })}
                    placeholder="e.g. Meerut, UP"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Service Availed *</label>
                  <input
                    type="text"
                    required
                    value={testimonialModal.serviceAvailed || ''}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, serviceAvailed: e.target.value })}
                    placeholder="e.g. Passport Application / CSC Certificate"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Customer Mobile (Private Admin Only)</label>
                  <input
                    type="text"
                    value={testimonialModal.mobile || ''}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Star Rating (1 to 5 Stars) *</label>
                <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setTestimonialModal({ ...testimonialModal, rating: star })}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (testimonialModal.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-black text-amber-300 ml-3">
                    {testimonialModal.rating || 5} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Customer Review / Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={testimonialModal.reviewText || ''}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, reviewText: e.target.value })}
                  placeholder="What the customer said about their experience..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Official Admin Reply (Optional)</label>
                <textarea
                  rows={2}
                  value={testimonialModal.adminReply || ''}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, adminReply: e.target.value })}
                  placeholder="Thank the customer or add an official note from Al Khalil Cyber Centre..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Review Date</label>
                  <input
                    type="text"
                    value={testimonialModal.date || ''}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, date: e.target.value })}
                    placeholder="YYYY-MM-DD or Today"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={testimonialModal.order ?? 1}
                    onChange={(e) =>
                      setTestimonialModal({ ...testimonialModal, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reviewApprovedCheck"
                    checked={testimonialModal.isApproved !== false}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, isApproved: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="reviewApprovedCheck" className="font-bold text-slate-200 cursor-pointer">
                    Approved (Visible to Public)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reviewFeaturedCheck"
                    checked={!!testimonialModal.isFeatured}
                    onChange={(e) => setTestimonialModal({ ...testimonialModal, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                  <label htmlFor="reviewFeaturedCheck" className="font-bold text-slate-200 cursor-pointer">
                    Feature on Homepage Top
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold rounded-xl shadow-md cursor-pointer mt-2"
              >
                Save Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: QUICK OFFICIAL ADMIN REPLY
      ========================================================================= */}
      {replyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">
                  Reply to {replyModal.customerName}
                </h3>
              </div>
              <button
                onClick={() => setReplyModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
              "{replyModal.reviewText}"
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAdminReply(replyModal.id, replyModal.reply);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Response from Al Khalil Cyber Centre
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyModal.reply}
                  onChange={(e) => setReplyModal({ ...replyModal, reply: e.target.value })}
                  placeholder="Thank you for trusting Al Khalil Cyber Centre! We are delighted to serve you..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md"
                >
                  Post Official Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: BANNER ADD/EDIT
      ========================================================================= */}
      {bannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {bannerModal.id ? 'Edit Banner' : 'Add New Hero Banner'}
              </h3>
              <button onClick={() => setBannerModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminBanner(bannerModal);
                  showSuccess('Banner saved successfully.');
                  setBannerModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message || 'Failed to save banner.');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bannerModal.title || ''}
                  onChange={(e) => setBannerModal({ ...bannerModal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={bannerModal.subtitle || ''}
                  onChange={(e) => setBannerModal({ ...bannerModal, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Badge Text (e.g. PRINTING STUDIO / CSC)</label>
                <input
                  type="text"
                  value={bannerModal.badgeText || ''}
                  onChange={(e) => setBannerModal({ ...bannerModal, badgeText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Banner Image URL or Upload Custom File *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={bannerModal.imageUrl || ''}
                    onChange={(e) => setBannerModal({ ...bannerModal, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                  <label className="shrink-0 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl cursor-pointer font-bold">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const url = await uploadBannerImage(e.target.files[0]);
                            setBannerModal({ ...bannerModal, imageUrl: url });
                            showSuccess('Image uploaded!');
                          } catch (err: any) {
                            setActionError(err.message || 'Upload failed');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerModal.buttonText || ''}
                    onChange={(e) => setBannerModal({ ...bannerModal, buttonText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={bannerModal.buttonLink || ''}
                    onChange={(e) => setBannerModal({ ...bannerModal, buttonLink: e.target.value })}
                    placeholder="#services or tel:9259837361"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Slide Duration (Sec)</label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={bannerModal.slideDuration || 5}
                    onChange={(e) => setBannerModal({ ...bannerModal, slideDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Order</label>
                  <input
                    type="number"
                    value={bannerModal.order || 1}
                    onChange={(e) => setBannerModal({ ...bannerModal, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerModal.active !== false}
                      onChange={(e) => setBannerModal({ ...bannerModal, active: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600"
                    />
                    <span className="font-bold text-white">Active</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer mt-2"
              >
                Save Banner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: FLASH NEWS ADD/EDIT
      ========================================================================= */}
      {newsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {newsModal.id ? 'Edit Flash News' : 'Add Flash News Item'}
              </h3>
              <button onClick={() => setNewsModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminNews(newsModal);
                  showSuccess('Flash news saved.');
                  setNewsModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">News Text *</label>
                <textarea
                  rows={3}
                  required
                  value={newsModal.text || ''}
                  onChange={(e) => setNewsModal({ ...newsModal, text: e.target.value })}
                  placeholder="e.g. Aadhaar Card Biometric Update Active Daily..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Badge Tag</label>
                  <select
                    value={newsModal.badge || 'NEW'}
                    onChange={(e) => setNewsModal({ ...newsModal, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="NEW">NEW</option>
                    <option value="OFFER">OFFER</option>
                    <option value="POPULAR">POPULAR</option>
                    <option value="FEATURED">FEATURED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={newsModal.order || 1}
                    onChange={(e) => setNewsModal({ ...newsModal, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newsActive"
                  checked={newsModal.active !== false}
                  onChange={(e) => setNewsModal({ ...newsModal, active: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600"
                />
                <label htmlFor="newsActive" className="font-bold text-white cursor-pointer">
                  Show on Website Ticker
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Save Flash News
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: SERVICE ADD/EDIT
      ========================================================================= */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {serviceModal.id ? 'Edit Service' : 'Add New Service'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure service details, optional government and centre fee breakdown, and customer requirements.
                </p>
              </div>
              <button onClick={() => setServiceModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const rawBreakdown = serviceModal.chargeBreakdown || [];
                  const cleanedBreakdown = rawBreakdown
                    .filter((r) => r.name.trim() !== '' || Number(r.govtFee) > 0 || Number(r.centreCharge) > 0)
                    .map((r) => ({
                      id: r.id || `chg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      name: r.name.trim() || 'Service Charge',
                      govtFee: Number(r.govtFee) || 0,
                      centreCharge: Number(r.centreCharge) || 0
                    }));

                  await saveAdminService({
                    ...serviceModal,
                    serviceCode: serviceModal.serviceCode ? serviceModal.serviceCode.trim().toUpperCase() : '',
                    chargeBreakdown: cleanedBreakdown
                  });
                  showSuccess('Service saved successfully.');
                  setServiceModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={serviceModal.category || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, category: e.target.value })}
                    placeholder="e.g. JAN SEVA / CSC SERVICES"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Service Code <span className="text-slate-500 font-normal text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={serviceModal.serviceCode || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, serviceCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. PASS-001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Starting Price</label>
                  <input
                    type="text"
                    value={serviceModal.priceStartingFrom || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, priceStartingFrom: e.target.value })}
                    placeholder="e.g. ₹50 / ₹2,980"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceModal.title || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, title: e.target.value })}
                  placeholder="e.g. Fresh New Passport – Normal"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Short Summary *</label>
                <input
                  type="text"
                  required
                  value={serviceModal.shortDescription || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Detailed Information</label>
                <textarea
                  rows={2}
                  value={serviceModal.fullDescription || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    value={serviceModal.estimatedTime || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, estimatedTime: e.target.value })}
                    placeholder="e.g. 15 Minutes / 2 Days"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Required Docs (Comma separated)</label>
                  <input
                    type="text"
                    value={(serviceModal.requiredDocuments || []).join(', ')}
                    onChange={(e) =>
                      setServiceModal({
                        ...serviceModal,
                        requiredDocuments: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      })
                    }
                    placeholder="Aadhaar Card, Photo, Marksheet"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              {/* =========================================================================
                  CHARGE BREAKDOWN SECTION (Govt Fee + Centre Charges)
              ========================================================================= */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-white text-sm">
                        Charge Breakdown
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Optional
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Itemize separate Government Fees vs. Al-Khalil Cyber Centre service charges. Leave empty if not needed.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newRow: ServiceChargeItem = {
                        id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        name: '',
                        govtFee: 0,
                        centreCharge: 0
                      };
                      setServiceModal({
                        ...serviceModal,
                        chargeBreakdown: [...(serviceModal.chargeBreakdown || []), newRow]
                      });
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Charge / Add Work</span>
                  </button>
                </div>

                {serviceModal.chargeBreakdown && serviceModal.chargeBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2">
                      <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="py-2 px-2.5 w-[38%]">Work / Charge Name</th>
                            <th className="py-2 px-2.5 w-[22%]">Government Fee (₹)</th>
                            <th className="py-2 px-2.5 w-[22%]">Centre Charge (₹)</th>
                            <th className="py-2 px-2.5 w-[18%] text-right">Total (₹)</th>
                            <th className="py-2 px-2 text-center w-[100px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {serviceModal.chargeBreakdown.map((row, idx) => {
                            const rowGovt = Number(row.govtFee) || 0;
                            const rowCentre = Number(row.centreCharge) || 0;
                            const rowTotal = rowGovt + rowCentre;

                            return (
                              <tr key={row.id || idx} className="hover:bg-slate-900/60 transition-colors">
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. Government Fee / Form Filling"
                                    value={row.name}
                                    onChange={(e) => {
                                      const updated = [...(serviceModal.chargeBreakdown || [])];
                                      updated[idx] = { ...updated[idx], name: e.target.value };
                                      setServiceModal({ ...serviceModal, chargeBreakdown: updated });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:border-emerald-500 focus:outline-hidden"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      placeholder="0"
                                      value={row.govtFee === 0 && row.name === '' ? '' : row.govtFee}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                                        const updated = [...(serviceModal.chargeBreakdown || [])];
                                        updated[idx] = { ...updated[idx], govtFee: val };
                                        setServiceModal({ ...serviceModal, chargeBreakdown: updated });
                                      }}
                                      className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-600 focus:border-emerald-500 focus:outline-hidden"
                                    />
                                  </div>
                                </td>
                                <td className="py-1.5 px-2">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs">₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      placeholder="0"
                                      value={row.centreCharge === 0 && row.name === '' ? '' : row.centreCharge}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                                        const updated = [...(serviceModal.chargeBreakdown || [])];
                                        updated[idx] = { ...updated[idx], centreCharge: val };
                                        setServiceModal({ ...serviceModal, chargeBreakdown: updated });
                                      }}
                                      className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-600 focus:border-emerald-500 focus:outline-hidden"
                                    />
                                  </div>
                                </td>
                                <td className="py-1.5 px-2.5 text-right">
                                  <span className="font-mono font-bold text-emerald-400 text-xs">
                                    ₹{rowTotal.toLocaleString('en-IN')}
                                  </span>
                                </td>
                                <td className="py-1.5 px-1 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const list = [...(serviceModal.chargeBreakdown || [])];
                                        const temp = list[idx];
                                        list[idx] = list[idx - 1];
                                        list[idx - 1] = temp;
                                        setServiceModal({ ...serviceModal, chargeBreakdown: list });
                                      }}
                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (serviceModal.chargeBreakdown?.length || 0) - 1}
                                      onClick={() => {
                                        const list = [...(serviceModal.chargeBreakdown || [])];
                                        const temp = list[idx];
                                        list[idx] = list[idx + 1];
                                        list[idx + 1] = temp;
                                        setServiceModal({ ...serviceModal, chargeBreakdown: list });
                                      }}
                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = [...(serviceModal.chargeBreakdown || [])];
                                        list.splice(idx, 1);
                                        setServiceModal({ ...serviceModal, chargeBreakdown: list });
                                      }}
                                      className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 cursor-pointer"
                                      title="Delete Row"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Calculated Totals at Bottom */}
                    {(() => {
                      const rows = serviceModal.chargeBreakdown || [];
                      const gTotal = rows.reduce((s, r) => s + (Number(r.govtFee) || 0), 0);
                      const cTotal = rows.reduce((s, r) => s + (Number(r.centreCharge) || 0), 0);
                      const grand = gTotal + cTotal;

                      return (
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                            <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-800/60 flex flex-col">
                              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                                Government Fee Total
                              </span>
                              <span className="text-lg font-black font-mono text-blue-200 mt-0.5">
                                ₹{gTotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-800/60 flex flex-col">
                              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                                Centre Charge Total
                              </span>
                              <span className="text-lg font-black font-mono text-indigo-200 mt-0.5">
                                ₹{cTotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/70 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                                  Grand Total
                                </span>
                                <span className="text-lg font-black font-mono text-emerald-300 block mt-0.5">
                                  ₹{grand.toLocaleString('en-IN')}
                                </span>
                              </div>
                              {grand > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setServiceModal({
                                      ...serviceModal,
                                      priceStartingFrom: `₹${grand.toLocaleString('en-IN')}`
                                    });
                                  }}
                                  className="mt-1 text-[10px] font-bold text-emerald-300 hover:text-white underline cursor-pointer text-left"
                                >
                                  Apply as Starting Price (₹{grand.toLocaleString('en-IN')})
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center">
                    <p className="text-xs text-slate-500">
                      No breakdown rows added yet. Click "+ Add Charge / Add Work" to add itemized government fees and centre charges.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceModal.isPopular || false}
                    onChange={(e) => setServiceModal({ ...serviceModal, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span className="font-bold text-white">Show in Highlights (Popular)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceModal.active !== false}
                    onChange={(e) => setServiceModal({ ...serviceModal, active: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span className="font-bold text-white">Active</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer text-sm"
              >
                Save Service
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: RATE ADD/EDIT
      ========================================================================= */}
      {rateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {rateModal.id ? 'Edit Rate Item' : 'Add Rate Item'}
              </h3>
              <button onClick={() => setRateModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminRate(rateModal);
                  showSuccess('Rate item saved.');
                  setRateModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={rateModal.category || ''}
                  onChange={(e) => setRateModal({ ...rateModal, category: e.target.value })}
                  placeholder="e.g. Printing & Xerox, Smart Cards & IDs"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Service / Product Name *</label>
                <input
                  type="text"
                  required
                  value={rateModal.serviceName || ''}
                  onChange={(e) => setRateModal({ ...rateModal, serviceName: e.target.value })}
                  placeholder="e.g. Color Print A4"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Price / Rate *</label>
                  <input
                    type="text"
                    required
                    value={rateModal.price || ''}
                    onChange={(e) => setRateModal({ ...rateModal, price: e.target.value })}
                    placeholder="e.g. ₹5 / ₹50"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Unit / Basis *</label>
                  <input
                    type="text"
                    required
                    value={rateModal.unit || ''}
                    onChange={(e) => setRateModal({ ...rateModal, unit: e.target.value })}
                    placeholder="per page / per card"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Notes / Specifications</label>
                <input
                  type="text"
                  value={rateModal.notes || ''}
                  onChange={(e) => setRateModal({ ...rateModal, notes: e.target.value })}
                  placeholder="e.g. 75 GSM paper / waterproof"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Save Rate Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: WORK JOB ADD/EDIT
      ========================================================================= */}
      {jobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {jobModal.id ? `Update Work Order (${jobModal.trackingCode})` : 'Create Work Order Token'}
              </h3>
              <button onClick={() => setJobModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminJob(jobModal);
                  showSuccess('Work order updated successfully.');
                  setJobModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tracking Token Code *</label>
                  <input
                    type="text"
                    required
                    value={jobModal.trackingCode || ''}
                    onChange={(e) => setJobModal({ ...jobModal, trackingCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sky-400 font-mono font-bold text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Status *</label>
                  <select
                    value={jobModal.status || 'Received'}
                    onChange={(e) => setJobModal({ ...jobModal, status: e.target.value as JobStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="Received">Received</option>
                    <option value="Processing">Processing</option>
                    <option value="Pending">Pending</option>
                    <option value="Ready">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={jobModal.customerName || ''}
                    onChange={(e) => setJobModal({ ...jobModal, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Customer Mobile</label>
                  <input
                    type="tel"
                    value={jobModal.customerMobile || ''}
                    onChange={(e) => setJobModal({ ...jobModal, customerMobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Auto-fill from Services Catalog <span className="text-slate-500 font-normal text-[10px]">(Optional)</span>
                </label>
                <select
                  onChange={(e) => {
                    const srv = services.find((s) => s.id === e.target.value);
                    if (srv) {
                      const rows = srv.chargeBreakdown || [];
                      const gTotal = rows.reduce((s, r) => s + (Number(r.govtFee) || 0), 0);
                      const cTotal = rows.reduce((s, r) => s + (Number(r.centreCharge) || 0), 0);
                      const grand = gTotal + cTotal;

                      setJobModal({
                        ...jobModal,
                        serviceName: srv.title,
                        serviceCode: srv.serviceCode || '',
                        serviceId: srv.id,
                        govtFee: rows.length > 0 ? gTotal : undefined,
                        centreCharges: rows.length > 0 ? cTotal : undefined,
                        chargeBreakdown: rows.length > 0 ? [...rows] : undefined,
                        priceTotal: rows.length > 0 && grand > 0 ? `₹${grand.toLocaleString('en-IN')}` : srv.priceStartingFrom || jobModal.priceTotal
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="">-- Choose a service to auto-fill details & breakdown --</option>
                  {services.filter((s) => s.active).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceCode ? `[${s.serviceCode}] ` : ''}{s.title} ({s.priceStartingFrom || 'Standard'})
                      {s.chargeBreakdown && s.chargeBreakdown.length > 0 ? ' [With Breakdown]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Service / Task Name *</label>
                <input
                  type="text"
                  required
                  value={jobModal.serviceName || ''}
                  onChange={(e) => setJobModal({ ...jobModal, serviceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

              {/* Breakdown Preview if available */}
              {(jobModal.govtFee !== undefined || (jobModal.chargeBreakdown && jobModal.chargeBreakdown.length > 0)) && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Government Fee:</span>
                    <span className="text-blue-300 font-mono">₹{Number(jobModal.govtFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Centre Charges:</span>
                    <span className="text-indigo-300 font-mono">₹{Number(jobModal.centreCharges || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-black border-t border-slate-800 pt-1 text-white">
                    <span>Total Bill:</span>
                    <span className="text-emerald-400 font-mono">{jobModal.priceTotal}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Remarks (Visible to Customer) *</label>
                <textarea
                  rows={2}
                  required
                  value={jobModal.statusNotes || ''}
                  onChange={(e) => setJobModal({ ...jobModal, statusNotes: e.target.value })}
                  placeholder="e.g., PVC card printed. Ready for pickup at counter."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Est. Delivery</label>
                  <input
                    type="text"
                    value={jobModal.estimatedDelivery || ''}
                    onChange={(e) => setJobModal({ ...jobModal, estimatedDelivery: e.target.value })}
                    placeholder="e.g. Today 5 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Total Bill</label>
                  <input
                    type="text"
                    value={jobModal.priceTotal || ''}
                    onChange={(e) => setJobModal({ ...jobModal, priceTotal: e.target.value })}
                    placeholder="₹150"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Paid Status</label>
                  <input
                    type="text"
                    value={jobModal.amountPaid || ''}
                    onChange={(e) => setJobModal({ ...jobModal, amountPaid: e.target.value })}
                    placeholder="Full Paid / ₹50 Adv"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {jobModal.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirm({
                        id: jobModal.id!,
                        title: jobModal.trackingCode || 'Job Record',
                        subtitle: `${jobModal.customerName || ''} • ${jobModal.serviceName || ''}`,
                        type: 'job'
                      });
                    }}
                    className="px-4 py-3 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Save Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: OFFICIAL INVOICE / BILL SLIP (Print & WhatsApp)
      ========================================================================= */}
      {selectedJobInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    Official Work Slip / Bill
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    AL-KHALIL CYBER CENTRE • Token #{selectedJobInvoice.trackingCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJobInvoice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Area */}
            <div id="printable-receipt" className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
              {/* Receipt Top Header */}
              <div className="text-center border-b border-slate-800 pb-3">
                <h4 className="text-base font-black text-white uppercase tracking-wider">
                  {siteInfo.brandName || 'AL-KHALIL CYBER CENTRE'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {siteInfo.address || 'Opp. Block Office, Main Road'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Mob: {siteInfo.phone} • WhatsApp: {siteInfo.whatsapp}
                </p>
              </div>

              {/* Customer & Token Meta */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold block">CUSTOMER NAME</span>
                  <strong className="text-white text-xs block mt-0.5">{selectedJobInvoice.customerName}</strong>
                  {selectedJobInvoice.customerMobile && (
                    <span className="text-slate-400 font-mono mt-0.5 block">Mob: {selectedJobInvoice.customerMobile}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold block">TOKEN / SLIP NO.</span>
                  <span className="text-indigo-400 font-mono font-black text-xs block mt-0.5">
                    {selectedJobInvoice.trackingCode}
                  </span>
                  <span className="text-slate-400 text-[10px] mt-0.5 block">
                    Date: {new Date(selectedJobInvoice.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">SERVICE / WORK</span>
                <div className="flex items-center justify-between mt-0.5">
                  <h5 className="text-sm font-black text-white uppercase">
                    {selectedJobInvoice.serviceName}
                  </h5>
                  {selectedJobInvoice.serviceCode && (
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {selectedJobInvoice.serviceCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Charge Breakdown Table if present */}
              {selectedJobInvoice.chargeBreakdown && selectedJobInvoice.chargeBreakdown.length > 0 ? (
                <div className="space-y-2 pb-3 border-b border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    CHARGE BREAKDOWN
                  </span>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold">
                        <th className="py-1">Work / Charge</th>
                        <th className="py-1 text-right">Govt Fee</th>
                        <th className="py-1 text-right">Centre Fee</th>
                        <th className="py-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {selectedJobInvoice.chargeBreakdown.map((item, idx) => {
                        const g = Number(item.govtFee) || 0;
                        const c = Number(item.centreCharge) || 0;
                        return (
                          <tr key={idx} className="text-slate-300">
                            <td className="py-1.5">{item.name}</td>
                            <td className="py-1.5 text-right font-mono">₹{g.toLocaleString('en-IN')}</td>
                            <td className="py-1.5 text-right font-mono">₹{c.toLocaleString('en-IN')}</td>
                            <td className="py-1.5 text-right font-mono font-bold text-white">
                              ₹{(g + c).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400 font-medium">
                      <span>Government Fee Total:</span>
                      <span className="font-mono text-blue-300">
                        ₹{Number(selectedJobInvoice.govtFee || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-medium">
                      <span>Centre Service Charges:</span>
                      <span className="font-mono text-indigo-300">
                        ₹{Number(selectedJobInvoice.centreCharges || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Total & Status Row */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-sm font-black text-white">
                  <span>Grand Total Bill:</span>
                  <span className="text-emerald-400 font-mono text-base">
                    {selectedJobInvoice.priceTotal || '₹0'}
                  </span>
                </div>
                {selectedJobInvoice.amountPaid && (
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Payment Status:</span>
                    <span className="font-bold text-emerald-300">{selectedJobInvoice.amountPaid}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Work Status:</span>
                  <span className="font-bold uppercase text-indigo-300">{selectedJobInvoice.status}</span>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="text-center pt-2 text-[10px] text-slate-500 border-t border-slate-900">
                Track your service status 24x7 online with your token #{selectedJobInvoice.trackingCode}.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill Slip</span>
              </button>

              <a
                href={`https://wa.me/91${(selectedJobInvoice.customerMobile || siteInfo.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(
                  `*AL-KHALIL CYBER CENTRE - WORK SLIP*\n\nToken: ${selectedJobInvoice.trackingCode}\nCustomer: ${selectedJobInvoice.customerName}\nService: ${selectedJobInvoice.serviceName}${
                    selectedJobInvoice.govtFee !== undefined ? `\nGovt Fee: ₹${selectedJobInvoice.govtFee}` : ''
                  }${
                    selectedJobInvoice.centreCharges !== undefined ? `\nCentre Charge: ₹${selectedJobInvoice.centreCharges}` : ''
                  }\nTotal Bill: ${selectedJobInvoice.priceTotal || 'N/A'}\nStatus: ${selectedJobInvoice.status}\n\nTrack your work status online at our website.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: CERTIFICATE ADD / EDIT
      ========================================================================= */}
      {certModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{certModal.id ? 'Edit Certificate' : 'Add Government Certificate / License'}</span>
              </h3>
              <button onClick={() => setCertModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminCertificate(certModal);
                  showSuccess('Certificate saved successfully.');
                  setCertModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Certificate Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={certModal.title || ''}
                    onChange={(e) => setCertModal({ ...certModal, title: e.target.value })}
                    placeholder="e.g. CSC E-Governance VLE Certificate"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Title in Hindi</label>
                  <input
                    type="text"
                    value={certModal.titleHindi || ''}
                    onChange={(e) => setCertModal({ ...certModal, titleHindi: e.target.value })}
                    placeholder="e.g. सीएससी प्राधिकृत केंद्र प्रमाण पत्र"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Issuing Department / Authority *</label>
                  <input
                    type="text"
                    required
                    value={certModal.issuingAuthority || ''}
                    onChange={(e) => setCertModal({ ...certModal, issuingAuthority: e.target.value })}
                    placeholder="e.g. Ministry of Electronics & IT, CSC SPV"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Reg / License / VLE ID Number *</label>
                  <input
                    type="text"
                    required
                    value={certModal.registrationNumber || ''}
                    onChange={(e) => setCertModal({ ...certModal, registrationNumber: e.target.value })}
                    placeholder="e.g. VLE-UP-9259837361"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Certificate Image Upload / URL */}
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <label className="block font-bold text-slate-300">Certificate Image / Proof Document</label>
                
                {certModal.imageUrl && (
                  <div className="h-32 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
                    <img src={certModal.imageUrl} alt="Certificate Proof" className="max-h-full max-w-full object-contain" />
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={certModal.imageUrl || ''}
                    onChange={(e) => setCertModal({ ...certModal, imageUrl: e.target.value })}
                    placeholder="Image URL or upload file..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold flex items-center gap-1.5 cursor-pointer shrink-0 border border-slate-700">
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingCert ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCert}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const url = await uploadCertificateImage(e.target.files[0]);
                            setCertModal({ ...certModal, imageUrl: url });
                          } catch (err: any) {
                            setActionError(err.message);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={certModal.issueDate || ''}
                    onChange={(e) => setCertModal({ ...certModal, issueDate: e.target.value })}
                    placeholder="e.g. 15 Jan 2021"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Expiry / Validity</label>
                  <input
                    type="text"
                    value={certModal.expiryDate || ''}
                    onChange={(e) => setCertModal({ ...certModal, expiryDate: e.target.value })}
                    placeholder="e.g. Lifetime / 2028"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={certModal.order ?? 1}
                    onChange={(e) => setCertModal({ ...certModal, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description / Authorized Scope</label>
                <textarea
                  rows={2}
                  value={certModal.description || ''}
                  onChange={(e) => setCertModal({ ...certModal, description: e.target.value })}
                  placeholder="e.g. Authorized to provide Digital Seva, Aadhaar, PAN, Banking & G2C Services."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="certActiveModal"
                  checked={certModal.active !== false}
                  onChange={(e) => setCertModal({ ...certModal, active: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="certActiveModal" className="font-bold text-slate-200 cursor-pointer">
                  Display Certificate Publicly on Official Website
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md cursor-pointer mt-2"
              >
                Save Certificate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          LIGHTBOX MODAL: FULL CERTIFICATE PROOF VIEWER
      ========================================================================= */}
      {previewCert && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-3xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{previewCert.title}</h3>
                <p className="text-xs text-amber-400 font-mono">Reg ID: {previewCert.registrationNumber}</p>
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-slate-950 rounded-2xl p-4">
              <img
                src={previewCert.imageUrl}
                alt={previewCert.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Authority: {previewCert.issuingAuthority}</span>
              {previewCert.issueDate && <span>Issued: {previewCert.issueDate}</span>}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL: SAFE PERMANENT DELETION (NO IFRAME BLOCKING)
      ========================================================================= */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !loading && setDeleteConfirm(null)}
        >
          <div
            className="bg-slate-900 border border-rose-900/60 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-950 text-rose-400 border border-rose-800 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Confirm Record Deletion</h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to delete{' '}
                  <span className="text-white font-bold font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                    {deleteConfirm.title}
                  </span>
                  ?
                </p>
                {deleteConfirm.subtitle && (
                  <p className="text-[11px] text-slate-400 font-medium">{deleteConfirm.subtitle}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-rose-300/90 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>This record will be permanently removed from your database.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={executeDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
