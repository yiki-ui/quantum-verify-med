import { Routes, Route, Link } from 'react-router-dom';
import RegulatorDashboard from './components/Dashboard';
import { useAuth } from '../../lib/auth';
import ChatWidget from '../../components/ChatWidget';

export default function RegulatorEntry() {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Regulator Navigation Bar */}
            <nav className="bg-gray-800/50 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link to="/regulator" className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                                    PharmaVerify Regulator
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="py-8">
                <Routes>
                    <Route path="/" element={<RegulatorDashboard />} />
                </Routes>
            </main>
            {/* Regulator AI Assistant */}
            <ChatWidget
                contextData={{ userRole: 'regulator' }}
                title="Regulator AI Assistant"
            />
        </div>
    );
}
