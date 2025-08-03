import express, { Request, Response } from 'express';
import LegalComplianceService from '../services/legalComplianceService';
import { authenticateUser } from '../middleware/auth';
import { notarizeEvent } from '../services/blockchainService';

const router = express.Router();

// ========== STATE COMPLIANCE ROUTES ==========

/**
 * Get legal requirements for a specific state
 */
router.get('/states/:state/requirements', async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const requirements = LegalComplianceService.getStateRequirements(state.toUpperCase());
    
    if (!requirements) {
      return res.status(404).json({ 
        error: 'State not found',
        message: `Legal requirements not available for ${state.toUpperCase()}` 
      });
    }

    res.json({
      state: state.toUpperCase(),
      stateName: requirements.stateName,
      requirements,
      lastUpdated: requirements.lastUpdated
    });
  } catch (error) {
    console.error('[Legal API] Get state requirements failed:', error);
    res.status(500).json({ error: 'Failed to get state requirements' });
  }
});

/**
 * Validate will compliance for a specific state
 */
router.post('/validate/:state', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const willData = req.body;
    const userId = req.user.id;

    const validation = await LegalComplianceService.validateWillCompliance(willData, state.toUpperCase());
    
    // Log validation for audit trail
    console.log(`[Legal] Will validation for user ${userId} in ${state}: ${validation.compliant ? 'PASSED' : 'FAILED'}`);
    
    // Blockchain notarization of validation
    await notarizeEvent({
      event: 'WILL_VALIDATION',
      userId,
      entityId: willData.id || 'draft',
      timestamp: new Date(),
      metadata: {
        state: state.toUpperCase(),
        compliant: validation.compliant,
        violationCount: validation.violations.length,
        warningCount: validation.warnings.length
      }
    });

    res.json({
      state: state.toUpperCase(),
      validation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Legal API] Will validation failed:', error);
    res.status(500).json({ error: 'Failed to validate will compliance' });
  }
});

/**
 * Generate state-specific will template
 */
router.post('/templates/:state', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const personalInfo = req.body;
    const userId = req.user.id;

    const template = LegalComplianceService.generateStateWillTemplate(state.toUpperCase(), personalInfo);
    
    // Log template generation
    console.log(`[Legal] Generated will template for user ${userId} in ${state}`);
    
    // Blockchain notarization of template generation
    await notarizeEvent({
      event: 'WILL_TEMPLATE_GENERATED',
      userId,
      timestamp: new Date(),
      metadata: {
        state: state.toUpperCase(),
        templateVersion: '1.0',
        clauseCount: template.stateSpecificClauses.length
      }
    });

    res.json({
      state: state.toUpperCase(),
      template: template.template,
      placeholders: template.placeholders,
      stateSpecificClauses: template.stateSpecificClauses,
      requirements: LegalComplianceService.getStateRequirements(state.toUpperCase()),
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Legal API] Template generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate will template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get probate avoidance strategies for a state
 */
router.get('/states/:state/probate-avoidance', async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const strategies = LegalComplianceService.getProbateAvoidanceStrategies(state.toUpperCase());
    
    res.json({
      state: state.toUpperCase(),
      strategies,
      disclaimer: 'This information is for educational purposes only and does not constitute legal advice. Consult with a qualified attorney for personalized guidance.'
    });
  } catch (error) {
    console.error('[Legal API] Get probate strategies failed:', error);
    res.status(500).json({ error: 'Failed to get probate avoidance strategies' });
  }
});

/**
 * Get real-time legal updates for a state
 */
router.get('/states/:state/updates', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const updates = await LegalComplianceService.getRealtimeLegalUpdates(state.toUpperCase());
    
    res.json({
      state: state.toUpperCase(),
      updates: updates.updates,
      lastChecked: updates.lastChecked,
      nextCheck: updates.nextCheck
    });
  } catch (error) {
    console.error('[Legal API] Get legal updates failed:', error);
    res.status(500).json({ error: 'Failed to get legal updates' });
  }
});

/**
 * Check legal updates across all states
 */
router.get('/updates/all-states', authenticateUser, async (req: Request, res: Response) => {
  try {
    const updates = await LegalComplianceService.checkAllStatesForUpdates();
    
    // Filter to show only states with updates
    const statesWithUpdates = Object.entries(updates)
      .filter(([, data]) => data.hasUpdates)
      .reduce((acc, [state, data]) => {
        acc[state] = data;
        return acc;
      }, {} as any);

    res.json({
      statesWithUpdates,
      totalStatesChecked: Object.keys(updates).length,
      statesWithUpdatesCount: Object.keys(statesWithUpdates).length,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Legal API] Check all states updates failed:', error);
    res.status(500).json({ error: 'Failed to check legal updates' });
  }
});

// ========== COMPLIANCE MONITORING ==========

/**
 * Subscribe to legal updates for specific states
 */
router.post('/monitoring/subscribe', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { states, notificationPreferences } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(states) || states.length === 0) {
      return res.status(400).json({ error: 'States array is required' });
    }

    // Save monitoring preferences (would implement with database)
    console.log(`[Legal] User ${userId} subscribed to updates for states: ${states.join(', ')}`);
    
    // Blockchain notarization of monitoring subscription
    await notarizeEvent({
      event: 'LEGAL_MONITORING_SUBSCRIBED',
      userId,
      timestamp: new Date(),
      metadata: {
        states,
        preferences: notificationPreferences
      }
    });

    res.json({
      success: true,
      message: `Subscribed to legal updates for ${states.length} state(s)`,
      states,
      preferences: notificationPreferences
    });
  } catch (error) {
    console.error('[Legal API] Subscribe to monitoring failed:', error);
    res.status(500).json({ error: 'Failed to subscribe to legal monitoring' });
  }
});

/**
 * Get user's legal monitoring status
 */
router.get('/monitoring/status', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // This would query from database in real implementation
    const mockStatus = {
      subscribedStates: ['CA', 'NY', 'TX', 'FL'],
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      pendingUpdates: 2
    };

    res.json({
      userId,
      monitoring: mockStatus,
      disclaimer: 'Legal monitoring helps you stay informed of changes that may affect your estate plan.'
    });
  } catch (error) {
    console.error('[Legal API] Get monitoring status failed:', error);
    res.status(500).json({ error: 'Failed to get monitoring status' });
  }
});

// ========== EDUCATIONAL RESOURCES ==========

/**
 * Get legal education resources
 */
router.get('/education/resources', async (req: Request, res: Response) => {
  try {
    const { category, state } = req.query;
    
    const resources = {
      articles: [
        {
          title: 'Understanding Will Requirements by State',
          description: 'Comprehensive guide to will requirements across all 50 states',
          category: 'general',
          readTime: '15 min',
          lastUpdated: '2024-03-01'
        },
        {
          title: 'Probate Process Explained',
          description: 'Step-by-step guide to the probate process and how to minimize complications',
          category: 'probate',
          readTime: '12 min',
          lastUpdated: '2024-02-15'
        },
        {
          title: 'Digital Asset Planning',
          description: 'How to include digital assets in your estate plan',
          category: 'digital',
          readTime: '8 min',
          lastUpdated: '2024-03-10'
        }
      ],
      videos: [
        {
          title: 'Estate Planning Basics',
          duration: '25 min',
          category: 'general'
        },
        {
          title: 'Trust vs Will: Which is Right for You?',
          duration: '18 min',
          category: 'trusts'
        }
      ],
      webinars: [
        {
          title: 'State-Specific Estate Planning Updates 2024',
          date: '2024-04-15',
          category: 'updates'
        }
      ]
    };

    // Filter by category if specified
    let filteredResources = resources;
    if (category) {
      filteredResources = {
        articles: resources.articles.filter(a => a.category === category),
        videos: resources.videos.filter(v => v.category === category),
        webinars: resources.webinars.filter(w => w.category === category)
      };
    }

    res.json({
      resources: filteredResources,
      categories: ['general', 'probate', 'trusts', 'digital', 'updates'],
      disclaimer: 'These resources are for educational purposes only and do not constitute legal advice.'
    });
  } catch (error) {
    console.error('[Legal API] Get education resources failed:', error);
    res.status(500).json({ error: 'Failed to get education resources' });
  }
});

/**
 * Get FAQ for estate planning
 */
router.get('/faq', async (req: Request, res: Response) => {
  try {
    const faq = [
      {
        question: 'Do I need a will if I have a trust?',
        answer: 'Yes, you typically need a "pour-over" will to handle any assets not transferred to your trust and to name guardians for minor children.',
        category: 'trusts'
      },
      {
        question: 'How often should I update my will?',
        answer: 'Review your will every 3-5 years or after major life events like marriage, divorce, birth of children, or significant changes in assets.',
        category: 'maintenance'
      },
      {
        question: 'Can I write my own will?',
        answer: 'While possible in some states, it\'s recommended to use proper legal guidance to ensure your will meets all state requirements and accurately reflects your wishes.',
        category: 'diy'
      },
      {
        question: 'What happens if I die without a will?',
        answer: 'Your estate will be distributed according to your state\'s intestacy laws, which may not align with your preferences.',
        category: 'intestate'
      },
      {
        question: 'Do witnesses need to read my will?',
        answer: 'No, witnesses only need to observe you signing the will and confirm your identity and mental capacity. They don\'t need to know the contents.',
        category: 'witnesses'
      }
    ];

    const { category } = req.query;
    const filteredFaq = category 
      ? faq.filter(item => item.category === category)
      : faq;

    res.json({
      faq: filteredFaq,
      categories: ['trusts', 'maintenance', 'diy', 'intestate', 'witnesses'],
      totalQuestions: faq.length
    });
  } catch (error) {
    console.error('[Legal API] Get FAQ failed:', error);
    res.status(500).json({ error: 'Failed to get FAQ' });
  }
});

export default router;