import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const app = express();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.use(cors({
  origin: ['https://nexteraestate.com', 'https://www.nexteraestate.com', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/auth/google', (req: Request, res: Response) => {
  try {
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'https://nexteraestate.onrender.com/api/auth/google/callback'
    });
    res.redirect(url);
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Auth failed' });
  }
});

app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'https://nexteraestate.com';
    if (!code) return res.redirect(frontendUrl + '?error=no_code');
    const { tokens } = await googleClient.getToken({ code: code as string, redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'https://nexteraestate.onrender.com/api/auth/google/callback' });
    googleClient.setCredentials(tokens);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!
    });
    const payload = ticket.getPayload()!;
    const token = jwt.sign(
      { id: payload.sub, email: payload.email, name: payload.name, avatar: payload.picture },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    res.redirect(frontendUrl + '/dashboard?token=' + token);
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect((process.env.FRONTEND_URL || 'https://nexteraestate.com') + '?error=auth_failed');
  }
});

app.get('/api/user', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    res.json({ id: decoded.id, email: decoded.email, name: decoded.name, avatar: decoded.avatar });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/wills', (req: Request, res: Response) => { res.json([]); });
app.get('/api/documents', (req: Request, res: Response) => { res.json([]); });
app.get('/api/family', (req: Request, res: Response) => { res.json([]); });
app.get('/api/death-switch', (req: Request, res: Response) => { res.json({ enabled: false }); });
app.get('/api/activity', (req: Request, res: Response) => { res.json([]); });
app.get('/api/payments/usage', (req: Request, res: Response) => {
  res.json({ storage: { used: 0, limit: 5000000000, percentage: 0 }, videoMessages: { used: 0, limit: 2 }, familyMembers: { used: 0, limit: 3 } });
});
app.get('/api/payments/subscription', (req: Request, res: Response) => {
  res.json({ plan: { name: 'Free', id: 'free' }, status: 'active' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`[SERVER] NextEra Estate backend listening on port ${port}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});
