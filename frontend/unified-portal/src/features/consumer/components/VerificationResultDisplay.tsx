import { useEffect, useState } from 'react';
import type { VerificationResult } from '../types';
import ChatWidget from '../../../components/ChatWidget';
import { jsPDF } from 'jspdf';

interface Props {
    result: VerificationResult;
    onReset: () => void;
}

export default function VerificationResultDisplay({ result, onReset }: Props) {
    const [showAnimation, setShowAnimation] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        setShowAnimation(true);
    }, [result.isAuthentic]);

    const handleDownloadPDF = () => {
        setIsGeneratingPDF(true);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const primary  = '#0ea5e9';
            const success  = '#10b981';
            const danger   = '#ef4444';
            const textDark = '#1e293b';
            const textGray = '#64748b';

            // ── Header ──────────────────────────────────────────────────────
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(24);
            pdf.setTextColor(primary);
            pdf.text('PharmaVerify', 20, 25);

            pdf.setFontSize(14);
            pdf.setTextColor(textDark);
            pdf.text('Medicine Verification Report', 20, 35);

            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.5);
            pdf.line(20, 40, 190, 40);

            // ── Verification Status ─────────────────────────────────────────
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(result.isAuthentic ? success : danger);
            pdf.text(result.isAuthentic ? '✓ AUTHENTIC PRODUCT' : '✗ COUNTERFEIT DETECTED', 20, 55);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(textGray);
            pdf.text(result.message || '', 20, 63);

            pdf.setFontSize(11);
            pdf.setTextColor(textGray);
            pdf.text('Batch Number:', 20, 75);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(textDark);
            pdf.text(result.batchNumber, 60, 75);

            // ── Product Information ─────────────────────────────────────────
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(primary);
            pdf.text('Product Information', 20, 92);

            const fields: [string, string][] = [
                ['Medicine Name',    result.medicine?.name || 'N/A'],
                ['Active Ingredient',result.medicine?.active_ingredient || 'N/A'],
                ['Dosage',           result.medicine?.dosage || 'N/A'],
                ['Manufacturer',     result.medicine?.manufacturer || 'N/A'],
            ];
            let y = 104;
            fields.forEach(([label, value]) => {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(textGray);
                pdf.text(label + ':', 20, y);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(textDark);
                pdf.text(value, 70, y);
                y += 10;
            });

            // ── Batch Details ───────────────────────────────────────────────
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(primary);
            pdf.text('Batch Details', 20, y + 8);
            y += 20;

            const batchFields: [string, string][] = [
                ['Status',              (result.batch?.status || 'unknown').toUpperCase()],
                ['Quantity',            (result.batch?.quantity?.toLocaleString() || 'N/A') + ' units'],
                ['Manufacturing Date',  result.batch?.manufacturing_date ? new Date(result.batch.manufacturing_date).toLocaleDateString() : 'N/A'],
                ['Expiry Date',         result.batch?.expiry_date ? new Date(result.batch.expiry_date).toLocaleDateString() : 'N/A'],
            ];
            batchFields.forEach(([label, value]) => {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(textGray);
                pdf.text(label + ':', 20, y);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(textDark);
                pdf.text(value, 70, y);
                y += 10;
            });

            // ── Blockchain ──────────────────────────────────────────────────
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(primary);
            pdf.text('Blockchain Verification', 20, y + 8);
            y += 20;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(result.blockchain?.verified ? success : danger);
            pdf.text(result.blockchain?.verified ? '✓ Verified on Cardano Blockchain' : '✗ Not verified on blockchain', 20, y);
            y += 10;

            if (result.blockchain?.txHash) {
                pdf.setTextColor(textGray);
                pdf.text('Tx Hash:', 20, y);
                pdf.setTextColor(textDark);
                pdf.setFontSize(8);
                pdf.text(result.blockchain.txHash, 45, y);
                y += 10;
            }

            // ── Quantum Signature ───────────────────────────────────────────
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(primary);
            pdf.text('Post-Quantum Cryptography', 20, y + 8);
            y += 20;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(result.quantum?.signatureValid ? success : danger);
            pdf.text(result.quantum?.signatureValid ? '✓ Quantum Signature Valid' : '✗ Signature Invalid', 20, y);
            y += 8;
            pdf.setTextColor(textGray);
            pdf.text('Algorithm: ' + (result.quantum?.algorithm || 'N/A'), 20, y);

            // ── Footer ──────────────────────────────────────────────────────
            pdf.setDrawColor(226, 232, 240);
            pdf.line(20, 275, 190, 275);
            pdf.setFontSize(8);
            pdf.setTextColor(textGray);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Generated by Quantum Verify Med — Blockchain-Authenticated Pharmaceutical Verification', 20, 282);
            pdf.text('Timestamp: ' + new Date().toLocaleString(), 20, 288);

            pdf.save(`PharmaVerify-Report-${result.batchNumber}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <>
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
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="glass-card px-6 py-3 hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingPDF ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    )}
                    <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </button>
            </div>
        </div>

            {/* Interactive AI Chat Widget (Only for Authentic Products) */}
            {result.isAuthentic && (
                <ChatWidget
                    contextData={{
                        medicineName: result.medicine.name,
                        activeIngredient: result.medicine.active_ingredient,
                        dosage: result.medicine.dosage,
                        batchNumber: result.batchNumber,
                        status: result.batch.status,
                    }}
                    title="Smart Consumer Assistant"
                />
            )}
        </>
    );
}
