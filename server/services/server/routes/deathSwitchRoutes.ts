import express from 'express';
import deathSwitchService from '../services/deathSwitchService';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Enable/disable death switch
router.post('/configure', authMiddleware, async (req, res) => {
  try {
    const { enabled, inactivityThreshold, heirs } = req.body;
    // ... save configuration to DB
    res.json({ status: 'configured' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record video message
router.post('/record-message', authMiddleware, async (req, res) => {
  try {
    const { message, isFinal } = req.body;
    // ... save video message to vault
    res.json({ status: 'recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Heir verification endpoint
router.post('/verify-heir/:token', async (req, res) => {
  try {
    const { biometricData, governmentId } = req.body;
    const result = await deathSwitchService.verifyHeir(
      req.params.token, 
      biometricData, 
      governmentId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints for scheduled tasks
router.post('/check-obituaries', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  await deathSwitchService.checkObituaries();
  res.json({ status: 'completed' });
});

router.post('/check-inactivity', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  await deathSwitchService.checkInactivity();
  res.json({ status: 'completed' });
});

export default router;
