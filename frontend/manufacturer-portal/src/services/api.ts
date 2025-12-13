import axios from 'axios';
import type { Medicine, Batch, QuantumSignatureResponse, CardanoMintResponse, BatchRegistrationData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});



// Mock medicines data for demo
const mockMedicines: Medicine[] = [
    {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Aspirin 500mg',
        description: 'Pain reliever and fever reducer',
        manufacturer_id: '11111111-1111-1111-1111-111111111111',
        active_ingredient: 'Acetylsalicylic Acid',
        dosage: '500mg',
        is_authentic: true,
        quantum_signature: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
        quantum_public_key: 'pub_key_aspirin_500mg_authentic_2024',
        quantum_key_id: 'key_aspirin_001',
        quantum_algorithm: 'dilithium2',
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Paracetamol 1000mg',
        description: 'Analgesic and antipyretic medication',
        manufacturer_id: '11111111-1111-1111-1111-111111111111',
        active_ingredient: 'Paracetamol',
        dosage: '1000mg',
        is_authentic: true,
        quantum_signature: 'f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0',
        quantum_public_key: 'pub_key_paracetamol_1000mg_authentic_2024',
        quantum_key_id: 'key_paracetamol_001',
        quantum_algorithm: 'dilithium2',
    },
    {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Aspirin 500mg (COUNTERFEIT)',
        description: 'COUNTERFEIT - Fake pain reliever',
        manufacturer_id: '11111111-1111-1111-1111-111111111111',
        active_ingredient: 'Unknown/Fake Ingredient',
        dosage: '500mg',
        is_authentic: false,
        quantum_signature: 'INVALID_SIGNATURE_COUNTERFEIT_0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        quantum_public_key: 'FAKE_PUBLIC_KEY_INVALID',
        quantum_key_id: 'key_fake_001',
        quantum_algorithm: 'dilithium2',
    },
];


// Medicines API
export const medicinesApi = {
    getAll: async (): Promise<Medicine[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockMedicines;
    },

    getById: async (id: string): Promise<Medicine> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const medicine = mockMedicines.find(m => m.id === id);
        if (!medicine) {
            throw new Error('Medicine not found');
        }
        return medicine;
    },
};

// Batches API
export const batchesApi = {
    getAll: async (): Promise<Batch[]> => {
        // Return empty array for demo - batches would be created through registration
        await new Promise(resolve => setTimeout(resolve, 500));
        return [];
    },

    getById: async (_id: string): Promise<Batch> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        throw new Error('Batch not found');
    },

    create: async (data: BatchRegistrationData): Promise<Batch> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock batch creation
        const batch: Batch = {
            id: crypto.randomUUID(),
            batch_number: `BT-${Date.now()}`,
            medicine_id: data.medicine_id,
            manufacturer_id: '11111111-1111-1111-1111-111111111111',
            quantity: data.quantity,
            manufacturing_date: data.manufacturing_date,
            expiry_date: data.expiry_date,
            status: 'active',
            blockchain_verified: false,
            created_at: new Date().toISOString(),
        };
        return batch;
    },
};

// Quantum Cryptography API
export const quantumApi_service = {
    generateKeypair: async () => {
        // Simulate quantum keypair generation
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            data: {
                keyId: `key_${Date.now()}`,
                publicKey: Array.from({ length: 64 }, () =>
                    Math.floor(Math.random() * 16).toString(16)
                ).join(''),
                algorithm: 'dilithium2',
            },
        };
    },

    signBatch: async (_batchData: any, keyId: string): Promise<QuantumSignatureResponse> => {
        // Simulate quantum signature generation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const signature = Array.from({ length: 128 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        const publicKey = Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        return {
            success: true,
            data: {
                signature,
                publicKey,
                keyId,
                algorithm: 'dilithium2',
                timestamp: new Date().toISOString(),
            },
        };
    },

    verifySignature: async (_signature: string, _data: any, _publicKey: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            success: true,
            valid: true,
        };
    },
};

// Cardano Blockchain API
export const cardanoApi = {
    mintNFT: async (batchData: any, _signature: string): Promise<CardanoMintResponse> => {
        // Simulated minting for demo purposes
        const txHash = Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        const policyId = Array.from({ length: 56 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        const assetName = `PharmaVerify_${batchData.batchNumber}`;

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            success: true,
            data: {
                txHash,
                policyId,
                assetName,
                network: 'Cardano Testnet',
                explorerUrl: `https://testnet.cardanoscan.io/transaction/${txHash}`,
            },
        };
    },

    verifyOnChain: async (_txHash: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            verified: true,
        };
    },
};

export default api;
