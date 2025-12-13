import { RelayerService } from './relayer.service';

interface OracleData {
    type: 'recall' | 'status_change' | 'verification';
    batchId: string;
    data: any;
    timestamp: string;
}

export class OracleService {
    private relayer: RelayerService;

    constructor(blockfrostProjectId: string, network: 'mainnet' | 'testnet' = 'mainnet') {
        this.relayer = new RelayerService(blockfrostProjectId, network);
    }

    /**
     * Publish recall attestation to blockchain
     */
    async publishRecall(
        batchId: string,
        reason: string,
        severity: 'low' | 'medium' | 'high' | 'critical'
    ): Promise<string> {
        const oracleData: OracleData = {
            type: 'recall',
            batchId,
            data: {
                reason,
                severity,
                issuedBy: 'regulator',
            },
            timestamp: new Date().toISOString(),
        };

        const txId = await this.relayer.queueTransaction('recall', {
            batchId,
            reason,
            severity,
            oracleData,
        });

        console.log(`Recall published to blockchain queue: ${txId}`);
        return txId;
    }

    /**
     * Publish batch status change
     */
    async publishStatusChange(
        batchId: string,
        newStatus: 'active' | 'distributed' | 'recalled' | 'expired',
        reason?: string
    ): Promise<string> {
        const oracleData: OracleData = {
            type: 'status_change',
            batchId,
            data: {
                newStatus,
                reason,
                previousStatus: 'active', // In production, fetch from database
            },
            timestamp: new Date().toISOString(),
        };

        const txId = await this.relayer.queueTransaction('status_update', {
            batchId,
            status: newStatus,
            reason,
            oracleData,
        });

        console.log(`Status change published to blockchain queue: ${txId}`);
        return txId;
    }

    /**
     * Publish verification result
     */
    async publishVerification(
        batchId: string,
        verificationResult: {
            status: string;
            verified: boolean;
            confidence: number;
        }
    ): Promise<string> {
        const oracleData: OracleData = {
            type: 'verification',
            batchId,
            data: verificationResult,
            timestamp: new Date().toISOString(),
        };

        const txId = await this.relayer.queueTransaction('status_update', {
            batchId,
            status: 'verified',
            oracleData,
        });

        console.log(`Verification published to blockchain queue: ${txId}`);
        return txId;
    }

    /**
     * Query oracle data from blockchain
     */
    async queryOracleData(batchId: string): Promise<OracleData[]> {
        // In production, query blockchain for all oracle transactions
        // related to this batch ID

        // Mock implementation
        return [
            {
                type: 'verification',
                batchId,
                data: {
                    status: 'authentic',
                    verified: true,
                    confidence: 0.95,
                },
                timestamp: new Date().toISOString(),
            },
        ];
    }

    /**
     * Start oracle service
     */
    async start() {
        console.log('🔮 Oracle Service started');
        await this.relayer.startProcessing();
    }

    /**
     * Stop oracle service
     */
    stop() {
        this.relayer.stopProcessing();
        console.log('Oracle Service stopped');
    }
}

export default OracleService;
