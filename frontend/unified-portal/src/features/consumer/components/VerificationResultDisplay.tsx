import { useEffect, useState } from 'react';
import type { VerificationResult } from '../types';

interface Props {
    result: VerificationResult;
    onReset: () => void;
}

export default function VerificationResultDisplay({ result, onReset }: Props) {
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        setShowAnimation(true);
    }, []);

    return (
        <div className={`transition-all duration-500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Result Header */}
            <div className={`glass-card p-8 mb-6 ${result.isAuthentic
                    ? 'bg-gradient-to-r from-success-500/20 to-emerald-500/20 border-success-500/50'
                    : 'bg-gradient-to-r from-danger-500/20 to-red-500/20 border-danger-500/50'
                }`}>
                <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${result.isAuthentic
                            ? 'bg-gradient-to-br from-success-500 to-emerald-500 animate-pulse-slow'
                            : 'bg-gradient-to-br from-danger-500 to-red-500 animate-pulse'
                        }`}>
                        {result.isAuthentic ? (
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>

                    <h2 className={`text-4xl font-bold mb-2 ${result.isAuthentic ? 'text-success-400' : 'text-danger-400'
                        }`}>
                        {result.isAuthentic ? 'AUTHENTIC PRODUCT' : 'COUNTERFEIT DETECTED'}
                    </h2>

                    <p className={`text-lg mb-4 ${result.isAuthentic ? 'text-success-300' : 'text-danger-300'
                        }`}>
                        {result.message}
                    </p>

                    <div className="inline-block px-6 py-3 bg-black/30 rounded-lg">
                        <p className="text-white/60 text-sm mb-1">Batch Number</p>
                        <p className="text-white font-mono text-xl font-bold">{result.batchNumber}</p>
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Product Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Medicine Name</p>
                        <p className="text-white font-semibold">{result.medicine.name}</p>
                    </div>
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Dosage</p>
                        <p className="text-white font-semibold">{result.medicine.dosage}</p>
                    </div>
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Manufacturer</p>
                        <p className="text-white font-semibold">{result.medicine.manufacturer}</p>
                    </div>
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Active Ingredient</p>
                        <p className="text-white font-semibold">{result.medicine.active_ingredient}</p>
                    </div>
                </div>
            </div>

            {/* Batch Details */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    Batch Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Quantity</p>
                        <p className="text-white font-semibold text-xl">{result.batch.quantity.toLocaleString()} units</p>
                    </div>
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Status</p>
                        <p className={`font-semibold text-xl ${result.batch.status === 'active' ? 'text-success-400' : 'text-danger-400'
                            }`}>
                            {result.batch.status.toUpperCase()}
                        </p>
                    </div>
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Manufacturing Date</p>
                        <p className="text-white font-semibold">{new Date(result.batch.manufacturing_date).toLocaleDateString()}</p>
                    </div>
                    <div className="glass-card p-4 bg-white/5">
                        <p className="text-white/60 text-sm mb-1">Expiry Date</p>
                        <p className="text-white font-semibold">{new Date(result.batch.expiry_date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Blockchain Verification */}
            <div className={`glass-card p-6 mb-6 ${result.blockchain.verified
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Blockchain Verification
                </h3>

                {result.blockchain.verified ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse" />
                            <p className="text-success-400 font-semibold">Verified on Cardano Blockchain</p>
                        </div>

                        {result.blockchain.txHash && (
                            <div className="glass-card p-4 bg-black/30">
                                <p className="text-white/60 text-sm mb-2">Transaction Hash</p>
                                <code className="text-cyan-300 text-sm font-mono break-all">
                                    {result.blockchain.txHash}
                                </code>
                            </div>
                        )}

                        {result.blockchain.policyId && (
                            <div className="glass-card p-4 bg-black/30">
                                <p className="text-white/60 text-sm mb-2">Policy ID</p>
                                <code className="text-cyan-300 text-sm font-mono break-all">
                                    {result.blockchain.policyId}
                                </code>
                            </div>
                        )}

                        {result.blockchain.explorerUrl && (
                            <a
                                href={result.blockchain.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary w-full flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>View on Blockchain Explorer</span>
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <svg className="w-16 h-16 text-danger-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-danger-400 font-semibold">Not Verified on Blockchain</p>
                        <p className="text-white/60 text-sm mt-2">This product has no blockchain record</p>
                    </div>
                )}
            </div>

            {/* Quantum Signature */}
            <div className={`glass-card p-6 mb-6 ${result.quantum.signatureValid
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Post-Quantum Cryptography
                </h3>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/60 text-sm mb-1">Signature Algorithm</p>
                        <p className="text-white font-semibold">{result.quantum.algorithm}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold ${result.quantum.signatureValid
                            ? 'bg-success-500/20 text-success-400'
                            : 'bg-danger-500/20 text-danger-400'
                        }`}>
                        {result.quantum.signatureValid ? '✓ Valid Signature' : '✗ Invalid Signature'}
                    </div>
                </div>

                {result.quantum.signatureValid && (
                    <p className="text-white/60 text-sm mt-4">
                        This product is protected with quantum-resistant cryptography, ensuring security against future quantum computer attacks.
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onReset}
                    className="btn-primary flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Verify Another Product</span>
                </button>
                <button
                    onClick={() => window.print()}
                    className="glass-card px-6 py-3 hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2 text-white font-semibold"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print Report</span>
                </button>
            </div>
        </div>
    );
}
