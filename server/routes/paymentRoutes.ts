import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import PaymentService from '../services/paymentService';
import { authenticateUser } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const router = express.Router();

// ========== SUBSCRIPTION ROUTES ==========

/**
 * Create a new subscription
 */
router.post('/subscriptions', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { planId, paymentMethodId } = req.body;
    const userId = req.user.id;

    const result = await PaymentService.createSubscription(userId, planId, paymentMethodId);
    
    res.json({
      clientSecret: result.clientSecret,
      subscriptionId: result.subscriptionId,
      status: result.status
    });
  } catch (error) {
    console.error('[Payment API] Create subscription failed:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Get current subscription details
 */
router.get('/subscription', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const details = await PaymentService.getSubscriptionDetails(userId);
    
    res.json(details);
  } catch (error) {
    console.error('[Payment API] Get subscription failed:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
});

/**
 * Cancel subscription
 */
router.delete('/subscription', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { immediate = false } = req.body;

    await PaymentService.cancelSubscription(userId, immediate);
    
    res.json({ success: true, message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('[Payment API] Cancel subscription failed:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update payment method
 */
router.put('/payment-method', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }

    await PaymentService.updatePaymentMethod(userId, paymentMethodId);
    
    res.json({ success: true, message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('[Payment API] Update payment method failed:', error);
    res.status(500).json({ 
      error: 'Failed to update payment method',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create customer portal session
 */
router.post('/portal', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const portalUrl = await PaymentService.createPortalSession(userId);
    
    res.json({ url: portalUrl });
  } catch (error) {
    console.error('[Payment API] Create portal session failed:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Check subscription limits for a feature
 */
router.get('/limits/:feature', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { feature } = req.params;

    const limits = await PaymentService.checkSubscriptionLimits(userId, feature);
    
    res.json(limits);
  } catch (error) {
    console.error('[Payment API] Check limits failed:', error);
    res.status(500).json({ error: 'Failed to check subscription limits' });
  }
});

/**
 * Get available plans
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const { SUBSCRIPTION_PLANS } = await import('../services/paymentService');
    
    res.json({
      plans: Object.values(SUBSCRIPTION_PLANS)
    });
  } catch (error) {
    console.error('[Payment API] Get plans failed:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

// ========== STRIPE WEBHOOKS ==========

/**
 * Handle Stripe webhooks
 */
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Payment Webhook] No webhook secret configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Payment Webhook] Signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log(`[Payment Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        const paymentSucceeded = event.data.object as Stripe.Invoice;
        if (paymentSucceeded.subscription) {
          await PaymentService.handlePaymentSuccess(paymentSucceeded.subscription as string);
        }
        break;

      case 'invoice.payment_failed':
        const paymentFailed = event.data.object as Stripe.Invoice;
        if (paymentFailed.subscription) {
          await PaymentService.handlePaymentFailed(paymentFailed.subscription as string);
        }
        break;

      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        console.log(`[Payment Webhook] Subscription created: ${subscriptionCreated.id}`);
        break;

      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        console.log(`[Payment Webhook] Subscription updated: ${subscriptionUpdated.id}`);
        break;

      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        if (subscriptionDeleted.metadata.userId) {
          await PaymentService.handlePaymentFailed(subscriptionDeleted.id);
        }
        break;

      case 'setup_intent.succeeded':
        const setupIntent = event.data.object as Stripe.SetupIntent;
        console.log(`[Payment Webhook] Setup intent succeeded: ${setupIntent.id}`);
        break;

      default:
        console.log(`[Payment Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Payment Webhook] Error handling ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ========== USAGE TRACKING ==========

/**
 * Get usage statistics
 */
router.get('/usage', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get usage for all trackable features
    const [storageUsage, videoUsage, familyUsage] = await Promise.all([
      PaymentService.checkSubscriptionLimits(userId, 'storage'),
      PaymentService.checkSubscriptionLimits(userId, 'videoMessages'),
      PaymentService.checkSubscriptionLimits(userId, 'familyMembers')
    ]);

    res.json({
      storage: {
        used: storageUsage.currentUsage,
        limit: storageUsage.limit,
        percentage: storageUsage.limit > 0 ? Math.round((storageUsage.currentUsage / storageUsage.limit) * 100) : 0
      },
      videoMessages: {
        used: videoUsage.currentUsage,
        limit: videoUsage.limit,
        percentage: videoUsage.limit > 0 ? Math.round((videoUsage.currentUsage / videoUsage.limit) * 100) : 0
      },
      familyMembers: {
        used: familyUsage.currentUsage,
        limit: familyUsage.limit,
        percentage: familyUsage.limit > 0 ? Math.round((familyUsage.currentUsage / familyUsage.limit) * 100) : 0
      },
      planName: storageUsage.planName
    });
  } catch (error) {
    console.error('[Payment API] Get usage failed:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

/**
 * Create setup intent for saving payment method
 */
router.post('/setup-intent', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Get or create customer
    let customer = await PaymentService['getCustomerByUserId'](userId);
    if (!customer) {
      const user = await PaymentService['getUserById'](userId);
      customer = await PaymentService.createCustomer(user);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    res.json({
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    console.error('[Payment API] Create setup intent failed:', error);
    res.status(500).json({ error: 'Failed to create setup intent' });
  }
});

export default router;