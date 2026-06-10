import { createContext, useContext } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'manufacturer' | 'pharmacy' | 'regulator';

export interface AuthUser {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    walletAddress?: string;
    profileImage?: string;
    verified?: boolean;
    isDemo?: boolean;
}

export interface Session {
    user: AuthUser;
    token: string;
    expiresAt: number; // Unix timestamp in ms
}

export interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    hasRole: (role: UserRole) => boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SESSION_KEY = 'pharmaverify_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Context ─────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    hasRole: () => false,
});

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}

// ─── Session Persistence ─────────────────────────────────────────────────────

export function saveSession(user: AuthUser, token: string): void {
    const session: Session = {
        user,
        token,
        expiresAt: Date.now() + SESSION_TTL_MS,
    };
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
        console.error('Failed to persist session:', e);
    }
}

export function loadSession(): Session | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;

        const session: Session = JSON.parse(raw);

        // Check expiry
        if (Date.now() > session.expiresAt) {
            clearSession();
            return null;
        }

        // Basic shape validation
        if (!session.user?.id || !session.user?.role || !session.token) {
            clearSession();
            return null;
        }

        return session;
    } catch {
        clearSession();
        return null;
    }
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    // Also clean up any legacy keys from the old auth system
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
}

// ─── Legacy Compatibility ────────────────────────────────────────────────────
// The old auth system stored 'user' and 'token' separately in localStorage.
// These helpers exist so existing code that imports authUtils still works
// during migration, but they now delegate to the new session system.

export const authUtils = {
    getStoredUser: (): AuthUser | null => {
        const session = loadSession();
        return session?.user ?? null;
    },

    getToken: (): string | null => {
        const session = loadSession();
        return session?.token ?? null;
    },

    logout: (): void => {
        clearSession();
    },
};
