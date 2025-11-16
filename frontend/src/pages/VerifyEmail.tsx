import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckSquare, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type AuthResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Navbar from "@/components/Navbar";

const VerifyEmail = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { toast } = useToast();
	const { setUser, user } = useUser();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [message, setMessage] = useState("");
	const [shouldRedirect, setShouldRedirect] = useState(false);
	const token = searchParams.get("token");

	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setStatus("error");
				setMessage("No verification token provided");
				return;
			}

			try {
				const response = (await api.verifyEmail(token)) as AuthResponse;
				// Store user data in context (tokens are in HttpOnly cookies)
				if (response.user) {
					setUser(response.user);
					setStatus("success");
					setMessage(
						response.message || "Email verified successfully!"
					);

					toast({
						title: "Success",
						description:
							"Your email has been verified! Welcome to Taskify.",
					});

					// Signal that we should redirect once user is confirmed in context
					setShouldRedirect(true);
				} else {
					throw new Error("No user data returned from verification");
				}
			} catch (error: any) {
				setStatus("error");
				setMessage(error.message || "Failed to verify email");

				toast({
					title: "Verification Failed",
					description:
						error.message || "Invalid or expired verification link",
					variant: "destructive",
				});
			}
		};

		verifyEmail();
	}, [token, toast, setUser]);

	// Separate effect to handle redirect after user is set
	useEffect(() => {
		if (shouldRedirect && user) {
			const redirectTimer = setTimeout(() => {
				navigate("/dashboard", { replace: true });
			}, 500);

			return () => clearTimeout(redirectTimer);
		}
	}, [shouldRedirect, user, navigate]);

	return (
		<div className="min-h-screen bg-background">
			<Navbar />

			{/* Main Content */}
			<div className="flex items-center justify-center px-4 py-16 sm:py-20 mt-16">
				<div className="w-full max-w-[420px] text-center">
					{status === "loading" && (
						<>
							<div className="flex justify-center mb-6">
								<div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
									<Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
								</div>
							</div>
							<h1 className="text-2xl font-normal text-foreground mb-3">
								Verifying your email...
							</h1>
							<p className="text-muted-foreground">
								Please wait while we verify your email address.
							</p>
						</>
					)}

					{status === "success" && (
						<>
							<div className="flex justify-center mb-6">
								<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
									<CheckCircle2 className="w-8 h-8 text-green-600" />
								</div>
							</div>
							<h1 className="text-2xl font-normal text-foreground mb-3">
								Email verified!
							</h1>
							<p className="text-muted-foreground mb-6">
								{message}
							</p>
							<div className="flex items-center justify-center gap-2 text-sm text-blue-600">
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Taking you to your dashboard...</span>
							</div>
						</>
					)}

					{status === "error" && (
						<>
							<div className="flex justify-center mb-6">
								<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
									<XCircle className="w-8 h-8 text-red-600" />
								</div>
							</div>
							<h1 className="text-2xl font-normal text-foreground mb-3">
								Verification failed
							</h1>
							<p className="text-muted-foreground mb-8">
								{message}
							</p>
							<div className="space-y-3">
								<Button
									onClick={() => navigate("/auth")}
									className="w-full h-10 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium rounded-md"
								>
									Go to Login
								</Button>
								<Button
									onClick={() => navigate("/")}
									variant="outline"
									className="w-full h-10 text-sm font-medium border-border/60 hover:bg-accent/50 rounded-md"
								>
									Back to Home
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default VerifyEmail;
