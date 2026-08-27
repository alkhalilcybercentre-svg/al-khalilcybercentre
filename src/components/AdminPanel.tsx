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
  FileCheck,
  Palette,
  Share2,
  Building2
} from 'lucide-react';
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
  DashboardStats,
  JobStatus
} from '../types';
import {
  adminLogin,
  verifyAdminAuth,
  adminLogout,
  adminChangePin,
  fetchAdminStats,
  fetchAdminBanners,
  saveAdminBanner,
  deleteAdminBanner,
  uploadBannerImage,
  fetchAdminNews,
  saveAdminNews,
  deleteAdminNews,
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
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [rates, setRates] = useState<RateItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [jobs, setJobs] = useState<WorkJob[]>([]);
  const [documents, setDocuments] = useState<UploadedDocumentRecord[]>([]);
  const [businessSettings, setBusinessSettings] = useState<SiteInfo>(siteInfo);

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
  const [serviceModal, setServiceModal] = useState<Partial<ServiceItem> | null>(null);
  const [rateModal, setRateModal] = useState<Partial<RateItem> | null>(null);
  const [certModal, setCertModal] = useState<Partial<CertificateItem> | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
  const [jobModal, setJobModal] = useState<Partial<WorkJob> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
    subtitle?: string;
    type: 'job' | 'banner' | 'news' | 'service' | 'rate' | 'cert' | 'doc';
  } | null>(null);

  // Filter & Search states
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('ALL');
  const [docSearch, setDocSearch] = useState('');
  const [certSearch, setCertSearch] = useState('');

  // Security PIN states
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeLoading, setPinChangeLoading] = useState(false);

  // Check Auth on Mount
  useEffect(() => {
    const check = async () => {
      const auth = await verifyAdminAuth();
      setIsAuthenticated(auth);
      if (auth) {
        loadAllData();
      }
    };
    check();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        bannersData,
        newsData,
        servicesData,
        ratesData,
        certsData,
        jobsData,
        docsData,
        settingsData
      ] = await Promise.all([
        fetchAdminStats(),
        fetchAdminBanners(),
        fetchAdminNews(),
        fetchAdminServices(),
        fetchAdminRates(),
        fetchAdminCertificates(),
        fetchAdminJobs(),
        fetchAdminDocuments(),
        fetchAdminSettings()
      ]);

      setStats(statsData);
      setBanners(bannersData);
      setNews(newsData);
      setServices(servicesData);
      setRates(ratesData);
      setCertificates(certsData);
      setJobs(jobsData);
      setDocuments(docsData);
      if (settingsData) {
        setBusinessSettings(settingsData);
      }
    } catch (e: any) {
      console.error('Failed to load admin data', e);
      if (e.message && e.message.includes('Session expired')) {
        setIsAuthenticated(false);
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
    if (!pinInput.trim()) {
      setLoginError('Please enter your 6-digit Admin PIN.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    try {
      await adminLogin(pinInput.trim());
      setIsAuthenticated(true);
      setPinInput('');
      loadAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Incorrect PIN.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
  };

  // PIN Change Handler (6 to 12 digits)
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinRegex = /^\d{6,12}$/;
    if (!pinRegex.test(newPin)) {
      setActionError('New PIN must be between 6 and 12 digits (numbers only).');
      return;
    }
    if (newPin !== confirmPin) {
      setActionError('New PIN and Confirm PIN do not match.');
      return;
    }

    setPinChangeLoading(true);
    setActionError(null);
    try {
      await adminChangePin(currentPin, newPin);
      showSuccess('Admin PIN changed successfully. Remember your new PIN!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to change PIN.');
    } finally {
      setPinChangeLoading(false);
    }
  };

  // Comprehensive Settings Save Handler
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

  // =========================================================================
  // LOGIN SCREEN
  // =========================================================================
  if (isAuthenticated === false || isAuthenticated === null) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl text-white relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-700 flex items-center justify-center mx-auto text-white shadow-lg shadow-sky-900/40">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-400">
              AL KHALIL CYBER CENTRE Official Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Enter 6-Digit Admin PIN
              </label>
              <input
                type="password"
                autoFocus
                maxLength={10}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                placeholder="Default: 595213"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xl tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal"
              />
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Default authorized PIN: <span className="font-mono text-sky-400 font-bold">595213</span> (Can be changed inside)
              </p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
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

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                ← Return to Public Website
              </button>
            </div>
          </form>
        </div>
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
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
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
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certificate</span>
                  </button>
                </div>
              </div>

              {/* Metric Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
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
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Certificates</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
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

                <div
                  onClick={() => setActiveTab('rates')}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] text-slate-400 uppercase font-bold block">Rate Items</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">
                    {rates.length}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Price Chart</span>
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
                      title: '',
                      shortDescription: '',
                      fullDescription: '',
                      requiredDocuments: ['Aadhaar Card'],
                      estimatedTime: 'Same Day',
                      priceStartingFrom: '₹50',
                      isPopular: true,
                      active: true,
                      order: services.length + 1
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
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-900">
                          {srv.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {srv.priceStartingFrom}
                        </span>
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
                          onClick={() => setServiceModal(srv)}
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
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Security & PIN Management
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Change the secure Admin PIN used to unlock this management portal.
                </p>
              </div>

              <form onSubmit={handleChangePin} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Current PIN *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN (e.g. 595213)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    New PIN (Minimum 6 digits/characters) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new 6+ digit PIN"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New PIN *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Re-enter new PIN"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-widest"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Hash Protection</span>
                  </div>
                  <p>
                    Your PIN is hashed using 10-round salted bcrypt encryption and never stored in plaintext.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={pinChangeLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {pinChangeLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating PIN...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Update Admin PIN</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {serviceModal.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setServiceModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveAdminService(serviceModal);
                  showSuccess('Service saved successfully.');
                  setServiceModal(null);
                  loadAllData();
                } catch (err: any) {
                  setActionError(err.message);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={serviceModal.category || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, category: e.target.value })}
                    placeholder="e.g. JAN SEVA / CSC SERVICES"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Starting Price</label>
                  <input
                    type="text"
                    value={serviceModal.priceStartingFrom || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, priceStartingFrom: e.target.value })}
                    placeholder="e.g. ₹50 / ₹8 per card"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Detailed Information</label>
                <textarea
                  rows={3}
                  value={serviceModal.fullDescription || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    value={serviceModal.estimatedTime || ''}
                    onChange={(e) => setServiceModal({ ...serviceModal, estimatedTime: e.target.value })}
                    placeholder="e.g. 15 Minutes / 2 Days"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
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
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
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
                <label className="block font-bold text-slate-300 mb-1">Service / Task Name *</label>
                <input
                  type="text"
                  required
                  value={jobModal.serviceName || ''}
                  onChange={(e) => setJobModal({ ...jobModal, serviceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>

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
