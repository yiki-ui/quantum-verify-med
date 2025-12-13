/**
 * Cardano Wallet Integration for PQC Authentication
 */

export interface WalletInfo {
    name: string;
    icon: string;
    apiVersion: string;
    enable: () => Promise<any>;
}

export interface CardanoWallet {
    address: string;
    stakeAddress?: string;
    balance?: string;
    walletName: string;
}

/**
 * Cardano Wallet Manager
 * Handles wallet connection and authentication
 */
export class CardanoWalletManager {
    private connectedWallet: any = null;
    private walletAddress: string | null = null;

    /**
     * Get available Cardano wallets
     */
    getAvailableWallets(): WalletInfo[] {
        const wallets: WalletInfo[] = [];

        console.log('Checking for wallets...');
        console.log('window.cardano:', (window as any).cardano);

        // Check for common Cardano wallets
        if ((window as any).cardano) {
            const cardano = (window as any).cardano;
            console.log('Cardano object keys:', Object.keys(cardano));

            // Nami
            if (cardano.nami) {
                console.log('Found Nami');
                wallets.push({
                    name: 'Nami',
                    icon: '🦎',
                    apiVersion: cardano.nami.apiVersion || '1.0.0',
                    enable: () => cardano.nami.enable(),
                });
            } else {
                console.log('Nami not found in cardano object');
            }

            // Eternl
            if (cardano.eternl) {
                console.log('Found Eternl');
                wallets.push({
                    name: 'Eternl',
                    icon: '♾️',
                    apiVersion: cardano.eternl.apiVersion || '1.0.0',
                    enable: () => cardano.eternl.enable(),
                });
            }

            // Flint
            if (cardano.flint) {
                console.log('Found Flint');
                wallets.push({
                    name: 'Flint',
                    icon: '🔥',
                    apiVersion: cardano.flint.apiVersion || '1.0.0',
                    enable: () => cardano.flint.enable(),
                });
            }

            // Typhon
            if (cardano.typhon) {
                console.log('Found Typhon');
                wallets.push({
                    name: 'Typhon',
                    icon: '🌊',
                    apiVersion: cardano.typhon.apiVersion || '1.0.0',
                    enable: () => cardano.typhon.enable(),
                });
            }

            // Lace
            if (cardano.lace) {
                console.log('Found Lace');
                wallets.push({
                    name: 'Lace',
                    icon: '🧶',
                    apiVersion: cardano.lace.apiVersion || '1.0.0',
                    enable: () => cardano.lace.enable(),
                });
            }
        } else {
            console.log('No window.cardano object found');
        }

        console.log('Detected wallets:', wallets);
        return wallets;
    }

    /**
     * Connect to a Cardano wallet
     */
    async connectWallet(walletName: string): Promise<CardanoWallet> {
        try {
            const wallets = this.getAvailableWallets();
            const wallet = wallets.find(w => w.name.toLowerCase() === walletName.toLowerCase());

            if (!wallet) {
                throw new Error(`Wallet ${walletName} not found. Please install it first.`);
            }

            // Enable wallet with timeout
            const enablePromise = wallet.enable();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timed out. Please check your wallet extension.')), 30000)
            );

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
            } catch (e) {
                console.warn('Could not fetch balance:', e);
            }

            return {
                address,
                balance,
                walletName: wallet.name,
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw new Error(`Failed to connect to ${walletName}: ${error}`);
        }
    }

    /**
     * Disconnect wallet
     */
    disconnectWallet(): void {
        this.connectedWallet = null;
        this.walletAddress = null;
    }

    /**
     * Get connected wallet address
     */
    getAddress(): string | null {
        return this.walletAddress;
    }

    /**
     * Check if wallet is connected
     */
    isConnected(): boolean {
        return this.connectedWallet !== null && this.walletAddress !== null;
    }

    /**
     * Sign data with wallet (for additional authentication)
     */
    async signData(data: string): Promise<string> {
        if (!this.connectedWallet) {
            throw new Error('No wallet connected');
        }

        try {
            const address = await this.connectedWallet.getUsedAddresses();
            const signature = await this.connectedWallet.signData(
                address[0],
                Buffer.from(data).toString('hex')
            );

            return signature.signature;
        } catch (error) {
            console.error('Signing error:', error);
            throw new Error(`Failed to sign data: ${error}`);
        }
    }
}

// Export singleton instance
export const walletManager = new CardanoWalletManager();
export default walletManager;
