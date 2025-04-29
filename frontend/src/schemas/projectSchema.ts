import { z } from "zod";

export const projectSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Project title must be at least 3 characters long" }),
    description: z.string().min(5, {
      message: "Project description must be at least 5 characters long",
    }),
    category: z.enum(["Development", "Marketing", "Design"], {
      message: "Category is required",
    }),
    priority: z.enum(["High", "Medium", "Low"], {
      message: "Priority is required",
    }),
    // image: z
    //   .instanceof(File)
    //   .refine((file) => file.size > 0, {
    //     message: "Project image is required",
    //   })
    //   .optional(),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    teamMembers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string().optional(),
          role: z.string().optional(),
        })
      )
      .min(1, { message: "At least one team member is required" }),
    documents: z.array(z.instanceof(File)).optional(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be earlier than end date",
    path: ["startDate"],
  });

export const projectUpdateSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Project title must be at least 3 characters long" }),
    description: z
      .string()
      .min(5, {
        message: "Project description must be at least 5 characters long",
      }),
    progress: z
      .number()
      .min(0)
      .max(100, { message: "Progress must be between 0 and 100" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    teamMembers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string().optional(),
          role: z.string().optional(),
        })
      )
      .min(1, { message: "At least one team member is required" }),
    image: z
      .union([z.instanceof(File).optional(), z.string().optional()])
      .refine(
        (file) => (file ? (file instanceof File ? file.size > 0 : true) : true),
        {
          message: "Project image is required if uploaded",
        }
      ),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be earlier than end date",
    path: ["startDate"],
  });