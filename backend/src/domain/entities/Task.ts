// src/domain/entities/Task.ts
export class Subtask {
    constructor(
      public id: string,
      public taskId: string,
      public name: string,
      public description: string,
      public priority: "low" | "medium" | "high",
      public status: "todo" | "in-progress" | "completed",
      public dueDate: Date,
      public createdAt?: Date,
      public updatedAt?: Date
    ) {}
  }
  
  export class Task {
    constructor(
      public id: string,
      public projectId: string,
      public name: string,
      public description: string,
      public userId: string,
      public assignedTo: string, 
      public status: "backlog" | "todo" | "in-progress" | "completed",
      public priority: "low" | "medium" | "high",
      public dueDate: Date,
      public subtasks: Subtask[],
      public createdAt?: Date,
      public updatedAt?: Date,
      public sprintId?: string | null,
      public user?: { id: string; name: string; email: string; role: string; profilePic: string } | null,
      public assignedUser?: { id: string; name: string; email: string; role: string; profilePic: string } | null,
    ) {}
  }
  