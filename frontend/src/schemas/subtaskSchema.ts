import { z } from "zod";

export const subtaskSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(20, { message: "Title must not exceed 20 characters" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long" })
    .max(1000, { message: "Description must not exceed 1000 characters" }),
  status: z.enum(["todo", "in-progress", "completed"], {
    message: "Invalid status",
  }),
  priority: z.enum(["low", "medium", "high"], { message: "Invalid priority" }),
  dueDate: z
    .string()
    .nonempty({ message: "Due date is required" })
    .refine((date) => new Date(date) > new Date(), {
      message: "Due date must be a future date",
    }),
});

export const updateSubtaskSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must not exceed 100 characters" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long" })
    .max(1000, { message: "Description must not exceed 1000 characters" }),
  status: z.enum(["todo", "in-progress", "review", "completed"], {
    message: "Invalid status",
  }),
  priority: z.enum(["low", "medium", "high"], { message: "Invalid priority" }),
  dueDate: z
    .string()
    .nonempty({ message: "Due date is required" })
    .refine((date) => new Date(date) > new Date(), {
      message: "Due date must be a future date",
    }),
});
