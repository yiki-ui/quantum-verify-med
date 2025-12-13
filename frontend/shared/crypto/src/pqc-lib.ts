/**
 * Post-Quantum Cryptography Library for Pharma Verify
 * Implements CRYSTALS-Dilithium for quantum-resistant digital signatures
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';

export interface PQCKeyPair {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
    keyId: string;
    algorithm: 'dilithium2' | 'dilithium3' | 'dilithium5';
    createdAt: string;
}

export interface PQCSignature {
    signature: Uint8Array;
    data: Uint8Array;
    keyId: string;
    algorithm: string;
    timestamp: string;
}

export interface BatchData {
    batchId: string;
    productName: string;
    manufacturer: string;
    quantity: number;
    manufacturingDate: string;
    expiryDate: string;
    [key: string]: any;
}

/**
 * Post-Quantum Cryptography Manager
 * Handles keypair generation, signing, and verification using Dilithium
 */
export class PQCManager {
    private readonly algorithm = 'dilithium2';
    private readonly dbName = 'pharma-verify-pqc';
    private readonly storeName = 'keypairs';
    private db: IDBDatabase | null = null;

    constructor() {
        this.initDB();
    }

    /**
     * Initialize IndexedDB for key storage
     */
    private async initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'keyId' });
                }
            };
        });
    }

    /**
     * Generate a new PQC keypair
     */
    async generateKeyPair(purpose: string = 'batch'): Promise<PQCKeyPair> {
        // Generate Dilithium keypair using ML-DSA-65 (Dilithium2)
        const seed = new Uint8Array(32);
        crypto.getRandomValues(seed);
        const { secretKey, publicKey } = ml_dsa65.keygen(seed);

        // Generate unique key ID
        const keyId = await this.generateKeyId();

        const keyPair: PQCKeyPair = {
            publicKey,
            privateKey: secretKey,
            keyId,
            algorithm: 'dilithium2',
            createdAt: new Date().toISOString(),
        };

        // Store in IndexedDB
        await this.storeKeyPair(keyPair);

        return keyPair;
    }

    /**
     * Sign data with PQC private key
     */
    async sign(data: string | BatchData, keyId: string): Promise<PQCSignature> {
        const keyPair = await this.getKeyPair(keyId);
        if (!keyPair) {
            throw new Error(`Key not found: ${keyId}`);
        }

        // Convert data to bytes
        const dataBytes = typeof data === 'string'
            ? new TextEncoder().encode(data)
            : new TextEncoder().encode(JSON.stringify(data));

        // Sign with Dilithium
        const signature = ml_dsa65.sign(keyPair.privateKey, dataBytes);

        return {
            signature,
            data: dataBytes,
            keyId,
            algorithm: this.algorithm,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Verify PQC signature
     */
    async verify(
        data: string | BatchData,
        signature: Uint8Array,
        publicKey: Uint8Array
    ): Promise<boolean> {
        try {
            // Convert data to bytes
            const dataBytes = typeof data === 'string'
                ? new TextEncoder().encode(data)
                : new TextEncoder().encode(JSON.stringify(data));

            // Verify with Dilithium
            return ml_dsa65.verify(publicKey, dataBytes, signature);
        } catch (error) {
            console.error('Verification error:', error);
            return false;
        }
    }

    /**
     * Sign batch attestation data
     */
    async signBatch(batchData: BatchData, keyId: string): Promise<{
        signature: string;
        publicKey: string;
        batchHash: string;
        timestamp: string;
    }> {
        const sig = await this.sign(batchData, keyId);
        const keyPair = await this.getKeyPair(keyId);

        if (!keyPair) {
            throw new Error(`Key not found: ${keyId}`);
        }

        // Create batch hash
        const batchHash = await this.hashData(JSON.stringify(batchData));

        return {
            signature: this.bytesToHex(sig.signature),
            publicKey: this.bytesToHex(keyPair.publicKey),
            batchHash,
            timestamp: sig.timestamp,
        };
    }

    /**
     * Verify batch attestation
     */
    async verifyBatch(
        batchData: BatchData,
        signatureHex: string,
        publicKeyHex: string
    ): Promise<boolean> {
        const signature = this.hexToBytes(signatureHex);
        const publicKey = this.hexToBytes(publicKeyHex);

        return this.verify(batchData, signature, publicKey);
    }

    /**
     * Get keypair from storage
     */
    async getKeyPair(keyId: string): Promise<PQCKeyPair | null> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(keyId);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * List all keypairs
     */
    async listKeyPairs(): Promise<PQCKeyPair[]> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete keypair
     */
    async deleteKeyPair(keyId: string): Promise<void> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(keyId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Export public key for sharing
     */
    async exportPublicKey(keyId: string): Promise<string> {
        const keyPair = await this.getKeyPair(keyId);
        if (!keyPair) {
            throw new Error(`Key not found: ${keyId}`);
        }
        return this.bytesToHex(keyPair.publicKey);
    }

    /**
     * Store keypair in IndexedDB
     */
    private async storeKeyPair(keyPair: PQCKeyPair): Promise<void> {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(keyPair);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generate unique key ID
     */
    private async generateKeyId(): Promise<string> {
        const randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);
        return this.bytesToHex(randomBytes);
    }

    /**
     * Hash data using SHA-256
     */
    private async hashData(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
        return this.bytesToHex(new Uint8Array(hashBuffer));
    }

    /**
     * Convert bytes to hex string
     */
    private bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Convert hex string to bytes
     */
    private hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }
}

// Export singleton instance
export const pqcManager = new PQCManager();
export default pqcManager;
