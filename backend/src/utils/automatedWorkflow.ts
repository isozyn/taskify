// Automated Workflow Status Calculator
// Option C: Real-time status calculation based on dates

import { TaskStatus } from '../models';

export interface TaskWithDates {
  id: number;
  startDate?: Date | null;
  endDate?: Date | null;
  status: TaskStatus;
}

/**
 * Calculate the current status of a task based on its dates
 * Used for Automated Workflow projects
 */
export function calculateAutomatedStatus(task: TaskWithDates): TaskStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to compare dates only

  // If manually marked as completed, keep it completed
  if (task.status === TaskStatus.COMPLETED) {
    return TaskStatus.COMPLETED;
  }

  // If manually marked as blocked, keep it blocked
  if (task.status === TaskStatus.BLOCKED) {
    return TaskStatus.BLOCKED;
  }

  // If no dates set, put in TODO (shouldn't happen in automated workflow)
  if (!task.startDate || !task.endDate) {
    return TaskStatus.TODO;
  }

  const startDate = new Date(task.startDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(task.endDate);
  endDate.setHours(0, 0, 0, 0);

  // Future task - hasn't started yet
  if (startDate > now) {
    return TaskStatus.TODO; // "Upcoming"
  }

  // Task is past end date - needs review
  if (endDate < now) {
    return TaskStatus.IN_REVIEW; // "Review"
  }

  // Task is currently active (between start and end date)
  if (startDate <= now && endDate >= now) {
    return TaskStatus.IN_PROGRESS; // "In Progress"
  }

  // Default fallback
  return TaskStatus.TODO;
}

/**
 * Calculate status for multiple tasks
 */
export function calculateAutomatedStatusForTasks(tasks: TaskWithDates[]): Map<number, TaskStatus> {
  const statusMap = new Map<number, TaskStatus>();
  
  tasks.forEach(task => {
    statusMap.set(task.id, calculateAutomatedStatus(task));
  });
  
  return statusMap;
}

/**
 * Map TaskStatus to Kanban column IDs for Automated Workflow
 */
export function mapStatusToColumn(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return 'upcoming';
    case TaskStatus.IN_PROGRESS:
      return 'in-progress';
    case TaskStatus.IN_REVIEW:
      return 'review';
    case TaskStatus.COMPLETED:
      return 'complete';
    case TaskStatus.BLOCKED:
      return 'backlog';
    default:
      return 'upcoming';
  }
}
