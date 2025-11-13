import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NoteService {
	/**
	 * Get all notes for a project
	 */
	static async getNotesByProject(projectId: number, userId: number) {
		// Verify user has access to the project
		const projectAccess = await prisma.project.findFirst({
			where: {
				id: projectId,
				OR: [
					{ ownerId: userId },
					{ members: { some: { userId } } },
				],
			},
		});

		if (!projectAccess) {
			throw new Error("Access denied to this project");
		}

		return prisma.note.findMany({
			where: {
				projectId,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});
	}

	/**
	 * Create a new note
	 */
	static async createNote(data: {
		title: string;
		content: string;
		color: string;
		projectId: number;
		userId: number;
	}) {
		// Verify user has access to the project
		const projectAccess = await prisma.project.findFirst({
			where: {
				id: data.projectId,
				OR: [
					{ ownerId: data.userId },
					{ members: { some: { userId: data.userId } } },
				],
			},
		});

		if (!projectAccess) {
			throw new Error("Access denied to this project");
		}

		return prisma.note.create({
			data: {
				title: data.title,
				content: data.content,
				color: data.color,
				projectId: data.projectId,
				userId: data.userId,
			},
		});
	}

	/**
	 * Update a note
	 */
	static async updateNote(
		noteId: number,
		userId: number,
		data: Partial<{
			title: string;
			content: string;
			color: string;
		}>
	) {
		// Verify the note exists and user has access
		const note = await prisma.note.findFirst({
			where: {
				id: noteId,
				project: {
					OR: [
						{ ownerId: userId },
						{ members: { some: { userId } } },
					],
				},
			},
		});

		if (!note) {
			throw new Error("Note not found or access denied");
		}

		return prisma.note.update({
			where: { id: noteId },
			data,
		});
	}

	/**
	 * Delete a note
	 */
	static async deleteNote(noteId: number, userId: number) {
		// Verify the note exists and user has access
		const note = await prisma.note.findFirst({
			where: {
				id: noteId,
				project: {
					OR: [
						{ ownerId: userId },
						{ members: { some: { userId } } },
					],
				},
			},
		});

		if (!note) {
			throw new Error("Note not found or access denied");
		}

		return prisma.note.delete({
			where: { id: noteId },
		});
	}
}
