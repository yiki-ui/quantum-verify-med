import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { MeshWallet, Transaction, ForgeScript, AssetMetadata } from '@meshsdk/core';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

/**
 * Aiken-based Token Strategy for PharmaVerify
 * Implements CIP-68 compliant NFT minting with Aiken validators
 */

interface TokenMetadata {
    name: string;
    description: string;
    image: string;
    batchId: string;
    manufacturer: string;
    manufacturingDate: string;
    expiryDate: string;
    quantity: number;
    status: string;
    // Quantum signature fields
    quantumSignature?: string;
    quantumAlgorithm?: string;
    quantumKeyId?: string;
}

interface MintResult {
    txHash: string;
    policyId: string;
    nftAssetName: string;
    refAssetName: string;
}

export class AikenTokenStrategy {
    private blockfrost: BlockFrostAPI;
    private wallet!: MeshWallet;
    private policyId!: string;
    private policyScript!: string;

    constructor(
        projectId: string,
        network: 'mainnet' | 'testnet' = 'testnet',
        walletMnemonic?: string
    ) {
        this.blockfrost = new BlockFrostAPI({
            projectId,
            network: network === 'mainnet' ? 'mainnet' : 'preprod',
        });

        // Initialize wallet
        if (walletMnemonic) {
            this.wallet = new MeshWallet({
                networkId: network === 'mainnet' ? 1 : 0,
                key: {
                    type: 'mnemonic',
                    words: walletMnemonic.split(' '),
                },
            });
        }

        // Load compiled Aiken validator
        this.loadCompiledValidator();
    }

    /**
     * Load compiled Aiken validator from plutus.json
     */
    private loadCompiledValidator(): void {
        try {
            const plutusPath = path.join(
                __dirname,
                '../aiken/plutus.json'
            );
            const plutusJson = JSON.parse(fs.readFileSync(plutusPath, 'utf8'));

            // Extract the minting policy validator
            const validator = plutusJson.validators.find(
                (v: any) => v.title === 'batch_token_policy.mint'
            );

            if (!validator) {
                throw new Error('Batch token policy validator not found in plutus.json');
            }

            this.policyScript = validator.compiledCode;
            this.policyId = validator.hash;

            console.log(`✅ Loaded Aiken validator. Policy ID: ${this.policyId}`);
        } catch (error) {
            console.error('Failed to load Aiken validator:', error);
            throw new Error('Aiken validator not compiled. Run: npm run build:aiken');
        }
    }

    /**
     * Mint CIP-68 compliant batch token
     * Creates both NFT (100) and Reference (222) tokens
     */
    async mintBatchToken(
        batchId: string,
        metadata: TokenMetadata,
        manufacturerKey: string
    ): Promise<MintResult> {
        try {
            // Generate asset names following CIP-68
            const baseAssetName = this.generateAssetName(batchId, metadata.batchId);
            const nftAssetName = this.addCIP68Prefix(baseAssetName, 100); // NFT
            const refAssetName = this.addCIP68Prefix(baseAssetName, 222); // Reference

            // Build transaction
            const tx = new Transaction({ initiator: this.wallet });

            // Construct CIP-68 metadata
            const cip68Metadata = this.createCIP68Metadata(metadata);

            // Define forge script from the compiled Aiken validator
            const forgeScript = {
                code: this.policyScript,
                version: 'V2',
            };

            // Mint CIP-68 User NFT (100) and Reference Token (222)
            tx.mintAsset(forgeScript, { assetName: nftAssetName, assetQuantity: '1' });
            tx.mintAsset(forgeScript, { assetName: refAssetName, assetQuantity: '1' });

            // Standard CIP-25 Metadata for the user NFT
            tx.setMetadata(721, { 
                [this.policyId]: { 
                    [nftAssetName]: {
                        ...metadata,
                        name: `${metadata.name} (Verified Batch)`,
                    } 
                } 
            });

            // CIP-68 Reference Metadata (Label 68)
            tx.setMetadata(68, cip68Metadata);

            // Ensure the transaction is signed by the authorized manufacturer
            tx.setRequiredSigners([manufacturerKey]);

            const unsignedTx = await tx.build();
            const signedTx = await this.wallet.signTx(unsignedTx);
            const txHash = await this.wallet.submitTx(signedTx);

            console.log(`✅ Batch token successfully minted on Cardano. Tx: ${txHash}`);

            return {
                txHash,
                policyId: this.policyId,
                nftAssetName,
                refAssetName,
            };
        } catch (error: any) {
            console.error('Minting failed:', error);
            throw new Error(`Failed to mint batch token: ${error.message}`);
        }
    }

    /**
     * Update batch status (recall, expire, suspend)
     * Only regulators can perform this action
     */
    async updateBatchStatus(
        batchId: string,
        newStatus: 'recalled' | 'expired' | 'suspended',
        regulatorKey: string,
        reason?: string
    ): Promise<string> {
        try {
            const baseAssetName = this.generateAssetName(batchId, batchId);
            const refAssetName = this.addCIP68Prefix(baseAssetName, 222);

            // Find the reference token UTxO
            const refTokenUtxo = await this.findReferenceTokenUtxo(refAssetName);

            if (!refTokenUtxo) {
                throw new Error('Reference token not found');
            }

            // Build update transaction
            const tx = new Transaction({ initiator: this.wallet });

            // Spend the reference token UTxO
            tx.sendAssets(
                {
                    address: refTokenUtxo.address,
                    datum: {
                        value: this.createUpdatedDatum(refTokenUtxo.datum, newStatus),
                    },
                },
                [
                    {
                        unit: this.policyId + refAssetName,
                        quantity: '1',
                    },
                ]
            );

            // Add regulator signature
            tx.setRequiredSigners([regulatorKey]);

            // Set redeemer for update action
            try {
                (tx as any).setMintRedeemer(
                    this.policyId,
                    JSON.stringify({
                        constructor: 2,
                        fields: [{ bytes: Buffer.from(newStatus).toString('hex') }],
                    })
                );
            } catch (e) {
                console.warn('setMintRedeemer not available, skipping...');
            }

            // Build and submit
            const unsignedTx = await tx.build();
            const signedTx = await this.wallet.signTx(unsignedTx);
            const txHash = await this.wallet.submitTx(signedTx);

            console.log(`✅ Batch status updated to ${newStatus}. Tx: ${txHash}`);

            return txHash;
        } catch (error: any) {
            console.error('Status update failed:', error);
            throw new Error(`Failed to update batch status: ${error.message}`);
        }
    }

    /**
     * Verify batch attestation on-chain
     */
    async verifyBatchAttestation(batchId: string): Promise<boolean> {
        try {
            const baseAssetName = this.generateAssetName(batchId, batchId);
            const nftAssetName = this.addCIP68Prefix(baseAssetName, 100);

            const asset = await this.blockfrost.assetsById(
                this.policyId + nftAssetName
            );

            return asset !== null && asset.quantity === '1';
        } catch (error) {
            console.error('Verification failed:', error);
            return false;
        }
    }

    /**
     * Get batch metadata from blockchain
     */
    async getBatchMetadata(batchId: string): Promise<any> {
        try {
            const baseAssetName = this.generateAssetName(batchId, batchId);
            const refAssetName = this.addCIP68Prefix(baseAssetName, 222);

            const asset = await this.blockfrost.assetsById(
                this.policyId + refAssetName
            );

            if (!asset || !asset.onchain_metadata) {
                return null;
            }

            return asset.onchain_metadata;
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
            return null;
        }
    }

    /**
     * Generate asset name: SHA256(serial_number || batch_id)
     */
    private generateAssetName(serialNumber: string, batchId: string): string {
        const hash = crypto
            .createHash('sha256')
            .update(serialNumber + batchId)
            .digest('hex');

        // Take first 32 bytes (64 hex chars)
        return hash.substring(0, 64);
    }

    /**
     * Add CIP-68 prefix to asset name
     * @param assetName Base asset name (32 bytes)
     * @param prefix 100 for NFT, 222 for Reference, 333 for FT
     */
    private addCIP68Prefix(assetName: string, prefix: number): string {
        const prefixHex = prefix.toString(16).padStart(4, '0');
        return prefixHex + assetName;
    }

    /**
     * Create CIP-68 compliant metadata
     */
    private createCIP68Metadata(metadata: TokenMetadata): any {
        const cip68Meta: any = {
            version: 1,
            extra: {
                batch_number: metadata.batchId,
                manufacturer: metadata.manufacturer,
                manufacturing_date: metadata.manufacturingDate,
                expiry_date: metadata.expiryDate,
                quantity: metadata.quantity,
                status: metadata.status,
                product_name: metadata.name,
            },
        };

        // Add quantum signature fields if present
        if (metadata.quantumSignature) {
            cip68Meta.extra.quantum_signature = metadata.quantumSignature;
            cip68Meta.extra.quantum_algorithm = metadata.quantumAlgorithm || 'dilithium2';
            cip68Meta.extra.quantum_key_id = metadata.quantumKeyId;
            cip68Meta.extra.quantum_secured = true;
        }

        return cip68Meta;
    }

    /**
     * Find reference token UTxO
     */
    private async findReferenceTokenUtxo(refAssetName: string): Promise<any> {
        try {
            const addresses = await this.wallet.getUsedAddresses();
            const address = addresses[0];

            const utxos = await this.blockfrost.addressesUtxos(address);

            return utxos.find((utxo: any) =>
                utxo.amount.some(
                    (asset: any) => asset.unit === this.policyId + refAssetName
                )
            );
        } catch (error) {
            console.error('Failed to find reference token:', error);
            return null;
        }
    }

    /**
     * Create updated datum with new status
     */
    private createUpdatedDatum(currentDatum: any, newStatus: string): any {
        // Parse current datum and update only status field
        const datum = JSON.parse(currentDatum);
        datum.fields[6] = { bytes: Buffer.from(newStatus).toString('hex') }; // status field

        return datum;
    }
}

export default AikenTokenStrategy;