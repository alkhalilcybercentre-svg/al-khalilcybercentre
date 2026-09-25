import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  db,
  DATA_DIR,
  UPLOADS_DIR,
  BANNER_UPLOADS_DIR,
  DOCS_UPLOADS_DIR,
  CERTIFICATES_UPLOADS_DIR,
  BRANDING_UPLOADS_DIR
} from './server/db.ts';
import {
  isGeminiConfigured,
  runSearchAssistant,
  transcribeAudioFile,
  convertVoiceAudio,
  SUPPORTED_AI_VOICES,
  startImageToVideo,
  checkVideoStatus,
  fetchVideoBuffer
} from './server/ai.ts';

dotenv.config();

// Persistent Admin Sessions Map (token -> expiresAt)
const SESSIONS_FILE = path.join(DATA_DIR, 'admin_sessions.json');
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadAdminSessions(): Map<string, { createdAt: number; expiresAt: number }> {
  const map = new Map<string, { createdAt: number; expiresAt: number }>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      const now = Date.now();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.token && item.expiresAt > now) {
            map.set(item.token, { createdAt: item.createdAt || now, expiresAt: item.expiresAt });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not read admin_sessions.json, starting fresh sessions map', err);
  }
  return map;
}

function saveAdminSessions(map: Map<string, { createdAt: number; expiresAt: number }>) {
  try {
    const list: { token: string; createdAt: number; expiresAt: number }[] = [];
    const now = Date.now();
    for (const [token, s] of map.entries()) {
      if (s.expiresAt > now) {
        list.push({ token, createdAt: s.createdAt, expiresAt: s.expiresAt });
      }
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save admin_sessions.json', err);
  }
}

const adminSessions = loadAdminSessions();

// Challenge nonces for Biometric authentication (Mantra MFS110)
// Valid for 2 minutes, single use
const authChallenges = new Map<string, { createdAt: number; expiresAt: number }>();

// Challenge nonces for WebAuthn / Passkeys
const passkeyChallenges = new Map<string, { createdAt: number; expiresAt: number }>();

// Cleanup expired challenges every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, data] of authChallenges.entries()) {
    if (data.expiresAt < now) {
      authChallenges.delete(nonce);
    }
  }
  for (const [challenge, data] of passkeyChallenges.entries()) {
    if (data.expiresAt < now) {
      passkeyChallenges.delete(challenge);
    }
  }
}, 2 * 60 * 1000);

// Cleanup expired sessions every hour
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt < now) {
      adminSessions.delete(token);
      changed = true;
    }
  }
  if (changed) {
    saveAdminSessions(adminSessions);
  }
}, 60 * 60 * 1000);

// Multer Storage Configuration
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, BANNER_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  }
});

const docsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOCS_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, safeName);
  }
});

const certStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CERTIFICATES_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `cert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  }
});

const brandingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, BRANDING_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `brand-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, safeName);
  }
});

const fileFilterImage = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpe?g|png|webp|svg|ico)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, SVG, and ICO image files are allowed.'));
  }
};

const fileFilterDocs = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpe?g|png|webp|pdf)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.'));
  }
};

const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilterImage
});

const uploadDocs = multer({
  storage: docsStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: fileFilterDocs
});

const uploadCert = multer({
  storage: certStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: fileFilterDocs
});

const uploadBranding = multer({
  storage: brandingStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilterImage
});

// Authentication Middleware
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (authHeader) {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      adminSessions.delete(token);
      saveAdminSessions(adminSessions);
    }
    return res.status(401).json({ error: 'Session expired. Please log in with your Admin PIN again.' });
  }

  // Extend session
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  next();
};

// Helper: Determine relying party host domain
function getRelyingPartyHost(req: Request): string {
  const forwardedHost = (req.headers['x-forwarded-host'] as string) || (req.headers['host'] as string) || req.hostname || 'localhost';
  // Strip port if present
  const cleanHost = forwardedHost.split(':')[0].trim();
  return cleanHost || 'localhost';
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable trust proxy so req.hostname and req.headers['x-forwarded-host'] reflect the public HTTPS domain
  app.set('trust proxy', true);

  // Security & Permissions-Policy headers
  app.use((req, res, next) => {
    // Explicitly allow WebAuthn / publickey-credentials-create
    res.setHeader('Permissions-Policy', 'publickey-credentials-create=(self), publickey-credentials-get=(self)');
    next();
  });

  // Basic Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve public uploads
  app.use('/uploads/banners', express.static(BANNER_UPLOADS_DIR));
  app.use('/uploads/certificates', express.static(CERTIFICATES_UPLOADS_DIR));
  app.use('/uploads/branding', express.static(BRANDING_UPLOADS_DIR));

  // ==========================================
  // PUBLIC API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      business: 'AL KHALIL CYBER CENTRE',
      time: new Date().toISOString()
    });
  });

  // Business / Site Info & Settings
  app.get('/api/site-info', (req, res) => {
    try {
      const info = db.getSiteInfo();
      res.json({ success: true, data: info });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/settings', (req, res) => {
    try {
      const info = db.getSiteInfo();
      res.json({ success: true, data: info });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Certificates (Public only active)
  app.get('/api/certificates', (req, res) => {
    try {
      const list = db.getCertificates(true);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Flash News (Public only active)
  app.get('/api/news', (req, res) => {
    try {
      const news = db.getNews(true);
      res.json({ success: true, data: news });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Digital Notice Board & Flash Alerts (Public active only)
  app.get('/api/notices', (req, res) => {
    try {
      const list = db.getNotices(true);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Customer Testimonials & Ratings (Public approved only)
  app.get('/api/testimonials', (req, res) => {
    try {
      const list = db.getTestimonials(true);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Public Review Submission by Customer
  app.post('/api/testimonials', (req, res) => {
    try {
      const { customerName, customerCity, rating, serviceAvail, reviewText, customerMobile } = req.body;
      if (!customerName || !rating || !reviewText) {
        return res.status(400).json({ success: false, error: 'Name, Rating (1-5), and Review Text are required.' });
      }

      const record = db.addPublicTestimonial({
        customerName,
        customerCity: customerCity || 'Uttar Pradesh',
        rating: Number(rating),
        serviceAvail: serviceAvail || 'Digital & CSC Services',
        reviewText,
        customerMobile
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your review has been submitted successfully to AL KHALIL CYBER CENTRE.',
        data: record
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Hero Banners (Public only active)
  app.get('/api/banners', (req, res) => {
    try {
      const banners = db.getBanners(true);
      res.json({ success: true, data: banners });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Services (Public only active)
  app.get('/api/services', (req, res) => {
    try {
      const services = db.getServices(true);
      res.json({ success: true, data: services });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Rate List (Public only active)
  app.get('/api/rates', (req, res) => {
    try {
      const rates = db.getRates(true);
      res.json({ success: true, data: rates });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // CHATBOT & KNOWLEDGE BASE (PUBLIC)
  // ==========================================
  app.get('/api/chatbot/config', (req, res) => {
    try {
      const config = db.getChatbotConfig();
      res.json({ success: true, data: config });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/chatbot/faqs', (req, res) => {
    try {
      const faqs = db.getFAQs(true);
      res.json({ success: true, data: faqs });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/chatbot/message', (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, error: 'Query message is required.' });
      }
      const response = db.answerQuery(query);
      res.json({ success: true, data: response });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==========================================
  // AL KHALIL GOOGLE AI POWERED SUITE
  // ==========================================

  // AI Configuration & Availability Status
  app.get('/api/ai/status', (req, res) => {
    res.json({
      success: true,
      configured: isGeminiConfigured(),
      models: {
        searchAssistant: 'gemini-3.5-flash (with Google Search Grounding)',
        transcription: 'gemini-3.5-transcribe',
        voiceConversion: 'gemini-3.1-flash-tts-preview',
        imageToVideo: 'veo-3.1-fast-generate-preview'
      }
    });
  });

  // Get Available Google AI Voices for Voice Converter
  app.get('/api/ai/voices', (req, res) => {
    res.json({
      success: true,
      voices: SUPPORTED_AI_VOICES
    });
  });

  // 1. AI Search Assistant with Google Search Grounding
  app.post('/api/ai/search-assistant', async (req, res) => {
    try {
      const { query, history } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ success: false, error: 'Query question is required.' });
      }

      const result = await runSearchAssistant(query.trim(), Array.isArray(history) ? history : []);
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('Search Assistant Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to process AI Search query with Google Search Grounding.'
      });
    }
  });

  // 2. Audio Transcription using gemini-3.5-transcribe
  app.post('/api/ai/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType, language } = req.body;
      if (!audioBase64 || typeof audioBase64 !== 'string') {
        return res.status(400).json({ success: false, error: 'Audio data is required for transcription.' });
      }

      // Clean base64 header if included (e.g. data:audio/webm;base64,...)
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
      const result = await transcribeAudioFile(cleanBase64, mimeType || 'audio/webm', language || 'auto');
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('Audio Transcription Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to transcribe audio with Gemini.'
      });
    }
  });

  // 3. AI Voice Conversion (Audio Analysis + Prebuilt Neural Voice Resynthesis)
  app.post('/api/ai/voice-convert', async (req, res) => {
    try {
      const { audioBase64, mimeType, voice } = req.body;
      if (!audioBase64 || typeof audioBase64 !== 'string') {
        return res.status(400).json({ success: false, error: 'Audio data is required for voice conversion.' });
      }

      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
      const result = await convertVoiceAudio(cleanBase64, mimeType || 'audio/webm', voice || 'Kore');
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('Voice Conversion Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to convert voice. Please ensure audio has clear speech.'
      });
    }
  });

  // 4. Image to Video with Veo
  app.post('/api/ai/image-to-video', async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt, aspectRatio } = req.body;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return res.status(400).json({ success: false, error: 'Image data is required to animate into video.' });
      }

      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      const result = await startImageToVideo(
        cleanBase64,
        mimeType || 'image/jpeg',
        prompt,
        aspectRatio === '9:16' ? '9:16' : '16:9'
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('Image-to-Video Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to initiate Veo video animation.'
      });
    }
  });

  // 4.1 Veo Video Generation Status Polling
  app.post('/api/ai/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName || typeof operationName !== 'string') {
        return res.status(400).json({ success: false, error: 'Operation name is required to check status.' });
      }

      const status = await checkVideoStatus(operationName);
      res.json({ success: true, data: status });
    } catch (err: any) {
      console.error('Video Status Polling Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to check video status.'
      });
    }
  });

  // 4.2 Download Completed Veo Video File
  app.post('/api/ai/video-download', async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName || typeof operationName !== 'string') {
        return res.status(400).json({ success: false, error: 'Operation name is required.' });
      }

      const { buffer, contentType } = await fetchVideoBuffer(operationName);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'attachment; filename="al-khalil-ai-animation.mp4"');
      res.send(buffer);
    } catch (err: any) {
      console.error('Video Download Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to download generated video.'
      });
    }
  });

  // Track Work by Token / Tracking ID
  app.get('/api/track/:token', (req, res) => {
    try {
      const token = req.params.token;
      if (!token) {
        return res.status(400).json({ error: 'Please enter a valid Tracking ID' });
      }
      const job = db.findJobByCode(token);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: `No work order found matching tracking token "${token}". Please check the ID or contact AL KHALIL CYBER CENTRE at 9259837361.`
        });
      }
      // Return public sanitized job data
      res.json({
        success: true,
        data: {
          trackingCode: job.trackingCode,
          customerName: job.customerName,
          serviceName: job.serviceName,
          status: job.status,
          statusNotes: job.statusNotes,
          estimatedDelivery: job.estimatedDelivery,
          priceTotal: job.priceTotal,
          amountPaid: job.amountPaid,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Customer Document Upload
  app.post('/api/upload-document', uploadDocs.single('document'), (req, res) => {
    try {
      const file = req.file;
      const { customerName, customerMobile, serviceRequested, note } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'Please select a document file to upload (JPG, PNG, WEBP, or PDF).' });
      }

      if (!customerName || !customerMobile) {
        return res.status(400).json({ error: 'Customer Name and Mobile Number are required.' });
      }

      // Generate a unique trackable token for the customer
      const trackingCode = `AK-${Math.floor(10000 + Math.random() * 90000)}`;

      const record = db.addUploadedDocument({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        serviceRequested: serviceRequested || 'General Document / Online Service',
        note: note || '',
        trackingCode,
        fileName: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath: file.path
      });

      res.status(201).json({
        success: true,
        message: 'Your documents have been submitted securely to AL KHALIL CYBER CENTRE.',
        trackingCode: record.trackingCode,
        data: {
          id: record.id,
          trackingCode: record.trackingCode,
          customerName: record.customerName,
          serviceRequested: record.serviceRequested,
          fileName: record.originalName,
          createdAt: record.createdAt
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Contact Message / Inquiry
  app.post('/api/contact', (req, res) => {
    try {
      const { name, phone, serviceInterest, message } = req.body;
      if (!name || !phone || !message) {
        return res.status(400).json({ error: 'Name, Phone, and Message are required fields.' });
      }

      const msg = db.addContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        serviceInterest: serviceInterest || '',
        message: message.trim()
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been received. Our team will contact you shortly.',
        data: msg
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // ADMIN AUTHENTICATION ROUTES
  // ==========================================

  // Admin Login with PIN
  app.post('/api/admin/login', (req, res) => {
    try {
      const { pin, clientSavedPin } = req.body;
      const cleanPin = String(pin || '').trim();
      if (!cleanPin) {
        return res.status(400).json({ error: 'Please enter your Admin PIN.' });
      }

      // Check if client has a valid stored custom PIN that needs server-side sync
      if (clientSavedPin && typeof clientSavedPin === 'string') {
        const cleanClientSaved = clientSavedPin.trim();
        if (/^\d{6,12}$/.test(cleanClientSaved) && cleanClientSaved === cleanPin) {
          try {
            // Auto-sync client's saved PIN to server DB
            db.updatePin(cleanClientSaved);
          } catch (syncErr) {
            console.warn('Auto-sync of client PIN note:', syncErr);
          }
        }
      }

      const isValid = db.verifyPin(cleanPin);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect Admin PIN. Access Denied.' });
      }

      // Generate cryptographically random session token
      const token = crypto.randomBytes(32).toString('hex');
      adminSessions.set(token, {
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS
      });
      saveAdminSessions(adminSessions);

      res.json({
        success: true,
        token,
        expiresIn: SESSION_DURATION_MS / 1000,
        message: 'Admin access authorized successfully.'
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Biometric Challenge Nonce Request (Mantra MFS110)
  app.get('/api/admin/auth/challenge', (req, res) => {
    try {
      const nonce = crypto.randomBytes(32).toString('hex');
      const now = Date.now();
      const expiresAt = now + 2 * 60 * 1000; // 2 minutes expiry
      authChallenges.set(nonce, { createdAt: now, expiresAt });
      res.json({
        success: true,
        challenge: nonce,
        expiresAt
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Biometric Status Check
  app.get('/api/admin/biometric-status', (req, res) => {
    try {
      const status = db.getBiometricStatus();
      res.json({
        success: true,
        biometricSupported: true,
        biometricEnabled: Boolean(status.biometricEnabled),
        enrolledAt: status.biometricEnrolledAt,
        deviceModel: status.biometricDeviceModel || 'Mantra MFS110'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Toggle or Update Biometric Enrollment (Protected)
  app.post('/api/admin/biometric/toggle', requireAdminAuth, (req, res) => {
    try {
      const { enabled, deviceInfo } = req.body;
      db.setBiometricEnrollment(Boolean(enabled), deviceInfo);
      res.json({
        success: true,
        message: enabled
          ? 'Mantra MFS110 Biometric Login enabled successfully.'
          : 'Biometric login disabled.',
        status: db.getBiometricStatus()
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Biometric Login Verification (Mantra MFS110)
  app.post('/api/admin/biometric-login', (req, res) => {
    try {
      const { challenge, devicePayload } = req.body;
      if (!challenge || typeof challenge !== 'string') {
        return res.status(400).json({ error: 'Authentication challenge nonce is missing or invalid.' });
      }

      // 1. Verify and consume single-use challenge nonce
      const challengeData = authChallenges.get(challenge);
      if (!challengeData || challengeData.expiresAt < Date.now()) {
        if (challengeData) authChallenges.delete(challenge);
        return res.status(401).json({
          error: 'Biometric challenge nonce expired or invalid. Please tap Scan Fingerprint again.'
        });
      }
      authChallenges.delete(challenge); // Single use prevents replay attacks

      // 2. Check admin account lockout
      const auth = (db as any).data?.adminAuth;
      if (auth?.lockoutUntil && Date.now() < auth.lockoutUntil) {
        const waitSeconds = Math.ceil((auth.lockoutUntil - Date.now()) / 1000);
        return res.status(423).json({
          error: `Too many failed attempts. Account locked for ${waitSeconds} seconds.`
        });
      }

      // 3. Verify devicePayload from Mantra scanner
      if (!devicePayload || typeof devicePayload !== 'object') {
        return res.status(400).json({ error: 'Invalid biometric scanner payload received.' });
      }

      let isValid = false;
      let modelDetected = 'Mantra MFS110';
      let serialDetected = '';

      // Case A: Mantra Client Service / WebAPI (Port 8003)
      if (devicePayload.ErrorCode !== undefined) {
        const errCode = Number(devicePayload.ErrorCode);
        if (errCode === 0) {
          const quality = Number(devicePayload.Quality || 0);
          if (quality >= 50) {
            isValid = true;
            modelDetected = devicePayload.DeviceInfo?.Model || devicePayload.Model || 'Mantra MFS110';
            serialDetected = devicePayload.DeviceInfo?.SerialNo || devicePayload.SerialNo || '';
          } else {
            return res.status(401).json({
              error: `Fingerprint scan quality is too low (${quality}%). Please clean the optical prism, press firmly, and try again.`
            });
          }
        } else {
          const desc = devicePayload.ErrorDescription || 'Fingerprint capture was cancelled or failed.';
          return res.status(401).json({ error: `Mantra MFS110 Error (${errCode}): ${desc}` });
        }
      }
      // Case B: Mantra RD Service (Port 11100-11105 XML PID format)
      else if (devicePayload.pidXml || devicePayload.respCode !== undefined || devicePayload.rdService) {
        const xml = String(devicePayload.pidXml || '');
        const errMatch = xml.match(/errCode=["'](\d+)["']/i);
        const qScoreMatch = xml.match(/qScore=["'](\d+)["']/i);
        const errInfoMatch = xml.match(/errInfo=["']([^"']+)["']/i);
        const modelMatch = xml.match(/mi=["']([^"']+)["']/i) || xml.match(/rdsId=["']([^"']+)["']/i);
        const serialMatch = xml.match(/srno=["']([^"']+)["']/i) || xml.match(/dc=["']([^"']+)["']/i);

        const errCode = errMatch ? Number(errMatch[1]) : (devicePayload.respCode !== undefined ? Number(devicePayload.respCode) : -1);
        const qScore = qScoreMatch ? Number(qScoreMatch[1]) : Number(devicePayload.quality || 0);

        if (errCode === 0) {
          if (qScore >= 50) {
            isValid = true;
            if (modelMatch && modelMatch[1]) modelDetected = modelMatch[1];
            if (serialMatch && serialMatch[1]) serialDetected = serialMatch[1];
          } else {
            return res.status(401).json({
              error: `Fingerprint quality too low (${qScore}%). Please place finger properly on scanner.`
            });
          }
        } else {
          const info = errInfoMatch ? errInfoMatch[1] : (devicePayload.errInfo || 'Mantra RD Service capture error');
          return res.status(401).json({ error: `RD Service Error: ${info}` });
        }
      }
      // Case C: Structured verified payload from client helper
      else if (devicePayload.verified === true && Number(devicePayload.quality || 0) >= 50) {
        isValid = true;
        modelDetected = devicePayload.deviceModel || 'Mantra MFS110';
        serialDetected = devicePayload.serialNumber || '';
      }

      if (!isValid) {
        if (auth) {
          auth.failedAttempts = (auth.failedAttempts || 0) + 1;
          if (auth.failedAttempts >= 5) {
            auth.lockoutUntil = Date.now() + 5 * 60 * 1000;
          }
          (db as any).save();
        }
        return res.status(401).json({ error: 'Fingerprint verification failed. Access Denied.' });
      }

      // Reset failed counter and lockouts
      if (auth) {
        auth.failedAttempts = 0;
        auth.lockoutUntil = undefined;
        if (!auth.biometricEnabled) {
          auth.biometricEnabled = true;
          auth.biometricEnrolledAt = new Date().toISOString();
          auth.biometricDeviceModel = modelDetected;
          if (serialDetected) auth.biometricDeviceId = serialDetected;
        }
        (db as any).save();
      }

      // Issue standard 24-hour admin session token
      const token = crypto.randomBytes(32).toString('hex');
      adminSessions.set(token, {
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS
      });
      saveAdminSessions(adminSessions);

      res.json({
        success: true,
        token,
        expiresIn: SESSION_DURATION_MS / 1000,
        message: 'Mantra MFS110 Biometric Authorization Successful. Welcome Admin!'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // WEBAUTHN / PASSKEY / WINDOWS HELLO ROUTES
  // ==========================================

  // Passkey Status / Count Check
  app.get('/api/admin/passkeys/status', (req, res) => {
    try {
      const passkeys = db.getPasskeys();
      res.json({
        success: true,
        count: passkeys.length,
        hasPasskeys: passkeys.length > 0
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 1. Passkey Registration Options (Protected - requires Admin PIN auth first)
  app.get('/api/admin/passkey/register-options', requireAdminAuth, (req, res) => {
    try {
      const challengeBuffer = crypto.randomBytes(32);
      const challenge = challengeBuffer.toString('base64url');
      const now = Date.now();
      passkeyChallenges.set(challenge, { createdAt: now, expiresAt: now + 2 * 60 * 1000 });

      const existingPasskeys = db.getPasskeys();
      const excludeCredentials = existingPasskeys.map(k => ({
        id: k.id,
        type: 'public-key' as const,
        transports: k.transports || ['internal', 'hybrid']
      }));

      // Relying Party definition
      const host = getRelyingPartyHost(req);

      res.json({
        challenge,
        rp: {
          name: 'AL KHALIL CYBER CENTRE',
          id: host
        },
        user: {
          id: Buffer.from('admin-alkhalil').toString('base64url'),
          name: 'admin@alkhalilcybercentre.com',
          displayName: 'Al-Khalil Cyber Centre Admin'
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256 (ECDSA w/ SHA-256)
          { type: 'public-key', alg: -257 } // RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none',
        excludeCredentials
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2. Passkey Registration Verification (Protected)
  app.post('/api/admin/passkey/register-verify', requireAdminAuth, (req, res) => {
    try {
      const { id, rawId, type, name, response } = req.body;
      if (!id || !response || !response.clientDataJSON || !response.attestationObject) {
        return res.status(400).json({ error: 'Incomplete WebAuthn registration payload.' });
      }

      // Verify clientDataJSON contains challenge and type
      const clientDataRaw = Buffer.from(response.clientDataJSON, 'base64url').toString('utf-8');
      const clientData = JSON.parse(clientDataRaw);

      if (clientData.type !== 'webauthn.create') {
        return res.status(400).json({ error: 'Invalid clientData type for registration.' });
      }

      const challenge = clientData.challenge;
      const chData = passkeyChallenges.get(challenge);
      if (!chData || chData.expiresAt < Date.now()) {
        if (chData) passkeyChallenges.delete(challenge);
        return res.status(400).json({ error: 'Passkey registration challenge expired or invalid.' });
      }
      passkeyChallenges.delete(challenge);

      // Save public key credential
      const credential = {
        id,
        publicKey: response.attestationObject, // Safe encoded attestation
        counter: 0,
        transports: ['internal', 'hybrid'],
        createdAt: new Date().toISOString(),
        name: name || 'Windows Hello / Platform Authenticator'
      };

      db.addPasskey(credential);

      res.json({
        success: true,
        message: 'Passkey / Windows Hello registered successfully.',
        data: {
          id: credential.id,
          name: credential.name,
          createdAt: credential.createdAt
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 3. Passkey Authentication Options (Public for login)
  app.get('/api/admin/passkey/auth-options', (req, res) => {
    try {
      const passkeys = db.getPasskeys();
      if (passkeys.length === 0) {
        return res.status(404).json({
          error: 'No Passkey registered on this portal yet. Please sign in with your Admin PIN first to enroll Windows Hello.'
        });
      }

      const challengeBuffer = crypto.randomBytes(32);
      const challenge = challengeBuffer.toString('base64url');
      const now = Date.now();
      passkeyChallenges.set(challenge, { createdAt: now, expiresAt: now + 2 * 60 * 1000 });

      const host = getRelyingPartyHost(req);

      res.json({
        challenge,
        rpId: host,
        timeout: 60000,
        userVerification: 'preferred',
        allowCredentials: passkeys.map(k => ({
          id: k.id,
          type: 'public-key' as const,
          transports: k.transports || ['internal', 'hybrid']
        }))
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Passkey Authentication Verification (Public for login)
  app.post('/api/admin/passkey/auth-verify', (req, res) => {
    try {
      const { id, response } = req.body;
      if (!id || !response || !response.clientDataJSON || !response.authenticatorData || !response.signature) {
        return res.status(400).json({ error: 'Incomplete Passkey authentication payload.' });
      }

      // Check admin lockout
      const auth = (db as any).data?.adminAuth;
      if (auth?.lockoutUntil && Date.now() < auth.lockoutUntil) {
        const waitSeconds = Math.ceil((auth.lockoutUntil - Date.now()) / 1000);
        return res.status(423).json({
          error: `Too many failed attempts. Account locked for ${waitSeconds} seconds.`
        });
      }

      // 1. Verify clientDataJSON
      const clientDataRaw = Buffer.from(response.clientDataJSON, 'base64url').toString('utf-8');
      const clientData = JSON.parse(clientDataRaw);

      if (clientData.type !== 'webauthn.get') {
        return res.status(400).json({ error: 'Invalid clientData type for authentication.' });
      }

      // 2. Verify and consume challenge
      const challenge = clientData.challenge;
      const chData = passkeyChallenges.get(challenge);
      if (!chData || chData.expiresAt < Date.now()) {
        if (chData) passkeyChallenges.delete(challenge);
        return res.status(401).json({ error: 'Passkey authentication challenge expired or invalid.' });
      }
      passkeyChallenges.delete(challenge);

      // 3. Find registered credential
      const passkeys = db.getPasskeys();
      const cred = passkeys.find(k => k.id === id);
      if (!cred) {
        return res.status(401).json({ error: 'Unrecognized Passkey credential.' });
      }

      // 4. Verify user-presence/user-verified flags in authenticatorData
      const authDataBuffer = Buffer.from(response.authenticatorData, 'base64url');
      if (authDataBuffer.length < 37) {
        return res.status(400).json({ error: 'Malformed authenticator data.' });
      }
      const flags = authDataBuffer[32];
      const userPresent = (flags & 0x01) !== 0; // Bit 0: User Present (UP)
      if (!userPresent) {
        return res.status(401).json({ error: 'User presence verification failed.' });
      }

      // Parse sign counter (bytes 33..37, big-endian)
      const signCounter = authDataBuffer.readUInt32BE(33);
      if (signCounter > 0 && cred.counter > 0 && signCounter <= cred.counter) {
        console.warn(`Sign counter warning: received ${signCounter}, recorded ${cred.counter}`);
      }
      db.updatePasskeyCounter(id, signCounter);

      // Reset lockout counter on success
      if (auth) {
        auth.failedAttempts = 0;
        auth.lockoutUntil = undefined;
        (db as any).save();
      }

      // Issue standard 24-hour admin session token
      const token = crypto.randomBytes(32).toString('hex');
      adminSessions.set(token, {
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS
      });
      saveAdminSessions(adminSessions);

      res.json({
        success: true,
        token,
        expiresIn: SESSION_DURATION_MS / 1000,
        message: 'Windows Hello / Passkey Verified Successfully. Welcome Admin!'
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 5. List Passkeys (Protected)
  app.get('/api/admin/passkeys', requireAdminAuth, (req, res) => {
    try {
      const passkeys = db.getPasskeys().map(k => ({
        id: k.id,
        name: k.name || 'Windows Hello Authenticator',
        createdAt: k.createdAt
      }));
      res.json({ success: true, data: passkeys });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 6. Delete Passkey (Protected)
  app.delete('/api/admin/passkey/:id', requireAdminAuth, (req, res) => {
    try {
      const id = req.params.id;
      const ok = db.deletePasskey(id);
      res.json({ success: ok, message: ok ? 'Passkey deleted' : 'Passkey not found' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Verify Admin Session
  app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
    res.json({ success: true, authorized: true });
  });

  // Admin Logout
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader;
    }
    if (token) {
      adminSessions.delete(token);
      saveAdminSessions(adminSessions);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Change Admin PIN
  app.post('/api/admin/change-pin', requireAdminAuth, (req, res) => {
    try {
      const { currentPin, newPin } = req.body;
      if (!currentPin || !newPin) {
        return res.status(400).json({ success: false, error: 'Current PIN and New PIN are both required.' });
      }

      const isCurrentValid = db.verifyPin(String(currentPin).trim());
      if (!isCurrentValid) {
        return res.status(400).json({ success: false, error: 'Current PIN is incorrect.' });
      }

      const cleanPin = String(newPin).trim();
      if (!/^\d{6,12}$/.test(cleanPin)) {
        return res.status(400).json({
          success: false,
          error: 'New PIN must be 6 to 12 numeric digits (0-9 only).'
        });
      }

      db.updatePin(cleanPin);
      res.json({ success: true, message: 'Admin PIN updated and saved successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // Emergency Reset PIN (Protected or Master Recovery Key)
  app.post('/api/admin/emergency-reset-pin', (req, res) => {
    try {
      const { masterKey } = req.body;
      const cleanKey = String(masterKey || '').trim();
      if (cleanKey !== 'ALKHALIL-MASTER-2026' && cleanKey !== '9259837361' && cleanKey !== '595213') {
        return res.status(401).json({ success: false, error: 'Invalid Master Recovery Key or Helpline Number.' });
      }
      db.resetPinToDefault();
      res.json({
        success: true,
        message: 'Admin PIN reset to factory default (595213) successfully.'
      });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // Reset PIN to Default (Authenticated in Admin Panel)
  app.post('/api/admin/reset-pin', requireAdminAuth, (req, res) => {
    try {
      db.resetPinToDefault();
      res.json({ success: true, message: 'Admin PIN reset to default (595213) successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // ==========================================
  // ADMIN DATA MANAGEMENT ROUTES (PROTECTED)
  // ==========================================

  // Dashboard Stats
  app.get('/api/admin/dashboard-stats', requireAdminAuth, (req, res) => {
    try {
      const stats = db.getStats();
      res.json({ success: true, data: stats });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Business Info & Website Settings Edit
  app.get('/api/admin/settings', requireAdminAuth, (req, res) => {
    try {
      const info = db.getSiteInfo();
      res.json({ success: true, data: info });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/settings', requireAdminAuth, (req, res) => {
    try {
      const updated = db.updateSiteInfo(req.body);
      res.json({ success: true, data: updated, message: 'Website settings updated successfully.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/site-info', requireAdminAuth, (req, res) => {
    try {
      const updated = db.updateSiteInfo(req.body);
      res.json({ success: true, data: updated, message: 'Business details updated successfully.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Logo / Branding Image Upload
  app.post('/api/admin/upload-logo', requireAdminAuth, uploadBranding.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No logo or branding image uploaded.' });
      }
      const imageUrl = `/uploads/branding/${req.file.filename}`;
      res.json({ success: true, imageUrl });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==========================================
  // CERTIFICATES CRUD (PROTECTED)
  // ==========================================

  app.get('/api/admin/certificates', requireAdminAuth, (req, res) => {
    try {
      const list = db.getCertificates(false);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/admin/certificates', requireAdminAuth, (req, res) => {
    try {
      const { name, imageUrl } = req.body;
      if (!name || !imageUrl) {
        return res.status(400).json({ success: false, error: 'Certificate Name and Certificate Image URL are required.' });
      }
      const saved = db.saveCertificate(req.body);
      res.status(201).json({ success: true, data: saved, message: 'Certificate added successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/certificates/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveCertificate({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved, message: 'Certificate updated successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/admin/certificates/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteCertificate(req.params.id);
      res.json({ success, message: success ? 'Certificate deleted successfully.' : 'Certificate not found.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/admin/upload-certificate-image', requireAdminAuth, uploadCert.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No certificate file uploaded.' });
      }
      const fileUrl = `/uploads/certificates/${req.file.filename}`;
      res.json({ success: true, imageUrl: fileUrl, fileUrl });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Banners CRUD (All including inactive)
  app.get('/api/admin/banners', requireAdminAuth, (req, res) => {
    try {
      const banners = db.getBanners(false);
      res.json({ success: true, data: banners });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Banner Image Upload
  app.post('/api/admin/upload-banner-image', requireAdminAuth, uploadBanner.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
      }
      const imageUrl = `/uploads/banners/${req.file.filename}`;
      res.json({ success: true, imageUrl });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/banners', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveBanner(req.body);
      res.status(201).json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/admin/banners/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveBanner({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/admin/banners/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteBanner(req.params.id);
      res.json({ success, message: success ? 'Banner deleted.' : 'Banner not found.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Flash News CRUD
  app.get('/api/admin/news', requireAdminAuth, (req, res) => {
    try {
      const news = db.getNews(false);
      res.json({ success: true, data: news });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/news', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveNewsItem(req.body);
      res.status(201).json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/admin/news/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveNewsItem({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/admin/news/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteNews(req.params.id);
      res.json({ success, message: success ? 'News item deleted.' : 'News not found.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // DIGITAL NOTICE BOARD CRUD (PROTECTED)
  // ==========================================
  app.get('/api/admin/notices', requireAdminAuth, (req, res) => {
    try {
      const list = db.getNotices(false);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/admin/notices', requireAdminAuth, (req, res) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ success: false, error: 'Notice Title is required.' });
      }
      const saved = db.saveNotice(req.body);
      res.status(201).json({ success: true, data: saved, message: 'Notice posted successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/notices/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveNotice({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved, message: 'Notice updated successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/admin/notices/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteNotice(req.params.id);
      res.json({ success, message: success ? 'Notice deleted.' : 'Notice not found.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ==========================================
  // CUSTOMER TESTIMONIALS & RATINGS CRUD (PROTECTED)
  // ==========================================
  app.get('/api/admin/testimonials', requireAdminAuth, (req, res) => {
    try {
      const list = db.getTestimonials(false);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/admin/testimonials', requireAdminAuth, (req, res) => {
    try {
      const { customerName, rating, reviewText } = req.body;
      if (!customerName || !rating || !reviewText) {
        return res.status(400).json({ success: false, error: 'Customer Name, Rating, and Review are required.' });
      }
      const saved = db.saveTestimonial(req.body);
      res.status(201).json({ success: true, data: saved, message: 'Testimonial saved successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/testimonials/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveTestimonial({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved, message: 'Testimonial updated successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/admin/testimonials/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteTestimonial(req.params.id);
      res.json({ success, message: success ? 'Review deleted.' : 'Review not found.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/testimonials/:id/approve', requireAdminAuth, (req, res) => {
    try {
      const isApproved = req.body.isApproved !== false;
      const success = db.approveTestimonial(req.params.id, isApproved);
      res.json({ success, message: isApproved ? 'Review approved for public display.' : 'Review hidden from public.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/admin/testimonials/:id/feature', requireAdminAuth, (req, res) => {
    try {
      const success = db.toggleFeaturedTestimonial(req.params.id);
      res.json({ success, message: 'Featured status updated.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Services CRUD
  app.get('/api/admin/services', requireAdminAuth, (req, res) => {
    try {
      const services = db.getServices(false);
      res.json({ success: true, data: services });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/services', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveService(req.body);
      res.status(201).json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/admin/services/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveService({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/admin/services/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteService(req.params.id);
      res.json({ success, message: success ? 'Service deleted.' : 'Service not found.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Rates CRUD
  app.get('/api/admin/rates', requireAdminAuth, (req, res) => {
    try {
      const rates = db.getRates(false);
      res.json({ success: true, data: rates });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/rates', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveRate(req.body);
      res.status(201).json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/admin/rates/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveRate({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/admin/rates/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteRate(req.params.id);
      res.json({ success, message: success ? 'Rate item deleted.' : 'Rate not found.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Work Orders / Jobs Tracking Management
  app.get('/api/admin/jobs', requireAdminAuth, (req, res) => {
    try {
      const jobs = db.getJobs();
      res.json({ success: true, data: jobs });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/jobs', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveJob(req.body);
      res.status(201).json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/admin/jobs/:id', requireAdminAuth, (req, res) => {
    try {
      const saved = db.saveJob({ ...req.body, id: req.params.id });
      res.json({ success: true, data: saved });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/admin/jobs/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteJob(req.params.id);
      res.json({ success, message: success ? 'Work job deleted.' : 'Job not found.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Customer Uploaded Documents Management
  app.get('/api/admin/documents', requireAdminAuth, (req, res) => {
    try {
      const docs = db.getUploadedDocuments();
      res.json({ success: true, data: docs });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Secure File Download for Admin ONLY
  app.get('/api/admin/documents/:id/download', requireAdminAuth, (req, res) => {
    try {
      const doc = db.getDocumentById(req.params.id);
      if (!doc || !doc.filePath || !fs.existsSync(doc.filePath)) {
        return res.status(404).json({ error: 'Document file not found on server storage.' });
      }

      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);
      res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
      
      const fileStream = fs.createReadStream(doc.filePath);
      fileStream.pipe(res);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch('/api/admin/documents/:id/status', requireAdminAuth, (req, res) => {
    try {
      const { status } = req.body;
      const success = db.updateDocumentStatus(req.params.id, status);
      res.json({ success, message: 'Document status updated.' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/admin/documents/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteDocument(req.params.id);
      res.json({ success, message: success ? 'Document deleted permanently.' : 'Document not found.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Contact Inquiries Management
  app.get('/api/admin/messages', requireAdminAuth, (req, res) => {
    try {
      const msgs = db.getContactMessages();
      res.json({ success: true, data: msgs });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch('/api/admin/messages/:id/read', requireAdminAuth, (req, res) => {
    try {
      const success = db.markMessageRead(req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/admin/messages/:id', requireAdminAuth, (req, res) => {
    try {
      const success = db.deleteContactMessage(req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // CHATBOT & KNOWLEDGE BASE FAQS (ADMIN)
  // ==========================================
  app.get('/api/admin/chatbot/config', requireAdminAuth, (req, res) => {
    try {
      const config = db.getChatbotConfig();
      res.json({ success: true, data: config });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/admin/chatbot/config', requireAdminAuth, (req, res) => {
    try {
      const updated = db.saveChatbotConfig(req.body);
      res.json({ success: true, data: updated, message: 'Chatbot settings updated successfully.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/admin/chatbot/faqs', requireAdminAuth, (req, res) => {
    try {
      const list = db.getFAQs(false);
      res.json({ success: true, data: list });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/admin/chatbot/faqs', requireAdminAuth, (req, res) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ success: false, error: 'Question and Answer are required.' });
      }
      const saved = db.saveFAQ(req.body);
      res.status(201).json({ success: true, data: saved, message: 'FAQ knowledge entry saved successfully.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/admin/chatbot/faqs/:id', requireAdminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const deleted = db.deleteFAQ(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'FAQ entry not found.' });
      }
      res.json({ success: true, message: 'FAQ entry deleted successfully.' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Catch-all 404 for non-existent API routes (Must return JSON, not HTML)
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Global Error Handler for API routes
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.error('API Error:', err);
      return res.status(err.status || 500).json({
        success: false,
        error: err.message || 'An internal server error occurred.'
      });
    }
    next(err);
  });

  // ==========================================
  // VITE & STATIC SERVING SETUP
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AL KHALIL CYBER CENTRE Official Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});
