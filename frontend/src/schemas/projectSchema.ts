import { z } from "zod";


const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];

export const projectSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Project title must be at least 3 characters long" })
      .max(100, { message: "Project title must not exceed 100 characters" }),

    description: z
      .string()
      .min(5, { message: "Project description must be at least 5 characters long" })
      .max(1000, { message: "Project description must not exceed 1000 characters" }),

    category: z.enum(["Development", "Marketing", "Design"], {
      message: "Category is required",
    }),

    priority: z.enum(["High", "Medium", "Low"], {
      message: "Priority is required",
    }),

    image: z
      .union([z.instanceof(File).optional(), z.string().optional()])
      .refine(
        (file) =>
          !file ||
          (file instanceof File
            ? file.size > 0 && allowedImageTypes.includes(file.type)
            : true),
        {
          message: "Only PNG, JPG, or WEBP image files are allowed",
        }
      ),

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

    documents: z
      .array(z.instanceof(File))
      .optional()
      .refine(
        (docs) =>
          !docs ||
          docs.every((doc) => doc.size > 0 && doc.size <= 10 * 1024 * 1024), // 10MB max per file
        {
          message: "Each document must be less than 10MB",
        }
      ),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be earlier than end date",
    path: ["startDate"],
  });


// UPDATE schema
export const projectUpdateSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Project title must be at least 3 characters long" })
      .max(100, { message: "Project title must not exceed 100 characters" }),

    description: z
      .string()
      .min(5, { message: "Project description must be at least 5 characters long" })
      .max(1000, { message: "Project description must not exceed 1000 characters" }),

    progress: z
      .number()
      .min(0, { message: "Progress must be at least 0%" })
      .max(100, { message: "Progress must not exceed 100%" }),

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
        (file) =>
          !file ||
          (file instanceof File
            ? file.size > 0 && allowedImageTypes.includes(file.type)
            : true),
        {
          message: "Only PNG, JPG, or WEBP image files are allowed",
        }
      ),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Start date must be earlier than end date",
    path: ["startDate"],
  });
