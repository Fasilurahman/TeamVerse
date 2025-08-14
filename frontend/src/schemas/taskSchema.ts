import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Task title must be at least 3 characters long" })
    .max(20, { message: "Task title must not exceed 20 characters" }),
  description: z
    .string()
    .min(5, { message: "Task description must be at least 5 characters long" })
    .max(50, { message: "Task description must not exceed 50 characters" }),
  status: z.enum(["backlog", "todo", "in-progress", "completed"], {
    message: "Invalid status",
  }),
  priority: z.enum(["low", "medium", "high"], { message: "Invalid priority" }),
  dueDate: z
    .string()
    .nonempty({ message: "Due date is required" })
    .refine((date) => new Date(date) > new Date(), {
      message: "Due date must be a future date",
    }),
  assignedTo: z
    .string()
    .nonempty({ message: "Assignee is required" })
    .max(50, { message: "Assignee field must not exceed 50 characters" }),
});

export const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Task title must be at least 3 characters long" })
    .max(20, { message: "Task title must not exceed 20 characters" }),
  description: z
    .string()
    .min(5, { message: "Task description must be at least 5 characters long" })
    .max(50, { message: "Task description must not exceed 50 characters" }),
  status: z.enum(["backlog", "todo", "in-progress", "completed"], {
    message: "Invalid status",
  }),
  priority: z.enum(["low", "medium", "high"], { message: "Invalid priority" }),
  dueDate: z
    .string()
    .nonempty({ message: "Due date is required" })
    .refine((date) => new Date(date) > new Date(), {
      message: "Due date must be a future date",
    }),
  assignedTo: z
    .string()
    .nonempty({ message: "Assignee is required" })
    .max(50, { message: "Assignee field must not exceed 50 characters" }),
});
