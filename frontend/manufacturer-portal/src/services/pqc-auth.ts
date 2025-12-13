/**
 * PQC Authentication Service for Manufacturer Portal
 * Integrates Cardano wallet + PQC keypairs
 */

import { pqcManager, walletManager } from '../../../shared/crypto/dist';

export interface ManufacturerProfile {
    walletAddress: string;
    walletName: string;
    pqcKeyId: string;
    pqcPublicKey: string;
    companyName?: string;
    registeredAt: string;
}

/**
 * PQC Authentication Manager for Manufacturers
 */
class PQCAuthService {
    private readonly STORAGE_KEY = 'manufacturer_profile';

    /**
     * Connect wallet and generate PQC keypair (registration/login)
     */
    async connectAndRegister(walletName: string, companyName?: string): Promise<ManufacturerProfile> {
        try {
            // Connect Cardano wallet
            const wallet = await walletManager.connectWallet(walletName);

            // Check if user already has a profile
            const existingProfile = this.getStoredProfile();
            if (existingProfile && existingProfile.walletAddress === wallet.address) {
                return existingProfile;
            }

            // Generate new PQC keypair
            const keyPair = await pqcManager.generateKeyPair('manufacturer');
            const publicKeyHex = await pqcManager.exportPublicKey(keyPair.keyId);

            // Create manufacturer profile
            const profile: ManufacturerProfile = {
                walletAddress: wallet.address,
                walletName: wallet.walletName,
                pqcKeyId: keyPair.keyId,
                pqcPublicKey: publicKeyHex,
                companyName,
                registeredAt: new Date().toISOString(),
            };

            // Store profile
            this.storeProfile(profile);

            return profile;
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(`Failed to register: ${error}`);
        }
    }

    /**
     * Login with existing wallet
     */
    async login(walletName: string): Promise<ManufacturerProfile> {
        try {
            // Connect wallet
            const wallet = await walletManager.connectWallet(walletName);

            // Get stored profile
            const profile = this.getStoredProfile();

            if (!profile || profile.walletAddress !== wallet.address) {
                throw new Error('No profile found for this wallet. Please register first.');
            }

            // Verify PQC keypair exists
            const keyPair = await pqcManager.getKeyPair(profile.pqcKeyId);
            if (!keyPair) {
                throw new Error('PQC keypair not found. Please register again.');
            }

            return profile;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout
     */
    logout(): void {
        walletManager.disconnectWallet();
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Get current profile
     */
    getProfile(): ManufacturerProfile | null {
        return this.getStoredProfile();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const profile = this.getStoredProfile();
        return profile !== null && walletManager.isConnected();
    }

    /**
     * Sign batch data with PQC
     */
    async signBatchData(batchData: any): Promise<{
        signature: string;
        publicKey: string;
        batchHash: string;
        timestamp: string;
    }> {
        const profile = this.getStoredProfile();
        if (!profile) {
            throw new Error('Not authenticated');
        }

        return pqcManager.signBatch(batchData, profile.pqcKeyId);
    }

    /**
     * Get available wallets
     */
    getAvailableWallets() {
        return walletManager.getAvailableWallets();
    }

    /**
     * Store profile in localStorage
     */
    private storeProfile(profile: ManufacturerProfile): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    }

    /**
     * Get stored profile
     */
    private getStoredProfile(): ManufacturerProfile | null {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Update company name
     */
    async updateCompanyName(companyName: string): Promise<void> {
        const profile = this.getStoredProfile();
        if (!profile) {
            throw new Error('Not authenticated');
        }

        profile.companyName = companyName;
        this.storeProfile(profile);
    }
}

// Export singleton instance
export const pqcAuth = new PQCAuthService();
export default pqcAuth;
