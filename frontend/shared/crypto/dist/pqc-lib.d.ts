/**
 * Post-Quantum Cryptography Library for Pharma Verify
 * Implements CRYSTALS-Dilithium for quantum-resistant digital signatures
 */
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
export declare class PQCManager {
    private readonly algorithm;
    private readonly dbName;
    private readonly storeName;
    private db;
    constructor();
    /**
     * Initialize IndexedDB for key storage
     */
    private initDB;
    /**
     * Generate a new PQC keypair
     */
    generateKeyPair(purpose?: string): Promise<PQCKeyPair>;
    /**
     * Sign data with PQC private key
     */
    sign(data: string | BatchData, keyId: string): Promise<PQCSignature>;
    /**
     * Verify PQC signature
     */
    verify(data: string | BatchData, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
    /**
     * Sign batch attestation data
     */
    signBatch(batchData: BatchData, keyId: string): Promise<{
        signature: string;
        publicKey: string;
        batchHash: string;
        timestamp: string;
    }>;
    /**
     * Verify batch attestation
     */
    verifyBatch(batchData: BatchData, signatureHex: string, publicKeyHex: string): Promise<boolean>;
    /**
     * Get keypair from storage
     */
    getKeyPair(keyId: string): Promise<PQCKeyPair | null>;
    /**
     * List all keypairs
     */
    listKeyPairs(): Promise<PQCKeyPair[]>;
    /**
     * Delete keypair
     */
    deleteKeyPair(keyId: string): Promise<void>;
    /**
     * Export public key for sharing
     */
    exportPublicKey(keyId: string): Promise<string>;
    /**
     * Store keypair in IndexedDB
     */
    private storeKeyPair;
    /**
     * Generate unique key ID
     */
    private generateKeyId;
    /**
     * Hash data using SHA-256
     */
    private hashData;
    /**
     * Convert bytes to hex string
     */
    private bytesToHex;
    /**
     * Convert hex string to bytes
     */
    private hexToBytes;
}
export declare const pqcManager: PQCManager;
export default pqcManager;
