import { useEffect } from 'react';
import ProductVerification from './components/ProductVerification';
import { authUtils } from './services/auth';

export default function ConsumerEntry() {
    useEffect(() => {
        // Check if user is authenticated
        const user = authUtils.getStoredUser();
        const token = authUtils.getToken();

        if (!user || !token) {
            // Not logged in, redirect to auth portal
            window.location.href = '/login';
            return;
        }

        // Check if user has pharmacy role
        if (user.role !== 'pharmacy') {
            // Wrong portal, redirect to auth
            alert('Access denied. This portal is for pharmacies/consumers only.');
            authUtils.logout();
            window.location.href = '/login';
        }
    }, []);

    const handleLogout = () => {
        authUtils.logout();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-lg bg-black/20">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">PharmaVerify</h1>
                                <p className="text-xs text-white/60">Consumer Verification Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-xs">
                                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                                <span className="text-white/60">Cardano Testnet</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10 text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <ProductVerification />
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 backdrop-blur-lg bg-black/20 mt-20">
                <div className="container mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                        <div>
                            <h3 className="text-white font-semibold mb-3">About PharmaVerify</h3>
                            <p className="text-white/60">
                                Blockchain-powered pharmaceutical verification using post-quantum cryptography
                                to ensure medicine authenticity.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-3">Technology</h3>
                            <ul className="text-white/60 space-y-2">
                                <li>• Cardano Blockchain</li>
                                <li>• CRYSTALS-Dilithium2</li>
                                <li>• CIP-25 NFT Standard</li>
                                <li>• Quantum-Resistant Security</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-3">Support</h3>
                            <p className="text-white/60">
                                Report counterfeit products or get help verifying your medicines.
                            </p>
                            <p className="text-cyan-400 mt-2">support@pharmaverify.example</p>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-6 text-center text-white/40 text-xs">
                        © 2024 PharmaVerify. Powered by Cardano Blockchain & Post-Quantum Cryptography.
                    </div>
                </div>
            </footer>
        </div>
    );
}
