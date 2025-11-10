import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, loading, user } = useUser();

	console.log("[ProtectedRoute] Status:", {
		isAuthenticated,
		loading,
		user: user?.email,
	});

	// Show loading spinner while checking authentication
	if (loading) {
		console.log("[ProtectedRoute] Loading authentication...");
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		console.log("[ProtectedRoute] Not authenticated, redirecting to /auth");
		return <Navigate to="/auth" replace />;
	}

	console.log("[ProtectedRoute] Authenticated, rendering protected content");
	// Render protected content if authenticated
	return <>{children}</>;
};
