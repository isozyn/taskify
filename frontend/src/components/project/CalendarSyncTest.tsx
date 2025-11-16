// Quick test component for Google Calendar sync
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CalendarSyncTest = () => {
	const [taskId, setTaskId] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const handleSyncTask = async () => {
		if (!taskId) {
			toast({
				title: "Error",
				description: "Please enter a task ID",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsLoading(true);
			await api.syncTaskToCalendar(parseInt(taskId));
			toast({
				title: "Success",
				description: "Task synced to Google Calendar!",
			});
		} catch (error: any) {
			toast({
				title: "Sync Failed",
				description: error.message || "Failed to sync task",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnsyncTask = async () => {
		if (!taskId) {
			toast({
				title: "Error",
				description: "Please enter a task ID",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsLoading(true);
			await api.unsyncTaskFromCalendar(parseInt(taskId));
			toast({
				title: "Success",
				description: "Task removed from Google Calendar!",
			});
		} catch (error: any) {
			toast({
				title: "Unsync Failed",
				description: error.message || "Failed to remove task",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const testSyncStatus = async () => {
		try {
			setIsLoading(true);
			const response: any = await api.getCalendarSyncStatus();
			toast({
				title: "Sync Status",
				description: `Connected: ${response.calendarConnected