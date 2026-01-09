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
export declare class CardanoWalletManager {
    private connectedWallet;
    private walletAddress;
    /**
     * Get available Cardano wallets
     */
    /**
     * Get available Cardano wallets
     */
    getAvailableWallets(): WalletInfo[];
    /**
     * Connect to a Cardano wallet
     */
    connectWallet(walletName: string): Promise<CardanoWallet>;
    /**
     * Disconnect wallet
     */
    disconnectWallet(): void;
    /**
     * Get connected wallet address
     */
    getAddress(): string | null;
    /**
     * Check if wallet is connected
     */
    isConnected(): boolean;
    /**
     * Sign data with wallet (for additional authentication)
     */
    signData(data: string): Promise<string>;
}
export declare const walletManager: CardanoWalletManager;
export default walletManager;
