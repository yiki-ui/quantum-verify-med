export interface VerificationResult {
    isAuthentic: boolean;
    batchNumber: string;
    medicine: {
        name: string;
        dosage: string;
        manufacturer: string;
        active_ingredient: string;
    };
    batch: {
        quantity: number;
        manufacturing_date: string;
        expiry_date: string;
        status: string;
    };
    blockchain: {
        verified: boolean;
        txHash?: string;
        policyId?: string;
        explorerUrl?: string;
    };
    quantum: {
        signatureValid: boolean;
        algorithm: string;
    };
    message: string;
}

export interface Medicine {
    id: string;
    name: string;
    description: string;
    manufacturer_id: string;
    active_ingredient: string;
    dosage: string;
    is_authentic: boolean;
    quantum_signature?: string;
    quantum_public_key?: string;
    quantum_key_id?: string;
    quantum_algorithm?: string;
}

export interface Batch {
    id: string;
    batch_number: string;
    medicine_id: string;
    manufacturer_id: string;
    quantity: number;
    manufacturing_date: string;
    expiry_date: string;
    status: 'active' | 'distributed' | 'recalled' | 'expired';
    blockchain_tx_hash?: string;
    blockchain_policy_id?: string;
    blockchain_asset_name?: string;
    blockchain_verified: boolean;
    quantum_signature?: string;
    created_at: string;
}

export interface QuantumSignatureResponse {
    success: boolean;
    data: {
        signature: string;
        publicKey: string;
        keyId: string;
        algorithm: string;
        timestamp: string;
    };
}

export interface CardanoMintResponse {
    success: boolean;
    data: {
        txHash: string;
        policyId: string;
        assetName: string;
        network: string;
        explorerUrl: string;
    };
}

export interface BatchRegistrationData {
    medicine_id: string;
    quantity: number;
    manufacturing_date: string;
    expiry_date: string;
}

export interface User {
    id: string;
    username: string;
    role: 'pharmacy' | 'manufacturer' | 'consumer';
    walletAddress?: string;
}
