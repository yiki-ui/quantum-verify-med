import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { medicinesApi, quantumApi_service, cardanoApi } from '../services/api';
import QuantumSignatureDisplay from './QuantumSignatureDisplay';
import CardanoMintingFlow from './CardanoMintingFlow';

export default function BatchRegistration() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        medicine_id: '',
        quantity: '',
        manufacturing_date: '',
        expiry_date: '',
    });
    const [quantumData, setQuantumData] = useState<any>(null);
    const [mintData, setMintData] = useState<any>(null);

    // Fetch medicines
    const { data: medicines = [], isLoading } = useQuery({
        queryKey: ['medicines'],
        queryFn: medicinesApi.getAll,
    });

    // Generate quantum signature
    const signatureMutation = useMutation({
        mutationFn: async () => {
            // Generate keypair
            const keypairResponse = await quantumApi_service.generateKeypair();
            const keyId = keypairResponse.data.keyId;

            // Sign batch data
            const batchNumber = `BT-${Date.now()}`;
            const batchData = {
                batchNumber,
                ...formData,
                timestamp: new Date().toISOString(),
            };

            const signResponse = await quantumApi_service.signBatch(batchData, keyId);

            return {
                batchNumber,
                batchData,
                signature: signResponse.data.signature,
                publicKey: signResponse.data.publicKey,
                keyId: signResponse.data.keyId,
            };
        },
        onSuccess: (data) => {
            setQuantumData(data);
            setStep(2);
        },
    });

    // Mint to Cardano
    const mintMutation = useMutation({
        mutationFn: async () => {
            const response = await cardanoApi.mintNFT(quantumData.batchData, quantumData.signature);
            return response.data;
        },
        onSuccess: (data) => {
            setMintData(data);
            setStep(3);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signatureMutation.mutate();
    };

    const handleMint = () => {
        mintMutation.mutate();
    };

    const selectedMedicine = medicines.find(m => m.id === formData.medicine_id);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between">
                    {[
                        { num: 1, label: 'Register Batch' },
                        { num: 2, label: 'Quantum Signature' },
                        { num: 3, label: 'Mint to Cardano' },
                    ].map((s, idx) => (
                        <div key={s.num} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-300 ${step >= s.num
                                ? 'bg-gradient-to-r from-quantum-500 to-primary-500 text-white shadow-lg shadow-quantum-500/50'
                                : 'bg-white/10 text-white/40'
                                }`}>
                                {s.num}
                            </div>
                            <div className="ml-3">
                                <p className={`font-semibold ${step >= s.num ? 'text-white' : 'text-white/40'}`}>
                                    {s.label}
                                </p>
                            </div>
                            {idx < 2 && (
                                <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${step > s.num ? 'bg-gradient-to-r from-quantum-500 to-primary-500' : 'bg-white/10'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Registration Form */}
            {step === 1 && (
                <div className="glass-card p-8">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                        <svg className="w-8 h-8 mr-3 text-quantum-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Register New Batch
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Medicine Selection */}
                        <div>
                            <label className="block text-white/80 font-semibold mb-2">Select Medicine</label>
                            <select
                                value={formData.medicine_id}
                                onChange={(e) => setFormData({ ...formData, medicine_id: e.target.value })}
                                className="input-field w-full"
                                required
                            >
                                <option value="">Choose a medicine...</option>
                                {medicines.map((medicine) => (
                                    <option key={medicine.id} value={medicine.id}>
                                        {medicine.name} - {medicine.dosage} ({medicine.active_ingredient})
                                        {!medicine.is_authentic && ' ⚠️ COUNTERFEIT'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedMedicine && (
                            <div className={`glass-card p-4 ${selectedMedicine.is_authentic
                                    ? 'bg-quantum-500/10 border-quantum-500/30'
                                    : 'bg-danger-500/10 border-danger-500/30'
                                }`}>
                                <p className="text-white/60 text-sm mb-1">Selected Medicine Details</p>
                                <p className="text-white font-semibold">{selectedMedicine.description}</p>
                                {selectedMedicine.is_authentic ? (
                                    <p className="text-quantum-400 text-sm mt-2">
                                        ✓ Quantum Signature Verified
                                    </p>
                                ) : (
                                    <p className="text-danger-400 text-sm mt-2 font-semibold">
                                        ⚠️ WARNING: This is a counterfeit medicine for demo purposes
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <label className="block text-white/80 font-semibold mb-2">Quantity (units)</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="input-field w-full"
                                placeholder="e.g., 10000"
                                min="1"
                                required
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white/80 font-semibold mb-2">Manufacturing Date</label>
                                <input
                                    type="date"
                                    value={formData.manufacturing_date}
                                    onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
                                    className="input-field w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 font-semibold mb-2">Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData.expiry_date}
                                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                    className="input-field w-full"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={signatureMutation.isPending}
                            className="btn-primary w-full flex items-center justify-center space-x-2"
                        >
                            {signatureMutation.isPending ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Generating Quantum Signature...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Generate Quantum Signature</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Quantum Signature Display */}
            {step === 2 && quantumData && (
                <QuantumSignatureDisplay
                    data={quantumData}
                    onNext={handleMint}
                    isLoading={mintMutation.isPending}
                />
            )}

            {/* Step 3: Cardano Minting */}
            {step === 3 && mintData && (
                <CardanoMintingFlow data={mintData} batchNumber={quantumData.batchNumber} />
            )}
        </div>
    );
}
