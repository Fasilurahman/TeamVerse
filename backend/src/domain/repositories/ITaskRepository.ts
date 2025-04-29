import { Task, Subtask } from "../../domain/entities/Task";

export interface ITaskRepository {
  create(taskData: Partial<Task>): Promise<Task | null>;
  createSubtask(subtaskData: any): Promise<Task>;
  findByProjectId(projectId: string): Promise<Task[]>;
  getAll(userId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(taskId: string, updatedTaskData: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  updateSubtask(
    taskId: string,
    subtaskId: string,
    updateData: any
  ): Promise<Subtask | null>;
  getSubtasksByUserId(userId: string): Promise<Subtask[]>;
  deleteSubtask(subtaskId: string): Promise<Task | null>;
  getSubtasksByTaskId(taskId: string): Promise<Subtask[]>;
  findBacklogTasksByProjectId(projectId: string): Promise<Task[]>;
  updateTaskStatus(taskId: string, status: string, sprintId: string): Promise<Task | null>;
  updateTaskStatusByTaskId(taskId: string, status: string): Promise<Task | null>;
  moveTasksToBacklog(sprintId: string): Promise<void>;
}
