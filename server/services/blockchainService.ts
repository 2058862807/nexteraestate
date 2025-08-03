import { ethers } from 'ethers';
import crypto from 'crypto';

// Polygon (MATIC) configuration for cost-effective notarization
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NOTARIZATION_CONTRACT_ADDRESS;

// Smart contract ABI for notarization
const NOTARIZATION_ABI = [
  {
    "inputs": [
      {"name": "_hash", "type": "bytes32"},
      {"name": "_metadata", "type": "string"}
    ],
    "name": "notarizeEvent",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_hash", "type": "bytes32"}],
    "name": "getNotarization",
    "outputs": [
      {"name": "timestamp", "type": "uint256"},
      {"name": "blockNumber", "type": "uint256"},
      {"name": "metadata", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    
    if (PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
      
      if (CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, NOTARIZATION_ABI, this.wallet);
      }
    }
  }

  /**
   * Notarize an event on the blockchain
   */
  async notarizeEvent(eventData: {
    event: string;
    userId: string;
    entityId?: string;
    timestamp: Date;
    metadata?: any;
  }): Promise<{
    hash: string;
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: number;
  }> {
    try {
      // Create a hash of the event data
      const eventHash = this.createEventHash(eventData);
      
      // If no blockchain setup, return hash only (for development)
      if (!this.contract) {
        console.log('[Blockchain] No contract configured, storing hash only:', eventHash);
        return { hash: eventHash };
      }

      // Prepare metadata
      const metadata = JSON.stringify({
        event: eventData.event,
        userId: eventData.userId,
        entityId: eventData.entityId,
        timestamp: eventData.timestamp.toISOString(),
        ...eventData.metadata
      });

      // Send transaction to blockchain
      const tx = await this.contract.notarizeEvent(
        '0x' + eventHash,
        metadata,
        {
          gasLimit: 100000, // Reasonable gas limit
          maxFeePerGas: ethers.parseUnits('30', 'gwei'), // 30 Gwei
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei') // 2 Gwei tip
        }
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      console.log('[Blockchain] Event notarized:', {
        hash: eventHash,
        txHash: receipt.transactionHash,
        block: receipt.blockNumber,
        gas: receipt.gasUsed.toString()
      });

      return {
        hash: eventHash,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: Number(receipt.gasUsed)
      };

    } catch (error) {
      console.error('[Blockchain] Notarization failed:', error);
      
      // Return hash even if blockchain fails
      const eventHash = this.createEventHash(eventData);
      return { hash: eventHash };
    }
  }

  /**
   * Verify a notarized event
   */
  async verifyNotarization(hash: string): Promise<{
    verified: boolean;
    timestamp?: number;
    blockNumber?: number;
    metadata?: any;
  }> {
    try {
      if (!this.contract) {
        return { verified: false };
      }

      const result = await this.contract.getNotarization('0x' + hash);
      
      if (result.timestamp === 0n) {
        return { verified: false };
      }

      return {
        verified: true,
        timestamp: Number(result.timestamp),
        blockNumber: Number(result.blockNumber),
        metadata: result.metadata ? JSON.parse(result.metadata) : null
      };

    } catch (error) {
      console.error('[Blockchain] Verification failed:', error);
      return { verified: false };
    }
  }

  /**
   * Create a deterministic hash for event data
   */
  private createEventHash(eventData: any): string {
    const dataString = JSON.stringify({
      event: eventData.event,
      userId: eventData.userId,
      entityId: eventData.entityId,
      timestamp: eventData.timestamp.toISOString(),
      metadata: eventData.metadata
    });
    
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Get current blockchain status
   */
  async getBlockchainStatus(): Promise<{
    connected: boolean;
    blockNumber?: number;
    gasPrice?: string;
    networkName?: string;
  }> {
    try {
      if (!this.provider) {
        return { connected: false };
      }

      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();
      const network = await this.provider.getNetwork();

      return {
        connected: true,
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        networkName: network.name
      };

    } catch (error) {
      console.error('[Blockchain] Status check failed:', error);
      return { connected: false };
    }
  }

  /**
   * Batch notarize multiple events (more cost-effective)
   */
  async batchNotarize(events: any[]): Promise<{
    batchHash: string;
    transactionHash?: string;
    individualHashes: string[];
  }> {
    try {
      // Create individual hashes
      const individualHashes = events.map(event => this.createEventHash(event));
      
      // Create batch hash
      const batchData = {
        events: events.length,
        timestamp: new Date().toISOString(),
        hashes: individualHashes
      };
      
      const batchHash = crypto.createHash('sha256')
        .update(JSON.stringify(batchData))
        .digest('hex');

      // For now, just return hashes (can implement batch contract later)
      console.log('[Blockchain] Batch notarization:', {
        batchHash,
        eventCount: events.length
      });

      return {
        batchHash,
        individualHashes
      };

    } catch (error) {
      console.error('[Blockchain] Batch notarization failed:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();

/**
 * Convenience function for notarizing events
 */
export async function notarizeEvent(eventData: any) {
  return await blockchainService.notarizeEvent(eventData);
}

/**
 * Convenience function for verifying notarizations
 */
export async function verifyNotarization(hash: string) {
  return await blockchainService.verifyNotarization(hash);
}

export default blockchainService;