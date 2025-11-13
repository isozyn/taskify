import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import CheckEmail from "./pages/CheckEmail";
import TemplateSelection from "./pages/TemplateSelection";
import ProjectSetup from "./pages/ProjectSetup";
import AcceptInvitation from "./pages/AcceptInvitation";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<ThemeProvider>
				<UserProvider>
					<Toaster />
					<Sonner />
					<BrowserRouter
					future={{
						v7_startTransition: true,
						v7_relativeSplatPath: true,
					}}
				>
					<Routes>
						{/* Public Routes - Redirect to dashboard if already authenticated */}
						<Route
							path="/"
							element={
								<PublicRoute>
									<Index />
								</PublicRoute>
							}
						/>
						<Route
							path="/auth"
							element={
								<PublicRoute>
									<Auth />
								</PublicRoute>
							}
						/>
						<Route
							path="/login"
							element={
								<PublicRoute>
									<Auth />
								</PublicRoute>
							}
						/>
						<Route
							path="/register"
							element={
								<PublicRoute>
									<Auth />
								</PublicRoute>
							}
						/>
						<Route
							path="/forgot-password"
							element={
								<PublicRoute>
									<ForgotPassword />
								</PublicRoute>
							}
						/>
						<Route
							path="/reset-password"
							element={
								<PublicRoute>
									<ResetPassword />
								</PublicRoute>
							}
						/>
						<Route path="/verify-email" element={<VerifyEmail />} />
						<Route path="/check-email" element={<CheckEmail />} />
						<Route
							path="/accept-invitation"
							element={<AcceptInvitation />}
						/>

						{/* Protected Routes - Require authentication */}
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/project-setup"
							element={
								<ProtectedRoute>
									<ProjectSetup />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/template-selection"
							element={
								<ProtectedRoute>
									<TemplateSelection />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/project/:id"
							element={
								<ProtectedRoute>
									<ProjectWorkspace />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/settings"
							element={
								<ProtectedRoute>
									<Settings />
								</ProtectedRoute>
							}
						/>

						{/* 404 Page */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
				</UserProvider>
			</ThemeProvider>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
