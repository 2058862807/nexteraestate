import axios from 'axios';
import { verifyBiometric } from './biometricService';
import { checkLegalCompliance } from './legalService';
import { notarizeEvent } from './blockchainService';
import { AIProcessor } from './aiService';
import Heir from '../models/Heir';
import User from '../models/User';
import Vault from '../models/Vault';

const LEGACY_API_KEY = process.env.LEGACY_API_KEY;
const INACTIVITY_THRESHOLD = 90 * 24 * 60 * 60 * 1000; // 90 days

class DeathSwitchService {
  async activateDeathSwitch(userId: string, trigger: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Verify trigger source
    if (!['inactivity', 'obituary', 'manual'].includes(trigger)) {
      throw new Error('Invalid trigger source');
    }

    // Check legal compliance
    const compliance = await checkLegalCompliance(user.state);
    if (!compliance.valid) {
      throw new Error(`Legal compliance failed: ${compliance.reason}`);
    }

    // Notify heirs and begin verification
    const heirs = await Heir.find({ userId });
    for (const heir of heirs) {
      await this.initiateHeirVerification(heir);
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

  private async initiateHeirVerification(heir: any) {
    // Send verification request to heir
    const verificationLink = `${process.env.APP_URL}/verify-heir/${heir.verificationToken}`;
    
    await sendEmail(heir.email, 'Estate Access Verification', `
      You've been designated as an heir. Please verify your identity:
      ${verificationLink}
    `);

    // Send push notification if mobile app installed
    if (heir.deviceToken) {
      await sendPushNotification(heir.deviceToken, {
        title: 'Estate Access Verification',
        body: 'Your identity verification is required'
      });
    }
  }

  async verifyHeir(heirId: string, biometricData: any, governmentId: any) {
    const heir = await Heir.findById(heirId);
    if (!heir) throw new Error('Heir not found');
    
    // Verify biometric data
    const bioMatch = await verifyBiometric(heir.biometricTemplate, biometricData);
    if (!bioMatch) throw new Error('Biometric verification failed');
    
    // Verify government ID
    const idVerified = await verifyGovernmentId(governmentId);
    if (!idVerified) throw new Error('ID verification failed');
    
    // Grant access
    heir.verified = true;
    heir.verificationDate = new Date();
    await heir.save();
    
    // Notarize verification
    await notarizeEvent({
      event: 'HEIR_VERIFIED',
      heirId,
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
    
    // Release to all verified heirs
    for (const heir of heirs) {
      await this.grantVaultAccess(heir, vault, aiSummary);
    }
    
    // Deactivate user account
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

  private async grantVaultAccess(heir: any, vault: any, aiSummary: string) {
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
    
    // Trigger video message playback
    if (vault.videoMessages && vault.videoMessages.length > 0) {
      await this.playVideoMessages(heir, vault.videoMessages);
    }
  }

  async checkObituaries() {
    const users = await User.find({ deathSwitchEnabled: true });
    
    for (const user of users) {
      const response = await axios.get(`https://legacy.com/api/obituaries`, {
        params: {
          name: user.fullName,
          location: user.location,
          apiKey: LEGACY_API_KEY
        }
      });
      
      if (response.data.matches.length > 0) {
        await this.activateDeathSwitch(user.id, 'obituary');
      }
    }
  }

  async checkInactivity() {
    const users = await User.find({ 
      deathSwitchEnabled: true,
      lastActive: { 
        $lt: new Date(Date.now() - INACTIVITY_THRESHOLD) 
      }
    });
    
    for (const user of users) {
      await this.activateDeathSwitch(user.id, 'inactivity');
    }
  }
}

export default new DeathSwitchService();
