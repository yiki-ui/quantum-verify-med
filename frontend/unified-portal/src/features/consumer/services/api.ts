import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Note: Verification is now performed client-side directly against the Cardano blockchain
 * using CardanoVerificationService for maximum security and PQC validation.
 */
export const verificationApi = {
    verifyBatch: () => { throw new Error("Use CardanoVerificationService for live on-chain verification."); }
};

export default axios.create({
    baseURL: API_BASE_URL,
});
