import cron from 'node-cron';
import deathSwitchService from '../services/deathSwitchService';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[DeathSwitch] Running daily checks');
  try {
    await deathSwitchService.checkObituaries();
    await deathSwitchService.checkInactivity();
    console.log('[DeathSwitch] Daily checks completed');
  } catch (error) {
    console.error('[DeathSwitch] Error in daily checks:', error);
  }
});

console.log('[DeathSwitch] Scheduled tasks initialized');
