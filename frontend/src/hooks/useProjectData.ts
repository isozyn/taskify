import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Task, CustomColumn } from '@/lib/api';

// Query keys for consistent cache management
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
  tasks: (id: number) => [...projectKeys.detail(id), 'tasks'] as const,
  columns: (id: number) => [...projectKeys.detail(id), 'columns'] as const,
  activities: (id: number) => [...projectKeys.detail(id), 'activities'] as const,
  members: (id: number) => [...projectKeys.detail(id), 'members'] as const,
};

// Hook to fetch project by ID with caching
export function useProject(projectId: number | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId!),
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      return await api.getProjectById(projectId);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes
  });
}

// Hook to fetch all projects with caching
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => await api.getProjects(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to fetch project tasks with caching
export function useProjectTasks(projectId: number | undefined) {
  return useQuery({
    queryKey: projectKeys.tasks(projectId!),
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response: any = await api.getTasksByProject(projectId);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // Tasks stay fresh for 2 minutes
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to fetch custom columns with caching
export function useCustomColumns(projectId: number | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: projectKeys.columns(projectId!),
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response: any = await api.getCustomColumns(projectId);
      return Array.isArray(response) ? response : response?.columns || [];
    },
    enabled: !!projectId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to fetch project activities with caching
export function useProjectActivities(projectId: number | undefined, limit: number = 10) {
  return useQuery({
    queryKey: [...projectKeys.activities(projectId!), limit],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response: any = await api.getProjectActivities(projectId, limit);
      return response?.activities || [];
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // Activities stay fresh for 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

// Hook to create a task with cache invalidation
export function useCreateTask(projectId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: any) => {
      if (!projectId) throw new Error('Project ID is required');
      return await api.createTask(projectId, taskData);
    },
    onSuccess: () => {
      // Invalidate tasks cache to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId!) });
      queryClient.invalidateQueries({ queryKey: projectKeys.activities(projectId!) });
    },
  });
}

// Hook to update a task with cache invalidation
export function useUpdateTask(projectId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: any }) => {
      return await api.updateTask(taskId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId!) });
      queryClient.invalidateQueries({ queryKey: projectKeys.activities(projectId!) });
    },
  });
}

// Hook to delete a task with cache invalidation
export function useDeleteTask(projectId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      return await api.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId!) });
      queryClient.invalidateQueries({ queryKey: projectKeys.activities(projectId!) });
    },
  });
}

// Hook to create a project with cache invalidation
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: any) => {
      return await api.createProject(projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Hook to update a project with cache invalidation
export function useUpdateProject(projectId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: any) => {
      if (!projectId) throw new Error('Project ID is required');
      return await api.updateProject(projectId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId!) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Hook to manually refresh project data
export function useRefreshProject(projectId: number | undefined) {
  const queryClient = useQueryClient();

  return () => {
    if (!projectId) return;
    queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
    queryClient.invalidateQueries({ queryKey: projectKeys.activities(projectId) });
  };
}
