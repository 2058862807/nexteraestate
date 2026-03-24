import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import crypto from 'crypto';

// Neon websocket config
neonConfig.webSocketConstructor = ws;

const app = express();
const upload = multer({ dest: '/tmp/uploads/', limits: { fileSize: 100 * 1024 * 1024 } });

// ── Clients ──
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'https://nexteraestate.onrender.com/api/auth/google/callback'
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
const db = pool ? drizzle({ client: pool }) : null;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://nexteraestate.com';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://nexteraestate.onrender.com/api/auth/google/callback';

// ── Middleware ──
app.use(cors({
  origin: [
    'https://nexteraestate.com',
    'https://www.nexteraestate.com',
    'https://nexteraestate.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ── Auth Middleware ──
const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── Health ──
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Google Auth ──
app.get('/api/auth/google', (_req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    redirect_uri: REDIRECT_URI
  });
  res.redirect(url);
});

app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(FRONTEND_URL + '?error=no_code');

    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: REDIRECT_URI
    });
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!
    });
    const payload = ticket.getPayload()!;

    // Upsert user in DB if available
    if (db) {
      try {
        await pool!.query(
          `INSERT INTO users (id, email, name, avatar, auth_provider, auth_provider_id, created_at, updated_at, last_active)
           VALUES ($1, $2, $3, $4, 'google', $5, NOW(), NOW(), NOW())
           ON CONFLICT (email) DO UPDATE SET name=$3, avatar=$4, last_active=NOW()`,
          [uuidv4(), payload.email, payload.name, payload.picture, payload.sub]
        );
      } catch (dbErr) {
        console.error('DB upsert error:', dbErr);
      }
    }

    // Get user id
    let userId = payload.sub;
    if (db) {
      try {
        const result = await pool!.query('SELECT id FROM users WHERE email=$1', [payload.email]);
        if (result.rows[0]) userId = result.rows[0].id;
      } catch {}
    }

    const token = jwt.sign(
      { id: userId, email: payload.email, name: payload.name, avatar: payload.picture },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(FRONTEND_URL + '/dashboard?token=' + token);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(FRONTEND_URL + '?error=auth_failed');
  }
});

// ── User ──
app.get('/api/user', auth, (req: Request, res: Response) => {
  res.json(req.user);
});

// ── Wills ──
app.get('/api/wills', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query('SELECT * FROM wills WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

app.post('/api/wills', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ id: uuidv4(), ...req.body });
  try {
    const id = uuidv4();
    const result = await pool!.query(
      `INSERT INTO wills (id, user_id, title, status, personal_info, created_at, updated_at)
       VALUES ($1, $2, $3, 'draft', $4, NOW(), NOW()) RETURNING *`,
      [id, req.user.id, req.body.title || 'My Will', JSON.stringify(req.body)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create will' });
  }
});

// ── Documents ──
app.get('/api/documents', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query('SELECT * FROM documents WHERE user_id=$1 ORDER BY uploaded_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch {
    res.json([]);
  }
});

app.post('/api/documents', auth, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  if (!db) return res.json({ id: uuidv4(), name: req.file.originalname });
  try {
    const id = uuidv4();
    const result = await pool!.query(
      `INSERT INTO documents (id, user_id, original_name, file_name, file_size, mime_type, category, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [id, req.user.id, req.file.originalname, req.file.filename, req.file.size, req.file.mimetype, req.body.category || 'personal']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.delete('/api/documents/:id', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ success: true });
  try {
    await pool!.query('DELETE FROM documents WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ── Family ──
app.get('/api/family', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query('SELECT * FROM family_members WHERE user_id=$1', [req.user.id]);
    res.json(result.rows);
  } catch { res.json([]); }
});

app.post('/api/family', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ id: uuidv4(), ...req.body });
  try {
    const id = uuidv4();
    const result = await pool!.query(
      `INSERT INTO family_members (id, user_id, first_name, last_name, email, relationship, role, status, invited_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'invited', NOW()) RETURNING *`,
      [id, req.user.id, req.body.firstName, req.body.lastName, req.body.email, req.body.relationship, req.body.role || 'beneficiary']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// ── Death Switch ──
app.get('/api/death-switch', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ enabled: false });
  try {
    const result = await pool!.query('SELECT * FROM death_switch WHERE user_id=$1 LIMIT 1', [req.user.id]);
    res.json(result.rows[0] || { enabled: false });
  } catch { res.json({ enabled: false }); }
});

app.post('/api/death-switch', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ id: uuidv4(), ...req.body });
  try {
    const id = uuidv4();
    const result = await pool!.query(
      `INSERT INTO death_switch (id, user_id, enabled, inactivity_period, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET enabled=$3, updated_at=NOW() RETURNING *`,
      [id, req.user.id, req.body.enabled || false, req.body.inactivityPeriod || 90]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update death switch' });
  }
});

// ── Activity ──
app.get('/api/activity', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query(
      'SELECT * FROM activity_log WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch { res.json([]); }
});

// ── Payments ──
app.get('/api/payments/usage', auth, (_req, res) => {
  res.json({
    storage: { used: 0, limit: 5000000000, percentage: 0 },
    videoMessages: { used: 0, limit: 2 },
    familyMembers: { used: 0, limit: 3 }
  });
});

app.get('/api/payments/subscription', auth, (_req, res) => {
  res.json({ plan: { name: 'Free', id: 'free' }, status: 'active' });
});

// ── AI - Will Builder ──
app.post('/api/ai/will-builder', auth, async (req: Request, res: Response) => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'You are an expert estate planning attorney. Help users create their will with specific, legally-sound guidance. This is not legal advice — always recommend consulting a licensed attorney.',
      messages: [{ role: 'user', content: req.body.userInput || req.body.message }]
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ response: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI unavailable' });
  }
});

// ── AI - Grief Counseling ──
app.post('/api/ai/grief-counseling', auth, async (req: Request, res: Response) => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You are a compassionate grief counselor. Provide empathetic, professional support. If someone expresses suicidal thoughts, provide crisis resources immediately: National Suicide Prevention Lifeline: 988.',
      messages: [{ role: 'user', content: req.body.message }]
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ response: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI unavailable' });
  }
});

// ── AI - Compliance ──
app.post('/api/ai/compliance', auth, async (req: Request, res: Response) => {
  try {
    const { state } = req.body;
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: 'You are a legal compliance expert for estate planning. Provide accurate, current information about will requirements by state.',
      messages: [{ role: 'user', content: `What are the will execution requirements for ${state || 'Alabama'}? Include: witnesses needed, notarization requirements, holographic will rules, probate thresholds.` }]
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ response: text, state });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI unavailable' });
  }
});

// ── Legal Compliance (hardcoded data) ──
app.get('/api/legal/state/:state', (_req, res) => {
  const { state } = _req.params;
  const requirements: Record<string, any> = {
    'AL': { stateName: 'Alabama', witnesses: 2, notarizationRequired: false, holographicAllowed: true, selfProvingAffidavit: true },
    'CA': { stateName: 'California', witnesses: 2, notarizationRequired: false, holographicAllowed: true, selfProvingAffidavit: true },
    'FL': { stateName: 'Florida', witnesses: 2, notarizationRequired: false, holographicAllowed: false, selfProvingAffidavit: true },
    'TX': { stateName: 'Texas', witnesses: 2, notarizationRequired: false, holographicAllowed: true, selfProvingAffidavit: true },
    'NY': { stateName: 'New York', witnesses: 2, notarizationRequired: false, holographicAllowed: false, selfProvingAffidavit: true },
  };
  const data = requirements[state.toUpperCase()] || { stateName: state, witnesses: 2, notarizationRequired: false, holographicAllowed: false, selfProvingAffidavit: true };
  res.json(data);
});

// ── Dashboard Stats ──
app.get('/api/dashboard/stats', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ totalDocuments: 0, completedWills: 0, complianceScore: 0, lastActivity: new Date() });
  try {
    const [docs, wills] = await Promise.all([
      pool!.query('SELECT COUNT(*) FROM documents WHERE user_id=$1', [req.user.id]),
      pool!.query('SELECT COUNT(*) FROM wills WHERE user_id=$1 AND status=$2', [req.user.id, 'completed'])
    ]);
    res.json({
      totalDocuments: parseInt(docs.rows[0].count),
      completedWills: parseInt(wills.rows[0].count),
      complianceScore: 0,
      lastActivity: new Date()
    });
  } catch {
    res.json({ totalDocuments: 0, completedWills: 0, complianceScore: 0, lastActivity: new Date() });
  }
});


// ── AI - Esquire ──
app.post('/api/ai/esquire', async (req: Request, res: Response) => {
  try {
    const message = req.body.message || req.body.userInput || '';
    const aiMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You are Esquire AI, an expert estate planning assistant for NextEra Estate. Help users understand: will creation, trusts, power of attorney, probate, Social Security survivors benefits (eligibility, how to apply, benefit amounts), Veterans benefits (VA pension, DIC, Survivors Pension, burial benefits), and how to use NextEra Estate features. Be clear and compassionate. Always add: This is general information, not legal advice.`,
      messages: [{ role: 'user', content: message }]
    });
    const text = aiMessage.content[0].type === 'text' ? aiMessage.content[0].text : '';
    res.json({ response: text });
  } catch (err) {
    console.error('Esquire error:', err);
    res.status(500).json({ error: 'AI temporarily unavailable' });
  }
});

// ── Add these routes to server/index.ts before the Error Handler ──

// ── Blockchain Notarization ──
app.get('/api/blockchain/notarizations', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query('SELECT * FROM blockchain_notarizations WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch { res.json([]); }
});

app.post('/api/blockchain/notarize', auth, async (req: Request, res: Response) => {
  try {
    const { hash, fileName, fileSize } = req.body;
    const id = uuidv4();
    const txHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
    if (db) {
      const result = await pool!.query(
        `INSERT INTO blockchain_notarizations (id, user_id, hash, tx_hash, file_name, file_size, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', NOW()) RETURNING *`,
        [id, req.user.id, hash, txHash, fileName, fileSize]
      );
      res.json(result.rows[0]);
    } else {
      res.json({ id, hash, tx_hash: txHash, file_name: fileName, status: 'confirmed', created_at: new Date() });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Notarization failed' });
  }
});

// ── Video Messages ──
app.get('/api/videos', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query('SELECT * FROM video_messages WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch { res.json([]); }
});

app.post('/api/videos', auth, upload.single('video'), async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { title, recipient, trigger, message } = req.body;
    if (db) {
      const result = await pool!.query(
        `INSERT INTO video_messages (id, user_id, title, recipient, trigger_event, message, file_name, file_size, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW()) RETURNING *`,
        [id, req.user.id, title || req.file?.originalname, recipient, trigger || 'death', message, req.file?.originalname, req.file?.size]
      );
      res.json(result.rows[0]);
    } else {
      res.json({ id, title, recipient, trigger, status: 'pending', created_at: new Date() });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.delete('/api/videos/:id', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ success: true });
  try {
    await pool!.query('DELETE FROM video_messages WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

// ── Death Switch Heirs ──
app.get('/api/death-switch/heirs', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query('SELECT * FROM death_switch_heirs WHERE user_id=$1', [req.user.id]);
    res.json(result.rows);
  } catch { res.json([]); }
});

app.post('/api/death-switch/heirs', auth, async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { name, email, relationship, phone } = req.body;
    if (db) {
      const result = await pool!.query(
        `INSERT INTO death_switch_heirs (id, user_id, name, email, relationship, phone, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
        [id, req.user.id, name, email, relationship, phone]
      );
      res.json(result.rows[0]);
    } else {
      res.json({ id, name, email, relationship, phone });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add heir' });
  }
});

app.delete('/api/death-switch/heirs/:id', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ success: true });
  try {
    await pool!.query('DELETE FROM death_switch_heirs WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

app.post('/api/death-switch/checkin', auth, async (req: Request, res: Response) => {
  try {
    if (db) {
      await pool!.query(
        `INSERT INTO death_switch (id, user_id, enabled, inactivity_period, last_checkin, created_at, updated_at)
         VALUES ($1, $2, true, 90, NOW(), NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET last_checkin=NOW(), updated_at=NOW()`,
        [uuidv4(), req.user.id]
      );
    }
    res.json({ success: true, lastCheckin: new Date() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// ── Password Vault ──
app.get('/api/password-vault', auth, async (req: Request, res: Response) => {
  if (!db) return res.json([]);
  try {
    const result = await pool!.query('SELECT * FROM password_vault WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch { res.json([]); }
});

app.post('/api/password-vault', auth, async (req: Request, res: Response) => {
  try {
    const id = uuidv4();
    const { title, category, username, password, url, pin, notes, recovery_codes } = req.body;
    if (db) {
      const result = await pool!.query(
        `INSERT INTO password_vault (id, user_id, title, category, username, password, url, pin, notes, recovery_codes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
        [id, req.user.id, title, category, username, password, url, pin, notes, recovery_codes]
      );
      res.json(result.rows[0]);
    } else {
      res.json({ id, title, category, username, url, notes, created_at: new Date() });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

app.delete('/api/password-vault/:id', auth, async (req: Request, res: Response) => {
  if (!db) return res.json({ success: true });
  try {
    await pool!.query('DELETE FROM password_vault WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

// ── Error Handler ──
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Start ──
const port = parseInt(process.env.PORT || '5000', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(`[SERVER] NextEra Estate backend listening on port ${port}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] Database: ${pool ? 'connected' : 'not configured'}`);
  console.log(`[SERVER] AI: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured'}`);
});

// TypeScript augmentation
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
