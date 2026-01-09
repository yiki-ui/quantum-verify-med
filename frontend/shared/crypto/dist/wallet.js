/**
 * Cardano Wallet Integration for PQC Authentication
 */
import { Buffer } from 'buffer';
/**
 * Cardano Wallet Manager
 * Handles wallet connection and authentication
 */
export class CardanoWalletManager {
    constructor() {
        this.connectedWallet = null;
        this.walletAddress = null;
    }
    /**
     * Get available Cardano wallets
     */
    /**
     * Get available Cardano wallets
     */
    getAvailableWallets() {
        const wallets = [];
        console.log('Checking for wallets...');
        // Check for common Cardano wallets
        if (window.cardano) {
            const cardano = window.cardano;
            console.log('Cardano object keys:', Object.keys(cardano));
            // Dynamically discover wallets that adhere to CIP-30
            for (const key of Object.keys(cardano)) {
                const provider = cardano[key];
                // Skip non-wallet objects (like other injected properties)
                if (!provider || typeof provider !== 'object')
                    continue;
                // Check if it looks like a wallet provider (has enable and apiVersion or icon)
                // Some wallets might not have apiVersion at top level, but enable is required by CIP-30
                if (provider.enable && typeof provider.enable === 'function') {
                    // Check if we already added this wallet (avoid duplicates if any)
                    if (wallets.some(w => w.name === provider.name || w.name.toLowerCase() === key.toLowerCase()))
                        continue;
                    // Determine name (use key as fallback)
                    const name = provider.name || key.charAt(0).toUpperCase() + key.slice(1);
                    console.log(`Found wallet: ${name} (${key})`);
                    wallets.push({
                        name: name,
                        icon: provider.icon || '🪙', // Default icon if missing
                        apiVersion: provider.apiVersion || '0.0.0',
                        enable: () => provider.enable(),
                    });
                }
            }
        }
        else {
            console.log('No window.cardano object found');
        }
        console.log('Detected wallets:', wallets);
        return wallets;
    }
    /**
     * Connect to a Cardano wallet
     */
    async connectWallet(walletName) {
        try {
            const wallets = this.getAvailableWallets();
            const wallet = wallets.find(w => w.name.toLowerCase() === walletName.toLowerCase());
            if (!wallet) {
                throw new Error(`Wallet ${walletName} not found. Please install it first.`);
            }
            // Enable wallet with timeout
            const enablePromise = wallet.enable();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out. Please check your wallet extension.')), 30000));
            this.connectedWallet = await Promise.race([enablePromise, timeoutPromise]);
            // Get address
            const addressHex = await this.connectedWallet.getUsedAddresses();
            const address = addressHex[0] || (await this.connectedWallet.getUnusedAddresses())[0];
            this.walletAddress = address;
            // Get balance (optional)
            let balance = '0';
            try {
                const balanceValue = await this.connectedWallet.getBalance();
                balance = balanceValue;
            }
            catch (e) {
                console.warn('Could not fetch balance:', e);
            }
            return {
                address,
                balance,
                walletName: wallet.name,
            };
        }
        catch (error) {
            console.error('Wallet connection error:', error);
            throw new Error(`Failed to connect to ${walletName}: ${error}`);
        }
    }
    /**
     * Disconnect wallet
     */
    disconnectWallet() {
        this.connectedWallet = null;
        this.walletAddress = null;
    }
    /**
     * Get connected wallet address
     */
    getAddress() {
        return this.walletAddress;
    }
    /**
     * Check if wallet is connected
     */
    isConnected() {
        return this.connectedWallet !== null && this.walletAddress !== null;
    }
    /**
     * Sign data with wallet (for additional authentication)
     */
    async signData(data) {
        if (!this.connectedWallet) {
            throw new Error('No wallet connected');
        }
        try {
            const address = await this.connectedWallet.getUsedAddresses();
            const signature = await this.connectedWallet.signData(address[0], Buffer.from(data).toString('hex'));
            return signature.signature;
        }
        catch (error) {
            console.error('Signing error:', error);
            throw new Error(`Failed to sign data: ${error}`);
        }
    }
}
// Export singleton instance
export const walletManager = new CardanoWalletManager();
export default walletManager;
