import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  ExternalLink,
  Eye,
  CheckCircle2,
  Calendar,
  Building2,
  X,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { CertificateItem, SiteInfo } from '../types';
import { fetchCertificates } from '../lib/api';

interface CertificatesSectionProps {
  siteInfo: SiteInfo;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({ siteInfo }) => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    const loadCerts = async () => {
      try {
        const list = await fetchCertificates();
        setCertificates(list);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCerts();
  }, []);

  // If there are no certificates and not loading, we can show default official credentials
  return (
    <section id="certificates" className="py-20 bg-slate-900/90 border-t border-slate-800 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Government & Industry Certified</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
            Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">Certificates</span> & Authorizations
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
            {siteInfo.businessName} is fully licensed and authorized by official central & state portals, banking partners, and e-governance agencies to deliver safe, transparent, and legally verified digital services.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-800/40 rounded-2xl p-6 border border-slate-800 animate-pulse h-80 flex flex-col justify-between">
                <div className="h-44 bg-slate-700/50 rounded-xl mb-4" />
                <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-700/30 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                id={`cert-card-${cert.id}`}
                className="group bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-2xl border border-slate-700/60 hover:border-indigo-500/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Certificate Image Banner */}
                <div className="relative aspect-[16/10] bg-slate-950/80 overflow-hidden cursor-pointer" onClick={() => setSelectedCert(cert)}>
                  <img
                    src={cert.imageUrl}
                    alt={cert.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback placeholder if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                      <Eye className="w-4 h-4" /> View Certificate
                    </span>
                  </div>

                  {/* Issuing Authority Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-md">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate max-w-[180px]">{cert.issuingAuthority || 'Govt. Authorized'}</span>
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
                        {cert.name}
                      </h3>
                    </div>

                    {cert.nameHindi && (
                      <p className="text-xs font-semibold text-indigo-300/90 mb-3">
                        {cert.nameHindi}
                      </p>
                    )}

                    {cert.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                        {cert.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-auto">
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-4">
                      {cert.regNumber && (
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Cert / Reg No:</span>
                          <span className="font-mono font-bold text-slate-200 truncate block">{cert.regNumber}</span>
                        </div>
                      )}
                      {cert.issueDate && (
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Issued On:</span>
                          <span className="font-bold text-slate-200 block">{cert.issueDate}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 border border-slate-700 hover:border-indigo-500 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect Official Proof</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Guarantee Banner */}
        <div className="mt-16 bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4 text-left">
            <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex-shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white uppercase tracking-wide">
                Need to verify our credentials with authority portals?
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                You can visit our center at {siteInfo.address}, {siteInfo.cityState} or request official registration verification on WhatsApp.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/91${siteInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20AL%20KHALIL%20CYBER%20CENTRE,%20I%20would%20like%20to%20verify%20your%20authorized%20credentials.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Lightbox / Modal for Full Certificate View */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {selectedCert.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedCert.issuingAuthority} • Reg: {selectedCert.regNumber || 'Verified Official'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Certificate Preview */}
            <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col items-center justify-center bg-slate-950/40">
              <img
                src={selectedCert.imageUrl}
                alt={selectedCert.name}
                className="max-w-full max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
                referrerPolicy="no-referrer"
              />

              <div className="w-full mt-6 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <p className="font-medium">{selectedCert.description}</p>
                <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Authority:</span>
                    <span className="font-bold text-white">{selectedCert.issuingAuthority}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Reg Number:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedCert.regNumber || 'Govt Verified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Issue Date:</span>
                    <span className="font-bold text-white">{selectedCert.issueDate || 'Active'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold">Status:</span>
                    <span className="font-black text-emerald-400 uppercase">100% Authorized</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
              <a
                href={selectedCert.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open Full Image
              </a>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
