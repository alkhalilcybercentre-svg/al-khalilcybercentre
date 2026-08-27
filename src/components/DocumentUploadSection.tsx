import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Shield,
  FileCheck,
  Copy,
  Check,
  MessageCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { SiteInfo } from '../types';
import { uploadCustomerDocument } from '../lib/api';

interface DocumentUploadSectionProps {
  siteInfo: SiteInfo;
  onNavigateToTrack?: (token: string) => void;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  siteInfo,
  onNavigateToTrack
}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [service, setService] = useState('Aadhaar / PAN Card Service');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToken, setSuccessToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB

  const handleFileChange = (selectedFile: File | null) => {
    setError(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only JPG, PNG, WEBP, and PDF documents are allowed.');
      setFile(null);
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError('File size exceeds the 25MB limit. Please upload a smaller file.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setError('Please provide your Full Name and Mobile Number.');
      return;
    }

    if (!file) {
      setError('Please select or drop a document to upload.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('customerName', name.trim());
      fd.append('customerMobile', mobile.trim());
      fd.append('serviceRequested', service);
      fd.append('note', note.trim());
      fd.append('document', file);

      const res = await uploadCustomerDocument(fd);
      setSuccessToken(res.trackingCode);

      // Reset form
      setName('');
      setMobile('');
      setNote('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit document. Please try again or WhatsApp us.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTokenToClipboard = () => {
    if (successToken) {
      navigator.clipboard.writeText(successToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section id="upload-docs" className="py-16 sm:py-20 bg-slate-900 border-b border-slate-800 text-slate-100 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>FAST & SECURE SUBMISSION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Send Documents to Centre
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Need an online form filled or high-speed printing? Submit your documents directly. You will receive an instant tracking token.
          </p>
        </div>

        {/* Success Modal / Card */}
        {successToken ? (
          <div className="bg-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl border border-emerald-500/40 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Documents Submitted Successfully!
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
                Our operator at AL KHALIL CYBER CENTRE has received your file. Here is your official work tracking token:
              </p>
            </div>

            {/* Token Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-950 text-white font-mono text-xl sm:text-2xl font-black tracking-widest shadow-xl border border-slate-700">
              <span className="text-indigo-400">{successToken}</span>
              <button
                type="button"
                onClick={copyTokenToClipboard}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy Token"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20just%20uploaded%20my%20documents%20with%20Token%20${successToken}.%20Please%20check.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Notify Operator on WhatsApp</span>
              </a>

              {onNavigateToTrack && (
                <button
                  type="button"
                  onClick={() => {
                    const t = successToken;
                    setSuccessToken(null);
                    onNavigateToTrack(t);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
                >
                  <span>Track Status Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSuccessToken(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-700 font-bold text-xs uppercase tracking-wider"
              >
                Submit Another Document
              </button>
            </div>
          </div>
        ) : (
          /* Form Card */
          <div className="bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-bold">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Mohammad Imran / Rajesh Kumar"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium transition-all placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                    Mobile Number (For WhatsApp / SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g., 98XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Service / Purpose Required
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                >
                  <option value="Aadhaar / PAN Card Service">Aadhaar / PAN Card Service</option>
                  <option value="Online Govt Job / Exam Form">Online Govt Job / Exam Form</option>
                  <option value="Document Printing & Xerox">Document Printing & Xerox (B&W / Color)</option>
                  <option value="Wedding / Invitation Card Design">Wedding / Invitation Card Design</option>
                  <option value="Flex Banner / Poster Printing">Flex Banner / Poster Printing</option>
                  <option value="Ayushman / Pension Scheme">Ayushman / Pension Scheme</option>
                  <option value="4K Photography & Drone Booking">4K Photography & Drone Booking</option>
                  <option value="Resume / CV & Bio-data">Resume / CV & Bio-data</option>
                  <option value="Other Digital Service">Other Digital Service</option>
                </select>
              </div>

              {/* Drag & Drop File Upload Area */}
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Upload Document / Image (PDF, JPG, PNG, WEBP) *
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-indigo-400 bg-indigo-950/40'
                      : file
                      ? 'border-emerald-400 bg-emerald-950/30'
                      : 'border-slate-700 hover:border-indigo-500 bg-slate-900/80 hover:bg-slate-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {file ? (
                    <div className="flex items-center justify-between gap-3 max-w-md mx-auto bg-slate-950 p-3.5 rounded-xl border border-emerald-500/40 shadow-sm">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                        <div className="text-left truncate">
                          <p className="text-sm font-bold text-white truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/50"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto animate-bounce" />
                      <p className="text-sm font-black uppercase tracking-wider text-white">
                        Click to browse or Drag & Drop your document here
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        Supported: JPG, PNG, WEBP, PDF (Max size: 25MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Note / Remarks */}
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Special Instructions / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Mention any specific requirements (e.g. 2 color copies, urgent delivery, Hindi typing, etc.)..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Privacy Notice */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Privacy Guaranteed:</strong> Customer documents are stored encrypted in a private server sandbox and accessible strictly by authorized AL KHALIL CYBER CENTRE personnel.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 border border-indigo-400/30"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading Documents Securely...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Documents & Get Tracking ID</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
