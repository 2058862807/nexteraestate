import express from 'express';
import deathSwitchService from '../services/deathSwitchService';
import authMiddleware from '../middleware/auth';
import multer from 'multer';

const router = express.Router();
const upload = multer();

// Configure death switch
router.post('/configure', authMiddleware, async (req, res) => {
  try {
    const config = await deathSwitchService.configure(req.user.id, req.body);
    res.json(config);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Record video message
router.post('/record-message', authMiddleware, upload.single('video'), async (req, res) => {
  try {
    const message = await deathSwitchService.recordMessage(
      req.user.id,
      req.file.buffer,
      req.body.isFinal === 'true'
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Heir verification
router.post('/verify-heir/:token', upload.fields([
  { name: 'biometricData', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 }
]), async (req, res) => {
  try {
    const result = await deathSwitchService.verifyHeir(
      req.params.token,
      JSON.parse(req.body.biometricData),
      req.files.governmentId[0].buffer
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin endpoints
router.post('/check/obituaries', adminMiddleware, async (req, res) => {
  try {
    await deathSwitchService.checkObituaries();
    res.json({ status: 'completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/check/inactivity', adminMiddleware, async (req, res) => {
  try {
    await deathSwitchService.checkInactivity();
    res.json({ status: 'completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
