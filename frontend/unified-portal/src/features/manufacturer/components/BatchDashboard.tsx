import { useQuery } from '@tanstack/react-query';
import { batchesApi, medicinesApi } from '../services/api';
import ChatWidget from '../../../components/ChatWidget';

export default function BatchDashboard() {
    const { data: batches = [], isLoading: batchesLoading } = useQuery({
        queryKey: ['batches'],
        queryFn: batchesApi.getAll,
    });

    const { data: medicines = [] } = useQuery({
        queryKey: ['medicines'],
        queryFn: medicinesApi.getAll,
    });

    const getMedicineName = (medicineId: string) => {
        const medicine = medicines.find(m => m.id === medicineId);
        return medicine ? `${medicine.name} - ${medicine.dosage}` : 'Unknown';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'distributed':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'recalled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'expired':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default:
                return 'bg-white/10 text-white/60 border-white/20';
        }
    };

    if (batchesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-quantum-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-white/60">Loading batches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="glass-card p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Batch Dashboard</h2>
                        <p className="text-white/60">Manage and monitor your pharmaceutical batches</p>
                    </div>
                    <div className="glass-card px-6 py-3 bg-quantum-500/10 border-quantum-500/30">
                        <p className="text-white/60 text-sm">Total Batches</p>
                        <p className="text-3xl font-bold text-white">{batches.length}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Active', count: batches.filter(b => b.status === 'active').length, color: 'green' },
                        { label: 'Distributed', count: batches.filter(b => b.status === 'distributed').length, color: 'blue' },
                        { label: 'Recalled', count: batches.filter(b => b.status === 'recalled').length, color: 'red' },
                        { label: 'Blockchain Verified', count: batches.filter(b => b.blockchain_verified).length, color: 'quantum' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card p-4 bg-white/5">
                            <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                            <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Batches List */}
            <div className="space-y-4">
                {batches.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-xl font-semibold text-white mb-2">No Batches Yet</h3>
                        <p className="text-white/60 mb-6">Start by registering your first pharmaceutical batch</p>
                        <a href="/" className="btn-primary inline-flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Register New Batch</span>
                        </a>
                    </div>
                ) : (
                    batches.map((batch) => (
                        <div key={batch.id} className="glass-card p-6 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-bold text-white font-mono">{batch.batch_number}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(batch.status)}`}>
                                            {batch.status.toUpperCase()}
                                        </span>
                                        {batch.blockchain_verified && (
                                            <span className="px-3 py-1 bg-quantum-500/20 text-quantum-400 rounded-full text-xs font-semibold border border-quantum-500/30">
                                                ⛓️ On-Chain
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/60">{getMedicineName(batch.medicine_id || '')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm">Quantity</p>
                                    <p className="text-2xl font-bold text-white">{batch.quantity.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Manufacturing Date</p>
                                    <p className="text-white font-semibold">{new Date(batch.manufacturing_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Expiry Date</p>
                                    <p className="text-white font-semibold">{new Date(batch.expiry_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Created</p>
                                    <p className="text-white font-semibold">{new Date(batch.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {batch.blockchain_tx_hash && (
                                <div className="glass-card p-3 bg-quantum-500/5 border-quantum-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-white/60 text-xs mb-1">Blockchain Transaction</p>
                                            <code className="text-quantum-300 text-sm font-mono break-all">
                                                {batch.blockchain_tx_hash}
                                            </code>
                                        </div>
                                        <a
                                            href={`https://testnet.cardanoscan.io/transaction/${batch.blockchain_tx_hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="View on explorer"
                                        >
                                            <svg className="w-5 h-5 text-quantum-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {batch.quantum_signature && (
                                <div className="mt-3 glass-card p-3 bg-white/5">
                                    <p className="text-white/60 text-xs mb-1">Quantum Signature</p>
                                    <code className="text-white/70 text-xs font-mono break-all">
                                        {batch.quantum_signature.substring(0, 80)}...
                                    </code>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <ChatWidget
                contextData={{ userRole: 'manufacturer' }}
                title="Manufacturer AI Assistant"
            />
        </div>
    );
}
