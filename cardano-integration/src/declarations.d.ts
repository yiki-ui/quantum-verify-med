/**
 * Type stubs for packages pending `npm install`.
 * These declarations silence "cannot find module" errors in the IDE.
 * Remove this file once `npm install` has been run successfully
 * and real type definitions are available in node_modules.
 */

// ─── Node.js built-in stubs (replaces @types/node) ───────────────────────────

declare module 'fs' {
    export function readFileSync(path: string, encoding: string): string;
    export function existsSync(path: string): boolean;
    export function writeFileSync(path: string, data: string): void;
}

declare module 'path' {
    export function join(...paths: string[]): string;
    export function resolve(...paths: string[]): string;
    export function dirname(p: string): string;
    export function basename(p: string, ext?: string): string;
    export function extname(p: string): string;
}

declare module 'crypto' {
    interface Hash {
        update(data: string): Hash;
        digest(encoding: 'hex' | 'base64'): string;
    }
    export function createHash(algorithm: string): Hash;
    export function randomBytes(size: number): Buffer;
    const crypto: {
        createHash: typeof createHash;
        randomBytes: typeof randomBytes;
    };
    export default crypto;
}

// ─── Third-party package stubs ───────────────────────────────────────────────

declare module '@blockfrost/blockfrost-js' {
    export class BlockFrostAPI {
        constructor(options: { projectId: string; network?: string });
        assetsById(id: string): Promise<any>;
        addressesUtxos(address: string): Promise<any[]>;
    }
}

declare module '@meshsdk/core' {
    export class MeshWallet {
        constructor(options: any);
        signTx(tx: string): Promise<string>;
        submitTx(tx: string): Promise<string>;
        getUsedAddresses(): Promise<string[]>;
    }

    export class Transaction {
        constructor(options: { initiator: MeshWallet });
        mintAsset(script: any, asset: { assetName: string; assetQuantity: string }): this;
        setMetadata(label: number, metadata: any): this;
        setRequiredSigners(signers: string[]): this;
        sendAssets(recipient: any, assets: any[]): this;
        build(): Promise<string>;
    }

    export type ForgeScript = any;
    export type AssetMetadata = Record<string, any>;
}
