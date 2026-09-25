import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Edit2,
  Trash2,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Sliders,
  Layers,
  MessageSquare,
  Send,
  X,
  Tag,
  Key
} from 'lucide-react';
import { BotFAQItem, ChatbotConfig } from '../../types';
import {
  fetchAdminChatbotConfig,
  saveAdminChatbotConfig,
  fetchAdminChatbotFAQs,
  saveAdminChatbotFAQ,
  deleteAdminChatbotFAQ,
  sendChatMessage
} from '../../lib/api';

interface AdminChatbotTabProps {
  onRefreshPublicData: () => void;
}

const CATEGORIES = [
  'PAN & Aadhaar',
  'Jan Seva & Certificates',
  'Shop & Location',
  'Printing & Offset',
  'Rates & Pricing',
  'Online Forms',
  'General Inquiries'
];

export const AdminChatbotTab: React.FC<AdminChatbotTabProps> = ({ onRefreshPublicData }) => {
  const [config, setConfig] = useState<ChatbotConfig>({
    botName: 'Al Khalil Smart Assistant',
    botSubtitle: 'Online • Instant Docs, Timings & Work Tracking',
    welcomeMessage:
      'Assalam-o-Alaikum & Welcome to **Al Khalil Cyber Centre (Kheda Tanda)**! 👋\n\nI am your 24/7 assistant. Ask me about required documents for PAN/Aadhaar/Certificates, shop timings, exact location, rates, or enter your **Token (e.g. `AK-59124`)** for live work status!',
    placeholderText: 'Ask anything (e.g., PAN docs, timings, tracking #)...',
    quickPrompts: [
      '📋 PAN Card Documents',
      '🆔 Aadhaar Update Docs',
      '📍 Location in Kheda Tanda',
      '⏰ Shop Timings',
      '📜 Aay/Jaati/Niwas Docs',
      '🔍 Track My Work Token',
      '💰 Price & Rate List'
    ]
  });

  const [faqs, setFaqs] = useState<BotFAQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State
  const [editingFaq, setEditingFaq] = useState<Partial<BotFAQItem> | null>(null);
  const [savingFaq, setSavingFaq] = useState(false);

  // New prompt input for config
  const [newPromptInput, setNewPromptInput] = useState('');

  // Live Bot Test Console
  const [testQuery, setTestQuery] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    reply: string;
    matchedFAQ?: BotFAQItem;
    suggestedQuestions?: string[];
    actionUrl?: string;
    actionText?: string;
    isLiveJobLookup?: boolean;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfg, faqList] = await Promise.all([
        fetchAdminChatbotConfig().catch(() => null),
        fetchAdminChatbotFAQs().catch(() => [])
      ]);
      if (cfg) setConfig(cfg);
      if (faqList) setFaqs(faqList);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to load chatbot settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
    onRefreshPublicData();
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setErrorMsg(null);
    try {
      const updated = await saveAdminChatbotConfig(config);
      setConfig(updated);
      triggerSuccess('Chatbot settings and quick prompts saved successfully!');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save chatbot settings.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddPromptChip = () => {
    const trimmed = newPromptInput.trim();
    if (!trimmed) return;
    if (!config.quickPrompts.includes(trimmed)) {
      setConfig({
        ...config,
        quickPrompts: [...config.quickPrompts, trimmed]
      });
    }
    setNewPromptInput('');
  };

  const handleRemovePromptChip = (chipToRemove: string) => {
    setConfig({
      ...config,
      quickPrompts: config.quickPrompts.filter((p) => p !== chipToRemove)
    });
  };

  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq?.question?.trim() || !editingFaq?.answer?.trim()) {
      setErrorMsg('Question and Answer are required.');
      return;
    }

    setSavingFaq(true);
    setErrorMsg(null);
    try {
      await saveAdminChatbotFAQ(editingFaq);
      triggerSuccess(editingFaq.id ? 'Knowledge Base entry updated.' : 'New Knowledge Base entry added!');
      setEditingFaq(null);
      await loadData();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save FAQ entry.');
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFAQ = async (id: string, question: string) => {
    if (!window.confirm(`Are you sure you want to delete FAQ "${question}"?`)) return;
    setLoading(true);
    try {
      await deleteAdminChatbotFAQ(id);
      triggerSuccess(`FAQ "${question}" deleted successfully.`);
      await loadData();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to delete FAQ.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item: BotFAQItem) => {
    try {
      await saveAdminChatbotFAQ({
        ...item,
        active: !item.active
      });
      triggerSuccess(`FAQ "${item.question}" ${!item.active ? 'activated' : 'deactivated'}.`);
      await loadData();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to update FAQ status.');
    }
  };

  const handleRunBotTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    setTestLoading(true);
    try {
      const res = await sendChatMessage(testQuery.trim());
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        reply: `Error: ${e.message || 'Could not query assistant'}`
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'ALL' || faq.category === selectedCategory;
    const qLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(qLower) ||
      faq.keywords.toLowerCase().includes(qLower) ||
      faq.answer.toLowerCase().includes(qLower);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-900/30 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Chatbot & Knowledge Base Manager
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800">
                24/7 Smart Reply
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control the floating assistant on your website, edit instant answers for PAN/Aadhaar documents, timings, prices, and custom services.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setEditingFaq({
                question: '',
                category: 'General Inquiries',
                keywords: '',
                answer: '',
                suggestedQuestions: ['Shop Timings', 'Location in Kheda Tanda', 'Price List'],
                actionUrl: '',
                actionText: '',
                active: true,
                order: faqs.length + 1
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-950/50 cursor-pointer shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ Answer</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Bot Configuration & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chatbot Appearance & Prompts (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Bot Identity & Welcome Settings</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assistant Display Name
                </label>
                <input
                  type="text"
                  value={config.botName}
                  onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                  placeholder="e.g. Al Khalil Smart Assistant"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subtitle / Status Tagline
                </label>
                <input
                  type="text"
                  value={config.botSubtitle}
                  onChange={(e) => setConfig({ ...config, botSubtitle: e.target.value })}
                  placeholder="e.g. Online • Instant Docs & Timings"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Welcome Message (Displayed when customer opens the chat)
              </label>
              <textarea
                rows={3}
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                placeholder="Welcome text supporting **bold** markdown..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none font-mono"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Use <code className="text-cyan-400 font-mono">**bold**</code> for bold words or <code className="text-cyan-400 font-mono">`code`</code> for token highlights.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Input Field Placeholder Text
              </label>
              <input
                type="text"
                value={config.placeholderText}
                onChange={(e) => setConfig({ ...config, placeholderText: e.target.value })}
                placeholder="e.g. Ask anything (e.g., PAN docs, timings, tracking #)..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Quick Prompts Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Quick Action Suggestion Chips (1-Click Topics)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {config.quickPrompts.map((prompt, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 text-xs font-medium"
                  >
                    <span>{prompt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePromptChip(prompt)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPromptInput}
                  onChange={(e) => setNewPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPromptChip();
                    }
                  }}
                  placeholder="Type new suggestion chip & press Enter or Add..."
                  className="flex-1 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPromptChip}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Add Chip
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? 'Saving Settings...' : 'Save Bot Configuration'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Bot Test Console (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Interactive Test Console</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Live Engine</span>
          </div>

          <p className="text-xs text-slate-400">
            Type any question below to test how your Knowledge Base answers it instantly.
          </p>

          <form onSubmit={handleRunBotTest} className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g. pan card docs or AK-59124..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={testLoading || !testQuery.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-40 cursor-pointer"
              title="Test query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Test Quick Examples */}
          <div className="flex flex-wrap gap-1">
            {['PAN Docs', 'Aadhaar Docs', 'Shop Timings', 'Kheda Tanda Location', 'AK-59124'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setTestQuery(sample);
                  sendChatMessage(sample).then(setTestResult);
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Test Output Box */}
          <div className="flex-1 min-h-[160px] bg-slate-950 rounded-xl p-3 border border-slate-800/80 overflow-y-auto text-xs text-slate-300 space-y-2">
            {testLoading ? (
              <div className="flex items-center gap-2 text-slate-500 italic py-4">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Searching knowledge base...</span>
              </div>
            ) : testResult ? (
              <div>
                <div className="text-[10px] text-cyan-400 font-mono mb-1.5 flex items-center justify-between">
                  <span>
                    {testResult.matchedFAQ
                      ? `Matched FAQ: "${testResult.matchedFAQ.question}"`
                      : testResult.isLiveJobLookup
                      ? 'Live Work Tracking Match'
                      : 'Greeting / Default Fallback'}
                  </span>
                </div>
                <div className="whitespace-pre-line text-slate-200 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
                  {testResult.reply}
                </div>
                {testResult.actionUrl && (
                  <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>Action: {testResult.actionText || testResult.actionUrl}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-600 py-8 text-xs">
                Type a message or click a sample topic above to see live bot output.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQs Knowledge Base Management Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">
                Knowledge Base & FAQ Answers ({faqs.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Manage pre-programmed questions, document requirements, and custom answers.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or keywords..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories ({faqs.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = faqs.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* FAQs List Table/Cards */}
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800/80">
            <p className="text-sm text-slate-400">No FAQ entries match the current filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                      {faq.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">{faq.question}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleActive(faq)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        faq.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {faq.active ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteFAQ(faq.id, faq.question)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Keywords Trigger */}
                {faq.keywords && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Key className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-slate-500">Keywords:</span>
                    <span className="font-mono text-slate-300">{faq.keywords}</span>
                  </div>
                )}

                {/* Answer Preview */}
                <div className="text-xs text-slate-300 whitespace-pre-line bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                  {faq.answer}
                </div>

                {/* Footer details: Action button & Suggestions */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  <div className="flex items-center gap-3">
                    {faq.actionUrl && (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Button: {faq.actionText || faq.actionUrl}
                      </span>
                    )}
                  </div>

                  {faq.suggestedQuestions && faq.suggestedQuestions.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>Follow-up chips:</span>
                      <span className="text-slate-300">{faq.suggestedQuestions.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">
                  {editingFaq.id ? 'Edit Knowledge Base Answer' : 'Add New Knowledge Base Answer'}
                </h3>
              </div>
              <button
                onClick={() => setEditingFaq(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFAQ} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Customer Question / Topic Title *
                  </label>
                  <input
                    type="text"
                    value={editingFaq.question || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    placeholder="e.g. What documents are required for new PAN Card?"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={editingFaq.category || 'General Inquiries'}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Search Trigger Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={editingFaq.keywords || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, keywords: e.target.value })}
                  placeholder="e.g. pan card, apply pan, pan documents, nsdl, uti, minor pan"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The bot uses these words to match what visitors type in chat.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Answer / Reply * (Markdown & Bullets supported)
                </label>
                <textarea
                  rows={5}
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Enter clear, comprehensive instructions, required document bullet points, steps, or shop timings..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Optional Action Button URL / Section Link
                  </label>
                  <input
                    type="text"
                    value={editingFaq.actionUrl || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, actionUrl: e.target.value })}
                    placeholder="e.g. #rates, #track, #services, or https://wa.me/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Action Button Label Text
                  </label>
                  <input
                    type="text"
                    value={editingFaq.actionText || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, actionText: e.target.value })}
                    placeholder="e.g. View Complete Price List"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Follow-up Suggestion Chips (comma separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingFaq.suggestedQuestions)
                      ? editingFaq.suggestedQuestions.join(', ')
                      : ''
                  }
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      suggestedQuestions: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    })
                  }
                  placeholder="e.g. Shop Timings, Location in Kheda Tanda, Price List"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingFaq.active !== false}
                    onChange={(e) => setEditingFaq({ ...editingFaq, active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Publish & Activate in Chatbot</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFaq(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFaq}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 text-xs font-bold disabled:opacity-50"
                  >
                    {savingFaq ? 'Saving...' : 'Save Knowledge Base Entry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
