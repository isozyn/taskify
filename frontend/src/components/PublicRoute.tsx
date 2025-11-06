import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

interface PublicRouteProps {
	children: React.ReactNode;
}

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
	const { isAuthenticated, loading } = useUser();

	// Don't redirect while still loading auth state
	if (loading) {
		return <>{children}</>;
	}

	// Redirect to dashboard if already authenticated
	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	// Render public content if not authenticated
	return <>{children}</>;
};
