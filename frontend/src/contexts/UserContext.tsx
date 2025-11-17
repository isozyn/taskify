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
				} else {
					// No user data returned
					setUser(null);
				}
			} catch (error: any) {
				// User is not authenticated or token expired
				setUser(null);
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
			// Ignore logout errors
		} finally {
			// Clear user state
			setUser(null);
			// Clear tokens from localStorage
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
