import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Security Check
        const clientSecret = request.headers['x-internal-secret'] as string;
        const serverSecret = process.env.INTERNAL_API_SECRET as string;

        if (serverSecret && clientSecret !== serverSecret) {
            return response.status(401).json({ error: 'Unauthorized' });
        }

        const { signature, key, message } = request.body;
        console.log("Verifying signature for message via PQC Dilithium");

        if (!signature || !key || !message) {
            return response.status(400).json({ error: 'Missing required fields: signature, key, or message' });
        }

        // True Verification using ML-DSA-65 (CRYSTALS-Dilithium2)
        const signatureBytes = hexToBytes(signature);
        const publicKeyBytes = hexToBytes(key);
        
        const dataBytes = typeof message === 'string'
            ? new TextEncoder().encode(message)
            : new TextEncoder().encode(JSON.stringify(message));

        // Use noble/post-quantum to verify
        const verified = ml_dsa65.verify(publicKeyBytes, dataBytes, signatureBytes);

        return response.status(200).json({
            success: true,
            verified: verified,
            message: verified ? "Signature valid (PQC Verified)" : "Invalid signature",
            userId: "user_" + Math.random().toString(36).substring(7)
        });

    } catch (error) {
        console.error("Verification error:", error);
        return response.status(500).json({ success: false, error: String(error) });
    }
}
