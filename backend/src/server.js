import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'LOOP AI Customer Feedback Intelligence Platform',
    timestamp: new Date().toISOString()
  });
});

// Live Database Reseed / Populate Endpoint
app.all('/api/seed-database', async (req, res) => {
  try {
    const { seed135Complaints } = await import('./scripts/seed135Complaints.js');
    await seed135Complaints();
    res.json({ success: true, message: '10 Analysts & 135 corporate complaints successfully populated and assigned in database.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', reportRoutes);
app.use('/api', notificationRoutes);
app.use('/api', auditRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/feedback', feedbackRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred.'
  });
});

// Seed DB & Start Server
async function startServer() {
  try {
    console.log('Initializing LOOP SQLite Database & Seeding...');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 LOOP Backend API running on http://localhost:${PORT}`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
}

startServer();
