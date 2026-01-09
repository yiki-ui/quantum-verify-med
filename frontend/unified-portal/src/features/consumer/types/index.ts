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
