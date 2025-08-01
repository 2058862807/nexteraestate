import axios from 'axios';
import { verifyBiometric } from './biometricService';
import { checkLegalCompliance } from './legalService';
import { notarizeEvent } from './blockchainService';
import { AIProcessor } from './aiService';
import Heir from '../models/Heir';
import User from '../models/User';
import Vault from '../models/Vault';

const LEGACY_API_KEY = process.env.LEGACY_API_KEY;
const INACTIVITY_THRESHOLD = 90; // Days

class DeathSwitchService {
  async configure(userId: string, config: any) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.deathSwitchConfig = {
      enabled: config.enabled,
      inactivityThreshold: config.inactivityThreshold,
      heirs: config.heirs,
      lastConfigured: new Date()
    };
    
    await user.save();
    await notarizeEvent({
      event: 'DEATH_SWITCH_CONFIGURED',
      userId,
      config: user.deathSwitchConfig
    });
    
    return user.deathSwitchConfig;
  }

  async recordMessage(userId: string, video: Buffer, isFinal: boolean) {
    const vault = await Vault.findOne({ userId }) || new Vault({ userId });
    
    vault.videoMessages.push({
      content: video,
      recordedAt: new Date(),
      isFinal,
      notarized: false
    });
    
    await vault.save();
    return vault.videoMessages[vault.videoMessages.length - 1];
  }

  async activate(userId: string, trigger: 'inactivity' | 'obituary' | 'manual') {
    const user = await User.findById(userId);
    if (!user || !user.deathSwitchConfig.enabled) {
      throw new Error('Death switch not enabled');
    }
    
    // Legal compliance check
    const compliance = await checkLegalCompliance(user.state);
    if (!compliance.valid) {
      throw new Error(`Legal compliance failed: ${compliance.reason}`);
    }

    // Notify heirs
    const heirs = await Heir.find({ userId });
    for (const heir of heirs) {
      await this.notifyHeir(heir);
    }

    // Schedule vault release
    setTimeout(() => this.releaseVault(userId), compliance.waitingPeriod);
    
    // Notarize activation
    await notarizeEvent({
      event: 'DEATH_SWITCH_ACTIVATED',
      userId,
      trigger,
      timestamp: new Date()
    });

    return { status: 'activated', heirsNotified: heirs.length };
  }

  private async notifyHeir(heir: any) {
    const verificationLink = `${process.env.APP_URL}/verify-heir/${heir.verificationToken}`;
    
    await sendEmail(heir.email, 'Estate Access Verification', `
      You've been designated as an heir. Please verify your identity:
      ${verificationLink}
    `);
    
    if (heir.deviceToken) {
      await sendPushNotification(heir.deviceToken, {
        title: 'Estate Access Verification',
        body: 'Your identity verification is required'
      });
    }
  }

  async verifyHeir(token: string, biometricData: any, governmentId: any) {
    const heir = await Heir.findOne({ verificationToken: token });
    if (!heir) throw new Error('Invalid verification token');
    
    // Biometric verification
    const bioMatch = await verifyBiometric(heir.biometricTemplate, biometricData);
    if (!bioMatch) throw new Error('Biometric verification failed');
    
    // Government ID verification
    const idVerified = await verifyGovernmentId(governmentId);
    if (!idVerified) throw new Error('ID verification failed');
    
    // Mark as verified
    heir.verified = true;
    heir.verificationDate = new Date();
    await heir.save();
    
    // Notarize verification
    await notarizeEvent({
      event: 'HEIR_VERIFIED',
      heirId: heir.id,
      userId: heir.userId,
      timestamp: new Date()
    });

    return { status: 'verified' };
  }

  async releaseVault(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    const heirs = await Heir.find({ userId, verified: true });
    if (heirs.length === 0) throw new Error('No verified heirs');
    
    const vault = await Vault.findOne({ userId });
    if (!vault) throw new Error('Vault not found');
    
    // Generate AI summary
    const aiSummary = await AIProcessor.generateSummary(vault.contents);
    
    // Release to heirs
    for (const heir of heirs) {
      await this.grantAccess(heir, vault, aiSummary);
    }
    
    // Deactivate account
    user.deathSwitchActive = false;
    await user.save();
    
    // Notarize release
    await notarizeEvent({
      event: 'VAULT_RELEASED',
      userId,
      timestamp: new Date(),
      heirs: heirs.map(h => h.email),
      aiSummaryHash: createHash(aiSummary)
    });
  }

  private async grantAccess(heir: any, vault: any, aiSummary: string) {
    const accessLink = `${process.env.APP_URL}/vault-access/${heir.accessToken}`;
    
    await sendEmail(heir.email, 'Estate Vault Access', `
      You've been granted access to the estate vault.
      AI Summary: ${aiSummary}
      Access your vault: ${accessLink}
    `);
    
    if (heir.deviceToken) {
      await sendPushNotification(heir.deviceToken, {
        title: 'Estate Vault Access Granted',
        body: 'You can now access the digital vault'
      });
    }
    
    // Deliver video messages
    for (const message of vault.videoMessages) {
      await this.deliverVideoMessage(heir, message);
    }
  }

  async checkObituaries() {
    const users = await User.find({ 'deathSwitchConfig.enabled': true });
    
    for (const user of users) {
      const response = await axios.get(`https://legacy.com/api/obituaries`, {
        params: {
          name: `${user.firstName} ${user.lastName}`,
          location: user.location,
          apiKey: LEGACY_API_KEY
        }
      });
      
      if (response.data.matches.length > 0) {
        await this.activate(user.id, 'obituary');
      }
    }
  }

  async checkInactivity() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - INACTIVITY_THRESHOLD);
    
    const users = await User.find({ 
      'deathSwitchConfig.enabled': true,
      lastActive: { $lt: threshold }
    });
    
    for (const user of users) {
      await this.activate(user.id, 'inactivity');
    }
  }
}

export default new DeathSwitchService();
