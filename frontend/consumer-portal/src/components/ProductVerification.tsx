import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { verificationApi } from '../services/api';
import type { VerificationResult } from '../types';
import VerificationResultDisplay from './VerificationResultDisplay';
import { Html5Qrcode } from 'html5-qrcode';

export default function ProductVerification() {
    const [batchNumber, setBatchNumber] = useState('');
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

    const verifyMutation = useMutation({
        mutationFn: (batch: string) => verificationApi.verifyBatch(batch),
        onSuccess: (data) => {
            setResult(data);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (batchNumber.trim()) {
            setResult(null);
            verifyMutation.mutate(batchNumber.trim());
        }
    };

    const handleReset = () => {
        setBatchNumber('');
        setResult(null);
        verifyMutation.reset();
    };

    const toggleScanner = async () => {
        if (!isScannerActive) {
            // Start scanner
            setIsScannerActive(true);

            const qrCode = new Html5Qrcode("qr-reader");
            setHtml5QrCode(qrCode);

            try {
                await qrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        // QR code successfully scanned
                        console.log(`QR Code detected: ${decodedText}`);

                        // Stop scanner
                        stopScanner();

                        // Auto-fill and verify
                        setBatchNumber(decodedText);

                        // Show success notification
                        const notification = document.createElement('div');
                        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                        notification.innerHTML = `
                            <div class="flex items-center space-x-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>QR Code Scanned!</span>
                            </div>
                        `;
                        document.body.appendChild(notification);
                        setTimeout(() => notification.remove(), 3000);

                        // Auto-verify after 1 second
                        setTimeout(() => {
                            verifyMutation.mutate(decodedText);
                        }, 1000);
                    },
                    (errorMessage) => {
                        // QR code parse error, ignore
                    }
                );
            } catch (err) {
                console.error("Unable to start scanner:", err);
                alert("Unable to access camera. Please check permissions or use manual entry.");
                stopScanner();
            }
        } else {
            stopScanner();
        }
    };

    const stopScanner = () => {
        if (html5QrCode && isScannerActive) {
            html5QrCode.stop().then(() => {
                setIsScannerActive(false);
                setHtml5QrCode(null);
            }).catch((err) => {
                console.error("Error stopping scanner:", err);
            });
        }
    };

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (html5QrCode && isScannerActive) {
                html5QrCode.stop().catch(console.error);
            }
        };
    }, [html5QrCode, isScannerActive]);

    const quickTestBatches = [
        { label: 'Authentic Aspirin', value: 'BT-2024-ASPIRIN-001', type: 'success' },
        { label: 'Authentic Paracetamol', value: 'BT-2024-PARACETAMOL-001', type: 'success' },
        { label: 'Counterfeit Aspirin', value: 'BT-2024-ASPIRIN-FAKE-001', type: 'danger' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {!result ? (
                <>
                    {/* Main Verification Card */}
                    <div className="glass-card p-8 mb-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Verify Product Authenticity</h2>
                            <p className="text-white/60">Enter batch number or scan QR code to verify your medicine</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Batch Number Input */}
                            <div>
                                <label className="block text-white/80 font-semibold mb-2">Batch Number</label>
                                <input
                                    type="text"
                                    value={batchNumber}
                                    onChange={(e) => setBatchNumber(e.target.value)}
                                    className="input-field w-full text-lg"
                                    placeholder="e.g., BT-2024-ASPIRIN-001"
                                    required
                                    disabled={verifyMutation.isPending}
                                />
                                <p className="text-white/40 text-sm mt-2">
                                    Find the batch number on your medicine packaging
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={verifyMutation.isPending || !batchNumber.trim()}
                                className="btn-primary w-full flex items-center justify-center space-x-2"
                            >
                                {verifyMutation.isPending ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Verifying on Blockchain...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Verify Product</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* QR Scanner */}
                        <div className="mt-8 glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-semibold flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    Or Scan QR Code
                                </h3>
                                <button
                                    onClick={toggleScanner}
                                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>{isScannerActive ? 'Stop Camera' : 'Start Camera'}</span>
                                </button>
                            </div>
                            {isScannerActive ? (
                                <div>
                                    <div id="qr-reader" className="rounded-lg overflow-hidden" />
                                    <p className="text-white/60 text-sm mt-3 text-center">Position the QR code within the frame</p>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-20 h-20 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    <p className="text-white/60 text-sm">Click "Start Camera" to scan QR codes</p>
                                    <p className="text-white/40 text-xs mt-2">Works with product packaging QR codes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Test Section */}
                    <div className="glass-card p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Quick Test - Try These Sample Batches
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {quickTestBatches.map((batch) => (
                                <button
                                    key={batch.value}
                                    onClick={() => {
                                        setBatchNumber(batch.value);
                                        verifyMutation.mutate(batch.value);
                                    }}
                                    className={`glass-card p-4 hover:bg-white/10 transition-all duration-300 text-left border ${batch.type === 'success'
                                        ? 'border-success-500/30 hover:border-success-500/50'
                                        : 'border-danger-500/30 hover:border-danger-500/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${batch.type === 'success'
                                            ? 'bg-success-500/20 text-success-400'
                                            : 'bg-danger-500/20 text-danger-400'
                                            }`}>
                                            {batch.type === 'success' ? '✓ Authentic' : '⚠ Counterfeit'}
                                        </span>
                                    </div>
                                    <p className="text-white font-semibold text-sm mb-1">{batch.label}</p>
                                    <code className="text-white/60 text-xs font-mono">{batch.value}</code>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="glass-card p-6 mt-6 bg-blue-500/10 border-blue-500/30">
                        <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-white font-semibold mb-2">How It Works</p>
                                <ul className="text-white/60 text-sm space-y-2">
                                    <li>• Each medicine batch has a unique identifier</li>
                                    <li>• Batch data is secured with post-quantum cryptography</li>
                                    <li>• Verification is performed against Cardano blockchain</li>
                                    <li>• Instant results show if your medicine is authentic</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <VerificationResultDisplay result={result} onReset={handleReset} />
            )}
        </div>
    );
}
