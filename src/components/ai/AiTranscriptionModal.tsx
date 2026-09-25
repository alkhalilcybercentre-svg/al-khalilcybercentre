import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Mic,
  Square,
  Copy,
  Check,
  Download,
  RotateCcw,
  X,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { transcribeAudio } from '../../lib/api';
import { TranscriptionResponse } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AiTranscriptionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  const [language, setLanguage] = useState<string>('auto');

  // Live recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Transcription state
  const [transcribing, setTranscribing] = useState<boolean>(false);
  const [result, setResult] = useState<TranscriptionResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processAudioFile = (file: File) => {
    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac)$/i)) {
      setError('Please select a valid audio file (MP3, WAV, M4A, OGG, WEBM).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Audio file size must be less than 25MB.');
      return;
    }

    setError('');
    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudioFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processAudioFile(file);
  };

  const startRecording = async () => {
    try {
      setError('');
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `recorded-audio-${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        setAudioPreviewUrl(URL.createObjectURL(audioBlob));

        const reader = new FileReader();
        reader.onload = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic error:', err);
      setError('Microphone access denied or not available. Please upload an audio file instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBase64) {
      setError('Please upload or record audio first.');
      return;
    }

    try {
      setTranscribing(true);
      setError('');

      const mime = audioFile?.type || 'audio/webm';
      const res = await transcribeAudio(audioBase64, mime, language);
      setResult(res);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to transcribe audio. Please verify speech is clearly audible.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alkhalil-transcript-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioBase64('');
    setAudioPreviewUrl('');
    setResult(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  Audio to Text Transcription <span className="text-emerald-400">/ आवाज से टेक्स्ट</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                High-precision transcription for meetings, voice notes, Hindi, and English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Input Selection: Upload or Record */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              1. Upload Audio File or Record with Microphone / ऑडियो चुनें या बोलें
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File Upload Box */}
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-950/40 text-white scale-[1.01]'
                    : audioFile && !isRecording
                    ? 'border-emerald-500/80 bg-emerald-950/20 text-white'
                    : 'border-slate-700 hover:border-emerald-500 bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={transcribing || isRecording}
                />
                <Upload className={`w-6 h-6 ${isDragging ? 'text-emerald-300 animate-bounce' : 'text-emerald-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-center">
                  {isDragging
                    ? 'Drop audio file here!'
                    : audioFile && !isRecording
                    ? audioFile.name
                    : 'Upload Audio (.mp3, .wav, .m4a)'}
                </span>
                <span className="text-[10px] text-slate-400 text-center">
                  Click to select or drag & drop audio up to 25MB
                </span>
              </label>

              {/* Mic Recording Box */}
              <div className={`border rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all ${
                isRecording
                  ? 'border-rose-500 bg-rose-950/30 text-rose-300 animate-pulse'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300'
              }`}>
                {isRecording ? (
                  <>
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      Recording... {recordingSeconds}s
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop Recording
                    </button>
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 text-emerald-400" />
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={transcribing}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" /> Record with Mic
                    </button>
                    <span className="text-[10px] text-slate-400 text-center">
                      Live microphone voice input (Hindi / English)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Selected Audio Information */}
            {audioFile && (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Selected Audio File Details / फाइल विवरण:
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    Clear Audio
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">File Name</span>
                    <span className="text-white font-medium truncate block" title={audioFile.name}>
                      {audioFile.name}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Size</span>
                    <span className="text-white font-medium block">
                      {formatFileSize(audioFile.size)}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Format</span>
                    <span className="text-white font-medium block uppercase">
                      {audioFile.type.split('/')[1] || audioFile.name.split('.').pop() || 'AUDIO'}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Source</span>
                    <span className="text-emerald-400 font-medium block">
                      {isRecording || audioFile.name.startsWith('recorded-audio') ? 'Live Mic' : 'Upload'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Preview Player */}
            {audioPreviewUrl && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate font-semibold">Audio: {audioFile?.name || 'Live Recording'}</span>
                </div>
                <audio controls src={audioPreviewUrl} className="h-8 max-w-[200px] sm:max-w-xs" />
              </div>
            )}
          </div>

          {/* 2. Language Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              2. Target Language / भाषा का चयन
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'auto', label: 'Auto Detect (स्वतः पहचान)' },
                { id: 'hi', label: 'Hindi (हिन्दी)' },
                { id: 'en', label: 'English' },
                { id: 'hinglish', label: 'Hinglish (मिक्स)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLanguage(opt.id)}
                  disabled={transcribing}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    language === opt.id
                      ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transcribe Action Button */}
          {!result && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTranscribe}
                disabled={transcribing || !audioBase64}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {transcribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transcribing with gemini-3.5-transcribe...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Transcribe Audio to Text / टेक्स्ट में बदलें</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 3. Transcription Result */}
          {result && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Transcription Output
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    {result.wordCount} words
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download .txt
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Transcribed Text Output Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap select-all font-normal">
                {result.text}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Model: {result.modelUsed}</span>
                <span>Language: {result.detectedLanguage || 'Auto'}</span>
              </div>
            </div>
          )}

          {/* Model Information */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">
                Google Audio Transcription:
              </span>
              <span>
                Processed natively with Google DeepMind's <code>gemini-3.5-transcribe</code> model, engineered for high-accuracy phonetic understanding across Indian languages, Hindi, Hinglish, and English.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
