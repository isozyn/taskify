import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { api, CalendarSyncStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CalendarSettings = () => {
	const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>({
		calendarSyncEnabled: false,
		calendarConnected: false,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const { toast } = useToast();
	
	// Calendar sync is enabled - using Google Calendar API
	const CALENDAR_SYNC_DISABLED = false;

	// Fetch sync status on mount
	useEffect(() => {
		fetchSyncStatus();
	}, []);

	const fetchSyncStatus = async () => {
		try {
			setIsLoading(true);
			const response: any = await api.getCalendarSyncStatus();
			setSyncStatus(response);
		} catch (error: any) {
			toast({
				title: "Error",
				description: "Failed to fetch calendar sync status",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleSync = async (enabled: boolean) => {
		if (!syncStatus.calendarConnected) {
			toast({
				title: "Google Calendar Not Connected",
				description: "Please sign in with Google to enable calendar sync",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsSyncing(true);
			if (enabled) {
				await api.enableCalendarSync();
				toast({
					title: "Calendar Sync Enabled",
					description: "Your tasks will now sync to Google Calendar",
				});
			} else {
				await api.disableCalendarSync();
				toast({
					title: "Calendar Sync Disabled",
					description: "Tasks will no longer sync to Google Calendar",
				});
			}
			setSyncStatus({ ...syncStatus, calendarSyncEnabled: enabled });
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to toggle calendar sync",
				variant: "destructive",
			});
		} finally {
			setIsSyncing(false);
		}
	};

	const handleConnectGoogle = async () => {
		try {
			// Fetch the Google OAuth URL from the API
			const response: any = await api.googleAuth();
			if (response.url) {
				// Redirect to Google OAuth consent screen
				window.location.href = response.url;
			} else {
				throw new Error('No OAuth URL received');
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description: "Failed to connect to Google Calendar. Please try again.",
				variant: "destructive",
			});
		}
	};

	if (CALENDAR_SYNC_DISABLED) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="w-5 h-5" />
						Google Calendar Integration
					</CardTitle>
					<CardDescription>
						Calendar sync is currently unavailable
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
						<div className="flex items-start gap-3">
							<XCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
							<div>
								<p className="font-medium text-amber-900 mb-1">
									Calendar Sync Not Available
								</p>
								<p className="text-sm text-amber-700">
									Google Calendar integration requires additional OAuth permissions that are currently not enabled. 
									This feature may be available in a future update.
								</p>
							</div>
						</div>
					</div>
					
					<div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
						<h3 className="font-semibold text-slate-900 mb-2">Alternative Options:</h3>
						<ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
							<li>Use the built-in calendar view to manage your tasks</li>
							<li>Export tasks manually to your preferred calendar app</li>
							<li>Set up email reminders for important deadlines</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="w-5 h-5" />
						Google Calendar Integration
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="w-5 h-5" />
					Google Calendar Integration
				</CardTitle>
				<CardDescription>
					Automatically sync your tasks to Google Calendar
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Connection Status */}
				<div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
					<div className="flex items-center gap-3">
						{syncStatus.calendarConnected ? (
							<CheckCircle2 className="w-5 h-5 text-green-600" />
						) : (
							<XCircle className="w-5 h-5 text-slate-400" />
						)}
						<div>
							<p className="font-medium text-slate-900">
								{syncStatus.calendarConnected
									? "Google Calendar Connected"
									: "Google Calendar Not Connected"}
							</p>
							<p className="text-sm text-slate-500">
								{syncStatus.calendarConnected
									? "Your account is linked to Google Calendar"
									: "Connect your Google account to enable sync"}
							</p>
						</div>
					</div>
					{syncStatus.calendarConnected ? (
						<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
							Connected
						</Badge>
					) : (
						<Button onClick={handleConnectGoogle} size="sm" className="gap-2">
							<ExternalLink className="w-4 h-4" />
							Connect Google
						</Button>
					)}
				</div>

				{/* Sync Toggle */}
				<div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
					<div className="flex-1">
						<h3 className="font-semibold text-slate-900 mb-1">
							Automatic Calendar Sync
						</h3>
						<p className="text-sm text-slate-500">
							When enabled, tasks will automatically sync to your Google Calendar
						</p>
					</div>
					<Switch
						checked={syncStatus.calendarSyncEnabled}
						onCheckedChange={handleToggleSync}
						disabled={!syncStatus.calendarConnected || isSyncing}
					/>
				</div>

				{/* Sync Status Info */}
				{syncStatus.calendarSyncEnabled && (
					<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex items-start gap-3">
							<CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
							<div>
								<p className="font-medium text-blue-900 mb-1">
									Calendar Sync Active
								</p>
								<p className="text-sm text-blue-700">
									New tasks and updates will automatically appear in your Google Calendar.
									Tasks are color-coded by priority.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Help Text */}
				<div className="text-xs text-slate-500 space-y-1">
					<p>• Tasks with start and end dates will be synced as calendar events</p>
					<p>• Project timelines will be synced as all-day events</p>
					<p>• Updates to tasks and projects will automatically update the calendar</p>
					<p>• Deleting a task will remove it from your calendar</p>
					<p>• Events are color-coded: Red (Urgent), Blue (High), Yellow (Medium), Green (Low)</p>
				</div>
			</CardContent>
		</Card>
	);
};

export default CalendarSettings;
