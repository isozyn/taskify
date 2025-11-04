// Cleanup service for expired projects and other data

import { ProjectService } from './projectService';

export class CleanupService {
  /**
   * Run cleanup tasks for expired data
   */
  static async runCleanup(): Promise<void> {
    try {
      console.log('Starting cleanup process...');
      
      // Clean up projects deleted more than 30 days ago
      const deletedProjectsCount = await ProjectService.cleanupExpiredProjects();
      
      if (deletedProjectsCount > 0) {
        console.log(`Cleaned up ${deletedProjectsCount} expired projects`);
      }
      
      console.log('Cleanup process completed');
    } catch (error) {
      console.error('Cleanup process failed:', error);
    }
  }

  /**
   * Schedule cleanup to run daily
   */
  static scheduleCleanup(): void {
    // Run cleanup every 24 hours (86400000 ms)
    setInterval(() => {
      this.runCleanup();
    }, 24 * 60 * 60 * 1000);

    // Run initial cleanup on startup
    this.runCleanup();
  }
}