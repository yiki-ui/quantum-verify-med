import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface Props {
    data: {
        txHash: string;
        policyId: string;
        assetName: string;
        network: string;
        explorerUrl: string;
    };
    batchNumber: string;
}

export default function CardanoMintingFlow({ data, batchNumber }: Props) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Generate QR code for the batch number
        if (canvasRef.current) {
            QRCode.toCanvas(
                canvasRef.current,
                batchNumber,
                {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                },
                (error) => {
                    if (error) console.error('QR Code generation error:', error);
                }
            );

            // Also generate data URL for download
            QRCode.toDataURL(batchNumber, { width: 400 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error('QR Code URL generation error:', err));
        }
    }, [batchNumber]);

    const downloadQRCode = () => {
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.download = `pharmaverify-${batchNumber}.png`;
            link.href = qrCodeUrl;
            link.click();
        }
    };

    return (
        <div className="glass-card p-8 relative overflow-hidden">
            {/* Success Animation */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-gradient-to-r from-quantum-400 to-primary-400 rounded-full animate-ping"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                    animationDuration: `${1 + Math.random()}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4 animate-pulse-slow">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">NFT Minted Successfully!</h2>
                <p className="text-white/60">Your batch has been permanently recorded on the Cardano blockchain</p>
            </div>

            <div className="space-y-6">
                {/* Batch Info */}
                <div className="glass-card p-6 bg-gradient-to-r from-quantum-500/10 to-primary-500/10 border-quantum-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/60 text-sm mb-1">Batch Number</p>
                            <p className="text-white font-mono text-xl font-bold">{batchNumber}</p>
                        </div>
                        <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold">
                            ✓ Verified
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="glass-card p-6 bg-green-500/10 border-green-500/30">
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QR Code for Product Packaging
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="glass-card p-6 bg-white/5 text-center">
                                <p className="text-white/60 text-sm mb-4">Scan this QR code to verify the product</p>
                                <div className="inline-block p-4 bg-white rounded-lg">
                                    <canvas ref={canvasRef} />
                                </div>
                                <p className="text-white/60 text-xs mt-4">Print this QR code on product packaging</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="glass-card p-4 bg-black/30">
                                <p className="text-white/60 text-sm mb-2">QR Code Contains</p>
                                <ul className="text-white text-sm space-y-2">
                                    <li>• Batch Number</li>
                                    <li>• Blockchain Transaction ID</li>
                                    <li>• Verification URL</li>
                                </ul>
                            </div>
                            <div className="glass-card p-4 bg-black/30">
                                <p className="text-white/60 text-sm mb-2">Consumer Instructions</p>
                                <p className="text-white text-sm">
                                    Consumers can scan this QR code with any smartphone camera or the PharmaVerify app
                                    to instantly verify product authenticity.
                                </p>
                            </div>
                            <button
                                onClick={downloadQRCode}
                                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download QR Code</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Blockchain Details</h3>

                    {/* Transaction Hash */}
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-2">Transaction Hash</p>
                        <div className="flex items-center justify-between">
                            <code className="text-quantum-300 font-mono text-sm break-all flex-1">
                                {data.txHash}
                            </code>
                            <button
                                onClick={() => navigator.clipboard.writeText(data.txHash)}
                                className="ml-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Copy to clipboard"
                            >
                                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Policy ID */}
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-2">Policy ID</p>
                        <code className="text-white font-mono text-sm break-all">
                            {data.policyId}
                        </code>
                    </div>

                    {/* Asset Name */}
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-2">Asset Name</p>
                        <p className="text-white font-mono">{data.assetName}</p>
                    </div>

                    {/* Network */}
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-2">Network</p>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <p className="text-white font-semibold">{data.network}</p>
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="glass-card p-6 bg-blue-500/10 border-blue-500/30">
                    <h4 className="text-white font-semibold mb-4">What This Means</h4>
                    <div className="space-y-3">
                        {[
                            'Immutable record on Cardano blockchain',
                            'CIP-25 compliant NFT metadata',
                            'Post-quantum cryptographic signature embedded',
                            'Publicly verifiable by consumers',
                            'Tamper-proof batch attestation',
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start space-x-3">
                                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-white/80">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <a
                        href={data.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>View on Explorer</span>
                    </a>
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="btn-secondary flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Go to Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
