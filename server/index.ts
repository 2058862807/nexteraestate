import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API routes (placeholder)
app.get('/api/user', (req, res) => {
  res.json({ id: '1', name: 'Demo User', email: 'demo@nexteraestate.com' });
});

app.get('/api/wills', (req, res) => {
  res.json([{
    id: '1',
    title: 'My Will',
    status: 'draft',
    personalInfo: { name: 'Demo User', state: 'CA' },
    createdAt: new Date()
  }]);
});

app.get('/api/documents', (req, res) => {
  res.json([]);
});

app.get('/api/family', (req, res) => {
  res.json([]);
});

app.get('/api/death-switch', (req, res) => {
  res.json({ enabled: false });
});

app.get('/api/activity', (req, res) => {
  res.json([{
    id: '1',
    action: 'Will created',
    createdAt: new Date()
  }]);
});

app.get('/api/payments/usage', (req, res) => {
  res.json({
    storage: { used: 0, limit: 5000000000, percentage: 0 },
    videoMessages: { used: 0, limit: 2 },
    familyMembers: { used: 0, limit: 3 }
  });
});

app.get('/api/payments/subscription', (req, res) => {
  res.json({
    plan: { name: 'Free', id: 'free' },
    status: 'active'
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`[SERVER] NextEra Estate backend listening on port ${port}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});


