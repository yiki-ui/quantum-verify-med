import { Routes, Route, Link } from 'react-router-dom';
import BatchRegistration from './components/BatchRegistration';
import BatchDashboard from './components/BatchDashboard';
import { useAuth } from '../../lib/auth';

function ManufacturerEntry() {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-8">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-quantum-500 to-primary-500 rounded-lg flex items-center justify-center animate-glow">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">PharmaVerify</h1>
                                <p className="text-sm text-white/60">Manufacturer Portal</p>
                            </div>
                        </div>
                        <nav className="flex space-x-4 items-center">
                            <Link to="/manufacturer" className="text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
                                Register Batch
                            </Link>
                            <Link to="/manufacturer/dashboard" className="text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 pb-12">
                <Routes>
                    <Route path="/" element={<BatchRegistration />} />
                    <Route path="/dashboard" element={<BatchDashboard />} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="mt-12 py-6 text-center text-white/40 text-sm">
                <p>Powered by Post-Quantum Cryptography & Cardano Blockchain</p>
            </footer>
        </div>
    );
}

export default ManufacturerEntry;
