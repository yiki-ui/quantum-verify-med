import { useState, useEffect } from 'react';

export default function RegulatorDashboard() {
    const [stats, setStats] = useState({
        totalBatches: 0,
        counterfeitFlags: 0,
        activeRecalls: 0
    });

    useEffect(() => {
        // Mock data fetch for dashboard
        setTimeout(() => {
            setStats({
                totalBatches: 12450,
                counterfeitFlags: 34,
                activeRecalls: 2
            });
        }, 500);
    }, []);

    const recentAlerts = [
        { id: 1, type: 'counterfeit', batch: 'BT-2024-ASPIRIN-FAKE-001', location: 'Kigali Pharmacy', time: '10 mins ago' },
        { id: 2, type: 'expiry', batch: 'BT-2022-PARACETAMOL-110', location: 'National Hospital', time: '2 hours ago' },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
                <svg className="w-8 h-8 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                National Regulator Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 bg-blue-500/10 border-blue-500/30">
                    <p className="text-white/60 text-sm font-semibold uppercase mb-2">Total Registered Batches</p>
                    <p className="text-4xl font-bold text-blue-400">{stats.totalBatches.toLocaleString()}</p>
                </div>
                <div className="glass-card p-6 bg-red-500/10 border-red-500/30">
                    <p className="text-white/60 text-sm font-semibold uppercase mb-2">Counterfeit Flags</p>
                    <p className="text-4xl font-bold text-red-400">{stats.counterfeitFlags}</p>
                </div>
                <div className="glass-card p-6 bg-orange-500/10 border-orange-500/30">
                    <p className="text-white/60 text-sm font-semibold uppercase mb-2">Active Recalls</p>
                    <p className="text-4xl font-bold text-orange-400">{stats.activeRecalls}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Alerts Panel */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Network Alerts</h2>
                    <div className="space-y-4">
                        {recentAlerts.map(alert => (
                            <div key={alert.id} className="p-4 rounded-lg bg-black/30 border border-white/5 flex justify-between items-start">
                                <div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${
                                        alert.type === 'counterfeit' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                        {alert.type.toUpperCase()}
                                    </span>
                                    <p className="text-white font-mono text-sm">{alert.batch}</p>
                                    <p className="text-white/60 text-xs mt-1">Location: {alert.location}</p>
                                </div>
                                <span className="text-white/40 text-xs">{alert.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Batch Lookup/Recall Tool */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Batch Administration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-2">Lookup Batch</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Enter Batch ID..." className="input-field flex-1" />
                                <button className="btn-primary py-2">Search</button>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <h3 className="text-red-400 font-bold mb-2">Emergency Recall</h3>
                            <p className="text-white/60 text-sm mb-4">Initiate an on-chain state update to invalidate a compromised batch.</p>
                            <button className="w-full py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold rounded transition-colors border border-red-500/50">
                                Initiate Batch Recall
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
