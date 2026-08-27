import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  db,
  UPLOADS_DIR,
  BANNER_UPLOADS_DIR,
  DOCS_UPLOADS_DIR,
  CERTIFICATES_UPLOADS_DIR,
  BRANDING_UPLOADS_DIR
} from './server/db.ts';

dotenv.config();

// In-Memory Admin Sessions Map (token -> expiresAt)
const adminSessions = new Map<string, { createdAt: number; expiresAt: number }>();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (session.expiresAt < now) {
      adminSessions.delete(token);
    }
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
    if (session) adminSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in with your Admin PIN again.' });
  }

  // Extend session
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Middlewares
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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
      const { pin } = req.body;
      if (!pin) {
        return res.status(400).json({ error: 'Please enter your Admin PIN.' });
      }

      const isValid = db.verifyPin(String(pin).trim());
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect Admin PIN. Access Denied.' });
      }

      // Generate cryptographically random session token
      const token = crypto.randomBytes(32).toString('hex');
      adminSessions.set(token, {
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS
      });

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
      res.json({ success: true, message: 'Admin PIN updated successfully.' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // Reset PIN (Emergency recovery endpoint using admin auth)
  app.post('/api/admin/reset-pin', requireAdminAuth, (req, res) => {
    try {
      const { newPin } = req.body;
      const cleanPin = String(newPin || '').trim();
      if (!/^\d{6,12}$/.test(cleanPin)) {
        return res.status(400).json({ success: false, error: 'New PIN must be 6 to 12 numeric digits.' });
      }
      db.updatePin(cleanPin);
      res.json({ success: true, message: 'Admin PIN reset successfully.' });
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
