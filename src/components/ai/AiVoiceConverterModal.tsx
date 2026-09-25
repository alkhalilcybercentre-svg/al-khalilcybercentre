import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Upload,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Download,
  X,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Square
} from 'lucide-react';
import { convertVoiceAudio, fetchAiVoices } from '../../lib/api';
import { AiVoiceOption } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AiVoiceConverterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<AiVoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string>('');
  
  // Converted output state
  const [converting, setConverting] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string>('');
  const [convertedBase64, setConvertedBase64] = useState<string>('');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Audio playback controls
  const [isPlayingConverted, setIsPlayingConverted] = useState<boolean>(false);
  const convertedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchAiVoices().then(data => {
        if (data && data.length > 0) {
          setVoices(data);
        }
      });
    }
  }, [isOpen]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processFile = (file: File) => {
    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac)$/i)) {
      setError('Please select an audio file (MP3, WAV, M4A, OGG, WEBM, AAC).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Audio file size must be less than 25MB.');
      return;
    }

    setError('');
    setAudioFile(file);
    const objectUrl = URL.createObjectURL(file);
    setOriginalAudioUrl(objectUrl);

    // Read as Base64
    const reader = new FileReader();
    reader.onload = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
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
    if (file) processFile(file);
  };

  // Start live microphone recording
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
        const file = new File([audioBlob], `recorded-voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        setOriginalAudioUrl(URL.createObjectURL(audioBlob));

        const reader = new FileReader();
        reader.onload = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop tracks
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

  const handleConvert = async () => {
    if (!audioBase64) {
      setError('Please upload or record an audio file first.');
      return;
    }

    try {
      setConverting(true);
      setError('');
      setProgressStep('Analyzing spoken audio with Google Speech AI (gemini-3.5-transcribe)...');

      // Small delay for UX step feedback
      setTimeout(() => {
        setProgressStep(`Applying Neural Voice Synthesis with voice "${selectedVoice}" (gemini-3.1-flash-tts-preview)...`);
      }, 1500);

      const mime = audioFile?.type || 'audio/webm';
      const result = await convertVoiceAudio(audioBase64, mime, selectedVoice);

      setConvertedBase64(result.audioBase64);
      setTranscribedText(result.transcribedText);
      setModelUsed(result.modelUsed);

      // Create audio URL from base64
      const byteCharacters = atob(result.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType || 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      setConvertedAudioUrl(url);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(err.message || 'Failed to convert voice. Please verify speech is clearly audible.');
    } finally {
      setConverting(false);
      setProgressStep('');
    }
  };

  const toggleConvertedPlayback = () => {
    if (!convertedAudioRef.current) return;
    if (isPlayingConverted) {
      convertedAudioRef.current.pause();
      setIsPlayingConverted(false);
    } else {
      convertedAudioRef.current.play().catch(console.error);
      setIsPlayingConverted(true);
    }
  };

  const stopConvertedPlayback = () => {
    if (!convertedAudioRef.current) return;
    convertedAudioRef.current.pause();
    convertedAudioRef.current.currentTime = 0;
    setIsPlayingConverted(false);
  };

  const handleDownload = () => {
    if (!convertedAudioUrl) return;
    const link = document.createElement('a');
    link.href = convertedAudioUrl;
    link.download = `alkhalil-converted-voice-${selectedVoice.toLowerCase()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioBase64('');
    setOriginalAudioUrl('');
    setConvertedAudioUrl('');
    setConvertedBase64('');
    setTranscribedText('');
    setError('');
    setIsPlayingConverted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  AI Voice Converter <span className="text-indigo-400">/ आवाज कन्वर्टर</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Google AI Speech
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Transform any voice recording into realistic AI character voices
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

          {/* 1. Audio Input Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              1. Upload Audio File or Record Live / ऑडियो चुनें या रिकॉर्ड करें
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File Upload Box */}
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-950/40 text-white scale-[1.01]'
                    : audioFile && !isRecording
                    ? 'border-indigo-500/80 bg-indigo-950/20 text-white'
                    : 'border-slate-700 hover:border-indigo-500 bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={converting || isRecording}
                />
                <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-300 animate-bounce' : 'text-indigo-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-center">
                  {isDragging
                    ? 'Drop audio file here!'
                    : audioFile && !isRecording
                    ? audioFile.name
                    : 'Upload Audio File (.mp3, .wav, .m4a)'}
                </span>
                <span className="text-[10px] text-slate-400 text-center">
                  Click to browse or drag & drop audio up to 25MB
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
                      disabled={converting}
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

            {/* Selected File Information */}
            {audioFile && (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Selected Audio Details / चयनित फाइल विवरण:
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Remove / Clear
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
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">File Size</span>
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
                      {isRecording || audioFile.name.startsWith('recorded-voice') ? 'Microphone' : 'Uploaded File'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Original Audio Preview */}
            {originalAudioUrl && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
                  <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate font-semibold">Preview Input: {audioFile?.name || 'Live Recording'}</span>
                </div>
                <audio controls src={originalAudioUrl} className="h-8 max-w-[200px] sm:max-w-xs" />
              </div>
            )}
          </div>

          {/* 2. Choose Target AI Voice */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              2. Select Target Google AI Voice / आवाज का प्रकार चुनें
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(voices.length > 0 ? voices : [
                { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Clear, friendly, natural female tone' },
                { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Calm, soft, professional female tone' },
                { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Energetic, confident, crisp male tone' },
                { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Deep, warm, authoritative baritone male tone' },
                { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Bold, expressive, studio-quality male tone' }
              ]).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVoice(v.id)}
                  disabled={converting}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                    selectedVoice === v.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm uppercase tracking-tight text-white">{v.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700 text-slate-300">
                        {v.gender}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{v.description}</p>
                  </div>
                  {selectedVoice === v.id && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Convert Action Button */}
          {!convertedAudioUrl && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConvert}
                disabled={converting || !audioBase64}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {converting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Neural Voice Conversion...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Convert Voice with Google AI / आवाज कन्वर्ट करें</span>
                  </>
                )}
              </button>
              {converting && progressStep && (
                <p className="text-xs text-indigo-400 font-bold text-center mt-2.5 animate-pulse">
                  {progressStep}
                </p>
              )}
            </div>
          )}

          {/* 3. Converted Result Section */}
          {convertedAudioUrl && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Voice Conversion Complete
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    Voice: {selectedVoice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Convert Another
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Audio
                  </button>
                </div>
              </div>

              {/* Transcribed text extracted from audio */}
              {transcribedText && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                    Detected Speech Content / पहचान किया गया भाषण:
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
                    "{transcribedText}"
                  </p>
                </div>
              )}

              {/* Audio Player */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 flex items-center gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={toggleConvertedPlayback}
                    title={isPlayingConverted ? 'Pause Playback / रोकें' : 'Play Audio / सुनें'}
                    className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95 cursor-pointer"
                  >
                    {isPlayingConverted ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={stopConvertedPlayback}
                    title="Stop Playback / बंद करें"
                    className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Generated AI Voice ({selectedVoice})</span>
                    <span className="text-[10px] text-indigo-400 font-mono">High Quality MP3</span>
                  </div>
                  {/* Waveform representation */}
                  <div className="h-6 flex items-center gap-1 overflow-hidden">
                    {[40, 60, 90, 30, 80, 100, 70, 45, 95, 65, 35, 85, 50, 75, 90, 40, 60, 80, 55, 70].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          isPlayingConverted ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <audio
                  ref={convertedAudioRef}
                  src={convertedAudioUrl}
                  onEnded={() => setIsPlayingConverted(false)}
                  onPause={() => setIsPlayingConverted(false)}
                  onPlay={() => setIsPlayingConverted(true)}
                  className="hidden"
                />
              </div>

              {modelUsed && (
                <p className="text-[10px] text-slate-500 font-mono text-center">
                  Engine: {modelUsed}
                </p>
              )}
            </div>
          )}

          {/* Transparent System Architecture Info */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">
                Google AI Speech Pipeline Architecture:
              </span>
              <span>
                Speech recognition is processed using <code>gemini-3.5-transcribe</code>, and the audio is re-synthesized using Google's <code>gemini-3.1-flash-tts-preview</code> with official prebuilt neural voice vectors (Kore, Puck, Charon, Fenrir, Zephyr).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
