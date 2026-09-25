import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Download,
  X,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  Layers,
  Wand2,
  Maximize2
} from 'lucide-react';
import { startImageToVideo, pollVideoStatus, downloadVideoFile } from '../../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PROMPT_SUGGESTIONS = [
  'Animate this Al Khalil Cyber Centre promotional poster into a professional advertisement with smooth cinematic camera glide, modern studio lighting, and subtle animation while keeping all branding, text, shop name, phone number and logo completely intact and clear.',
  'Cinematic 4K drone glide effect across the scene with gentle ambient depth, smooth lighting reflections, and soft floating particles.',
  'Dynamic advertising zoom with neon accent reflections, subtle particle effects, and crisp high-definition motion.',
  '4K Wedding portrait animation with elegant slow-motion wind effect, soft warm golden hour glow, and cinematic depth-of-field.'
];

export const AiImageToVideoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [prompt, setPrompt] = useState<string>(PROMPT_SUGGESTIONS[0]);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  // Generation state
  const [generating, setGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [operationName, setOperationName] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');

  // Polling ref
  const pollTimerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image file size must be less than 20MB.');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
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
    if (file) processImageFile(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64) {
      setError('Please upload an image to animate.');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setVideoUrl('');
      setGenerationStep('Uploading image & initializing Google Veo (veo-3.1-fast-generate-preview)...');

      const mime = imageFile?.type || 'image/jpeg';
      const startRes = await startImageToVideo(imageBase64, mime, prompt, aspectRatio);

      setOperationName(startRes.operationName);
      setModelUsed(startRes.model);
      setGenerationStep('Veo neural diffusion synthesizing motion vectors and camera dynamics...');

      // Start Polling
      let attempts = 0;
      const maxAttempts = 40; // ~3.5 minutes max

      pollTimerRef.current = setInterval(async () => {
        attempts++;
        try {
          const status = await pollVideoStatus(startRes.operationName);

          if (status.done) {
            clearInterval(pollTimerRef.current);

            if (status.error) {
              setError(status.error);
              setGenerating(false);
              return;
            }

            if (status.videoUri) {
              setGenerationStep('Finalizing video download...');
              // Download video blob through server
              const blob = await downloadVideoFile(startRes.operationName);
              const blobUrl = URL.createObjectURL(blob);
              setVideoUrl(blobUrl);
              setGenerating(false);
              setGenerationStep('');
            }
          } else {
            setGenerationStep(`Rendering video frames with Google Veo (${attempts * 5}s)...`);
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollTimerRef.current);
            setError('Generation is taking longer than expected. Please try again with a simpler prompt.');
            setGenerating(false);
          }
        } catch (pollErr: any) {
          console.error('Polling error:', pollErr);
          // If downloading or polling hits quota, show helpful error
          if (attempts > 5) {
            clearInterval(pollTimerRef.current);
            setError(pollErr.message || 'Video generation status check encountered an issue.');
            setGenerating(false);
          }
        }
      }, 5000);
    } catch (err: any) {
      console.error('Generate video error:', err);
      setError(
        err.message ||
        'Google Veo generation failed. Please verify that your Google AI Studio project has Veo model access enabled.'
      );
      setGenerating(false);
      setGenerationStep('');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `alkhalil-animated-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setImageFile(null);
    setImageBase64('');
    setImagePreviewUrl('');
    setVideoUrl('');
    setOperationName('');
    setError('');
    setGenerating(false);
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-400">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  Image to Video Animation <span className="text-purple-400">/ फोटो से वीडियो</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Google Veo
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Turn shop posters, wedding photos, and banners into cinematic videos
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
          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Generation Note:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* 1. Image Upload & Preview */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              1. Upload Image / फोटो या पोस्टर चुनें
            </label>

            {!imagePreviewUrl ? (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-purple-400 bg-purple-950/40 text-white scale-[1.01]'
                    : 'border-slate-700 hover:border-purple-500 bg-slate-800/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={generating}
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <Upload className={`w-6 h-6 ${isDragging ? 'animate-bounce text-purple-300' : ''}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isDragging ? 'Drop image here!' : 'Select or Drag & Drop Image (JPG, PNG, WEBP)'}
                </span>
                <span className="text-[10px] text-slate-500">
                  Ideal for business posters, certificates, wedding photos, and marketing banners (up to 20MB)
                </span>
              </label>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-36 h-28 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900 shadow-md">
                    <img
                      src={imagePreviewUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs block" title={imageFile?.name}>
                        {imageFile?.name || 'Selected Image'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50 font-mono">
                        {imageFile ? formatFileSize(imageFile.size) : 'Ready'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Ready for Google Veo neural motion synthesis. Adjust prompt, aspect ratio, or regenerate below.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={generating}
                        />
                        Change Image
                      </label>
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={generating}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              2. Aspect Ratio / वीडियो का आकार
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                disabled={generating}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  aspectRatio === '16:9'
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <span className="font-bold text-xs uppercase block text-white">16:9 Landscape</span>
                  <span className="text-[10px] text-slate-400">Standard YouTube & Screens</span>
                </div>
                {aspectRatio === '16:9' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                disabled={generating}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  aspectRatio === '9:16'
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <span className="font-bold text-xs uppercase block text-white">9:16 Portrait (Reel)</span>
                  <span className="text-[10px] text-slate-400">Instagram Reels & WhatsApp Status</span>
                </div>
                {aspectRatio === '9:16' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </button>
            </div>
          </div>

          {/* 3. Prompt Customization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                3. Animation Prompt / एनिमेशन निर्देश
              </label>
              <span className="text-[10px] text-slate-500">Google Veo Prompting</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating}
              rows={3}
              placeholder="Describe the motion, camera movements, lighting, and mood..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-all font-medium leading-relaxed"
            />

            {/* Prompt presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Suggested Prompts / सुझाये गए निर्देश:
              </span>
              <div className="space-y-1">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(s)}
                    disabled={generating}
                    className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors truncate block border border-slate-800/80"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          {!videoUrl && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !imageBase64}
                className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Video with Google Veo...</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-4 h-4" />
                    <span>Generate Video with Google Veo / वीडियो बनाएं</span>
                  </>
                )}
              </button>
              {generating && generationStep && (
                <div className="p-3 mt-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center">
                  <p className="text-xs text-purple-300 font-bold animate-pulse">
                    {generationStep}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Google Veo high-definition rendering typically takes 30-90 seconds. Please keep this window open.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Generated Video Output */}
          {videoUrl && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Veo Animation Ready
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    Model: {modelUsed || 'veo-3.1-fast-generate-preview'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Regenerate Video / पुनः बनाएं
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download MP4
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" /> Start New Generation
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 aspect-video max-h-[360px] flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  loop
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Transparent Google Veo Setup & Requirements Info */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Info className="w-4 h-4 shrink-0" />
              <span>Google Veo Architecture & Setup Requirements / सेटअप जानकारी:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
              <li>
                <strong>Model:</strong> Powered by Google DeepMind's <code>veo-3.1-fast-generate-preview</code> (16:9 widescreen or 9:16 vertical Reel).
              </li>
              <li>
                <strong>Brand Preservation:</strong> The prompt instructions are specifically structured to retain Al Khalil Cyber Centre shop name, phone number (+91 9259837361), address, and logos without distortion.
              </li>
              <li>
                <strong>Google AI Studio & Cloud Setup:</strong> Requires a Google Cloud Project with the Gemini & Veo API enabled and associated billing/quota for high-definition video diffusion.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
