import Stripe from 'stripe';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Database setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  storageLimit: number; // in GB
  videoMessagesLimit: number; // -1 for unlimited
  familyMembersLimit: number;
  priority: 'standard' | 'priority' | 'premium';
}

// Plan configurations
export const SUBSCRIPTION_PLANS: Record<string, PlanDetails> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 999, // $9.99 in cents
    interval: 'month',
    features: [
      'AI Will Builder',
      '5GB Secure Storage',
      '2 Video Messages',
      'Basic Executor Management',
      'Email Support',
      'Death Switch Monitoring',
      'Blockchain Notarization'
    ],
    stripePriceId: 'price_basic_monthly',
    storageLimit: 5,
    videoMessagesLimit: 2,
    familyMembersLimit: 3,
    priority: 'standard'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 1999, // $19.99 in cents
    interval: 'month',
    features: [
      'Everything in Basic',
      'Unlimited Secure Storage',
      'Unlimited Video Messages',
      'Trust Creation Tools',
      'Advanced Sharing Controls',
      'Priority Email Support',
      '50-State Legal Compliance',
      'AI Grief Counseling',
      'Advanced Analytics'
    ],
    stripePriceId: 'price_premium_monthly',
    storageLimit: -1, // unlimited
    videoMessagesLimit: -1, // unlimited
    familyMembersLimit: 8,
    priority: 'priority'
  },
  family: {
    id: 'family',
    name: 'Family',
    price: 2999, // $29.99 in cents
    interval: 'month',
    features: [
      'Everything in Premium',
      'Up to 12 Family Members',
      'Collaborative Planning Tools',
      'Family Communication Center',
      'Priority Phone Support',
      'Dedicated Account Manager',
      'Legal Consultation Credits',
      'Multi-Will Management',
      'Advanced Security Features'
    ],
    stripePriceId: 'price_family_monthly',
    storageLimit: -1, // unlimited
    videoMessagesLimit: -1, // unlimited
    familyMembersLimit: 12,
    priority: 'premium'
  }
};

export class PaymentService {
  
  /**
   * Create a Stripe customer
   */
  static async createCustomer(user: {
    id: string;
    email: string;
    name: string;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          platform: 'nexteraestate'
        }
      });

      console.log(`[Payment] Created Stripe customer: ${customer.id} for user: ${user.id}`);
      return customer;
    } catch (error) {
      console.error('[Payment] Failed to create customer:', error);
      throw new Error('Failed to create payment customer');
    }
  }

  /**
   * Create a subscription with payment intent
   */
  static async createSubscription(userId: string, planId: string, paymentMethodId?: string): Promise<{
    clientSecret: string;
    subscriptionId: string;
    status: string;
  }> {
    try {
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        throw new Error(`Invalid plan: ${planId}`);
      }

      // Get or create customer
      let customer = await this.getCustomerByUserId(userId);
      if (!customer) {
        // Get user details (would come from database)
        const user = await this.getUserById(userId);
        customer = await this.createCustomer(user);
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: plan.stripePriceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId,
          platform: 'nexteraestate'
        }
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      // Save subscription to database
      await this.saveSubscription({
        id: subscription.id,
        userId,
        planId,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date()
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        subscriptionId: subscription.id,
        status: subscription.status
      };

    } catch (error) {
      console.error('[Payment] Failed to create subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Handle successful payment webhook
   */
  static async handlePaymentSuccess(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Update subscription status in database
      await this.updateSubscriptionStatus(subscriptionId, 'active');
      
      // Grant access to premium features
      await this.activatePremiumFeatures(subscription.metadata.userId, subscription.metadata.planId);
      
      // Send confirmation email
      await this.sendSubscriptionConfirmation(subscription.metadata.userId, subscription.metadata.planId);
      
      console.log(`[Payment] Activated subscription: ${subscriptionId}`);
    } catch (error) {
      console.error('[Payment] Failed to handle payment success:', error);
    }
  }

  /**
   * Handle failed payment
   */
  static async handlePaymentFailed(subscriptionId: string): Promise<void> {
    try {
      // Update subscription status
      await this.updateSubscriptionStatus(subscriptionId, 'past_due');
      
      // Send payment failure notification
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await this.sendPaymentFailureNotification(subscription.metadata.userId);
      
      console.log(`[Payment] Payment failed for subscription: ${subscriptionId}`);
    } catch (error) {
      console.error('[Payment] Failed to handle payment failure:', error);
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string, immediate: boolean = false): Promise<void> {
    try {
      const userSubscription = await this.getUserSubscription(userId);
      if (!userSubscription) {
        throw new Error('No active subscription found');
      }

      if (immediate) {
        // Cancel immediately
        await stripe.subscriptions.cancel(userSubscription.stripeSubscriptionId);
        await this.updateSubscriptionStatus(userSubscription.stripeSubscriptionId, 'canceled');
        await this.deactivatePremiumFeatures(userId);
      } else {
        // Cancel at period end
        await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
      }

      console.log(`[Payment] Canceled subscription for user: ${userId}`);
    } catch (error) {
      console.error('[Payment] Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      const customer = await this.getCustomerByUserId(userId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      console.log(`[Payment] Updated payment method for user: ${userId}`);
    } catch (error) {
      console.error('[Payment] Failed to update payment method:', error);
      throw new Error('Failed to update payment method');
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscriptionDetails(userId: string): Promise<{
    plan: PlanDetails | null;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return {
          plan: null,
          status: 'none',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        };
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      const plan = SUBSCRIPTION_PLANS[subscription.planId];

      return {
        plan,
        status: stripeSubscription.status,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      };
    } catch (error) {
      console.error('[Payment] Failed to get subscription details:', error);
      return {
        plan: null,
        status: 'error',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };
    }
  }

  /**
   * Generate customer portal URL
   */
  static async createPortalSession(userId: string): Promise<string> {
    try {
      const customer = await this.getCustomerByUserId(userId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${process.env.FRONTEND_URL}/dashboard`,
      });

      return session.url;
    } catch (error) {
      console.error('[Payment] Failed to create portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Check subscription limits
   */
  static async checkSubscriptionLimits(userId: string, feature: string): Promise<{
    allowed: boolean;
    currentUsage: number;
    limit: number;
    planName: string;
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        // Free tier limits
        return {
          allowed: false,
          currentUsage: 0,
          limit: 0,
          planName: 'Free'
        };
      }

      const plan = SUBSCRIPTION_PLANS[subscription.planId];
      const usage = await this.getFeatureUsage(userId, feature);

      let limit: number;
      switch (feature) {
        case 'storage':
          limit = plan.storageLimit * 1024 * 1024 * 1024; // Convert GB to bytes
          break;
        case 'videoMessages':
          limit = plan.videoMessagesLimit;
          break;
        case 'familyMembers':
          limit = plan.familyMembersLimit;
          break;
        default:
          limit = -1;
      }

      return {
        allowed: limit === -1 || usage < limit,
        currentUsage: usage,
        limit,
        planName: plan.name
      };
    } catch (error) {
      console.error('[Payment] Failed to check subscription limits:', error);
      return {
        allowed: false,
        currentUsage: 0,
        limit: 0,
        planName: 'Unknown'
      };
    }
  }

  // Helper methods (would be implemented with your database layer)
  private static async getCustomerByUserId(userId: string): Promise<Stripe.Customer | null> {
    // Implementation would query database for stripe customer ID
    // then retrieve from Stripe
    return null;
  }

  private static async getUserById(userId: string): Promise<any> {
    // Implementation would query user from database
    return { id: userId, email: 'user@example.com', name: 'User' };
  }

  private static async saveSubscription(subscription: any): Promise<void> {
    // Implementation would save to database
    console.log('[Payment] Saving subscription:', subscription.id);
  }

  private static async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    // Implementation would update database
    console.log(`[Payment] Updating subscription ${subscriptionId} status to ${status}`);
  }

  private static async getUserSubscription(userId: string): Promise<any> {
    // Implementation would query database
    return null;
  }

  private static async activatePremiumFeatures(userId: string, planId: string): Promise<void> {
    // Implementation would update user permissions
    console.log(`[Payment] Activating premium features for user: ${userId}, plan: ${planId}`);
  }

  private static async deactivatePremiumFeatures(userId: string): Promise<void> {
    // Implementation would revoke premium permissions
    console.log(`[Payment] Deactivating premium features for user: ${userId}`);
  }

  private static async sendSubscriptionConfirmation(userId: string, planId: string): Promise<void> {
    // Implementation would send email
    console.log(`[Payment] Sending confirmation email for user: ${userId}, plan: ${planId}`);
  }

  private static async sendPaymentFailureNotification(userId: string): Promise<void> {
    // Implementation would send failure notification
    console.log(`[Payment] Sending payment failure notification for user: ${userId}`);
  }

  private static async getFeatureUsage(userId: string, feature: string): Promise<number> {
    // Implementation would calculate current usage
    return 0;
  }
}

export default PaymentService;