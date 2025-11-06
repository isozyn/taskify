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
			try {
				const response = (await api.getCurrentUser()) as { user: User };
				if (response.user) {
					setUser(response.user);
					console.log(
						"[Auth] User authenticated:",
						response.user.email
					);
				} else {
					// No user data returned
					setUser(null);
					console.log("[Auth] No user data returned");
				}
			} catch (error: any) {
				// User is not authenticated or token expired
				setUser(null);
				console.log(
					"[Auth] Authentication failed:",
					error.message || "Not authenticated"
				);
			} finally {
				setLoading(false);
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
			// Clear user state regardless of API call result
			setUser(null);
		}
	};

	const isAuthenticated = !!user;

	return (
		<UserContext.Provider
			value={{ user, setUser, isAuthenticated, loading, logout }}
		>
			{!loading && children}
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
