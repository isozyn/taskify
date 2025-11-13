// /api/v1/projects/*

import { Router } from "express";
import { ProjectController } from "../controllers/projectController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Create a new project
router.post("/projects", ProjectController.createProject);

// Get all projects for authenticated user
router.get("/projects", ProjectController.getAllProjects);

// Get a single project by ID
router.get("/projects/:projectId", ProjectController.getProjectById);

// Update a project
router.put("/projects/:projectId", ProjectController.updateProject);

// Toggle project star
router.patch("/projects/:projectId/star", ProjectController.toggleProjectStar);

// Delete a project
router.delete("/projects/:projectId", ProjectController.deleteProject);

// Invite members to a project
router.post("/projects/:projectId/invite", ProjectController.inviteMembers);

// Get project members
router.get("/projects/:projectId/members", ProjectController.getProjectMembers);

// Update project member role
router.patch(
	"/projects/:projectId/members/:memberId",
	ProjectController.updateMemberRole
);

// Remove project member
router.delete(
	"/projects/:projectId/members/:memberId",
	ProjectController.removeMember
);

// Accept project invitation
router.post("/projects/accept-invitation", ProjectController.acceptInvitation);

export default router;
