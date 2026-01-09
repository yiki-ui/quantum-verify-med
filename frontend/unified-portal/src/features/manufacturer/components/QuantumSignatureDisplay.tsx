interface Props {
    data: {
        batchNumber: string;
        signature: string;
        publicKey: string;
        keyId: string;
    };
    onNext: () => void;
    isLoading: boolean;
}

export default function QuantumSignatureDisplay({ data, onNext, isLoading }: Props) {
    return (
        <div className="glass-card p-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-quantum-500 to-primary-500 rounded-full mb-4 animate-glow">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Quantum Signature Generated</h2>
                <p className="text-white/60">Post-quantum cryptographic signature created successfully</p>
            </div>

            <div className="space-y-6">
                {/* Batch Number */}
                <div className="glass-card p-4 bg-white/5">
                    <p className="text-white/60 text-sm mb-1">Batch Number</p>
                    <p className="text-white font-mono text-lg">{data.batchNumber}</p>
                </div>

                {/* Signature */}
                <div className="glass-card p-4 bg-quantum-500/10 border-quantum-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80 font-semibold">Quantum Signature</p>
                        <span className="px-3 py-1 bg-quantum-500/20 text-quantum-400 text-xs rounded-full font-semibold">
                            CRYSTALS-Dilithium2
                        </span>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                        <code className="text-quantum-300 text-sm font-mono break-all">
                            {data.signature.substring(0, 120)}...
                        </code>
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                        ✓ Quantum-resistant signature (NIST-approved algorithm)
                    </p>
                </div>

                {/* Public Key */}
                <div className="glass-card p-4 bg-white/5">
                    <p className="text-white/60 text-sm mb-2">Public Key</p>
                    <div className="bg-black/30 rounded-lg p-3 overflow-x-auto">
                        <code className="text-white/70 text-xs font-mono break-all">
                            {data.publicKey.substring(0, 80)}...
                        </code>
                    </div>
                </div>

                {/* Key ID */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Key ID</p>
                        <p className="text-white font-mono text-sm">{data.keyId}</p>
                    </div>
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Security Level</p>
                        <p className="text-green-400 font-semibold">Quantum-Safe</p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="glass-card p-4 bg-blue-500/10 border-blue-500/30">
                    <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-white font-semibold mb-1">About Post-Quantum Cryptography</p>
                            <p className="text-white/60 text-sm">
                                This signature uses CRYSTALS-Dilithium, a quantum-resistant digital signature algorithm approved by NIST.
                                It ensures your batch attestation remains secure even against future quantum computers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={onNext}
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Minting to Cardano...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>Mint NFT to Cardano Blockchain</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
