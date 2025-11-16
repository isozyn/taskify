import { Request, Response } from "express";
import { NoteService } from "../services/noteService";

export class NoteController {
	/**
	 * Get all notes for a project
	 */
	static async getNotesByProject(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);
			const userId = (req as any).user?.id;

			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			const notes = await NoteService.getNotesByProject(projectId, userId);
			res.status(200).json(notes);
		} catch (error: any) {
			res.status(500).json({
				error: error.message || "Failed to fetch notes",
			});
		}
	}

	/**
	 * Create a new note
	 */
	static async createNote(req: Request, res: Response): Promise<void> {
		try {
			const projectId = parseInt(req.params.projectId);
			const userId = (req as any).user?.id;

			if (isNaN(projectId)) {
				res.status(400).json({ error: "Invalid project ID" });
				return;
			}

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			const note = await NoteService.createNote({
				...req.body,
				projectId,
				userId,
			});

			res.status(201).json(note);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to create note",
			});
		}
	}

	/**
	 * Update a note
	 */
	static async updateNote(req: Request, res: Response): Promise<void> {
		try {
			const noteId = parseInt(req.params.noteId);
			const userId = (req as any).user?.id;

			if (isNaN(noteId)) {
				res.status(400).json({ error: "Invalid note ID" });
				return;
			}

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			const note = await NoteService.updateNote(noteId, userId, req.body);

			if (!note) {
				res.status(404).json({ error: "Note not found" });
				return;
			}

			res.status(200).json(note);
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to update note",
			});
		}
	}

	/**
	 * Delete a note
	 */
	static async deleteNote(req: Request, res: Response): Promise<void> {
		try {
			const noteId = parseInt(req.params.noteId);
			const userId = (req as any).user?.id;

			if (isNaN(noteId)) {
				res.status(400).json({ error: "Invalid note ID" });
				return;
			}

			if (!userId) {
				res.status(401).json({ error: "Unauthorized" });
				return;
			}

			await NoteService.deleteNote(noteId, userId);
			res.status(200).json({ message: "Note deleted successfully" });
		} catch (error: any) {
			res.status(400).json({
				error: error.message || "Failed to delete note",
			});
		}
	}
}
