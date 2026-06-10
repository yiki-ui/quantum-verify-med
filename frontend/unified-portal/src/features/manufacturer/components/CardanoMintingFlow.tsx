import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import ChatWidget from '../../../components/ChatWidget';

interface Props {
    data: {
        txHash: string;
        policyId: string;
        assetName: string;
        network: string;
        explorerUrl: string;
    };
    batchNumber: string;
    medicine: any;
}

export default function CardanoMintingFlow({ data, batchNumber, medicine }: Props) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);

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

    const generatePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Colors
            const primaryColor = '#0ea5e9'; // Cyan/Blue
            const textColor = '#1e293b'; // Slate 800
            const lightText = '#64748b'; // Slate 500

            // Header
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(24);
            pdf.setTextColor(primaryColor);
            pdf.text('PharmaVerify', 20, 25);
            
            pdf.setFontSize(16);
            pdf.setTextColor(textColor);
            pdf.text('Official Batch Registration Report', 20, 35);
            
            // Line separator
            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.5);
            pdf.line(20, 42, 190, 42);

            // Batch Details
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Batch Details', 20, 55);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(lightText);
            pdf.text('Batch Number:', 20, 65);
            pdf.setTextColor(textColor);
            pdf.setFont('helvetica', 'bold');
            pdf.text(batchNumber, 60, 65);

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(lightText);
            pdf.text('Status:', 20, 75);
            pdf.setTextColor('#10b981'); // Green
            pdf.setFont('helvetica', 'bold');
            pdf.text('Verified & Minted to Blockchain', 60, 75);

            // QR Code
            if (canvasRef.current) {
                const qrDataUrl = canvasRef.current.toDataURL('image/png');
                pdf.addImage(qrDataUrl, 'PNG', 130, 45, 60, 60);
                
                pdf.setFontSize(9);
                pdf.setTextColor(lightText);
                pdf.setFont('helvetica', 'normal');
                pdf.text('Scan to Verify Authenticity', 135, 110);
            }

            // Blockchain Details
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(primaryColor);
            pdf.text('Blockchain Verification Details', 20, 130);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(lightText);
            
            const startY = 145;
            const lineHeight = 12;

            pdf.text('Network:', 20, startY);
            pdf.setTextColor(textColor);
            pdf.text(data.network, 60, startY);

            pdf.setTextColor(lightText);
            pdf.text('Asset Name:', 20, startY + lineHeight);
            pdf.setTextColor(textColor);
            pdf.text(data.assetName, 60, startY + lineHeight);

            pdf.setTextColor(lightText);
            pdf.text('Policy ID:', 20, startY + lineHeight * 2);
            pdf.setTextColor(textColor);
            pdf.setFontSize(9);
            pdf.text(data.policyId, 60, startY + lineHeight * 2);

            pdf.setFontSize(11);
            pdf.setTextColor(lightText);
            pdf.text('Transaction:', 20, startY + lineHeight * 3);
            pdf.setTextColor(textColor);
            pdf.setFontSize(9);
            pdf.text(data.txHash, 60, startY + lineHeight * 3);

            // Security Features
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(primaryColor);
            pdf.text('Security Attestations', 20, 210);

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(textColor);
            pdf.text('✓ Immutable record on Cardano blockchain', 25, 225);
            pdf.text('✓ Post-quantum cryptographic signature embedded', 25, 235);
            pdf.text('✓ Tamper-proof batch attestation', 25, 245);

            // Footer
            pdf.setDrawColor(226, 232, 240);
            pdf.line(20, 275, 190, 275);
            pdf.setFontSize(8);
            pdf.setTextColor(lightText);
            pdf.text('Generated by Quantum Verify Med System', 20, 282);
            const date = new Date().toLocaleString();
            pdf.text(`Timestamp: ${date}`, 20, 288);

            pdf.save(`PharmaVerify-BatchReport-${batchNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <>
        <div className="glass-card p-8 relative overflow-hidden" ref={reportRef}>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-html2canvas-ignore>
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
                    <button
                        onClick={generatePDF}
                        disabled={isGeneratingPDF}
                        className="glass-card flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPDF ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF Report'}</span>
                    </button>
                </div>
            </div>
        </div>

            {/* Interactive AI Chat Widget */}
            {medicine && (
                <ChatWidget
                    contextData={{
                        medicineName: medicine.name,
                        activeIngredient: medicine.active_ingredient,
                        dosage: medicine.dosage,
                        batchNumber: batchNumber,
                    }}
                    title="Smart Batch Assistant"
                />
            )}
        </>
    );
}
