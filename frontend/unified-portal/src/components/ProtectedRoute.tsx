import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../lib/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

/**
 * Wraps portal routes with auth + role checks.
 * - If not authenticated → redirect to /login
 * - If authenticated but wrong role → redirect to /login  
 * - Otherwise → render children
 *
 * Because this runs synchronously during render (not inside a useEffect),
 * there is NO flash of unauthorized content.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated || !user) {
        // Preserve the intended destination so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
