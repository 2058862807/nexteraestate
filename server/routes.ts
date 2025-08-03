import express, { Request, Response } from 'express';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc } from 'drizzle-orm';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Database setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// File upload setup
const upload = multer({ 
  dest: '/tmp/uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Auth middleware
const authenticateUser = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export async function registerRoutes(app: express.Application) {
  
  // ========== AUTH ROUTES ==========
  app.get('/api/login', (req, res) => {
    // Redirect to OAuth provider or show login form
    res.redirect('/auth/google'); // Example OAuth
  });

  app.get('/api/user', authenticateUser, async (req, res) => {
    try {
      // Get user info from database
      const user = await getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // ========== WILLS ROUTES ==========
  app.get('/api/wills', authenticateUser, async (req, res) => {
    try {
      const wills = await db.select().from(willsTable).where(eq(willsTable.userId, req.user.id));
      res.json(wills);
    } catch (error) {
      console.error('Error fetching wills:', error);
      res.status(500).json({ error: 'Failed to fetch wills' });
    }
  });

  app.post('/api/wills', authenticateUser, async (req, res) => {
    try {
      const willData = {
        id: uuidv4(),
        userId: req.user.id,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [will] = await db.insert(willsTable).values(willData).returning();
      
      // Add blockchain notarization
      await notarizeEvent({
        event: 'WILL_CREATED',
        userId: req.user.id,
        willId: will.id,
        timestamp: new Date()
      });
      
      res.json(will);
    } catch (error) {
      console.error('Error creating will:', error);
      res.status(500).json({ error: 'Failed to create will' });
    }
  });

  app.put('/api/wills/:id', authenticateUser, async (req, res) => {
    try {
      const [will] = await db.update(willsTable)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(willsTable.id, req.params.id))
        .returning();
      
      // Add blockchain notarization for will updates
      await notarizeEvent({
        event: 'WILL_UPDATED',
        userId: req.user.id,
        willId: will.id,
        timestamp: new Date(),
        changes: Object.keys(req.body)
      });
      
      res.json(will);
    } catch (error) {
      console.error('Error updating will:', error);
      res.status(500).json({ error: 'Failed to update will' });
    }
  });

  // ========== DOCUMENTS ROUTES ==========
  app.get('/api/documents', authenticateUser, async (req, res) => {
    try {
      const documents = await db.select().from(documentsTable).where(eq(documentsTable.userId, req.user.id));
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.post('/api/documents', authenticateUser, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // AI-powered document categorization
      const category = await categorizeDocument(req.file);
      
      const document = {
        id: uuidv4(),
        userId: req.user.id,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: req.body.category || category,
        uploadedAt: new Date()
      };
      
      const [savedDoc] = await db.insert(documentsTable).values(document).returning();
      
      // Blockchain notarization of document upload
      await notarizeEvent({
        event: 'DOCUMENT_UPLOADED',
        userId: req.user.id,
        documentId: savedDoc.id,
        hash: await generateFileHash(req.file.path),
        timestamp: new Date()
      });
      
      res.json(savedDoc);
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  });

  app.delete('/api/documents/:id', authenticateUser, async (req, res) => {
    try {
      await db.delete(documentsTable).where(eq(documentsTable.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  // ========== FAMILY ROUTES ==========
  app.get('/api/family', authenticateUser, async (req, res) => {
    try {
      const family = await db.select().from(familyTable).where(eq(familyTable.userId, req.user.id));
      res.json(family);
    } catch (error) {
      console.error('Error fetching family:', error);
      res.status(500).json({ error: 'Failed to fetch family members' });
    }
  });

  app.post('/api/family', authenticateUser, async (req, res) => {
    try {
      const member = {
        id: uuidv4(),
        userId: req.user.id,
        ...req.body,
        status: 'invited',
        invitedAt: new Date(),
        verificationToken: crypto.randomBytes(32).toString('hex')
      };
      
      const [savedMember] = await db.insert(familyTable).values(member).returning();
      
      // Send invitation email
      await sendInvitationEmail(savedMember);
      
      res.json(savedMember);
    } catch (error) {
      console.error('Error adding family member:', error);
      res.status(500).json({ error: 'Failed to add family member' });
    }
  });

  app.put('/api/family/:id/status', authenticateUser, async (req, res) => {
    try {
      const [member] = await db.update(familyTable)
        .set({ 
          status: req.body.status, 
          respondedAt: new Date() 
        })
        .where(eq(familyTable.id, req.params.id))
        .returning();
      
      res.json(member);
    } catch (error) {
      console.error('Error updating family member status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  app.delete('/api/family/:id', authenticateUser, async (req, res) => {
    try {
      await db.delete(familyTable).where(eq(familyTable.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing family member:', error);
      res.status(500).json({ error: 'Failed to remove family member' });
    }
  });

  // ========== DEATH SWITCH ROUTES ==========
  app.get('/api/death-switch', authenticateUser, async (req, res) => {
    try {
      const deathSwitch = await db.select().from(deathSwitchTable).where(eq(deathSwitchTable.userId, req.user.id)).limit(1);
      res.json(deathSwitch[0] || null);
    } catch (error) {
      console.error('Error fetching death switch:', error);
      res.status(500).json({ error: 'Failed to fetch death switch' });
    }
  });

  app.post('/api/death-switch', authenticateUser, async (req, res) => {
    try {
      const deathSwitch = {
        id: uuidv4(),
        userId: req.user.id,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [saved] = await db.insert(deathSwitchTable).values(deathSwitch).returning();
      res.json(saved);
    } catch (error) {
      console.error('Error creating death switch:', error);
      res.status(500).json({ error: 'Failed to create death switch' });
    }
  });

  // ========== VIDEO ROUTES ==========
  app.post('/api/videos', authenticateUser, upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video uploaded' });
      }

      const video = {
        id: uuidv4(),
        userId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        fileName: req.file.filename,
        fileSize: req.file.size,
        recipient: req.body.recipient,
        triggerEvent: req.body.triggerEvent || 'death',
        createdAt: new Date()
      };
      
      const [savedVideo] = await db.insert(videoMessagesTable).values(video).returning();
      
      // Blockchain notarization
      await notarizeEvent({
        event: 'VIDEO_MESSAGE_CREATED',
        userId: req.user.id,
        videoId: savedVideo.id,
        timestamp: new Date()
      });
      
      res.json(savedVideo);
    } catch (error) {
      console.error('Error saving video:', error);
      res.status(500).json({ error: 'Failed to save video' });
    }
  });

  app.get('/api/videos', authenticateUser, async (req, res) => {
    try {
      const videos = await db.select().from(videoMessagesTable).where(eq(videoMessagesTable.userId, req.user.id));
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  // ========== AI ROUTES ==========
  app.post('/api/ai/will-builder', authenticateUser, async (req, res) => {
    try {
      const { userInput, context } = req.body;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert estate planning attorney helping users create their will. Provide specific, legally-sound guidance while being empathetic and clear."
          },
          {
            role: "user",
            content: userInput
          }
        ],
        max_tokens: 1000
      });

      res.json({ response: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error with AI will builder:', error);
      res.status(500).json({ error: 'Failed to get AI assistance' });
    }
  });

  app.post('/api/ai/grief-counseling', authenticateUser, async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a compassionate grief counselor providing support to someone dealing with loss. Be empathetic, professional, and provide helpful coping strategies."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 800
      });

      // Save conversation to database
      await db.insert(griefCounselingTable).values({
        id: uuidv4(),
        userId: req.user.id,
        sessionId,
        message,
        response: completion.choices[0].message.content,
        createdAt: new Date()
      });

      res.json({ response: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error with AI grief counseling:', error);
      res.status(500).json({ error: 'Failed to get counseling response' });
    }
  });

  // ========== ACTIVITY ROUTES ==========
  app.get('/api/activity', authenticateUser, async (req, res) => {
    try {
      const activities = await db.select().from(activityTable)
        .where(eq(activityTable.userId, req.user.id))
        .orderBy(desc(activityTable.createdAt))
        .limit(50);
      res.json(activities.map(activity => ({
        ...activity,
        createdAt: activity.createdAt.toISOString()
      })));
    } catch (error) {
      console.error('Error fetching activity:', error);
      res.status(500).json({ error: 'Failed to fetch activity' });
    }
  });

  // ========== SUBSCRIPTION ROUTES ==========
  app.post('/api/create-subscription', authenticateUser, async (req, res) => {
    try {
      const { planId } = req.body;
      
      // Create Stripe payment intent or subscription
      const clientSecret = await createStripeSubscription(req.user.id, planId);
      
      res.json({ clientSecret });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  console.log('All API routes registered successfully');
}

// Helper functions
async function getUserById(id: string) {
  // Implementation for getting user from database
  return { id, email: 'user@example.com', name: 'User' };
}

async function categorizeDocument(file: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Categorize this document into one of: legal, financial, digital_assets, personal, insurance, property. Respond with just the category name."
        },
        {
          role: "user",
          content: `Document name: ${file.originalname}, Type: ${file.mimetype}`
        }
      ],
      max_tokens: 10
    });
    
    return completion.choices[0].message.content?.toLowerCase() || 'personal';
  } catch (error) {
    return 'personal';
  }
}

async function generateFileHash(filePath: string) {
  const fileBuffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function notarizeEvent(event: any) {
  // Blockchain notarization implementation
  console.log('Notarizing event:', event);
  // TODO: Implement actual blockchain notarization
}

async function sendInvitationEmail(member: any) {
  // Email implementation
  console.log('Sending invitation to:', member.email);
}

async function createStripeSubscription(userId: string, planId: string) {
  // Stripe subscription implementation
  return 'pi_test_client_secret';
}

// Database table definitions (simplified - will need proper schema)
const willsTable = {} as any;
const documentsTable = {} as any;
const familyTable = {} as any;
const deathSwitchTable = {} as any;
const videoMessagesTable = {} as any;
const griefCounselingTable = {} as any;
const activityTable = {} as any;