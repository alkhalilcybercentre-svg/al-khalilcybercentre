import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  Search,
  Clapperboard,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Mic,
  Film,
  CheckCircle2
} from 'lucide-react';
import { SiteInfo } from '../types';
import { AiVoiceConverterModal } from './ai/AiVoiceConverterModal';
import { AiSearchAssistantModal } from './ai/AiSearchAssistantModal';
import { AiImageToVideoModal } from './ai/AiImageToVideoModal';
import { AiTranscriptionModal } from './ai/AiTranscriptionModal';

interface Props {
  siteInfo: SiteInfo;
}

export const AiToolsSection: React.FC<Props> = ({ siteInfo }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const tools = [
    {
      id: 'voice-converter',
      title: 'AI Voice Converter',
      titleHi: 'आवाज कन्वर्टर',
      badge: 'Google AI Speech',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      icon: Volume2,
      iconBg: 'bg-indigo-600/30 text-indigo-400 border-indigo-400/30',
      description:
        'Transform your recorded voice or audio files into studio-quality Google AI character voices (Kore, Puck, Charon, Fenrir, Zephyr).',
      highlights: [
        'Upload audio or record live with microphone',
        'Multiple male & female Google neural voices',
        'Instant MP3 preview & high-quality download'
      ],
      model: 'gemini-3.1-flash-tts-preview',
      buttonText: 'Open Voice Converter / शुरू करें',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-500'
    },
    {
      id: 'search-assistant',
      title: 'Govt Scheme Search Assistant',
      titleHi: 'सरकारी सेवा सर्च असिस्टेंट',
      badge: 'Google Search Grounded',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      icon: Search,
      iconBg: 'bg-blue-600/30 text-blue-400 border-blue-400/30',
      description:
        'Get verified, real-time answers on PAN Card, Aadhaar updates, UP Scholarships, Voter ID, driving licenses, and CSC Jan Seva procedures.',
      highlights: [
        'Grounded with live Google Search data',
        'Bilingual assistance in Hindi, Hinglish & English',
        'Direct links to official government portals'
      ],
      model: 'gemini-3.5-flash',
      buttonText: 'Ask Search Assistant / सर्च करें',
      buttonBg: 'bg-blue-600 hover:bg-blue-500'
    },
    {
      id: 'image-to-video',
      title: 'Image to Video Animation',
      titleHi: 'पोस्टर व फोटो से वीडियो',
      badge: 'Google Veo',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      icon: Clapperboard,
      iconBg: 'bg-purple-600/30 text-purple-400 border-purple-400/30',
      description:
        'Bring business posters, wedding photos, and promotional banners to life with cinematic camera motion powered by Google Veo.',
      highlights: [
        '16:9 Landscape & 9:16 Portrait (Reel) formats',
        'Customizable motion direction & cinematic prompts',
        'High-definition MP4 download & playback'
      ],
      model: 'veo-3.1-fast-generate-preview',
      buttonText: 'Animate Image / वीडियो बनाएं',
      buttonBg: 'bg-purple-600 hover:bg-purple-500'
    },
    {
      id: 'transcription',
      title: 'Audio to Text Transcription',
      titleHi: 'आवाज से टेक्स्ट ट्रांसक्रिप्शन',
      badge: 'gemini-3.5-transcribe',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      icon: FileText,
      iconBg: 'bg-emerald-600/30 text-emerald-400 border-emerald-400/30',
      description:
        'Convert any voice recording, meeting audio, or speech note into clean, accurate text with native Devanagari Hindi and English accuracy.',
      highlights: [
        'Live microphone speech or audio file upload',
        'High accuracy across Hindi, English & Hinglish',
        'One-click clipboard copy & .txt file export'
      ],
      model: 'gemini-3.5-transcribe',
      buttonText: 'Transcribe Audio / टेक्स्ट में बदलें',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500'
    }
  ];

  return (
    <section id="ai-tools" className="py-16 sm:py-20 bg-slate-900/90 relative overflow-hidden border-t border-b border-slate-800">
      {/* Background Lighting Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Google AI Powered Suite • आधुनिक एआई टूल्स</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            AL KHALIL <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400">AI TOOLS</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            Harness official Google AI intelligence for neural voice conversion, real-time government scheme verification, cinematic video animation, and speech transcription.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative"
              >
                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${tool.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-black uppercase tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                    {tool.title}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 block mb-3">
                    {tool.titleHi}
                  </span>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {/* Highlights checklist */}
                  <ul className="space-y-2 mb-6 pt-3 border-t border-slate-800/80">
                    {tool.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(tool.id)}
                    className={`w-full py-3 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${tool.buttonBg}`}
                  >
                    <span>{tool.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-[9px] text-slate-600 font-mono text-center block mt-2">
                    Engine: {tool.model}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Modals */}
      <AiVoiceConverterModal
        isOpen={activeModal === 'voice-converter'}
        onClose={() => setActiveModal(null)}
      />

      <AiSearchAssistantModal
        isOpen={activeModal === 'search-assistant'}
        onClose={() => setActiveModal(null)}
        phone={siteInfo.phone}
        whatsapp={siteInfo.whatsapp}
      />

      <AiImageToVideoModal
        isOpen={activeModal === 'image-to-video'}
        onClose={() => setActiveModal(null)}
      />

      <AiTranscriptionModal
        isOpen={activeModal === 'transcription'}
        onClose={() => setActiveModal(null)}
      />
    </section>
  );
};
