import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { useEffect, useState, useMemo, useCallback } from 'react';

import ManufacturerEntry from './features/manufacturer/ManufacturerEntry';
import ConsumerEntry from './features/consumer/ConsumerEntry';
import RegulatorEntry from './features/regulator/RegulatorEntry';
import ProtectedRoute from './components/ProtectedRoute';
import {
    AuthContext,
    useAuth,
    type AuthContextValue,
    type AuthUser,
    saveSession,
    loadSession,
    clearSession,
} from './lib/auth';
import { walletManager } from '../../shared/crypto/dist/wallet';
import './index.css';

// ─── Auth Provider ───────────────────────────────────────────────────────────

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const session = loadSession();
        return session?.user ?? null;
    });

    const login = useCallback((u: AuthUser, token: string) => {
        saveSession(u, token);
        setUser(u);
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);

    const hasRole = useCallback(
        (role: AuthUser['role']) => user?.role === role,
        [user],
    );

    const value: AuthContextValue = useMemo(
        () => ({
            user,
            isAuthenticated: user !== null,
            login,
            logout,
            hasRole,
        }),
        [user, login, logout, hasRole],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Login Page ──────────────────────────────────────────────────────────────

function UnifiedLogin() {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [web3authLoading, setWeb3authLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);

    // If already authenticated, redirect to the correct portal
    useEffect(() => {
        if (isAuthenticated && user) {
            const dest =
                user.role === 'manufacturer' ? '/manufacturer' :
                user.role === 'regulator' ? '/regulator' :
                '/consumer';
            navigate(dest, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Initialise Web3Auth
    useEffect(() => {
        const init = async () => {
            try {
                const clientId = (import.meta as any).env.VITE_WEB3AUTH_CLIENT_ID;
                if (!clientId || clientId === 'your_web3auth_client_id_here') {
                    console.warn("Web3Auth Client ID not configured");
                    setWeb3authLoading(false); // Not configured — stop spinner
                    return;
                }

                const chainConfig = {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    chainId: "0x1",
                    rpcTarget: "https://rpc.ankr.com/eth",
                    displayName: "Ethereum Mainnet",
                    blockExplorer: "https://etherscan.io",
                    ticker: "ETH",
                    tickerName: "Ethereum",
                };

                const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

                const w3a = new Web3Auth({
                    clientId,
                    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
                    privateKeyProvider: privateKeyProvider as any,
                });

                await (w3a as any).initModal();
                setWeb3auth(w3a);
            } catch (error) {
                console.error("Web3Auth initialization failed:", error);
            } finally {
                setWeb3authLoading(false);
            }
        };
        init();
    }, []);

    // ── Login Handlers ───────────────────────────────────────────────────────

    const handleDemoManufacturer = () => {
        login(
            { id: 'demo-manufacturer', name: 'Demo Manufacturer', role: 'manufacturer', email: 'demo@manufacturer.com', isDemo: true },
            `demo_${crypto.randomUUID()}`,
        );
        navigate('/manufacturer');
    };

    const handleDemoConsumer = () => {
        login(
            { id: 'demo-consumer', name: 'Demo Consumer', role: 'pharmacy', email: 'demo@consumer.com', isDemo: true },
            `demo_${crypto.randomUUID()}`,
        );
        navigate('/consumer');
    };

    const handleDemoRegulator = () => {
        login(
            { id: 'demo-regulator', name: 'Demo Regulator', role: 'regulator', email: 'demo@regulator.gov', isDemo: true },
            `demo_${crypto.randomUUID()}`,
        );
        navigate('/regulator');
    };

    const handleWalletConnect = async (walletName: string) => {
        try {
            setStatus(`Connecting to ${walletName}…`);
            const wallet = await walletManager.connectWallet(walletName);

            if (wallet && wallet.address) {
                const nonce = "Login to PharmaVerify: " + Date.now();
                setStatus('Requesting signature…');
                const signatureData = await walletManager.signData(nonce);

                // CIP-30 wallets return a COSESign1 structure — if signData
                // resolved without throwing, the wallet confirmed.
                if (signatureData) {
                    const u: AuthUser = {
                        id: 'wallet-' + wallet.address.substring(0, 12),
                        name: `${walletName} User`,
                        role: 'pharmacy',
                        email: 'wallet@cardano',
                        walletAddress: wallet.address,
                        verified: true,
                    };
                    login(u, `wallet_${crypto.randomUUID()}`);
                    navigate('/consumer');
                    return;
                }

                throw new Error("Signature verification failed");
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);

            // Eternl-specific: user hasn't set a dApp account
            if (
                msg.toLowerCase().includes('no dapp account') ||
                msg.toLowerCase().includes('dapp account') ||
                msg.toLowerCase().includes('no account set')
            ) {
                setStatus(
                    '⚠ Eternl: No dApp account set. ' +
                    'Open the full Eternl extension → Settings → dApp Connector → enable a wallet account.'
                );
                setTimeout(() => setStatus(null), 8000);
                return;
            }

            // User rejected the connection or signature
            if (
                msg.toLowerCase().includes('user declined') ||
                msg.toLowerCase().includes('user rejected') ||
                msg.toLowerCase().includes('cancelled')
            ) {
                setStatus('Connection cancelled.');
                setTimeout(() => setStatus(null), 2500);
                return;
            }

            setStatus(`⚠ ${msg}`);
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const handleGoogleLogin = async () => {
        if (web3authLoading) {
            setStatus('Google login is still initializing. Please wait a moment.');
            setTimeout(() => setStatus(null), 3000);
            return;
        }
        if (!web3auth) {
            setStatus('Google login is unavailable. Set VITE_WEB3AUTH_CLIENT_ID in your .env.local file.');
            setTimeout(() => setStatus(null), 5000);
            return;
        }

        try {
            setStatus('Opening Web3Auth…');
            const provider = await web3auth.connect();
            if (provider) {
                const userInfo = await web3auth.getUserInfo();
                const anyUser = userInfo as any;

                const u: AuthUser = {
                    id: anyUser.verifierId || 'google-' + Date.now(),
                    name: userInfo.name || 'Google User',
                    role: 'pharmacy',
                    email: userInfo.email || '',
                    profileImage: userInfo.profileImage,
                    verified: true,
                };
                login(u, `web3auth_${crypto.randomUUID()}`);
                navigate('/consumer');
            }
        } catch (error) {
            console.error("Login failed:", error);
            setStatus('Login failed. Please try again.');
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleGenericConnect = async () => {
        try {
            const wallets = walletManager.getAvailableWallets();
            if (wallets.length > 0) {
                const preferred = wallets.find(w => w.name === 'Nami') ||
                    wallets.find(w => w.name === 'Eternl') ||
                    wallets[0];
                await handleWalletConnect(preferred.name);
            } else {
                setStatus('No Cardano wallet found. Please install Nami, Eternl, or another CIP-30 wallet.');
                setTimeout(() => setStatus(null), 4000);
            }
        } catch (error) {
            setStatus('An error occurred while checking for wallets.');
            setTimeout(() => setStatus(null), 4000);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
            <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10 p-8 max-w-md w-full">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 mb-2">
                        Quantum Verify Med
                    </h1>
                    <p className="text-white/60 text-sm">Next-Gen Pharmaceutical Authentication</p>
                </div>

                {/* Status Toast */}
                {status && (
                    <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm text-center animate-pulse">
                        {status}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={web3authLoading}
                        className="w-full bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl border border-white/5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        {web3authLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                        )}
                        <span>{web3authLoading ? 'Initializing Google Login…' : 'Continue with Google'}</span>
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-800 px-2 text-white/30">Demo mode</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={handleDemoManufacturer} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-[10px] font-semibold text-center border border-blue-500/20 cursor-pointer transition-all hover:scale-[1.02]">
                            Demo Manufacturer
                        </button>
                        <button onClick={handleDemoConsumer} className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl text-[10px] font-semibold text-center border border-teal-500/20 cursor-pointer transition-all hover:scale-[1.02]">
                            Demo Consumer
                        </button>
                        <button onClick={handleDemoRegulator} className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-[10px] font-semibold text-center border border-purple-500/20 cursor-pointer transition-all hover:scale-[1.02]">
                            Demo Regulator
                        </button>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-xl border border-white/5">
                        <h3 className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider text-center">Cardano Wallets</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleWalletConnect('Nami')} className="flex flex-col items-center justify-center p-3 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-all group cursor-pointer">
                                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🦎</span>
                                <span className="text-xs font-medium text-orange-400">Nami</span>
                            </button>
                            <button onClick={() => handleWalletConnect('Eternl')} className="flex flex-col items-center justify-center p-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all group cursor-pointer">
                                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">♾️</span>
                                <span className="text-xs font-medium text-indigo-400">Eternl</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <button onClick={handleGenericConnect} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-full cursor-pointer transition-all">
                        Connect to Wallet
                    </button>
                    <div className="text-center">
                        <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                            powered by cardano and web3auth
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


// ─── App Shell ───────────────────────────────────────────────────────────────

const queryClient = new QueryClient();

function AppContent() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<UnifiedLogin />} />
                <Route
                    path="/manufacturer/*"
                    element={
                        <ProtectedRoute allowedRoles={['manufacturer']}>
                            <ManufacturerEntry />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/*"
                    element={
                        <ProtectedRoute allowedRoles={['pharmacy']}>
                            <ConsumerEntry />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/regulator/*"
                    element={
                        <ProtectedRoute allowedRoles={['regulator']}>
                            <RegulatorEntry />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
