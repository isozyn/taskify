import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { User, UserContextType } from "@/models/User";
import { api } from "@/lib/api";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Check if user is authenticated on mount by calling /me endpoint
	useEffect(() => {
		const checkAuth = async () => {
			console.log("[UserContext] Checking authentication...");

			// First check if token exists in localStorage
			const accessToken = localStorage.getItem("accessToken");
			if (!accessToken) {
				console.log(
					"[UserContext] ❌ No access token found in localStorage"
				);
				setUser(null);
				setLoading(false);
				return;
			}

			console.log(
				"[UserContext] ✅ Access token found, fetching user data..."
			);

			try {
				const response = (await api.getCurrentUser()) as { user: User };
				if (response.user) {
					setUser(response.user);
					console.log(
						"[UserContext] ✅ User authenticated:",
						response.user.email
					);
				} else {
					// No user data returned
					setUser(null);
					console.log("[UserContext] ❌ No user data returned");
				}
			} catch (error: any) {
				// User is not authenticated or token expired
				setUser(null);
				console.log(
					"[UserContext] ❌ Authentication failed:",
					error.message || "Not authenticated"
				);

				// Clear invalid tokens
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
			} finally {
				setLoading(false);
				console.log("[UserContext] Authentication check complete");
			}
		};

		checkAuth();
	}, []);

	// Logout function that calls backend to clear cookies
	const logout = async () => {
		try {
			await api.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			// Clear user state and localStorage regardless of API call result
			setUser(null);
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		}
	};

	const isAuthenticated = !!user;

	return (
		<UserContext.Provider
			value={{ user, setUser, isAuthenticated, loading, logout }}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
