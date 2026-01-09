import axios from 'axios';
import type { VerificationResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Mock data for demo - matches database schema
const mockMedicines = {
    'BT-2024-ASPIRIN-001': {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Aspirin 500mg',
        description: 'Pain reliever and fever reducer',
        manufacturer: 'PharmaCorp International',
        active_ingredient: 'Acetylsalicylic Acid',
        dosage: '500mg',
        is_authentic: true,
        quantum_signature: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    },
    'BT-2024-PARACETAMOL-001': {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Paracetamol 1000mg',
        description: 'Analgesic and antipyretic medication',
        manufacturer: 'PharmaCorp International',
        active_ingredient: 'Paracetamol',
        dosage: '1000mg',
        is_authentic: true,
        quantum_signature: 'f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0',
    },
    'BT-2024-ASPIRIN-FAKE-001': {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Aspirin 500mg',
        description: 'COUNTERFEIT - Fake pain reliever',
        manufacturer: 'Unknown/Counterfeit',
        active_ingredient: 'Unknown/Fake Ingredient',
        dosage: '500mg',
        is_authentic: false,
        quantum_signature: 'INVALID_SIGNATURE_COUNTERFEIT_0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
};

export const verificationApi = {
    verifyBatch: async (batchNumber: string): Promise<VerificationResult> => {
        // Simulate API delay for realistic demo
        await new Promise(resolve => setTimeout(resolve, 2000));

        const medicine = mockMedicines[batchNumber as keyof typeof mockMedicines];

        if (!medicine) {
            throw new Error('Batch not found');
        }

        const isAuthentic = medicine.is_authentic;

        // Generate mock blockchain data
        const txHash = Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        const policyId = Array.from({ length: 56 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        return {
            isAuthentic,
            batchNumber,
            medicine: {
                name: medicine.name,
                dosage: medicine.dosage,
                manufacturer: medicine.manufacturer,
                active_ingredient: medicine.active_ingredient,
            },
            batch: {
                quantity: isAuthentic ? 10000 : 5000,
                manufacturing_date: '2024-12-01',
                expiry_date: '2026-12-01',
                status: isAuthentic ? 'active' : 'recalled',
            },
            blockchain: {
                verified: isAuthentic,
                txHash: isAuthentic ? txHash : undefined,
                policyId: isAuthentic ? policyId : undefined,
                explorerUrl: isAuthentic ? `https://testnet.cardanoscan.io/transaction/${txHash}` : undefined,
            },
            quantum: {
                signatureValid: isAuthentic,
                algorithm: 'CRYSTALS-Dilithium2',
            },
            message: isAuthentic
                ? 'This product has been verified as authentic on the Cardano blockchain with quantum-resistant cryptography.'
                : '⚠️ WARNING: This product appears to be counterfeit. Do not use. Report to authorities immediately.',
        };
    },
};

export default axios.create({
    baseURL: API_BASE_URL,
});
