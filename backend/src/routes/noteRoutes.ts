import { Router } from "express";
import { NoteController } from "../controllers/noteController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all notes for a project
router.get("/projects/:projectId/notes", NoteController.getNotesByProject);

// Create a new note
router.post("/projects/:projectId/notes", NoteController.createNote);

// Update a note
router.patch("/notes/:noteId", NoteController.updateNote);

// Delete a note
router.delete("/notes/:noteId", NoteController.deleteNote);

export default router;
