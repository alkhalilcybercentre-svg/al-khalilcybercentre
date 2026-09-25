import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  MapPin,
  FileText,
  Search,
  ExternalLink,
  Phone,
  Trash2,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BotFAQItem, ChatbotConfig, WorkJob } from '../types';
import { fetchChatbotConfig, fetchChatbotFAQs, sendChatMessage } from '../lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedFAQ?: BotFAQItem;
  suggestedQuestions?: string[];
  actionUrl?: string;
  actionText?: string;
  isLiveJobLookup?: boolean;
  jobData?: WorkJob;
}

const STORAGE_KEY = 'alkhalil_chat_history_v2';
const SOUND_KEY = 'alkhalil_chat_sound_enabled';
const TEASER_DISMISSED_KEY = 'alkhalil_chat_teaser_dismissed';

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [faqs, setFaqs] = useState<BotFAQItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Play gentle notification sound using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Ignore audio failure if restricted by browser policy
    }
  };

  // Load config, FAQs & cached messages
  useEffect(() => {
    const loadData = async () => {
      try {
        const [botCfg, faqList] = await Promise.all([
          fetchChatbotConfig().catch(() => null),
          fetchChatbotFAQs().catch(() => [])
        ]);

        if (botCfg) setConfig(botCfg);
        if (faqList) setFaqs(faqList);

        // Sound pref
        const savedSound = localStorage.getItem(SOUND_KEY);
        if (savedSound !== null) {
          setSoundEnabled(savedSound === 'true');
        }

        // Chat history
        const savedMessages = localStorage.getItem(STORAGE_KEY);
        if (savedMessages) {
          try {
            const parsed = JSON.parse(savedMessages);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
              return;
            }
          } catch (e) {
            // ignore corrupted
          }
        }

        // Initialize welcome message
        const defaultWelcome = botCfg?.welcomeMessage || 
          'Assalam-o-Alaikum & Welcome to **Al Khalil Cyber Centre (Kheda Tanda)**! 👋\n\nI am your 24/7 digital assistant. You can ask me about required documents for PAN/Aadhaar/Certificates, shop timings, exact location, rates, or enter your **Token (e.g. `AK-59124`)** for instant work status!';

        const initialMsg: ChatMessage = {
          id: 'welcome-1',
          sender: 'bot',
          text: defaultWelcome,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: botCfg?.quickPrompts || [
            '📋 PAN Card Documents',
            '🆔 Aadhaar Update Docs',
            '📍 Location in Kheda Tanda',
            '⏰ Shop Timings',
            '📜 Aay/Jaati/Niwas Docs',
            '🔍 Track My Work Token',
            '💰 Price & Rate List'
          ]
        };
        setMessages([initialMsg]);
      } catch (err) {
        console.error('Failed to init chatbot:', err);
      }
    };

    loadData();

    // Show floating teaser after 3.5 seconds if not dismissed previously
    const teaserDismissed = localStorage.getItem(TEASER_DISMISSED_KEY);
    if (!teaserDismissed) {
      const timer = setTimeout(() => {
        setShowTeaser(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Save messages to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(textToSend);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedFAQ: response.matchedFAQ,
        suggestedQuestions: response.suggestedQuestions,
        actionUrl: response.actionUrl,
        actionText: response.actionText,
        isLiveJobLookup: response.isLiveJobLookup,
        jobData: response.jobData
      };

      setMessages((prev) => [...prev, botMsg]);
      playChime();

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (e) {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "I'm having a little trouble connecting to the server. You can also chat directly with our team on WhatsApp at **9259837361** or call us for instant assistance in Kheda Tanda!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl: 'https://wa.me/919259837361',
        actionText: 'Connect via WhatsApp',
        suggestedQuestions: ['Shop Timings', 'Location in Kheda Tanda', 'PAN Card Documents']
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const defaultWelcome = config?.welcomeMessage || 
      'Assalam-o-Alaikum & Welcome to **Al Khalil Cyber Centre (Kheda Tanda)**! 👋\n\nHow can I help you today? Ask about required documents, timings, prices, or track a work token!';

    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'bot',
      text: defaultWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: config?.quickPrompts || [
        '📋 PAN Card Documents',
        '🆔 Aadhaar Update Docs',
        '📍 Location in Kheda Tanda',
        '⏰ Shop Timings',
        '📜 Aay/Jaati/Niwas Docs',
        '🔍 Track My Work Token',
        '💰 Price & Rate List'
      ]
    };

    setMessages([initialMsg]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem(SOUND_KEY, String(next));
  };

  const dismissTeaser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTeaser(false);
    localStorage.setItem(TEASER_DISMISSED_KEY, 'true');
  };

  // Helper to render bold and lists neatly from Markdown-like text
  const renderFormattedText = (raw: string) => {
    return raw.split('\n').map((line, idx) => {
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Format bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-cyan-200">
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Format inline code `code`
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} className="px-1.5 py-0.5 mx-0.5 bg-cyan-950 text-cyan-300 font-mono text-xs rounded border border-cyan-800/60">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      // Check if bullet
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('📌') || line.trim().startsWith('🌾')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1 text-sm text-slate-200 leading-relaxed">
            <span>{formattedParts}</span>
          </div>
        );
      }

      // Check if numbered list (e.g. 1. 2. 3.)
      const isNumbered = /^\d+\.\s/.test(line.trim());
      if (isNumbered) {
        return (
          <div key={idx} className="flex items-start gap-1.5 py-0.5 pl-1 text-sm text-slate-200 leading-relaxed">
            <span>{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="py-0.5 text-sm text-slate-200 leading-relaxed">
          {formattedParts}
        </p>
      );
    });
  };

  const botDisplayName = config?.botName || 'Al Khalil Smart Assistant';
  const botDisplaySubtitle = config?.botSubtitle || 'Online • Instant Docs, Timings & Work Tracking';

  return (
    <>
      {/* Floating Teaser Bubble (Dismissible preview tooltip) */}
      <AnimatePresence>
        {showTeaser && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-4 sm:right-6 z-40 max-w-[290px] bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md cursor-pointer hover:border-cyan-400 transition-colors"
            onClick={() => {
              setIsOpen(true);
              setShowTeaser(false);
              localStorage.setItem(TEASER_DISMISSED_KEY, 'true');
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Al Khalil AI Assistant</h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Instant Answers Ready
                  </p>
                </div>
              </div>
              <button
                onClick={dismissTeaser}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              👋 Need document lists for PAN/Aadhaar, shop timings in Kheda Tanda, or live tracking? Tap to chat!
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-cyan-300 font-medium pt-1.5 border-t border-slate-800">
              <span>Ask a question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble Launcher Button */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-40">
        <motion.button
          id="btn-open-chatbot"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
            if (showTeaser) setShowTeaser(false);
          }}
          className={`relative group flex items-center justify-center p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50 shadow-cyan-950/50'
              : 'bg-gradient-to-tr from-cyan-600 via-sky-600 to-emerald-500 text-white shadow-cyan-500/30 hover:shadow-cyan-400/50'
          }`}
          aria-label="Open AI Assistant Chat"
          title="Al Khalil Cyber Centre Smart Assistant"
        >
          {/* Animated Glow Ring */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-40 group-hover:opacity-75 blur-sm transition duration-500 animate-pulse pointer-events-none" />
          )}

          <div className="relative z-10 flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-90 duration-300" />
            ) : (
              <div className="relative">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1.5 animate-bounce" />
              </div>
            )}
          </div>

          {/* Unread Message Badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Main Chatbot Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed z-50 right-3 sm:right-6 bottom-20 sm:bottom-24 w-[calc(100vw-24px)] sm:w-[410px] md:w-[430px] rounded-2xl shadow-2xl border border-slate-700/80 bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-200 ${
              isMinimized ? 'h-[64px]' : 'h-[580px] max-h-[82vh]'
            }`}
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(6, 182, 212, 0.15)'
            }}
          >
            {/* Window Header */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/70 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white tracking-wide">
                      {botDisplayName}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold uppercase">
                      AI 24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {botDisplaySubtitle}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={toggleSound}
                  className="p-1.5 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                  title={soundEnabled ? 'Mute Chime Sound' : 'Enable Chime Sound'}
                  aria-label="Toggle Sound"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>

                <button
                  onClick={handleClearChat}
                  className="p-1.5 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Clear conversation"
                  aria-label="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                  aria-label="Minimize"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth text-slate-100">
                  {/* Top Security & Help Notice */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Official Al Khalil Cyber Centre Assistant. Instant document lists, shop timings & live token tracking.</span>
                  </div>

                  {/* Rendered Messages */}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[88%]">
                        {msg.sender === 'bot' && (
                          <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-sm">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm shadow-md ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-none'
                              : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {/* Message Text Content */}
                          <div className="space-y-1">
                            {renderFormattedText(msg.text)}
                          </div>

                          {/* Live Job Card Preview if looked up */}
                          {msg.isLiveJobLookup && msg.jobData && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-xs space-y-2">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                                <span className="font-mono font-bold text-cyan-300">
                                  {msg.jobData.trackingCode}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                                    msg.jobData.status === 'Ready'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                      : msg.jobData.status === 'Completed'
                                      ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                                  }`}
                                >
                                  {msg.jobData.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                                <div><span className="text-slate-500">Customer:</span> {msg.jobData.customerName}</div>
                                <div><span className="text-slate-500">Service:</span> {msg.jobData.serviceName}</div>
                              </div>
                              <p className="text-[11px] text-slate-300 italic bg-slate-900/90 p-1.5 rounded border border-slate-800">
                                "{msg.jobData.statusNotes}"
                              </p>
                            </div>
                          )}

                          {/* Action Button if provided */}
                          {msg.actionUrl && (
                            <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                              <a
                                href={msg.actionUrl}
                                target={msg.actionUrl.startsWith('http') ? '_blank' : undefined}
                                rel={msg.actionUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/70 transition-colors shadow-sm"
                                onClick={() => {
                                  if (msg.actionUrl?.startsWith('#')) {
                                    // Smooth jump to page section
                                    const el = document.querySelector(msg.actionUrl);
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                              >
                                <span>{msg.actionText || 'View Details'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div
                            className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                              msg.sender === 'user' ? 'text-cyan-100/70 justify-end' : 'text-slate-500'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{msg.timestamp}</span>
                          </div>
                        </div>

                        {msg.sender === 'user' && (
                          <div className="w-6 h-6 rounded-lg bg-sky-900 border border-sky-700 flex items-center justify-center text-sky-200 shrink-0 mt-0.5 shadow-sm">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Suggested Follow-up Prompt Chips */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="mt-2.5 ml-8 flex flex-wrap gap-1.5 max-w-[90%]">
                          {msg.suggestedQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSendMessage(q)}
                              disabled={isLoading}
                              className="text-[11px] text-cyan-300 bg-slate-900 hover:bg-cyan-950/80 hover:text-cyan-200 border border-slate-800 hover:border-cyan-700/60 px-2.5 py-1 rounded-full transition-all text-left flex items-center gap-1 disabled:opacity-50"
                            >
                              <span>{q}</span>
                              <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="rounded-2xl rounded-bl-none px-4 py-3 bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-75" />
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-150" />
                        <span className="text-xs text-slate-400 ml-1">Looking up answer...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* WhatsApp Escalation Banner */}
                <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    Direct Human Support:
                  </span>
                  <a
                    href="https://wa.me/919259837361?text=Hello%20Al%20Khalil%20Cyber%20Centre,%20I%20need%20assistance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Chat on WhatsApp</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Input Controls Bar */}
                <div className="p-3 bg-slate-900 border-t border-slate-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder={config?.placeholderText || "Ask anything (e.g., PAN docs, timings, tracking #)..."}
                      disabled={isLoading}
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isLoading}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center shrink-0"
                      aria-label="Send Message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
