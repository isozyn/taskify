// CustomColumn Service - Business logic for custom workflow columns

import prisma from '../config/db';
import { CustomColumnCreateInput, CustomColumnUpdateInput, CustomColumnResponse } from '../models';

export class CustomColumnService {
  /**
   * Get all custom columns for a project
   */
  static async getColumnsByProjectId(projectId: number): Promise<CustomColumnResponse[]> {
    const columns = await prisma.customColumn.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    return columns;
  }

  /**
   * Get a single custom column by ID
   */
  static async getColumnById(columnId: number): Promise<CustomColumnResponse | null> {
    const column = await prisma.customColumn.findUnique({
      where: { id: columnId },
    });

    return column;
  }

  /**
   * Create a new custom column
   */
  static async createColumn(data: CustomColumnCreateInput): Promise<CustomColumnResponse> {
    // Check if project exists and is CUSTOM workflow
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.workflowType !== 'CUSTOM') {
      throw new Error('Can only create custom columns for projects with CUSTOM workflow type');
    }

    // If no order specified, set it to the end
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await prisma.customColumn.findFirst({
        where: { projectId: data.projectId },
        orderBy: { order: 'desc' },
      });
      order = maxOrder ? maxOrder.order + 1 : 0;
    }

    const column = await prisma.customColumn.create({
      data: {
        title: data.title,
        color: data.color || 'slate',
        order,
        projectId: data.projectId,
      },
    });

    return column;
  }

  /**
   * Update an existing custom column
   */
  static async updateColumn(
    columnId: number,
    data: CustomColumnUpdateInput
  ): Promise<CustomColumnResponse> {
    const column = await prisma.customColumn.update({
      where: { id: columnId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.color && { color: data.color }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return column;
  }

  /**
   * Delete a custom column
   * Also moves all tasks from this column to the first column of the project
   */
  static async deleteColumn(columnId: number): Promise<void> {
    const column = await prisma.customColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new Error('Column not found');
    }

    // Get the first column of the project (to move tasks to)
    const firstColumn = await prisma.customColumn.findFirst({
      where: { 
        projectId: column.projectId,
        id: { not: columnId }
      },
      orderBy: { order: 'asc' },
    });

    // Move tasks to first column if it exists
    if (firstColumn) {
      await prisma.task.updateMany({
        where: { columnId: columnId.toString() },
        data: { columnId: firstColumn.id.toString() },
      });
    } else {
      // If no other columns, set columnId to null
      await prisma.task.updateMany({
        where: { columnId: columnId.toString() },
        data: { columnId: null },
      });
    }

    // Delete the column
    await prisma.customColumn.delete({
      where: { id: columnId },
    });
  }

  /**
   * Reorder columns
   */
  static async reorderColumns(_projectId: number, columnIds: number[]): Promise<void> {
    // Update order for each column
    await Promise.all(
      columnIds.map((columnId, index) =>
        prisma.customColumn.update({
          where: { id: columnId },
          data: { order: index },
        })
      )
    );
  }

  /**
   * Initialize default columns for a new CUSTOM workflow project
   */
  static async createDefaultColumns(projectId: number): Promise<CustomColumnResponse[]> {
    const defaultColumns = [
      { title: 'To Do', color: 'slate', order: 0 },
      { title: 'In Progress', color: 'blue', order: 1 },
      { title: 'Done', color: 'green', order: 2 },
    ];

    const columns = await Promise.all(
      defaultColumns.map((col) =>
        prisma.customColumn.create({
          data: {
            ...col,
            projectId,
          },
        })
      )
    );

    return columns;
  }
}
