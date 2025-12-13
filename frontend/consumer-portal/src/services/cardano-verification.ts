/**
 * Browser-compatible Cardano verification service
 * Uses Blockfrost API directly for querying blockchain data
 */
import { pqcManager } from '../../../shared/crypto/dist';
export interface PQCMetadata {
    signature: string;
    publicKey: string;
    algorithm: string;
    batchHash: string;
    timestamp: string;
}

export class CardanoVerificationService {
    private projectId: string;
    private network: 'mainnet' | 'testnet';
    private policyId: string;

    constructor(
        projectId: string,
        network: 'mainnet' | 'testnet' = 'testnet',
        policyId?: string
    ) {
        this.projectId = projectId;
        this.network = network;
        this.policyId = policyId || this.generateMockPolicyId();
    }

    /**
     * Verify batch on Cardano blockchain
     */
    async verifyBatchPQC(batchId: string): Promise<{
        valid: boolean;
        metadata: any;
        pqcData: PQCMetadata | null;
    }> {
        try {
            // Mock mode for demo
            if (this.projectId === 'preprodDemoKey') {
                console.log('Using mock verification for demo');
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

                // Generate a temporary keypair for this mock verification so it passes
                const keyPair = await pqcManager.generateKeyPair('mock');
                const publicKey = await pqcManager.exportPublicKey(keyPair.keyId);

                // Mock batch attributes
                const attributes = {
                    batch_id: batchId,
                    product_name: "Demo Product (Aspirin 500mg)",
                    manufacturer: "PharmaCorp Demo",
                    quantity: 10000,
                    manufacturing_date: new Date().toISOString(),
                    expiry_date: new Date(Date.now() + 63072000000).toISOString() // +2 years
                };

                // Reconstruct data to sign (matching Verification.ts logic)
                const dataToSign = {
                    batchId: attributes.batch_id,
                    productName: attributes.product_name,
                    manufacturer: attributes.manufacturer,
                    quantity: attributes.quantity,
                    manufacturingDate: attributes.manufacturing_date,
                    expiryDate: attributes.expiry_date,
                };

                // Sign the data
                const signResult = await pqcManager.signBatch(dataToSign, keyPair.keyId);

                // Construct mock metadata structure
                const metadata = {
                    "721": {
                        [this.policyId]: {
                            [batchId]: {
                                "name": `Product - ${batchId}`,
                                "attributes": attributes
                            }
                        }
                    }
                };

                return {
                    valid: true,
                    metadata: metadata,
                    pqcData: {
                        signature: signResult.signature,
                        publicKey: signResult.publicKey,
                        algorithm: "dilithium2",
                        batchHash: signResult.batchHash,
                        timestamp: signResult.timestamp,
                    },
                };
            }

            // Convert batch ID to hex for asset ID
            const batchIdHex = this.stringToHex(batchId);
            const assetId = `${this.policyId}${batchIdHex}`;

            // Query Blockfrost API
            const baseUrl = this.network === 'mainnet'
                ? 'https://cardano-mainnet.blockfrost.io/api/v0'
                : 'https://cardano-preprod.blockfrost.io/api/v0';

            const response = await fetch(`${baseUrl}/assets/${assetId}`, {
                headers: {
                    'project_id': this.projectId
                }
            });

            if (!response.ok) {
                console.warn('Asset not found on blockchain');
                return { valid: false, metadata: null, pqcData: null };
            }

            const asset = await response.json();

            if (!asset || !asset.onchain_metadata) {
                return { valid: false, metadata: null, pqcData: null };
            }

            // Extract PQC metadata
            const onchainMeta = asset.onchain_metadata;
            const pqcData = onchainMeta.pqc_signature;

            if (!pqcData) {
                return { valid: false, metadata: onchainMeta, pqcData: null };
            }

            return {
                valid: true,
                metadata: onchainMeta,
                pqcData: {
                    signature: pqcData.signature,
                    publicKey: pqcData.public_key,
                    algorithm: pqcData.algorithm,
                    batchHash: pqcData.batch_hash,
                    timestamp: pqcData.timestamp,
                },
            };
        } catch (error) {
            console.error('Verification error:', error);
            return { valid: false, metadata: null, pqcData: null };
        }
    }

    /**
     * Convert string to hex
     */
    private stringToHex(str: string): string {
        return Array.from(new TextEncoder().encode(str))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Generate mock policy ID for testing
     */
    private generateMockPolicyId(): string {
        const randomBytes = new Uint8Array(28);
        crypto.getRandomValues(randomBytes);
        return Array.from(randomBytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

export default CardanoVerificationService;
